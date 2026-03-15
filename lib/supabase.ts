import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatMessage {
  id: string;
  username: string;
  icon_id: string;
  content: string;
  created_at: string;
}

export interface DrawStroke {
  room_id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  line_width: number;
}
