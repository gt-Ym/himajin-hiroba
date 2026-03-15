export interface IconDef {
  id: string;
  label: string;
  path: string;
}

export const ICONS: IconDef[] = [
  { id: "penguin", label: "ペンギン", path: "/icons/penguin.svg" },
  { id: "panda",   label: "パンダ",   path: "/icons/panda.svg"   },
  { id: "cat",     label: "ねこ",     path: "/icons/cat.svg"     },
  { id: "rabbit",  label: "うさぎ",   path: "/icons/rabbit.svg"  },
  { id: "bear",    label: "くま",     path: "/icons/bear.svg"    },
  { id: "fox",     label: "きつね",   path: "/icons/fox.svg"     },
  { id: "dog",     label: "いぬ",     path: "/icons/dog.svg"     },
  { id: "frog",    label: "かえる",   path: "/icons/frog.svg"    },
];

export function getIconPath(iconId: string): string {
  return ICONS.find((i) => i.id === iconId)?.path ?? "/icons/penguin.svg";
}
