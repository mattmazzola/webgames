import { FC } from "react";
import Bullseye from "../pages/Bullseye";
import ButtonMegastar from "../pages/ButtonMegastar";
import ClickCubed from "../pages/ClickCubed";
import EmojiRemember from "../pages/EmojiRemember";
import IAccept from "../pages/IAccept";
import Patience from "../pages/Patience";
import SliderSymphony from "../pages/SliderSymphony";
import TodaysDate from "../pages/TodaysDate";
import TowersOfHanoi from "../pages/TowersOfHanoi";
import WolfGoatCabbage from "../pages/WolfGoatCabbage";

export interface RouteConfig {
  path: string;
  title: string;
  description: string;
  icon: string;
  component: FC;
}

export const routes: RouteConfig[] = [
  {
    path: "/date",
    title: "Today's date",
    description: "Enter today's date to reveal a secret password",
    icon: "📅",
    component: TodaysDate,
  },
  {
    path: "/buttons",
    title: "Button megastar",
    description:
      "A collection of very clickable (and maybe not so clickable) things",
    icon: "🔘",
    component: ButtonMegastar,
  },
  {
    path: "/click-cubed",
    title: "Click³",
    description: "Can you click three times before time runs out?",
    icon: "⏱️",
    component: ClickCubed,
  },
  {
    path: "/patience",
    title: "Patience test",
    description: "Can you wait the perfect amount of time?",
    icon: "⌛",
    component: Patience,
  },
  {
    path: "/slider-symphony",
    title: "Slider symphony",
    description: "Align the boxes by mastering the vertical sliders!",
    icon: "🎚️",
    component: SliderSymphony,
  },
  {
    path: "/emoji-remember",
    title: "Emoji remember",
    description: "Remember the sequence of emojis to unlock the secret",
    icon: "🧠",
    component: EmojiRemember,
  },
  {
    path: "/bullseye",
    title: "Bullseye",
    description:
      "Hit the moving target three times - but watch out, it gets faster!",
    icon: "🎯",
    component: Bullseye,
  },
  {
    path: "/i-accept",
    title: "I Accept",
    description: "Prove you're human by agreeing to our terms",
    icon: "✅",
    component: IAccept,
  },
  {
    path: "/wolf-goat-cabbage",
    title: "River Crossing",
    description:
      "Help transport a wolf, goat, and cabbage across the river safely",
    icon: "⛵",
    component: WolfGoatCabbage,
  },
  {
    path: "/towers-of-hanoi",
    title: "Towers of Hanoi",
    description:
      "Move the stack of disks to the rightmost peg following the rules",
    icon: "🗼",
    component: TowersOfHanoi,
  },
];
