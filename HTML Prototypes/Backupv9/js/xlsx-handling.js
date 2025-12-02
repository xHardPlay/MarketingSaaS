// xlsx-handling.js - XLSX file parsing and table display

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
        if (rowsSummary) displayRowsSummary(json);

        // Show batch processing panel after successful upload
        const batchPanel = document.getElementById('batch-panel');
        if (batchPanel) {
            batchPanel.style.display = 'block';
        }

        // Auto-generate all ads immediately
        await autoGenerateAds(json);
    } catch (error) {
        alert('Error parsing XLSX file. Please ensure it is a valid Excel file.');
    }
});

// Display rows summary
function displayRowsSummary(rows) {
    if (rows.length === 0) {
        rowsSummary.innerHTML = '<p>No data found in the Excel file.</p>';
        return;
    }

    // Get all unique keys from all rows for dynamic headers
    const allKeys = new Set();
    rows.forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
    });

    // Define priority columns to show first
    const priorityCols = ['Client Company Name', 'Slogan', 'Headline', 'Title', 'Contact ID', 'Contact Email', 'Contact', 'ImageFileName', 'Logo File'];
    const priorityKeys = [];
    const otherKeys = [];

    allKeys.forEach(key => {
        if (priorityCols.includes(key)) {
            priorityKeys.push(key);
        } else {
            otherKeys.push(key);
        }
    });

    const columnsToShow = [...priorityKeys, ...otherKeys];

    // Create table with dynamic headers
    let tableHtml = '<table>';
    tableHtml += '<tr><th>Row</th>';
    columnsToShow.forEach(key => {
        tableHtml += `<th>${key}</th>`;
    });
    tableHtml += '<th>Preview</th><th>Actions</th></tr>';

    rows.forEach((row, index) => {
        tableHtml += `<tr><td>${index + 1}</td>`;
        columnsToShow.forEach(key => {
            const value = row[key] || '';
            const truncated = value.length > 30 ? value.substring(0, 27) + '...' : value;
            tableHtml += `<td title="${value}">${truncated}</td>`;
        });
        tableHtml += `<td><button class="preview-btn" data-row="${index}">Preview Ad</button></td>`;
        tableHtml += `<td><button class="select-btn" data-row="${index}">Select</button><button class="download-btn" data-row="${index}">Download</button></td></tr>`;
    });
    tableHtml += '</table>';

    rowsSummary.innerHTML = tableHtml;

    // Add click listener for buttons
    rowsSummary.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = e.target.dataset.row;
            if (e.target.classList.contains('download-btn')) {
                downloadRowComposition(index);
            } else if (e.target.classList.contains('select-btn')) {
                selectRow(index);
            } else if (e.target.classList.contains('preview-btn')) {
                previewAd(index);
            }
        }
    });
}

// Auto-generate all ads function
async function autoGenerateAds(rows) {
    batchFeedback.textContent = 'Generating ads...';

    // Disable generate button during auto-generation
    generateAllBtn.disabled = true;
    generatedAds.length = 0;

    let processed = 0;
    const total = rows.length;

    for (const [index, row] of rows.entries()) {
        try {
            const dataURL = await generateAdForRow(row, index);
            generatedAds.push({
                index,
                dataURL,
                filename: `${(row['Client Company Name'] || 'Ad').replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.png`,
                company: row['Client Company Name'] || 'Unknown'
            });
            processed++;
            batchFeedback.textContent = `Auto-generating ${processed}/${total} ads...`;
        } catch (error) {
            console.error('Error generating ad for row', index, error);
            batchFeedback.textContent = `Error auto-generating ad ${index + 1}, continuing...`;
        }
    }

    batchFeedback.textContent = `Auto-generation complete: ${generatedAds.length}/${total} ads created.`;
    if (generatedAds.length > 0) {
        displayAdPreviews();
        adPreviews.style.display = 'block';

        // Hide upload and batch processing panels, keep only the preview section
        const uploadPanel = document.querySelector('.panel-card h2');
        if (uploadPanel && uploadPanel.textContent === 'Upload Your Sheet') {
            uploadPanel.parentElement.style.display = 'none';
        }
        document.querySelector('.user-panel .panel-card:nth-child(2)').style.display = 'none'; // Batch Processing panel

        // Expand the layout to use full screen space for previews
        document.querySelector('.user-main').classList.add('full-width');
        document.querySelector('.user-container').classList.add('full-width');
        adPreviews.classList.add('full-screen');
    }

    // Re-enable button after generation (though it's hidden, for consistency)
    generateAllBtn.disabled = false;
}

// Function to preview a single ad
async function previewAd(index) {
    if (!rowsData || !rowsData[index]) return;

    try {
        const row = rowsData[index];
        const dataURL = await generateAdForRow(row, index);

        // Show modal with the preview using the shared modal function
        const customFilename = `${(row['Client Company Name'] || 'Ad').replace(/[^a-zA-Z0-9]/g, '_')}_preview_${index + 1}.png`;
        showAdModal(dataURL, customFilename, index);
    } catch (error) {
        console.error('Error previewing ad:', error);
        alert('Error generating preview. Check console for details.');
    }
}
