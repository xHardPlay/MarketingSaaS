// row-selection.js - Individual row selection and image loading

// Select row and auto-fill
function selectRow(index) {
    const row = rowsData[index];

    if (row) {
        // Resize canvas to composition size (1080x1080) for proper layout
        canvas.width = 1080;
        canvas.height = 1080;
        canvasWidth.value = 1080;
        canvasHeight.value = 1080;
        // Update slider max values to match
        textXSlider.max = 1080;
        textYSlider.max = 1080;
        textX.max = 1080;
        textY.max = 1080;
        logoX.max = 1080;
        logoY.max = 1080;

        // Remove existing text elements
        elements = elements.filter(el => el.type !== 'text');
        selectedElement = null;

    // Create slogan text element with auto-fitted font size (matching generateAdForRow layout)
        const sloganPanelY = 1080 - 360; // 1/3 of 1080 = 360
        const sloganPanelHeight = 360;
        const slogan = row.Slogan || '';
        let fontSize = 81; // start with default
        let fits = false;
        let lines = wrapText(slogan, 1080 - 40); // padding
        let lineHeight = fontSize * 1.2;
        let totalHeight = lines.length * lineHeight + 20; // padding
        while (!fits && fontSize > 10) {
            if (totalHeight <= sloganPanelHeight) {
                fits = true;
            } else {
                fontSize -= 2;
                lineHeight = fontSize * 1.2;
                lines = wrapText(slogan, 1080 - 40);
                totalHeight = lines.length * lineHeight + 20;
            }
        }
        const sloganText = createTextElement(slogan, 0, sloganPanelY, 1080, sloganPanelHeight, fontSize, 'Montserrat', '#ffffff', false, 'center');
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
                                    alert(`Image file "${imgFile}" not found in /images/ directory and GoogleLink format is not recognized.`);
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
                const textElements = elements.filter(el => el.type !== 'text');
                elements = textElements;

                // Deselect all remaining elements
                elements.forEach(el => el.isSelected = false);

                // Create new logo element on canvas with matching generateAdForRow positions
                const logoScale = 0.2;
                const logoW = 1080 * logoScale;
                const logoH = logoImg.height * (logoW / logoImg.width);
                const logoElement = createImageElement(logoImg, 1080 - logoW - 20, 20, logoW, logoH);
                logoElement.isSelected = true;
                selectedElement = logoElement;
                elements.push(logoElement);

                // Create contact ID text element after logo (above it in z-order)
                const contactId = row['Contact ID'] || '';
                if (contactId) {
                    const contactW = 236;
                    const contactX = 1080 - contactW - 20; // 824
                    const contactY = 20;
                    const contactText = createTextElement(contactId, contactX, contactY, contactW, 40, 30, 'Impact', '#ffffff', false);
                    elements.push(contactText);
                }

                // Re-select the first text element (slogan)
                const firstText = elements.find(el => el.type === 'text');
                if (firstText) {
                    firstText.isSelected = false; // Don't select both
                }

                renderCanvas();
            };
            logoImg.onerror = () => {
                alert(`Logo file "${logoFile}" not found in /logos/ directory.`);
                // Still create contact text even if logo fails
                const contactId = row['Contact ID'] || '';
                if (contactId) {
                    const contactW = 236;
                    const contactX = 1080 - contactW - 20; // 824
                    const contactY = 20;
                    const contactText = createTextElement(contactId, contactX, contactY, contactW, 40, 30, 'Impact', '#ffffff', false);
                    elements.push(contactText);
                }
                renderCanvas();
            };
            logoImg.src = 'logos/' + logoFile;
        } else {
            // If no logo file specified, remove any existing logo/image elements and add contact
            const textElements = elements.filter(el => el.type === 'text');
            elements = textElements;
            selectedElement = textElements.find(el => el.type === 'text') || null;

            // Create contact ID text element
            const contactId = row['Contact ID'] || '';
            if (contactId) {
                const contactW = 236;
                const contactX = 1080 - contactW - 20; // 824
                const contactY = 20;
                const contactText = createTextElement(contactId, contactX, contactY, contactW, 40, 30, 'Impact', '#ffffff', false);
                elements.push(contactText);
            }

            renderCanvas();
        }

        renderCanvas();
    }
}
