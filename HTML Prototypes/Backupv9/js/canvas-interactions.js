// canvas-interactions.js - Canvas mouse interaction event listeners

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
