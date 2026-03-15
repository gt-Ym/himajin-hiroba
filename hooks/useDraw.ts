import { useRef, useEffect, useCallback } from "react";
import { supabase, type DrawStroke } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";

export const CANVAS_W = 680;
export const CANVAS_H = 460;

const THROTTLE_MS = 16;
const MIN_DIST_SQ = 9; // 3px

function renderStroke(ctx: CanvasRenderingContext2D, s: DrawStroke) {
  ctx.beginPath();
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.line_width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(s.x0, s.y0);
  ctx.lineTo(s.x1, s.y1);
  ctx.stroke();
}

export function useDraw(activeRoom: number) {
  const { user } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreens = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const isDrawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const lastSent = useRef(0);
  const activeRoomRef = useRef(activeRoom);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const ensureOffscreen = useCallback((roomId: number): HTMLCanvasElement => {
    let c = offscreens.current.get(roomId);
    if (!c) {
      c = document.createElement("canvas");
      c.width = CANVAS_W;
      c.height = CANVAS_H;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      offscreens.current.set(roomId, c);
    }
    return c;
  }, []);

  const paintStroke = useCallback((s: DrawStroke) => {
    const off = ensureOffscreen(s.room_id);
    renderStroke(off.getContext("2d")!, s);
    if (s.room_id === activeRoomRef.current && canvasRef.current) {
      renderStroke(canvasRef.current.getContext("2d")!, s);
    }
  }, [ensureOffscreen]);

  const flushToCanvas = useCallback((roomId: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(ensureOffscreen(roomId), 0, 0);
  }, [ensureOffscreen]);

  // 初回ロード: 全部屋の既存ストロークをDBから取得
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      for (const roomId of [1, 2, 3]) {
        const { data } = await supabase
          .from("draw_strokes")
          .select("room_id,x0,y0,x1,y1,color,line_width")
          .eq("room_id", roomId)
          .order("id", { ascending: true });
        if (data) data.forEach((s) => paintStroke(s as DrawStroke));
      }
      flushToCanvas(activeRoomRef.current);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // タブ切り替え時にオフスクリーンを可視キャンバスに転写
  useEffect(() => {
    flushToCanvas(activeRoom);
  }, [activeRoom, flushToCanvas]);

  // Broadcastチャンネル購読
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("draw_broadcast", {
      config: { broadcast: { self: false } },
    });
    channelRef.current = ch;
    ch.on("broadcast", { event: "stroke" }, ({ payload }) => {
      paintStroke(payload as DrawStroke);
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [user, paintStroke]);

  const emit = useCallback((s: DrawStroke) => {
    paintStroke(s);
    channelRef.current?.send({ type: "broadcast", event: "stroke", payload: s });
    supabase.from("draw_strokes").insert(s).then(({ error }) => {
      if (error) console.error("[useDraw] insert error:", error);
    });
  }, [paintStroke]);

  const onStart = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    isDrawing.current = true;
    lastPt.current = {
      x: ((clientX - r.left) / r.width) * CANVAS_W,
      y: ((clientY - r.top) / r.height) * CANVAS_H,
    };
  }, []);

  const onMove = useCallback((clientX: number, clientY: number, color: string, lineWidth: number) => {
    if (!isDrawing.current || !lastPt.current || !canvasRef.current) return;
    const now = Date.now();
    if (now - lastSent.current < THROTTLE_MS) return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * CANVAS_W;
    const y = ((clientY - r.top) / r.height) * CANVAS_H;
    const dx = x - lastPt.current.x;
    const dy = y - lastPt.current.y;
    if (dx * dx + dy * dy < MIN_DIST_SQ) return;
    emit({
      room_id: activeRoomRef.current,
      x0: lastPt.current.x,
      y0: lastPt.current.y,
      x1: x,
      y1: y,
      color,
      line_width: lineWidth,
    });
    lastPt.current = { x, y };
    lastSent.current = now;
  }, [emit]);

  const onEnd = useCallback(() => {
    isDrawing.current = false;
    lastPt.current = null;
  }, []);

  return { canvasRef, onStart, onMove, onEnd };
}
