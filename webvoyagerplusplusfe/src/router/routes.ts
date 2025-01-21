import { FC } from "react";
import AdClicked from "../pages/AdClicked";
import BlockStack from "../pages/BlockStack";
import Breakout from "../pages/Breakout";
import Bullseye from "../pages/Bullseye";
import ButtonHold from "../pages/ButtonHold";
import ButtonMegastar from "../pages/ButtonMegastar";
import CalendarComprehension from "../pages/CalendarComprehension";
import CanvasCatch from "../pages/CanvasCatch";
import ChartRead from "../pages/ChartRead";
import ChartTranscribe from "../pages/ChartTranscribe";
import ClickCubed from "../pages/ClickCubed";
import ClickPixel from "../pages/ClickPixel";
import ColorHarmony from "../pages/ColorHarmony";
import CombinationLock from "../pages/CombinationLock";
import ContextBreaker from "../pages/ContextBreaker";
import EmojiRemember from "../pages/EmojiRemember";
import FileCredentials from "../pages/FileCredentials";
import FileUpload from "../pages/FileUpload";
import Frogger from "../pages/Frogger";
import Herding from "../pages/Herding";
import IAccept from "../pages/IAccept";
import IframeContent from "../pages/IframeContent";
import IframeNest from "../pages/IframeNest";
import IllegalMaterial from "../pages/IllegalMaterial";
import KeyCombo from "../pages/KeyCombo";
import LadyBirdPlanner from "../pages/LadyBirdPlanner";
import MapPanner from "../pages/MapPanner";
import MazeNavigator from "../pages/MazeNavigator";
import MenuNavigator from "../pages/MenuNavigator";
import OTPEntry from "../pages/OTPEntry";
import Patience from "../pages/Patience";
import PixelCopy from "../pages/PixelCopy";
import PopupChaos from "../pages/PopupChaos";
import PrintReveal from "../pages/PrintReveal";
import PromptDefender from "../pages/PromptDefender";
import RecipeCalculator from "../pages/RecipeCalculator";
import RecipeDetail from "../pages/RecipeDetail";
import RecipeList from "../pages/RecipeList";
import RightClickReveal from "../pages/RightClickReveal";
import RoboCheck from "../pages/RoboCheck";
import ScrollDiagonal from "../pages/ScrollDiagonal";
import ScrollHorizontal from "../pages/ScrollHorizontal";
import ScrollVertical from "../pages/ScrollVertical";
import ShopAdmin from "../pages/ShopAdmin";
import ShopAdminEdit from "../pages/ShopAdminEdit";
import ShoppingChallenge from "../pages/ShoppingChallenge";
import SliderSymphony from "../pages/SliderSymphony";
import TabSync from "../pages/TabSync";
import TabSyncReceiver from "../pages/TabSyncReceiver";
import TabSyncSender from "../pages/TabSyncSender";
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
  hidden?: boolean;
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
  {
    path: "/maze/*",
    title: "The Maze",
    description:
      "Navigate through a series of doors to find the exit - but choose wisely!",
    icon: "🚪",
    component: MazeNavigator,
    tags: ["navigation", "memory", "maze"],
  },
  {
    path: "/context-breaker",
    title: "Context Breaker",
    description:
      "Can you scroll all the way to the bottom to find the secret password?",
    icon: "🤖",
    component: ContextBreaker,
    tags: ["scroll", "endurance", "patience"],
  },
  {
    path: "/scroll-diagonal",
    title: "Diagonal Scroll",
    description:
      "Navigate to the bottom-right corner through diagonal scrolling!",
    icon: "↘️",
    component: ScrollDiagonal,
    tags: ["scroll", "endurance", "coordination"],
  },
  {
    path: "/block-stack",
    title: "Block Stack",
    description: "Stack blocks above the red line using physics to win!",
    icon: "🏗️",
    component: BlockStack,
    tags: ["physics", "coordination", "puzzle"],
  },
  {
    path: "/iframe-nest",
    title: "Nested Frames",
    description: "Navigate through nested iframes to find the hidden button",
    icon: "🖼️",
    component: IframeNest,
    tags: ["iframe", "navigation", "depth"],
  },
  {
    path: "/iframe-content/:depth",
    title: "Iframe Content",
    description: "Content for nested iframes",
    icon: "🖼️",
    component: IframeContent,
    tags: ["iframe", "content"],
    hidden: true,
  },
  {
    path: "/tab-sync",
    title: "Tab Sync",
    description:
      "Synchronize colors between browser tabs to reveal the password",
    icon: "🎨",
    component: TabSync,
    tags: ["tabs", "communication", "colors"],
  },
  {
    path: "/tab-sync/sender",
    title: "Tab Sync Sender",
    description: "Send color signals to the receiver",
    icon: "📤",
    component: TabSyncSender,
    tags: ["tabs", "communication"],
    hidden: true,
  },
  {
    path: "/tab-sync/receiver",
    title: "Tab Sync Receiver",
    description: "Receive and validate color sequences",
    icon: "📥",
    component: TabSyncReceiver,
    tags: ["tabs", "communication"],
    hidden: true,
  },
  {
    path: "/otp-entry",
    title: "OTP Entry",
    description: "Enter a 6-digit one-time password with auto-focusing inputs",
    icon: "🔢",
    component: OTPEntry,
    tags: ["input", "form", "focus"],
  },
  {
    path: "/print-reveal",
    title: "Print to Reveal",
    description: "Print this page to PDF to reveal the hidden password",
    icon: "🖨️",
    component: PrintReveal,
    tags: ["print", "pdf", "hidden"],
  },
  {
    path: "/robo-check",
    title: "Human Verification",
    description: "Complete a CAPTCHA challenge to prove you're human",
    icon: "🤖",
    component: RoboCheck,
    tags: ["captcha", "verification", "human"],
  },
  {
    path: "/right-click",
    title: "Right Click Reveal",
    description: "Use your context menu skills to reveal the hidden password",
    icon: "🖱️",
    component: RightClickReveal,
    tags: ["mouse", "context-menu", "interaction"],
  },
  {
    path: "/calendar-comprehension",
    title: "Calendar Comprehension",
    description: "Study a calendar and answer questions about the events",
    icon: "📅",
    component: CalendarComprehension,
    tags: ["calendar", "comprehension", "attention"],
  },
  {
    path: "/map-panner",
    title: "Map Panner",
    description: "Pan around a mysterious map to find the hidden treasure",
    icon: "🗺️",
    component: MapPanner,
    tags: ["drag", "exploration", "coordination"],
  },
  {
    path: "/ladybird",
    title: "LadyBird Planner",
    description:
      "Plan the ladybird's path to reach the flower using directional emojis",
    icon: "🐞",
    component: LadyBirdPlanner,
    tags: ["planning", "puzzle", "maze"],
  },
  {
    path: "/shop-admin",
    title: "Shop Admin",
    description: "Update product prices in the admin panel",
    icon: "🏪",
    component: ShopAdmin,
    tags: ["admin", "form", "edit"],
  },
  {
    path: "/shop-admin/edit/:productId",
    title: "Edit Product",
    description: "Edit product details",
    icon: "✏️",
    component: ShopAdminEdit,
    tags: ["admin", "form", "edit"],
    hidden: true,
  },
  {
    path: "/click-pixel",
    title: "Pixel Perfect",
    description: "Can you click on a single pixel target?",
    icon: "🎯",
    component: ClickPixel,
    tags: ["precision", "mouse", "dexterity"],
  },
  {
    path: "/recipes",
    title: "Recipe Book",
    description: "Browse and discover delicious recipes",
    icon: "📖",
    component: RecipeList,
    tags: ["recipes", "cooking", "food"],
  },
  {
    path: "/recipes/:recipeId",
    title: "Recipe Details",
    description: "View recipe details",
    icon: "🍳",
    component: RecipeDetail,
    tags: ["recipes", "cooking", "food"],
    hidden: true,
  },
  {
    path: "/recipe-calculator",
    title: "Recipe Calculator",
    description:
      "Help calculate the right amount of ingredients for a dinner party",
    icon: "🧮",
    component: RecipeCalculator,
    tags: ["math", "recipes", "calculation"],
  },
  {
    path: "/ad-clicked",
    title: "Advertisement",
    description: "Advertisement landing page",
    icon: "🎯",
    component: AdClicked,
    tags: ["ad"],
    hidden: true,
  },
];
