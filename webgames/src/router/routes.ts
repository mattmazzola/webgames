import { FC } from "react";
import AdClicked from "../pages/AdClicked";
import BlockStack, { PASSWORD_BlockStack } from "../pages/BlockStack";
import BrickBuster, { PASSWORD_BrickBuster } from "../pages/BrickBuster";
import Bullseye, { PASSWORD_Bullseye } from "../pages/Bullseye";
import ButtonHold, { PASSWORD_ButtonHold } from "../pages/ButtonHold";
import ButtonMegastar, {
  PASSWORD_ButtonMegastar,
  TASK_ID_ButtonMegastar,
} from "../pages/ButtonMegastar";
import CalendarComprehension, {
  PASSWORD_CalendarComprehension,
} from "../pages/CalendarComprehension";
import CalendarComprehension2, {
  PASSWORD_CalendarComprehension2,
} from "../pages/CalendarComprehension2";
import CanvasCatch, { PASSWORD_CanvasCatch } from "../pages/CanvasCatch";
import ChartRead, { PASSWORD_ChartRead } from "../pages/ChartRead";
import ChartTranscribe, {
  PASSWORD_ChartTranscribe,
} from "../pages/ChartTranscribe";
import ClickCubed, {
  PASSWORD_ClickCubed,
  TASK_ID_ClickCubed,
} from "../pages/ClickCubed";
import ClickPixel, { PASSWORD_ClickPixel } from "../pages/ClickPixel";
import ColorHarmony, { PASSWORD_ColorHarmony } from "../pages/ColorHarmony";
import CombinationLock, {
  PASSWORD_CombinationLock,
} from "../pages/CombinationLock";
import ContextBreaker, {
  PASSWORD_ContextBreaker,
} from "../pages/ContextBreaker";
import EmojiRemember, { PASSWORD_EmojiRemember } from "../pages/EmojiRemember";
import FileCredentials, {
  PASSWORD_FileCredentials,
} from "../pages/FileCredentials";
import FileUpload, { PASSWORD_FileUpload } from "../pages/FileUpload";
import FrogCrossing, { PASSWORD_FrogCrossing } from "../pages/FrogCrossing";
import Herding, { PASSWORD_Herding } from "../pages/Herding";
import IAccept, { PASSWORD_IAccept } from "../pages/IAccept";
import IframeContent, { PASSWORD_IframeContent } from "../pages/IframeContent";
import IframeNest, { PASSWORD_IframeNest } from "../pages/IframeNest";
import IllegalMaterial, {
  PASSWORD_IllegalMaterial,
} from "../pages/IllegalMaterial";
import KeyCombo, { PASSWORD_KeyCombo } from "../pages/KeyCombo";
import LadyBirdPlanner, {
  PASSWORD_LadyBirdPlanner,
} from "../pages/LadyBirdPlanner";
import MapPanner, { PASSWORD_MapPanner } from "../pages/MapPanner";
import MazeNavigator, { PASSWORD_MazeNavigator } from "../pages/MazeNavigator";
import MenuNavigator, { PASSWORD_MenuNavigator } from "../pages/MenuNavigator";
import OTPEntry, { PASSWORD_OTPEntry } from "../pages/OTPEntry";
import Patience, {
  PASSWORD_Patience,
  TASK_ID_Patience,
} from "../pages/Patience";
import PixelCopy, { PASSWORD_PixelCopy } from "../pages/PixelCopy";
import PopupChaos, { PASSWORD_PopupChaos } from "../pages/PopupChaos";
import PrintReveal, { PASSWORD_PrintReveal } from "../pages/PrintReveal";
import PromptDefender, {
  PASSWORD_PromptDefender,
} from "../pages/PromptDefender";
import RecipeCalculator, {
  PASSWORD_RecipeCalculator,
} from "../pages/RecipeCalculator";
import RecipeDetail from "../pages/RecipeDetail";
import RecipeList from "../pages/RecipeList";
import RightClickReveal, {
  PASSWORD_RightClickReveal,
} from "../pages/RightClickReveal";
import RoboCheck, { PASSWORD_RoboCheck } from "../pages/RoboCheck";
import ScrollDiagonal, {
  PASSWORD_ScrollDiagonal,
} from "../pages/ScrollDiagonal";
import ScrollHorizontal, {
  PASSWORD_ScrollHorizontal,
} from "../pages/ScrollHorizontal";
import ScrollVertical, {
  PASSWORD_ScrollVertical,
} from "../pages/ScrollVertical";
import ShopAdmin, { PASSWORD_ShopAdmin } from "../pages/ShopAdmin";
import ShopAdminEdit from "../pages/ShopAdminEdit";
import ShoppingChallenge, {
  PASSWORD_ShoppingChallenge,
} from "../pages/ShoppingChallenge";
import SliderSymphony, {
  PASSWORD_SliderSymphony,
  TASK_ID_SliderSymphony,
} from "../pages/SliderSymphony";
import StockMarketScroll, {
  PASSWORD_StockMarketScroll,
} from "../pages/StockMarketScroll";
import TabSync, { PASSWORD_TabSync } from "../pages/TabSync";
import TabSyncReceiver from "../pages/TabSyncReceiver";
import TabSyncSender from "../pages/TabSyncSender";
import TextMirror, { PASSWORD_TextMirror } from "../pages/TextMirror";
import TodaysDate, {
  PASSWORD_TodaysDate,
  TASK_ID_TodaysDate,
} from "../pages/TodaysDate";
import TowersOfHanoi, { PASSWORD_TowersOfHanoi } from "../pages/TowersOfHanoi";
import WebGLText, { PASSWORD_WebGLText } from "../pages/WebGLText";
import WebsAssemble, { PASSWORD_WebsAssemble } from "../pages/WebsAssemble";
import WolfGoatCabbage, {
  PASSWORD_WolfGoatCabbage,
} from "../pages/WolfGoatCabbage";

export interface RouteConfig {
  path: string;
  title: string;
  description: string;
  icon: string;
  component: FC;
  tags: string[];
  hidden?: boolean;
  password?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export const routes: RouteConfig[] = [
  {
    path: TASK_ID_TodaysDate,
    title: "Today's date",
    description: "Enter today's date",
    icon: "📅",
    component: TodaysDate,
    tags: ["form", "date"],
    password: PASSWORD_TodaysDate,
    difficulty: "easy",
  },
  {
    path: TASK_ID_ButtonMegastar,
    title: "Button megastar",
    description: "Click everything on the page to reveal the password",
    icon: "🔘",
    component: ButtonMegastar,
    tags: ["button", "click"],
    password: PASSWORD_ButtonMegastar,
    difficulty: "easy",
  },
  {
    path: TASK_ID_ClickCubed,
    title: "Click³",
    description: "Click three times before time runs out",
    icon: "⏱️",
    component: ClickCubed,
    tags: ["click", "timed"],
    password: PASSWORD_ClickCubed,
    difficulty: "medium",
  },
  {
    path: TASK_ID_Patience,
    title: "Patience test",
    description: "Wait the perfect amount of time to reveal the password",
    icon: "⌛",
    component: Patience,
    tags: ["timed", "refresh"],
    password: PASSWORD_Patience,
    difficulty: "medium",
  },
  {
    path: TASK_ID_SliderSymphony,
    title: "Slider symphony",
    description: "Align the boxes by mastering the vertical sliders!",
    icon: "🎚️",
    component: SliderSymphony,
    tags: ["slider", "actuation"],
    password: PASSWORD_SliderSymphony,
    difficulty: "medium",
  },
  {
    path: "emoji-remember",
    title: "Emoji remember",
    description: "Remember the sequence of emojis to unlock the secret",
    icon: "🧠",
    component: EmojiRemember,
    tags: ["memory", "search"],
    password: PASSWORD_EmojiRemember,
    difficulty: "hard",
  },
  {
    path: "bullseye",
    title: "Bullseye",
    description:
      "Click the moving target three times - but watch out, it gets faster!",
    icon: "🎯",
    component: Bullseye,
    tags: ["click", "timed", "coordination"],
    password: PASSWORD_Bullseye,
    difficulty: "hard",
  },
  {
    path: "i-accept",
    title: "I Accept",
    description: "Prove you're human by agreeing to our terms",
    icon: "✅",
    component: IAccept,
    tags: ["checkbox", "human"],
    password: PASSWORD_IAccept,
    difficulty: "easy",
  },
  {
    path: "wolf-goat-cabbage",
    title: "River Crossing",
    description: "Transport a wolf, goat, and cabbage across the river safely",
    icon: "⛵",
    component: WolfGoatCabbage,
    tags: ["logic", "planning"],
    password: PASSWORD_WolfGoatCabbage,
    difficulty: "medium",
  },
  {
    path: "towers-of-hanoi",
    title: "Towers of Hanoi",
    description: "Stack the disks on the rightmost peg following the rules",
    icon: "🗼",
    component: TowersOfHanoi,
    tags: ["logic", "planning"],
    password: PASSWORD_TowersOfHanoi,
    difficulty: "medium",
  },
  {
    path: "color-harmony",
    title: "Color Harmony",
    description: "Mix the perfect color combination using RGB sliders",
    icon: "🎨",
    component: ColorHarmony,
    tags: ["color", "slider", "dexterity", "perception"],
    password: PASSWORD_ColorHarmony,
    difficulty: "medium",
  },
  {
    path: "herding",
    title: "Sheep Herding",
    description:
      "Guide the wandering sheep into their pen by hovering with your cursor",
    icon: "🐑",
    component: Herding,
    tags: ["mouse", "dexterity"],
    password: PASSWORD_Herding,
    difficulty: "hard",
  },
  {
    path: "file-upload",
    title: "File Upload",
    description: "Upload any file to complete this challenge",
    icon: "📎",
    component: FileUpload,
    tags: ["file", "upload"],
    password: PASSWORD_FileUpload,
    difficulty: "easy",
  },
  {
    path: "canvas-catch",
    title: "Canvas Catch",
    description:
      "Drag the circle into the target zone to complete the challenge",
    icon: "🎯",
    component: CanvasCatch,
    tags: ["canvas", "drag"],
    password: PASSWORD_CanvasCatch,
    difficulty: "medium",
  },
  {
    path: "brick-buster",
    title: "Brick buster",
    description: "Break all the bricks to win!",
    icon: "🧱",
    component: BrickBuster,
    tags: ["game", "coordination"],
    password: PASSWORD_BrickBuster,
    difficulty: "hard",
  },
  {
    path: "text-mirror",
    title: "Text Mirror",
    description: "Perfectly copy the text",
    icon: "📝",
    component: TextMirror,
    tags: ["text", "copypaste", "typing"],
    password: PASSWORD_TextMirror,
    difficulty: "easy",
  },
  {
    path: "frog-crossing",
    title: "Frog Crossing",
    description: "Guide your frog safely across the busy road",
    icon: "🐸",
    component: FrogCrossing,
    tags: ["game", "keyboard"],
    password: PASSWORD_FrogCrossing,
    difficulty: "hard",
  },
  {
    path: "button-hold",
    title: "Button Hold",
    description: "Hold the button for exactly 3 seconds",
    icon: "⏱️",
    component: ButtonHold,
    tags: ["button", "timed"],
    password: PASSWORD_ButtonHold,
    difficulty: "easy",
  },
  {
    path: "key-combo",
    title: "Key Combo",
    description: "Press the correct key combination to unlock the secret",
    icon: "⌨️",
    component: KeyCombo,
    tags: ["keyboard"],
    password: PASSWORD_KeyCombo,
    difficulty: "easy",
  },
  {
    path: "scroll-vertical",
    title: "Scroll vertical",
    description: "Scroll down to find the password",
    icon: "📜",
    component: ScrollVertical,
    tags: ["scroll"],
    password: PASSWORD_ScrollVertical,
    difficulty: "easy",
  },
  {
    path: "scroll-horizontal",
    title: "Scroll horizontal",
    description: "Scroll right to find the password",
    icon: "➡️",
    component: ScrollHorizontal,
    tags: ["scroll"],
    password: PASSWORD_ScrollHorizontal,
    difficulty: "easy",
  },
  {
    path: "webgl-text",
    title: "WebGL Text",
    description: "Recognise the WebGL shape",
    icon: "🎮",
    component: WebGLText,
    tags: ["webgl"],
    password: PASSWORD_WebGLText,
    difficulty: "easy",
  },
  {
    path: "file-credentials",
    title: "File Credentials",
    description: "Download a credentials file and use it to log in",
    icon: "🔑",
    component: FileCredentials,
    tags: ["file", "download"],
    password: PASSWORD_FileCredentials,
    difficulty: "easy",
  },
  {
    path: "webs-assemble",
    title: "Webs, Assemble!",
    description: "Find the secret code hidden in the WebAssembly module",
    icon: "🕸️",
    component: WebsAssemble,
    tags: ["wasm", "code", "inspection"],
    password: PASSWORD_WebsAssemble,
    difficulty: "easy",
  },
  {
    path: "menu-navigator",
    title: "Menu Navigator",
    description: "Navigate through a menu bar to find the secret option",
    icon: "🗺️",
    component: MenuNavigator,
    tags: ["menu", "navigation", "hover"],
    password: PASSWORD_MenuNavigator,
  },
  {
    path: "popup-chaos",
    title: "Popup Chaos",
    description:
      "Close the annoying popup windows to reveal the secret password",
    icon: "🪟",
    component: PopupChaos,
    tags: ["drag", "click", "timing"],
    password: PASSWORD_PopupChaos,
  },
  {
    path: "chart-read",
    title: "Chart Read",
    description: "Find the maximum price and time in the stock chart",
    icon: "📈",
    component: ChartRead,
    tags: ["chart", "analysis", "observation"],
    password: PASSWORD_ChartRead,
  },
  {
    path: "chart-transcribe",
    title: "Chart Transcribe",
    description: "Transcribe the bar chart data into CSV format",
    icon: "📊",
    component: ChartTranscribe,
    tags: ["chart", "data", "accuracy"],
    password: PASSWORD_ChartTranscribe,
  },
  {
    path: "combination-lock",
    title: "Combination Lock",
    description: "Solve Grampa's riddles to unlock the combination",
    icon: "🔒",
    component: CombinationLock,
    tags: ["puzzle", "riddle", "numbers"],
    password: PASSWORD_CombinationLock,
  },
  {
    path: "pixel-copy",
    title: "Pixel Copy",
    description: "Recreate the pattern by toggling pixels in the grid",
    icon: "🎨",
    component: PixelCopy,
    tags: ["grid", "pattern", "memory"],
    password: PASSWORD_PixelCopy,
  },
  {
    path: "illegal-material",
    title: "Restricted Content",
    description:
      "Access this content at your own risk. Your actions are being monitored.",
    icon: "⚠️",
    component: IllegalMaterial,
    tags: ["warning", "legal", "risk"],
    password: PASSWORD_IllegalMaterial,
  },
  {
    path: "prompt-defender",
    title: "Prompt Defender",
    description: "Can you resist deception and find the real password?",
    icon: "🛡️",
    component: PromptDefender,
    tags: ["deception", "attention"],
    password: PASSWORD_PromptDefender,
  },
  {
    path: "shopping-challenge",
    title: "Shopping Challenge",
    description: "Add items to your cart and calculate the total price to win!",
    icon: "🛍️",
    component: ShoppingChallenge,
    tags: ["math", "shopping", "calculation"],
    password: PASSWORD_ShoppingChallenge,
  },
  {
    path: "maze/*",
    title: "The Maze",
    description:
      "Navigate through a series of doors to find the exit - but choose wisely!",
    icon: "🚪",
    component: MazeNavigator,
    tags: ["navigation", "memory", "maze"],
    password: PASSWORD_MazeNavigator,
  },
  {
    path: "context-breaker",
    title: "Context Breaker",
    description:
      "Can you scroll all the way to the bottom to find the secret password?",
    icon: "🤖",
    component: ContextBreaker,
    tags: ["scroll", "endurance", "patience"],
    password: PASSWORD_ContextBreaker,
  },
  {
    path: "scroll-diagonal",
    title: "Diagonal Scroll",
    description:
      "Navigate to the bottom-right corner through diagonal scrolling!",
    icon: "↘️",
    component: ScrollDiagonal,
    tags: ["scroll", "endurance", "coordination"],
    password: PASSWORD_ScrollDiagonal,
  },
  {
    path: "block-stack",
    title: "Block Stack",
    description: "Stack blocks above the red line using physics to win!",
    icon: "🏗️",
    component: BlockStack,
    tags: ["physics", "coordination", "puzzle"],
    password: PASSWORD_BlockStack,
  },
  {
    path: "iframe-nest",
    title: "Nested Frames",
    description: "Navigate through nested iframes to find the hidden button",
    icon: "🖼️",
    component: IframeNest,
    tags: ["iframe", "navigation", "depth"],
    password: PASSWORD_IframeNest,
  },
  {
    path: "iframe-content/:depth",
    title: "Iframe Content",
    description: "Content for nested iframes",
    icon: "🖼️",
    component: IframeContent,
    tags: ["iframe", "content"],
    hidden: true,
    password: PASSWORD_IframeContent,
  },
  {
    path: "tab-sync",
    title: "Tab Sync",
    description:
      "Synchronize colors between browser tabs to reveal the password",
    icon: "🎨",
    component: TabSync,
    tags: ["tabs", "communication", "colors"],
    password: PASSWORD_TabSync,
  },
  {
    path: "tab-sync/sender",
    title: "Tab Sync Sender",
    description: "Send color signals to the receiver",
    icon: "📤",
    component: TabSyncSender,
    tags: ["tabs", "communication"],
    hidden: true,
  },
  {
    path: "tab-sync/receiver",
    title: "Tab Sync Receiver",
    description: "Receive and validate color sequences",
    icon: "📥",
    component: TabSyncReceiver,
    tags: ["tabs", "communication"],
    hidden: true,
  },
  {
    path: "otp-entry",
    title: "OTP Entry",
    description: "Enter a 6-digit one-time password with auto-focusing inputs",
    icon: "🔢",
    component: OTPEntry,
    tags: ["input", "form", "focus"],
    password: PASSWORD_OTPEntry,
  },
  {
    path: "print-reveal",
    title: "Print to Reveal",
    description: "Print this page to PDF to reveal the hidden password",
    icon: "🖨️",
    component: PrintReveal,
    tags: ["print", "pdf", "hidden"],
    password: PASSWORD_PrintReveal,
  },
  {
    path: "robo-check",
    title: "Human Verification",
    description: "Complete a CAPTCHA challenge to prove you're human",
    icon: "🤖",
    component: RoboCheck,
    tags: ["captcha", "verification", "human"],
    password: PASSWORD_RoboCheck,
  },
  {
    path: "right-click",
    title: "Right Click Reveal",
    description: "Use your context menu skills to reveal the hidden password",
    icon: "🖱️",
    component: RightClickReveal,
    tags: ["mouse", "context-menu", "interaction"],
    password: PASSWORD_RightClickReveal,
  },
  {
    path: "calendar-comprehension",
    title: "Calendar Comprehension",
    description: "Study a calendar and answer questions about the events",
    icon: "📅",
    component: CalendarComprehension,
    tags: ["calendar", "comprehension", "attention"],
    password: PASSWORD_CalendarComprehension,
  },
  {
    path: "map-panner",
    title: "Map Panner",
    description: "Pan around a mysterious map to find the hidden treasure",
    icon: "🗺️",
    component: MapPanner,
    tags: ["drag", "exploration", "coordination"],
    password: PASSWORD_MapPanner,
  },
  {
    path: "ladybird",
    title: "LadyBird Planner",
    description:
      "Plan the ladybird's path to reach the flower using directional emojis",
    icon: "🐞",
    component: LadyBirdPlanner,
    tags: ["planning", "puzzle", "maze"],
    password: PASSWORD_LadyBirdPlanner,
  },
  {
    path: "shop-admin",
    title: "Shop Admin",
    description: "Update product prices in the admin panel",
    icon: "🏪",
    component: ShopAdmin,
    tags: ["admin", "form", "edit"],
    password: PASSWORD_ShopAdmin,
  },
  {
    path: "shop-admin/edit/:productId",
    title: "Edit Product",
    description: "Edit product details",
    icon: "✏️",
    component: ShopAdminEdit,
    tags: ["admin", "form", "edit"],
    hidden: true,
  },
  {
    path: "click-pixel",
    title: "Pixel Perfect",
    description: "Can you click on a single pixel target?",
    icon: "🎯",
    component: ClickPixel,
    tags: ["precision", "mouse", "dexterity"],
    password: PASSWORD_ClickPixel,
  },
  {
    path: "recipes",
    title: "Recipe Book",
    description: "Browse and discover delicious recipes",
    icon: "📖",
    component: RecipeList,
    tags: ["recipes", "cooking", "food"],
    hidden: true,
  },
  {
    path: "recipes/:recipeId",
    title: "Recipe Details",
    description: "View recipe details",
    icon: "🍳",
    component: RecipeDetail,
    tags: ["recipes", "cooking", "food"],
    hidden: true,
  },
  {
    path: "recipe-calculator",
    title: "Recipe Calculator",
    description:
      "Help calculate the right amount of ingredients for a dinner party",
    icon: "🧮",
    component: RecipeCalculator,
    tags: ["math", "recipes", "calculation"],
    password: PASSWORD_RecipeCalculator,
  },
  {
    path: "ad-clicked",
    title: "Advertisement",
    description: "Advertisement landing page",
    icon: "🎯",
    component: AdClicked,
    tags: ["ad"],
    hidden: true,
  },
  {
    path: "calendar2",
    title: "Advanced Calendar Challenge",
    description:
      "Test your calendar comprehension skills with complex time calculations",
    icon: "📅",
    component: CalendarComprehension2,
    tags: ["calendar", "time", "math"],
    password: PASSWORD_CalendarComprehension2,
  },
  {
    path: "stock-market",
    title: "Stock Market Insight",
    description: "Discover the best tech stock to buy in 2025",
    icon: "📈",
    component: StockMarketScroll,
    tags: ["scroll", "reading", "stocks"],
    password: PASSWORD_StockMarketScroll,
  },
];
