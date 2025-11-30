const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// UI elements
const imageInput = document.getElementById('image-upload');
const logoInput = document.getElementById('logo-upload');
const textInput = document.getElementById('text-input');
const textX = document.getElementById('text-x');
const textY = document.getElementById('text-y');
const textSize = document.getElementById('text-size');
const textColor = document.getElementById('text-color');
const logoX = document.getElementById('logo-x');
const logoY = document.getElementById('logo-y');
const logoSize = document.getElementById('logo-size');
const logoOpacity = document.getElementById('logo-opacity');
const downloadBtn = document.getElementById('download-btn');
const textFont = document.getElementById('text-font');
const saveBtn = document.getElementById('save-settings');
const loadInput = document.getElementById('load-settings');

// Image data
let backgroundImage = null;
let logoImage = null;

// Set canvas size (can be adjusted for better UX)
canvas.width = 800;
canvas.height = 600;

// Load background image
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            backgroundImage = img;
            renderCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Load logo image
logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file for logo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            logoImage = img;
            renderCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Add event listeners for all text and logo controls to re-render on change
[textInput, textX, textY, textSize, textColor, textFont, logoX, logoY, logoSize, logoOpacity].forEach(el => {
    el.addEventListener('input', renderCanvas);
    el.addEventListener('change', renderCanvas);
    el.addEventListener('click', renderCanvas);
});

// Function to render the canvas
function renderCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (backgroundImage) {
        // Draw at original size, centered (may be clipped if larger than canvas)
        const x = (canvas.width - backgroundImage.width) / 2;
        const y = (canvas.height - backgroundImage.height) / 2;
        ctx.drawImage(backgroundImage, x, y);
    }

    // Draw logo if loaded, with opacity and size
    if (logoImage) {
        ctx.globalAlpha = parseFloat(logoOpacity.value);
        const size = canvas.width * parseFloat(logoSize.value) / 100;
        ctx.drawImage(logoImage, parseInt(logoX.value), parseInt(logoY.value), size, size);
        ctx.globalAlpha = 1; // Reset opacity
    }

    // Draw text
    const text = textInput.value;
    if (text) {
        ctx.fillStyle = textColor.value;
        ctx.font = `${textSize.value}px ${textFont.value}`;
        ctx.fillText(text, parseInt(textX.value), parseInt(textY.value));
    }
}

// Download functionality
downloadBtn.addEventListener('click', () => {
    if (!backgroundImage) {
        alert('Please upload a background image before downloading.');
        return;
    }
    const link = document.createElement('a');
    link.download = 'designed-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Save settings functionality
saveBtn.addEventListener('click', () => {
    const settings = {
        textInput: textInput.value,
        textX: textX.value,
        textY: textY.value,
        textSize: textSize.value,
        textColor: textColor.value,
        textFont: textFont.value,
        logoX: logoX.value,
        logoY: logoY.value,
        logoSize: logoSize.value,
        logoOpacity: logoOpacity.value
    };
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'settings.json';
    link.click();
});

// Load settings functionality
loadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type || !file.type.includes('json')) {
        alert('Please select a valid JSON file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const settings = JSON.parse(e.target.result);
            // Apply settings
            textInput.value = settings.textInput || '';
            textX.value = settings.textX || 50;
            textY.value = settings.textY || 100;
            textSize.value = settings.textSize || 30;
            textColor.value = settings.textColor || '#000000';
            textFont.value = settings.textFont || 'Arial';
            logoX.value = settings.logoX || 600;
            logoY.value = settings.logoY || 50;
            logoSize.value = settings.logoSize || 20;
            logoOpacity.value = settings.logoOpacity || 1;

            // Re-render with new settings
            renderCanvas();
            alert('Settings loaded successfully.');
        } catch (error) {
            alert('Error loading settings: Invalid JSON file.');
        }
    };
    reader.readAsText(file);
});

// Initial render (empty canvas)
renderCanvas();
