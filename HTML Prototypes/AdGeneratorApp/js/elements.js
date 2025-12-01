// elements.js - Element creation and management

// Element creation functions
function createTextElement(text, x, y, width, height, fontSize, font, color, outline, align = 'left') {
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
        align: align,
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
