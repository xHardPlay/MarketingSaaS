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

        // Create slogan text element
        const slogan = row.Slogan || '';
        const sloganText = createTextElement(slogan, 50, 100, 300, 50, 45, 'Arial', '#000000', false);
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

                // Create new logo element on canvas
                const logoElement = createImageElement(logoImg, 50, canvas.height - 150, 120, 120);
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

        // Create contact ID text element
        const contactId = row['Contact ID'] || '';
        if (contactId) {
            // Create second text element for Contact ID, positioned below the slogan
            const contactText = createTextElement(contactId, 50, 150, 200, 40, 30, 'Arial', '#000000', false);
            elements.push(contactText);
        }

        renderCanvas();
    }
}

// Download functionality
downloadBtn.addEventListener('click', () => {
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
