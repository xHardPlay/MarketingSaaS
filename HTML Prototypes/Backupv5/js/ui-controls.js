// ui-controls.js - UI control synchronization functions

// Sync selected element with text controls
function syncTextElementFromInputs() {
    if (selectedElement && selectedElement.type === 'text') {
        selectedElement.text = textInput.value;
        selectedElement.x = parseInt(textX.value) || 50;
        selectedElement.y = parseInt(textY.value) || 100;
        selectedElement.fontSize = parseInt(textSize.value) || 45;
        selectedElement.color = textColor.value;
        selectedElement.font = textFont.value;
        selectedElement.outline = textOutline.checked;
        renderCanvas();
    }
}

// Sync selected element with logo controls
function syncImageElementFromInputs() {
    if (selectedElement && selectedElement.type === 'image') {
        selectedElement.x = parseInt(logoX.value) || 600;
        selectedElement.y = parseInt(logoY.value) || 50;
        selectedElement.width = (parseInt(logoSize.value) || 20) / 100 * canvas.width;
        selectedElement.height = selectedElement.width; // Keep aspect ratio
        selectedElement.opacity = parseFloat(logoOpacity.value) || 1;
        selectedElement.tint = logoTint.value !== '#ffffff' ? logoTint.value : null;
        renderCanvas();
    }
}

// Slider syncs for text (only when text element is selected)
function updateTextControls(element) {
    if (element && element.type === 'text') {
        textInput.value = element.text;
        textX.value = element.x;
        textY.value = element.y;
        textSize.value = element.fontSize;
        textColor.value = element.color;
        textFont.value = element.font;
        textOutline.checked = element.outline;
        textXSlider.value = element.x;
        textYSlider.value = element.y;
        textSizeSlider.value = element.fontSize;
    }
}

// Slider syncs for logo (only when image element is selected)
function updateImageControls(element) {
    if (element && element.type === 'image') {
        logoX.value = element.x;
        logoY.value = element.y;
        logoSize.value = Math.round((element.width / canvas.width) * 100);
        logoOpacity.value = element.opacity;
        logoTint.value = element.tint || '#ffffff';
    }
}

// Initial setup - populate controls from initial text element
function initializeControls() {
    if (selectedElement && selectedElement.type === 'text') {
        textInput.value = selectedElement.text;
        textX.value = selectedElement.x;
        textY.value = selectedElement.y;
        textSize.value = selectedElement.fontSize;
        textColor.value = selectedElement.color;
        textFont.value = selectedElement.font;
        textOutline.checked = selectedElement.outline;
        textXSlider.value = selectedElement.x;
        textYSlider.value = selectedElement.y;
        textSizeSlider.value = selectedElement.fontSize;
    }
}
