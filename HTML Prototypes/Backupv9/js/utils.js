// utils.js - Helper functions for canvas interactions and utilities

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
