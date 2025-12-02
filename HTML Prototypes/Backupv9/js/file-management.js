// file-management.js - Save and load settings functionality

// Save settings functionality
saveBtn.addEventListener('click', () => {
    const settings = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        elements: elements.map(element => {
            const baseData = {
                type: element.type,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                opacity: element.opacity || 1,
                tint: element.tint || null
            };

            if (element.type === 'text') {
                return {
                    ...baseData,
                    text: element.text || '',
                    fontSize: element.fontSize || 45,
                    font: element.font || 'Arial',
                    color: element.color || '#000000',
                    outline: element.outline || false
                };
            } else if (element.type === 'image' && element.image && element.image.src) {
                // Save image data URL for logos
                return {
                    ...baseData,
                    imageData: element.image.src
                };
            }
            return baseData;
        })
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

            // Restore canvas size
            if (settings.canvasWidth && settings.canvasHeight) {
                canvas.width = settings.canvasWidth;
                canvas.height = settings.canvasHeight;
                canvasWidth.value = canvas.width;
                canvasHeight.value = canvas.height;
                // Update slider max values
                textXSlider.max = canvas.width;
                textYSlider.max = canvas.height;
                textX.max = canvas.width;
                textY.max = canvas.height;
                logoX.max = canvas.width;
                logoY.max = canvas.height;
            }

            // Restore elements
            if (settings.elements && Array.isArray(settings.elements)) {
                elements.length = 0; // Clear current elements

                settings.elements.forEach(elementData => {
                    let newElement;
                    if (elementData.type === 'text') {
                        newElement = createTextElement(
                            elementData.text || '',
                            elementData.x || 50,
                            elementData.y || 100,
                            elementData.width || 200,
                            elementData.height || 60,
                            elementData.fontSize || 45,
                            elementData.font || 'Arial',
                            elementData.color || '#000000',
                            elementData.outline || false
                        );
                        newElement.opacity = elementData.opacity;
                        newElement.tint = elementData.tint;
                        elements.push(newElement);
                    } else if (elementData.type === 'image') {
                        // Create placeholder for images (can't restore images easily from JSON)
                        newElement = createTextElement(
                            '[Image Placeholder - Re-upload Logo]',
                            elementData.x || 600,
                            elementData.y || 50,
                            elementData.width || 100,
                            elementData.height || 100,
                            12,
                            'Arial',
                            '#666666',
                            false
                        );
                        elements.push(newElement);
                    }
                });

                // Select the last element
                selectedElement = null;
                if (elements.length > 0) {
                    selectedElement = elements[elements.length - 1];
                    selectedElement.isSelected = true;
                    if (selectedElement.type === 'text') {
                        updateTextControls(selectedElement);
                    }
                }
            }

            // Re-render with new settings
            renderCanvas();
            alert('Settings loaded successfully. Logos need to be re-uploaded.');
        } catch (error) {
            alert('Error loading settings: Invalid JSON file.');
        }
    };
    reader.readAsText(file);
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
