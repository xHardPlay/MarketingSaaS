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
    if (file.size > 1024 * 1024 * 1) { // 1MB
        alert('Image file size should not exceed 1MB.');
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
    if (file.size > 1024 * 1024 * 1) { // 1MB
        alert('Logo file size should not exceed 1MB.');
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
[textInput, textX, textY, textSize, textColor, logoX, logoY, logoSize, logoOpacity].forEach(el => {
    el.addEventListener('input', renderCanvas);
    el.addEventListener('change', renderCanvas);
});

// Function to render the canvas
function renderCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (backgroundImage) {
        // Scale to fit canvas
        const scale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
        const x = (canvas.width - backgroundImage.width * scale) / 2;
        const y = (canvas.height - backgroundImage.height * scale) / 2;
        ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale);
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
        ctx.font = `${textSize.value}px Arial`;
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

// Initial render (empty canvas)
renderCanvas();
