export interface IconDef {
  id: string;
  label: string;
  path: string;
}

export const ICONS: IconDef[] = [
  // 動物①
  { id: "penguin",    label: "ペンギン",   path: "/icons/penguin.svg"    },
  { id: "panda",      label: "パンダ",     path: "/icons/panda.svg"      },
  { id: "cat",        label: "ねこ",       path: "/icons/cat.svg"        },
  { id: "rabbit",     label: "うさぎ",     path: "/icons/rabbit.svg"     },
  { id: "bear",       label: "くま",       path: "/icons/bear.svg"       },
  { id: "fox",        label: "きつね",     path: "/icons/fox.svg"        },
  { id: "dog",        label: "いぬ",       path: "/icons/dog.svg"        },
  { id: "frog",       label: "かえる",     path: "/icons/frog.svg"       },
  { id: "hamster",    label: "ハムスター", path: "/icons/hamster.svg"    },
  { id: "chick",      label: "ひよこ",     path: "/icons/chick.svg"      },
  { id: "monkey",     label: "さる",       path: "/icons/monkey.svg"     },
  { id: "tiger",      label: "とら",       path: "/icons/tiger.svg"      },
  { id: "lion",       label: "ライオン",   path: "/icons/lion.svg"       },
  { id: "elephant",   label: "ぞう",       path: "/icons/elephant.svg"   },
  { id: "sheep",      label: "ひつじ",     path: "/icons/sheep.svg"      },
  { id: "horse",      label: "うま",       path: "/icons/horse.svg"      },
  { id: "turtle",     label: "かめ",       path: "/icons/turtle.svg"     },
  { id: "fish",       label: "さかな",     path: "/icons/fish.svg"       },
  { id: "owl",        label: "ふくろう",   path: "/icons/owl.svg"        },
  { id: "duck",       label: "あひる",     path: "/icons/duck.svg"       },
  // 動物②
  { id: "wolf",       label: "おおかみ",   path: "/icons/wolf.svg"       },
  { id: "deer",       label: "しか",       path: "/icons/deer.svg"       },
  { id: "camel",      label: "らくだ",     path: "/icons/camel.svg"      },
  { id: "crocodile",  label: "わに",       path: "/icons/crocodile.svg"  },
  { id: "whale",      label: "くじら",     path: "/icons/whale.svg"      },
  { id: "dolphin",    label: "いるか",     path: "/icons/dolphin.svg"    },
  { id: "octopus",    label: "たこ",       path: "/icons/octopus.svg"    },
  { id: "crab",       label: "かに",       path: "/icons/crab.svg"       },
  { id: "butterfly",  label: "ちょうちょ", path: "/icons/butterfly.svg"  },
  { id: "bee",        label: "みつばち",   path: "/icons/bee.svg"        },
  { id: "snail",      label: "かたつむり", path: "/icons/snail.svg"      },
  { id: "parrot",     label: "おうむ",     path: "/icons/parrot.svg"     },
  // 自然・天気
  { id: "cloud",      label: "くも",       path: "/icons/cloud.svg"      },
  { id: "sun",        label: "たいよう",   path: "/icons/sun.svg"        },
  { id: "moon",       label: "つき",       path: "/icons/moon.svg"       },
  { id: "star",       label: "ほし",       path: "/icons/star.svg"       },
  { id: "rainbow",    label: "にじ",       path: "/icons/rainbow.svg"    },
  { id: "snowflake",  label: "ゆき",       path: "/icons/snowflake.svg"  },
  { id: "earth",      label: "ちきゅう",   path: "/icons/earth.svg"      },
  { id: "mountain",   label: "やま",       path: "/icons/mountain.svg"   },
  // 乗り物
  { id: "airplane",   label: "ひこうき",   path: "/icons/airplane.svg"   },
  { id: "rocket",     label: "ロケット",   path: "/icons/rocket.svg"     },
  { id: "ship",       label: "ふね",       path: "/icons/ship.svg"       },
  { id: "car",        label: "くるま",     path: "/icons/car.svg"        },
  { id: "bicycle",    label: "じてんしゃ", path: "/icons/bicycle.svg"    },
  { id: "train",      label: "でんしゃ",   path: "/icons/train.svg"      },
  // アイテム
  { id: "crown",      label: "おうかん",   path: "/icons/crown.svg"      },
  { id: "diamond",    label: "ダイヤ",     path: "/icons/diamond.svg"    },
  { id: "book",       label: "ほん",       path: "/icons/book.svg"       },
  { id: "key",        label: "かぎ",       path: "/icons/key.svg"        },
  { id: "bell",       label: "かね",       path: "/icons/bell.svg"       },
  { id: "sword",      label: "つるぎ",     path: "/icons/sword.svg"      },
  { id: "crystal",    label: "クリスタル", path: "/icons/crystal.svg"    },
  { id: "shield",     label: "たて",       path: "/icons/shield.svg"     },
  // 食べ物
  { id: "strawberry", label: "いちご",     path: "/icons/strawberry.svg" },
  { id: "cake",       label: "ケーキ",     path: "/icons/cake.svg"       },
  { id: "ramen",      label: "ラーメン",   path: "/icons/ramen.svg"      },
  { id: "sushi",      label: "すし",       path: "/icons/sushi.svg"      },
  // 宇宙
  { id: "planet",     label: "わくせい",   path: "/icons/planet.svg"     },
  { id: "comet",      label: "すいせい",   path: "/icons/comet.svg"      },
];

export function getIconPath(iconId: string): string {
  return ICONS.find((i) => i.id === iconId)?.path ?? "/icons/penguin.svg";
}
