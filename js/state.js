/* ==========================================================================
   ESTADO GLOBAL
   ========================================================================== */
let canvas = null;
let history = [];
let historyIndex = -1;
const MAX_HISTORY_STEPS = 50;
let currentToolMode = 'text';
let lastActiveTextObj = null;
let isPickingColor = false;
let isRestoringState = false;
let savedTextSelection = null;

let isGridOn = false;

/* Caption mode */
let isCaptionModeListening = false;
let isCaptioningActive = false;
let captionTextbox = null;
let recognition = null;
let accumulatedTranscript = "";

const limitReachedSound = new Audio("https://res.cloudinary.com/dbwqwgbtx/video/upload/v1780071232/soundshelfstudio-ui-success-chime-513565_up13as.mp3");
