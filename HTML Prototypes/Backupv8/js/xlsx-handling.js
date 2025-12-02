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
        displayRowsSummary(json);
        generateAllBtn.disabled = false;
        downloadAllCompositionsBtn.disabled = false;
    } catch (error) {
        alert('Error parsing XLSX file. Please ensure it is a valid Excel file.');
    }
});

// Display rows summary
function displayRowsSummary(rows) {
    rowsSummary.innerHTML = '<table><tr><th>Client Company Name</th><th>Actions</th></tr></table>';
    rows.forEach((row, index) => {
        const tr = `<tr>
            <td>${row['Client Company Name'] || ''}</td>
            <td><button class="select-btn" data-row="${index}">Select</button><button class="download-btn" data-row="${index}">Download</button></td>
        </tr>`;
        rowsSummary.querySelector('table').insertAdjacentHTML('beforeend', tr);
    });

    // Add click listener for buttons
    rowsSummary.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = e.target.dataset.row;
            if (e.target.classList.contains('download-btn')) {
                downloadRowComposition(index);
            } else if (e.target.classList.contains('select-btn')) {
                selectRow(index);
            }
        }
    });
}
