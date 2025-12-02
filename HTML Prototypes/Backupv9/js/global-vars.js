// global-vars.js - Global variables and DOM element selectors (must load first)

// UI elements
const logoInput = document.getElementById('logo-upload');
const textInput = document.getElementById('text-input');
const textX = document.getElementById('text-x');
const textY = document.getElementById('text-y');
const textWidth = document.getElementById('text-width');
const textHeight = document.getElementById('text-height');
const textXSlider = document.getElementById('text-x-slider');
const textYSlider = document.getElementById('text-y-slider');
const textWidthSlider = document.getElementById('text-width-slider');
const textHeightSlider = document.getElementById('text-height-slider');
const textSize = document.getElementById('text-size');
const textSizeSlider = document.getElementById('text-size-slider');
const textOutline = document.getElementById('text-outline');
const textColor = document.getElementById('text-color');
const textFont = document.getElementById('text-font');
const logoTint = document.getElementById('logo-tint');
const logoX = document.getElementById('logo-x');
const logoY = document.getElementById('logo-y');
const logoSize = document.getElementById('logo-size');
const logoOpacity = document.getElementById('logo-opacity');
const addTextBtn = document.getElementById('add-text-btn');
const addLogoBtn = document.getElementById('add-logo-btn');
const deleteElementBtn = document.getElementById('delete-element-btn');
const downloadBtn = document.getElementById('download-btn');
const saveBtn = document.getElementById('save-settings');
const loadInput = document.getElementById('load-settings');
const xlsxInput = document.getElementById('xlsx-upload');
const rowsSummary = document.getElementById('rows-summary');
const canvasWidth = document.getElementById('canvas-width');
const canvasHeight = document.getElementById('canvas-height');
const resizeCanvasBtn = document.getElementById('resize-canvas');
const presetInstagramBtn = document.getElementById('preset-instagram');
const presetStoryBtn = document.getElementById('preset-instagram-story');
const presetFacebookBtn = document.getElementById('preset-facebook');
const generateAllBtn = document.getElementById('generate-all-btn');
const downloadAllCompositionsBtn = document.getElementById('download-all-compositions-btn');
const batchFeedback = document.getElementById('batch-feedback');
const adPreviews = document.getElementById('ad-previews');
const previewsContainer = document.getElementById('previews-container');
const downloadAllBtn = document.getElementById('download-all-btn');

// Batch generation data
let rowsData = [];
let generatedAds = [];
