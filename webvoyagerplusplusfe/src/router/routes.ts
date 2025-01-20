import { FC } from "react";
import Breakout from "../pages/Breakout";
import Bullseye from "../pages/Bullseye";
import ButtonHold from "../pages/ButtonHold";
import ButtonMegastar from "../pages/ButtonMegastar";
import CanvasCatch from "../pages/CanvasCatch";
import ChartRead from "../pages/ChartRead";
import ChartTranscribe from "../pages/ChartTranscribe";
import ClickCubed from "../pages/ClickCubed";
import ColorHarmony from "../pages/ColorHarmony";
import CombinationLock from "../pages/CombinationLock";
import EmojiRemember from "../pages/EmojiRemember";
import FileCredentials from "../pages/FileCredentials";
import FileUpload from "../pages/FileUpload";
import Frogger from "../pages/Frogger";
import Herding from "../pages/Herding";
import IAccept from "../pages/IAccept";
import IllegalMaterial from "../pages/IllegalMaterial";
import KeyCombo from "../pages/KeyCombo";
import MenuNavigator from "../pages/MenuNavigator";
import Patience from "../pages/Patience";
import PixelCopy from "../pages/PixelCopy";
import PopupChaos from "../pages/PopupChaos";
import PromptDefender from "../pages/PromptDefender";
import ScrollHorizontal from "../pages/ScrollHorizontal";
import ScrollVertical from "../pages/ScrollVertical";
import ShoppingChallenge from "../pages/ShoppingChallenge";
import SliderSymphony from "../pages/SliderSymphony";
import TextMirror from "../pages/TextMirror";
import TodaysDate from "../pages/TodaysDate";
import TowersOfHanoi from "../pages/TowersOfHanoi";
import WebGLText from "../pages/WebGLText";
import WebsAssemble from "../pages/WebsAssemble";
import WolfGoatCabbage from "../pages/WolfGoatCabbage";

export interface RouteConfig {
  path: string;
  title: string;
  description: string;
  icon: string;
  component: FC;
  tags: string[];
}

export const routes: RouteConfig[] = [
  {
    path: "/date",
    title: "Today's date",
    description: "Enter today's date to reveal a secret password",
    icon: "📅",
    component: TodaysDate,
    tags: ["form", "date"],
  },
  {
    path: "/buttons",
    title: "Button megastar",
    description:
      "A collection of very clickable (and maybe not so clickable) things",
    icon: "🔘",
    component: ButtonMegastar,
    tags: ["button", "click"],
  },
  {
    path: "/click-cubed",
    title: "Click³",
    description: "Can you click three times before time runs out?",
    icon: "⏱️",
    component: ClickCubed,
    tags: ["click", "speed"],
  },
  {
    path: "/patience",
    title: "Patience test",
    description: "Can you wait the perfect amount of time?",
    icon: "⌛",
    component: Patience,
    tags: ["timing", "waiting"],
  },
  {
    path: "/slider-symphony",
    title: "Slider symphony",
    description: "Align the boxes by mastering the vertical sliders!",
    icon: "🎚️",
    component: SliderSymphony,
    tags: ["slider", "dexterity"],
  },
  {
    path: "/emoji-remember",
    title: "Emoji remember",
    description: "Remember the sequence of emojis to unlock the secret",
    icon: "🧠",
    component: EmojiRemember,
    tags: ["memory", "sequence"],
  },
  {
    path: "/bullseye",
    title: "Bullseye",
    description:
      "Hit the moving target three times - but watch out, it gets faster!",
    icon: "🎯",
    component: Bullseye,
    tags: ["aim", "speed", "timing"],
  },
  {
    path: "/i-accept",
    title: "I Accept",
    description: "Prove you're human by agreeing to our terms",
    icon: "✅",
    component: IAccept,
    tags: ["checkbox", "form"],
  },
  {
    path: "/wolf-goat-cabbage",
    title: "River Crossing",
    description:
      "Help transport a wolf, goat, and cabbage across the river safely",
    icon: "⛵",
    component: WolfGoatCabbage,
    tags: ["logic", "planning"],
  },
  {
    path: "/towers-of-hanoi",
    title: "Towers of Hanoi",
    description:
      "Move the stack of disks to the rightmost peg following the rules",
    icon: "🗼",
    component: TowersOfHanoi,
    tags: ["logic", "planning"],
  },
  {
    path: "/color-harmony",
    title: "Color Harmony",
    description:
      "Mix the perfect color combination using RGB sliders - but hurry before they shift!",
    icon: "🎨",
    component: ColorHarmony,
    tags: ["color", "slider", "dexterity"],
  },
  {
    path: "/herding",
    title: "Sheep Herding",
    description: "Guide the wandering sheep into their pen using your cursor",
    icon: "🐑",
    component: Herding,
    tags: ["mouse", "dexterity"],
  },
  {
    path: "/file-upload",
    title: "File Upload",
    description: "Upload any file to complete this challenge",
    icon: "📎",
    component: FileUpload,
    tags: ["file", "upload"],
  },
  {
    path: "/canvas-catch",
    title: "Canvas Catch",
    description:
      "Drag the circle into the target zone to complete the challenge",
    icon: "🎯",
    component: CanvasCatch,
    tags: ["canvas", "drag", "coordination"],
  },
  {
    path: "/breakout",
    title: "Breakout",
    description: "Classic Atari Breakout - break all the bricks to win!",
    icon: "🧱",
    component: Breakout,
    tags: ["game", "arcade", "dexterity"],
  },
  {
    path: "/text-mirror",
    title: "Text Mirror",
    description: "Can you perfectly copy the text? Every character matters!",
    icon: "📝",
    component: TextMirror,
    tags: ["text", "accuracy", "typing"],
  },
  {
    path: "/frogger",
    title: "Frogger",
    description: "Guide your frog safely across the busy road using arrow keys",
    icon: "🐸",
    component: Frogger,
    tags: ["game", "keyboard", "timing"],
  },
  {
    path: "/button-hold",
    title: "Button Hold",
    description: "Can you hold the button for exactly 3 seconds?",
    icon: "⏱️",
    component: ButtonHold,
    tags: ["button", "timing", "dexterity"],
  },
  {
    path: "/key-combo",
    title: "Key Combo",
    description: "Press the correct key combination to unlock the secret",
    icon: "⌨️",
    component: KeyCombo,
    tags: ["keyboard", "hotkey", "dexterity"],
  },
  {
    path: "/scroll-vertical",
    title: "Endless Scroll",
    description: "How far can you scroll? Keep going to find out!",
    icon: "📜",
    component: ScrollVertical,
    tags: ["scroll", "endurance", "patience"],
  },
  {
    path: "/scroll-horizontal",
    title: "Sideways Scroll",
    description: "Keep scrolling right until you can't scroll anymore!",
    icon: "➡️",
    component: ScrollHorizontal,
    tags: ["scroll", "endurance", "patience"],
  },
  {
    path: "/webgl-text",
    title: "3D Text Challenge",
    description: "Can you read and type the rotating 3D text?",
    icon: "🎮",
    component: WebGLText,
    tags: ["webgl", "3d", "typing"],
  },
  {
    path: "/file-credentials",
    title: "File Credentials",
    description: "Download a credentials file and use it to log in",
    icon: "🔑",
    component: FileCredentials,
    tags: ["file", "download", "form"],
  },
  {
    path: "/webs-assemble",
    title: "Webs, Assemble!",
    description: "Find the secret code hidden in the WebAssembly module",
    icon: "🕸️",
    component: WebsAssemble,
    tags: ["wasm", "code", "inspection"],
  },
  {
    path: "/menu-navigator",
    title: "Menu Navigator",
    description: "Navigate through a menu bar to find the secret option",
    icon: "🗺️",
    component: MenuNavigator,
    tags: ["menu", "navigation", "hover"],
  },
  {
    path: "/popup-chaos",
    title: "Popup Chaos",
    description:
      "Close the annoying popup windows to reveal the secret password",
    icon: "🪟",
    component: PopupChaos,
    tags: ["drag", "click", "timing"],
  },
  {
    path: "/chart-read",
    title: "Chart Read",
    description: "Find the maximum price and time in the stock chart",
    icon: "📈",
    component: ChartRead,
    tags: ["chart", "analysis", "observation"],
  },
  {
    path: "/chart-transcribe",
    title: "Chart Transcribe",
    description: "Transcribe the bar chart data into CSV format",
    icon: "📊",
    component: ChartTranscribe,
    tags: ["chart", "data", "accuracy"],
  },
  {
    path: "/combination-lock",
    title: "Combination Lock",
    description: "Solve Grampa's riddles to unlock the combination",
    icon: "🔒",
    component: CombinationLock,
    tags: ["puzzle", "riddle", "numbers"],
  },
  {
    path: "/pixel-copy",
    title: "Pixel Copy",
    description: "Recreate the pattern by toggling pixels in the grid",
    icon: "🎨",
    component: PixelCopy,
    tags: ["grid", "pattern", "memory"],
  },
  {
    path: "/illegal-material",
    title: "Restricted Content",
    description:
      "Access this content at your own risk. Your actions are being monitored.",
    icon: "⚠️",
    component: IllegalMaterial,
    tags: ["warning", "legal", "risk"],
  },
  {
    path: "/prompt-defender",
    title: "Prompt Defender",
    description: "Can you resist deception and find the real password?",
    icon: "🛡️",
    component: PromptDefender,
    tags: ["deception", "attention"],
  },
  {
    path: "/shopping-challenge",
    title: "Shopping Challenge",
    description: "Add items to your cart and calculate the total price to win!",
    icon: "🛍️",
    component: ShoppingChallenge,
    tags: ["math", "shopping", "calculation"],
  },
];
