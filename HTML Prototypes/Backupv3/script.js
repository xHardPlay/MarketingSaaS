const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// UI elements
const imageInput = document.getElementById('image-upload');
const logoInput = document.getElementById('logo-upload');
const textInput = document.getElementById('text-input');
const textX = document.getElementById('text-x');
const textY = document.getElementById('text-y');
const textXSlider = document.getElementById('text-x-slider');
const textYSlider = document.getElementById('text-y-slider');
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

// Image data
let backgroundImage = null;
let logoImage = null;
let rowsData = [];

// Set canvas size (can be adjusted for better UX)
canvas.width = 800;
canvas.height = 600;

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

// Create initial text element
let initialTextElement = createTextElement('Enter your text here', 50, 100, 200, 60, 45, 'Arial', '#000000', false);
initialTextElement.isSelected = true;
selectedElement = initialTextElement;
elements.push(initialTextElement);

// Element creation functions
function createTextElement(text, x, y, width, height, fontSize, font, color, outline) {
    return {
        id: Date.now() + Math.random(),
        type: 'text',
        text: text,
        x: x,
        y: y,
        width: width,
        height: height,
        fontSize: fontSize,
        font: font,
        color: color,
        outline: outline,
        isSelected: false,
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        isEditing: false
    };
}

function createImageElement(image, x, y, width, height) {
    return {
        id: Date.now() + Math.random(),
        type: 'image',
        image: image,
        x: x,
        y: y,
        width: width,
        height: height,
        tint: null, // For recoloring
        opacity: 1,
        isSelected: false,
        isDragging: false,
        isResizing: false,
        resizeHandle: null
    };
}

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
            // Deselect all elements first
            elements.forEach(el => el.isSelected = false);

            // Create new image element
            const imageElement = createImageElement(img, 600, 50, 100, 100);
            imageElement.isSelected = true;
            selectedElement = imageElement;
            elements.push(imageElement);
            renderCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

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

// Add event listeners for all text and logo controls to re-render on change
[textInput, textX, textY, textSize, textColor, textFont, textOutline].forEach(el => {
    el.addEventListener('input', syncTextElementFromInputs);
    el.addEventListener('change', syncTextElementFromInputs);
});

[logoX, logoY, logoSize, logoOpacity, logoTint].forEach(el => {
    el.addEventListener('input', syncImageElementFromInputs);
    el.addEventListener('change', syncImageElementFromInputs);
});

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

textSizeSlider.addEventListener('input', () => {
    if (selectedElement && selectedElement.type === 'text') {
        textSize.value = textSizeSlider.value;
        selectedElement.fontSize = parseInt(textSizeSlider.value);
        renderCanvas();
    }
});

// Parse XLSX file and display summary
xlsxInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        rowsData = json;
        displayRowsSummary(json);
    } catch (error) {
        alert('Error parsing XLSX file. Please ensure it is a valid Excel file.');
    }
});

// Display rows summary
function displayRowsSummary(rows) {
    rowsSummary.innerHTML = '<table><tr><th>Row</th><th>Client Company Name</th><th>Job Description</th><th>Slogan</th><th>ImageFileName</th><th>Action</th></tr></table>';
    rows.forEach((row, index) => {
        const tr = `<tr>
            <td>${index + 1}</td>
            <td>${row['Client Company Name'] || ''}</td>
            <td>${row['Job Description'] || ''}</td>
            <td>${row.Slogan || ''}</td>
            <td>${row.ImageFileName || ''}</td>
            <td><button data-row="${index}">Select</button></td>
        </tr>`;
        rowsSummary.querySelector('table').insertAdjacentHTML('beforeend', tr);
    });

    // Add click listener for select buttons
    rowsSummary.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = e.target.dataset.row;
            selectRow(index);
        }
    });
}

// Select row and auto-fill
function selectRow(index) {
    const row = rowsData[index];
    if (row) {
        // Set slogan as default text
        textInput.value = row.Slogan || '';

        // Load image from images/ directory
        const imgFile = row.ImageFileName;
        if (imgFile) {
            const img = new Image();
            img.onload = () => {
                backgroundImage = img;
                renderCanvas();
            };
            img.onerror = () => {
                alert(`Image file "${imgFile}" not found in /images/ directory.`);
            };
            img.src = 'images/' + imgFile;
        }

        renderCanvas();
    }
}

// Helper function to wrap text
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}

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

    // Draw all elements (text and images)
    elements.forEach(element => {
        // Save context for each element
        ctx.save();

        if (element.type === 'text') {
            ctx.fillStyle = element.color;
            ctx.strokeStyle = element.color;
            ctx.lineWidth = 2;
            ctx.font = `${element.fontSize}px ${element.font}`;

            const lines = wrapText(element.text, element.width - 20); // 20px padding
            const lineHeight = element.fontSize * 1.2;

            for (let i = 0; i < lines.length; i++) {
                const lineY = element.y + (i + 1) * lineHeight;
                const lineX = element.x + 10; // 10px left padding

                if (element.outline) {
                    ctx.strokeText(lines[i], lineX, lineY);
                } else {
                    ctx.fillText(lines[i], lineX, lineY);
                }
            }

            // Draw selection rectangle if selected
            const rectHeight = lines.length * lineHeight + 20; // 20px total vertical padding
            element.height = Math.max(element.height, rectHeight);
        } else if (element.type === 'image') {
            // Handle image tinting
            if (element.tint) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = element.tint;
                ctx.fillRect(element.x, element.y, element.width, element.height);
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.globalAlpha = element.opacity;
            if (element.image && element.image.complete) {
                ctx.drawImage(element.image, element.x, element.y, element.width, element.height);
            }
        }

        // Draw selection rectangle and handles if selected
        if (element.isSelected) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            ctx.setLineDash([]);

            // Draw resize handles
            ctx.fillStyle = '#007bff';
            const handleSize = 8;
            // Corner handles
            ctx.fillRect(element.x - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
            // Edge handles
            ctx.fillRect(element.x + element.width/2 - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x - handleSize/2, element.y + element.height/2 - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width - handleSize/2, element.y + element.height/2 - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width/2 - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
        }

        // Restore context
        ctx.restore();
    });
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

// Helper function to get mouse position relative to canvas
function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Helper function to check if point is inside rectangle
function isPointInRect(px, py, x, y, w, h) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
}

// Helper function to detect which resize handle was clicked
function getResizeHandle(mouseX, mouseY, element) {
    const handleSize = 8;
    const handles = [
        { name: 'top-left', x: element.x - handleSize/2, y: element.y - handleSize/2 },
        { name: 'top-right', x: element.x + element.width - handleSize/2, y: element.y - handleSize/2 },
        { name: 'bottom-left', x: element.x - handleSize/2, y: element.y + element.height - handleSize/2 },
        { name: 'bottom-right', x: element.x + element.width - handleSize/2, y: element.y + element.height - handleSize/2 },
        { name: 'top', x: element.x + element.width/2 - handleSize/2, y: element.y - handleSize/2 },
        { name: 'bottom', x: element.x + element.width/2 - handleSize/2, y: element.y + element.height - handleSize/2 },
        { name: 'left', x: element.x - handleSize/2, y: element.y + element.height/2 - handleSize/2 },
        { name: 'right', x: element.x + element.width - handleSize/2, y: element.y + element.height/2 - handleSize/2 }
    ];

    for (let handle of handles) {
        if (isPointInRect(mouseX, mouseY, handle.x, handle.y, handleSize, handleSize)) {
            return handle.name;
        }
    }
    return null;
}

// Helper function to get element at mouse position (checking from top to bottom)
function getElementAtPosition(mouseX, mouseY) {
    // Check in reverse order (top elements first)
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        if (isPointInRect(mouseX, mouseY, element.x, element.y, element.width, element.height)) {
            return element;
        }
    }
    return null;
}

// Add mouse event listeners for canvas interaction
canvas.addEventListener('mousedown', (e) => {
    const mouse = getMousePos(canvas, e);
    isMouseDown = true;

    // Check for resize handles first (on selected element)
    if (selectedElement && selectedElement.isSelected) {
        const handle = getResizeHandle(mouse.x, mouse.y, selectedElement);
        if (handle) {
            draggedElement = selectedElement;
            resizeHandle = handle;
            isResizing = true;
            dragOffsetX = mouse.x;
            dragOffsetY = mouse.y;
            return;
        }
    }

    // Check if mouse is over an element
    const clickedElement = getElementAtPosition(mouse.x, mouse.y);
    if (clickedElement) {
        // Deselect all elements first
        elements.forEach(el => el.isSelected = false);

        // Select clicked element
        clickedElement.isSelected = true;
        selectedElement = clickedElement;

        // Start dragging
        draggedElement = clickedElement;
        isDragging = true;
        dragOffsetX = mouse.x - clickedElement.x;
        dragOffsetY = mouse.y - clickedElement.y;

        // Update UI controls based on selected element type
        if (clickedElement.type === 'text') {
            textInput.value = clickedElement.text;
            textX.value = clickedElement.x;
            textY.value = clickedElement.y;
            textSize.value = clickedElement.fontSize;
            textColor.value = clickedElement.color;
            textFont.value = clickedElement.font;
            textOutline.checked = clickedElement.outline;
            textXSlider.value = clickedElement.x;
            textYSlider.value = clickedElement.y;
            textSizeSlider.value = clickedElement.fontSize;
        } else if (clickedElement.type === 'image') {
            // Update logo controls
            logoX.value = clickedElement.x;
            logoY.value = clickedElement.y;
            logoSize.value = (clickedElement.width / canvas.width * 100); // Convert back to percentage
            logoOpacity.value = clickedElement.opacity;
        }

        canvas.style.cursor = 'move';
        renderCanvas();
        return;
    }

    // Deselect all if clicked elsewhere
    elements.forEach(el => el.isSelected = false);
    selectedElement = null;
    renderCanvas();
});

canvas.addEventListener('mousemove', (e) => {
    const mouse = getMousePos(canvas, e);

    if (isResizing && draggedElement) {
        const dx = mouse.x - dragOffsetX;
        const dy = mouse.y - dragOffsetY;

        switch (resizeHandle) {
            case 'top-left':
                draggedElement.x += dx;
                draggedElement.y += dy;
                draggedElement.width -= dx;
                draggedElement.height -= dy;
                break;
            case 'top-right':
                draggedElement.y += dy;
                draggedElement.width += dx;
                draggedElement.height -= dy;
                break;
            case 'bottom-left':
                draggedElement.x += dx;
                draggedElement.width -= dx;
                draggedElement.height += dy;
                break;
            case 'bottom-right':
                draggedElement.width += dx;
                draggedElement.height += dy;
                break;
            case 'top':
                draggedElement.y += dy;
                draggedElement.height -= dy;
                break;
            case 'bottom':
                draggedElement.height += dy;
                break;
            case 'left':
                draggedElement.x += dx;
                draggedElement.width -= dx;
                break;
            case 'right':
                draggedElement.width += dx;
                break;
        }

        // Ensure minimum size
        if (draggedElement.width < 50) draggedElement.width = 50;
        if (draggedElement.type === 'text' && draggedElement.height < 30) draggedElement.height = 30;
        if (draggedElement.type === 'image' && draggedElement.height < 20) draggedElement.height = 20;

        // Update UI controls
        if (draggedElement.type === 'text') {
            textX.value = Math.round(draggedElement.x);
            textY.value = Math.round(draggedElement.y);
            textXSlider.value = Math.round(draggedElement.x);
            textYSlider.value = Math.round(draggedElement.y);
        } else if (draggedElement.type === 'image') {
            logoX.value = Math.round(draggedElement.x);
            logoY.value = Math.round(draggedElement.y);
        }

        dragOffsetX = mouse.x;
        dragOffsetY = mouse.y;
        renderCanvas();
    } else if (isDragging && draggedElement) {
        draggedElement.x = mouse.x - dragOffsetX;
        draggedElement.y = mouse.y - dragOffsetY;

        // Update UI controls
        if (draggedElement.type === 'text') {
            textX.value = Math.round(draggedElement.x);
            textY.value = Math.round(draggedElement.y);
            textXSlider.value = Math.round(draggedElement.x);
            textYSlider.value = Math.round(draggedElement.y);
        } else if (draggedElement.type === 'image') {
            logoX.value = Math.round(draggedElement.x);
            logoY.value = Math.round(draggedElement.y);
        }

        renderCanvas();
    } else {
        // Change cursor based on hover position
        let cursor = 'default';

        if (selectedElement && selectedElement.isSelected) {
            const handle = getResizeHandle(mouse.x, mouse.y, selectedElement);
            if (handle) {
                if (handle.includes('left') || handle.includes('right')) {
                    cursor = handle.includes('top') || handle.includes('bottom') ?
                        (handle.includes('left') ? 'nw-resize' : 'ne-resize') :
                        (handle.includes('left') ? 'w-resize' : 'e-resize');
                } else {
                    cursor = handle.includes('top') ? 'n-resize' : 's-resize';
                }
            } else if (isPointInRect(mouse.x, mouse.y, selectedElement.x, selectedElement.y, selectedElement.width, selectedElement.height)) {
                cursor = 'move';
            }
        }

        canvas.style.cursor = cursor;
    }
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    isDragging = false;
    isResizing = false;
    if (draggedElement) {
        draggedElement.isDragging = false;
        draggedElement.isResizing = false;
        draggedElement.resizeHandle = null;
    }
    draggedElement = null;
    resizeHandle = null;
    canvas.style.cursor = 'default';
});

canvas.addEventListener('dblclick', (e) => {
    const mouse = getMousePos(canvas, e);
    const clickedElement = getElementAtPosition(mouse.x, mouse.y);

    if (clickedElement && clickedElement.type === 'text') {
        // Enter edit mode for text element
        clickedElement.isEditing = true;

        // Create textarea for editing
        const textarea = document.createElement('textarea');
        textarea.value = clickedElement.text;
        textarea.style.position = 'absolute';
        textarea.style.left = canvas.offsetLeft + clickedElement.x + 'px';
        textarea.style.top = canvas.offsetTop + clickedElement.y + 'px';
        textarea.style.width = clickedElement.width + 'px';
        textarea.style.height = clickedElement.height + 'px';
        textarea.style.fontSize = clickedElement.fontSize + 'px';
        textarea.style.fontFamily = clickedElement.font;
        textarea.style.border = '1px solid #007bff';
        textarea.style.resize = 'none';
        textarea.style.zIndex = '1000';

        canvas.parentElement.appendChild(textarea);
        textarea.focus();
        textarea.select();

        textarea.addEventListener('blur', () => {
            clickedElement.text = textarea.value;
            if (selectedElement === clickedElement) {
                textInput.value = textarea.value;
            }
            clickedElement.isEditing = false;
            textarea.remove();
            renderCanvas();
        });

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textarea.blur();
            }
        });
    }
});

// Initial setup
initializeControls();
updateTextControls(selectedElement);
renderCanvas();
