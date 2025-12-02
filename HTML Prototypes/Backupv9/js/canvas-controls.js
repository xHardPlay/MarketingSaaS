// canvas-controls.js - Canvas resizing and preset functionality

// Function to resize canvas
function resizeCanvas(newWidth, newHeight) {
    // Store old dimensions for element repositioning
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    // Set new canvas size
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Update size inputs to reflect actual canvas size
    canvasWidth.value = newWidth;
    canvasHeight.value = newHeight;

    // Update slider max values to match canvas size
    textXSlider.max = newWidth;
    textYSlider.max = newHeight;
    textX.max = newWidth;
    textY.max = newHeight;

    // Update logo position max values
    logoX.max = newWidth;
    logoY.max = newHeight;

    renderCanvas();
}

// Resize canvas button event listener
resizeCanvasBtn.addEventListener('click', () => {
    const newWidth = parseInt(canvasWidth.value);
    const newHeight = parseInt(canvasHeight.value);

    if (newWidth && newHeight && newWidth > 0 && newHeight > 0) {
        if (newWidth > 2000 || newHeight > 2000) {
            alert('Maximum canvas size is 2000x2000 pixels.');
            return;
        }
        resizeCanvas(newWidth, newHeight);
    } else {
        alert('Please enter valid width and height values.');
    }
});

// Preset size buttons
presetInstagramBtn.addEventListener('click', () => {
    canvasWidth.value = 1080;
    canvasHeight.value = 1080;
    resizeCanvas(1080, 1080);
});

presetStoryBtn.addEventListener('click', () => {
    canvasWidth.value = 1080;
    canvasHeight.value = 1920;
    resizeCanvas(1080, 1920);
});

presetFacebookBtn.addEventListener('click', () => {
    canvasWidth.value = 1200;
    canvasHeight.value = 630;
    resizeCanvas(1200, 630);
});
