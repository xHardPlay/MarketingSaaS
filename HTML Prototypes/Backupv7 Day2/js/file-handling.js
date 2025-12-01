// file-handling.js - File upload and parsing functionality

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

function convertGoogleDriveLink(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Check if URL is already a download URL
    if (url.startsWith('https://drive.google.com/uc?') && url.includes('export=download')) {
        return url; // URL is already correct, return as-is
    }

    // Handle different Google Drive URL formats
    let fileId = null;

    // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
        fileId = fileMatch[1];
    }

    // Format 2: https://drive.google.com/open?id=FILE_ID
    if (!fileId) {
        const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (openMatch) {
            fileId = openMatch[1];
        }
    }

    // Format 3: Direct FILE_ID
    if (!fileId && /^[a-zA-Z0-9_-]{10,}$/.test(url)) {
        fileId = url;
    }

    if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return null;
}

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
    rowsSummary.innerHTML = '<table><tr><th>Client Company Name</th><th>Action</th></tr></table>';
    rows.forEach((row, index) => {
        const tr = `<tr>
            <td>${row['Client Company Name'] || ''}</td>
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
        // Remove existing text elements
        elements = elements.filter(el => el.type !== 'text');
        selectedElement = null;

        // Create slogan text element with main text defaults
        const slogan = row.Slogan || '';
        const sloganText = createTextElement(slogan, 65, 483, 300, 80, 81, 'Montserrat', '#ffffff', false);
        elements.push(sloganText);

        // Set UI to slogan text if present
        if (slogan) {
            textInput.value = slogan;
            selectedElement = sloganText;
            updateTextControls(sloganText);
        }

        // Load image from images/ directory as background
        const imgFile = row.ImageFileName;
        if (imgFile) {
            // Check if local image exists first
            const checkLocalImage = new XMLHttpRequest();
            checkLocalImage.open('HEAD', 'images/' + imgFile, true);
            checkLocalImage.onreadystatechange = function() {
                if (checkLocalImage.readyState === XMLHttpRequest.DONE) {
                    if (checkLocalImage.status === 200) {
                        // Local image exists, load it
                        const img = new Image();
                        img.onload = () => {
                            backgroundImage = img;
                            renderCanvas();
                        };
                        img.src = 'images/' + imgFile;
                    } else {
                        // Local image not found, try Google Drive fallback
                        const imageLink = row.ImageLink;
                        console.log('Local image not found, trying Google Drive fallback');
                        console.log('ImageLink value:', imageLink);

                        if (imageLink) {
                            try {
                                const downloadUrl = convertGoogleDriveLink(imageLink);
                                console.log('Converted download URL:', downloadUrl);

                                if (downloadUrl) {
                                    // Use fetch to bypass CORS issues
                                    fetch(downloadUrl)
                                        .then(response => {
                                            if (!response.ok) {
                                                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                            }
                                            return response.blob();
                                        })
                                        .then(blob => {
                                            const objectUrl = URL.createObjectURL(blob);
                                            const fallbackImg = new Image();
                                            fallbackImg.onload = () => {
                                                backgroundImage = fallbackImg;
                                                renderCanvas();
                                                // Clean up the object URL
                                                URL.revokeObjectURL(objectUrl);
                                            };
                                            fallbackImg.onerror = () => {
                                                console.log('Image failed to load even with fetch approach');
                                                alert(`Image file "${imgFile}" not found in /images/ directory and Google Drive link is invalid.`);
                                                URL.revokeObjectURL(objectUrl);
                                            };
                                            fallbackImg.src = objectUrl;
                                        })
                                        .catch(error => {
                                            console.log('Fetch error:', error);
                                            alert(`Image file "${imgFile}" not found in /images/ directory and error loading from Google Drive: ${error.message}`);
                                        });
                                } else {
                                    alert(`Image file "${imgFile}" not found in /images/ directory and ImageLink format is not recognized.`);
                                }
                            } catch (error) {
                                console.log('Conversion error:', error);
                                alert(`Image file "${imgFile}" not found in /images/ directory and error loading ImageLink: ${error.message}`);
                            }
                        } else {
                            console.log('No ImageLink found in row');
                            alert(`Image file "${imgFile}" not found in /images/ directory.`);
                        }
                    }
                }
            };
            checkLocalImage.send();
        }

        // Load logo from logos/ directory as element
        const logoFile = row['Logo File'];
        if (logoFile) {
            const logoImg = new Image();
            logoImg.onload = () => {
                // Find and remove any existing logo/image elements (keep only text elements)
                const textElements = elements.filter(el => el.type === 'text');
                elements = textElements;

                // Deselect all remaining elements
                elements.forEach(el => el.isSelected = false);

                // Create new logo element on canvas with specified defaults
                const logoElement = createImageElement(logoImg, 817, 862, 216, 216); // 20% of 1080 canvas
                logoElement.isSelected = true;
                selectedElement = logoElement;
                elements.push(logoElement);

                // Re-select the first text element (slogan)
                const firstText = elements.find(el => el.type === 'text');
                if (firstText) {
                    firstText.isSelected = false; // Don't select both
                }

                renderCanvas();
            };
            logoImg.onerror = () => {
                alert(`Logo file "${logoFile}" not found in /logos/ directory.`);
            };
            logoImg.src = 'logos/' + logoFile;
        } else {
            // If no logo file specified, remove any existing logo/image elements
            const textElements = elements.filter(el => el.type === 'text');
            elements = textElements;
            selectedElement = textElements.find(el => el.type === 'text') || null;
            renderCanvas();
        }

        // Create contact ID text element with contact text defaults
        const contactId = row['Contact ID'] || '';
        if (contactId) {
            // Create second text element for Contact ID with specified defaults
            const contactText = createTextElement(contactId, 101, 974, 200, 40, 30, 'Impact', '#ffffff', false);
            elements.push(contactText);
        }

        renderCanvas();
    }
}

// Download functionality
downloadBtn.addEventListener('click', () => {
    try {
        const link = document.createElement('a');
        link.download = 'designed-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        if (error.name === 'SecurityError') {
            alert('Cannot download image due to security restrictions. ' +
                  'Canvas contains images loaded from local files or external domains. ' +
                  'To enable downloads, serve the application via a local web server (not file:///).');
        } else {
            alert('Error downloading image: ' + error.message);
        }
    }
});

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
