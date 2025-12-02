// Main entry point - Canvas and state variables (non-DOM globals defined in global-vars.js)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Image data
let backgroundImage = null;
let rowsData = [];

// Set initial canvas size to Instagram (1080x1080)
canvas.width = 1080;
canvas.height = 1080;
canvasWidth.value = canvas.width;
canvasHeight.value = canvas.height;

// Update slider max values for Instagram size
textXSlider.max = canvas.width;
textYSlider.max = canvas.height;
textX.max = canvas.width;
textY.max = canvas.height;
logoX.max = canvas.width;
logoY.max = canvas.height;

// Element management
let selectedElement = null;
let draggedElement = null;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Mouse interaction flags
let isMouseDown = false;
let offsetX = 0;
let offsetY = 0;

// Canvas elements array (can contain text and image elements)
let elements = [];

// Batch generation data
let generatedAds = [];

// Element control buttons
addTextBtn.addEventListener('click', () => {
    // Deselect all elements first
    elements.forEach(el => el.isSelected = false);

    // Create new text element with some offset
    const offset = elements.length * 20;
    const newTextElement = createTextElement('New Text', 50 + offset, 130 + offset, 200, 60, 45, 'Arial', '#000000', false);
    newTextElement.isSelected = true;
    selectedElement = newTextElement;
    elements.push(newTextElement);
    renderCanvas();
});

addLogoBtn.addEventListener('click', () => {
    logoInput.click(); // Trigger logo file input
});

deleteElementBtn.addEventListener('click', () => {
    if (selectedElement) {
        const index = elements.indexOf(selectedElement);
        if (index > -1) {
            elements.splice(index, 1);
            selectedElement = null;
            // Select another element if available
            if (elements.length > 0) {
                elements[0].isSelected = true;
                selectedElement = elements[0];
            }
            renderCanvas();
        }
    }
});

// Add event listeners for all text and logo controls to re-render on change
[textInput, textX, textY, textWidth, textHeight, textSize, textColor, textFont, textOutline].forEach(el => {
    el.addEventListener('input', syncTextElementFromInputs);
    el.addEventListener('change', syncTextElementFromInputs);
});

[logoX, logoY, logoSize, logoOpacity, logoTint].forEach(el => {
    el.addEventListener('input', syncImageElementFromInputs);
    el.addEventListener('change', syncImageElementFromInputs);
});

// Color buttons for quick color selection
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color;
        textColor.value = color;
        syncTextElementFromInputs();
    });
});

// Update slider syncs to use selected element
textXSlider.addEventListener('input', () => {
    if (selectedElement && selectedElement.type === 'text') {
        textX.value = textXSlider.value;
        selectedElement.x = parseInt(textXSlider.value);
        renderCanvas();
    }
});

textYSlider.addEventListener('input', () => {
    if (selectedElement && selectedElement.type === 'text') {
        textY.value = textYSlider.value;
        selectedElement.y = parseInt(textYSlider.value);
        renderCanvas();
    }
});

textWidthSlider.addEventListener('input', () => {
    if (selectedElement && selectedElement.type === 'text') {
        textWidth.value = textWidthSlider.value;
        selectedElement.width = parseInt(textWidthSlider.value);
        renderCanvas();
    }
});

textHeightSlider.addEventListener('input', () => {
    if (selectedElement && selectedElement.type === 'text') {
        textHeight.value = textHeightSlider.value;
        selectedElement.height = parseInt(textHeightSlider.value);
        renderCanvas();
    }
});

textSizeSlider.addEventListener('input', () => {
    if (selectedElement && selectedElement.type === 'text') {
        textSize.value = textSizeSlider.value;
        selectedElement.fontSize = parseInt(textSizeSlider.value);
        renderCanvas();
    }
});

// Initial setup
// Create initial text element with main text defaults
let initialTextElement = createTextElement('Enter your text here', 65, 483, 300, 80, 81, 'Montserrat', '#ffffff', false);
initialTextElement.isSelected = true;
selectedElement = initialTextElement;
elements.push(initialTextElement);

// Initialize controls and render
initializeControls();
updateTextControls(selectedElement);
renderCanvas();
