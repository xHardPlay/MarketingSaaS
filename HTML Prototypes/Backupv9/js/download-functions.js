// download-functions.js - All download functionality

function downloadRowComposition(index) {
    const row = rowsData[index];
    if (!row) return;

    generateAdForRow(row, index).then(dataURL => {
        const filename = `${(row['Client Company Name'] || 'Ad').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.click();
    }).catch(error => {
        console.error('Error generating composition for download:', error);
        alert('Error downloading composition: ' + error.message);
    });
}

function downloadCanvasAsPng(filename) {
    try {
        const link = document.createElement('a');
        link.download = filename;
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
}

// Download functionality for current canvas
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

// Download All Compositions functionality
downloadAllCompositionsBtn.addEventListener('click', async () => {
    if (rowsData.length === 0) return;

    downloadAllCompositionsBtn.disabled = true;
    downloadAllCompositionsBtn.textContent = 'Generating...';

    const zip = new JSZip();

    for (const [index, row] of rowsData.entries()) {
        try {
            const dataURL = await generateAdForRow(row, index);
            const base64 = dataURL.split(',')[1];
            const filename = `${(row['Client Company Name'] || 'Ad').replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.png`;
            zip.file(filename, base64, {base64: true});
        } catch (error) {
            console.error('Error generating ad for row', index, error);
        }
    }

    try {
        const content = await zip.generateAsync({type: 'blob'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'all_compositions.zip';
        a.click();
        downloadAllCompositionsBtn.textContent = 'Download All Compositions (ZIP)';
    } catch (error) {
        alert('Error creating ZIP file: ' + error.message);
        downloadAllCompositionsBtn.textContent = 'Download All Compositions (ZIP)';
    } finally {
        downloadAllCompositionsBtn.disabled = false;
    }
});
