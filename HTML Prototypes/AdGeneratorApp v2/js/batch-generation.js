// batch-generation.js - Bulk image generation and preview display

// ---- UTIL: WRAP TEXT usando el contexto activo ----
function wrapText(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';

    for (let i = 0; i < words.length; i++) {
        const test = line ? line + ' ' + words[i] : words[i];
        const w = ctx.measureText(test).width;
        if (w > maxWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function truncateLineWithEllipsis(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let lo = 0, hi = text.length;
    let best = '';
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const candidate = text.slice(0, mid) + '…';
        if (ctx.measureText(candidate).width <= maxWidth) {
            best = candidate;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return best || '…';
}

// ---- BATCH GENERATION (UI hook) ----
generateAllBtn.addEventListener('click', async () => {
    if (!rowsData || rowsData.length === 0) return;

    batchFeedback.textContent = 'Generating ads...';
    generateAllBtn.disabled = true;
    generatedAds.length = 0;

    let processed = 0;
    const total = rowsData.length;

    for (const [index, row] of rowsData.entries()) {
        try {
            const dataURL = await generateAdForRow(row, index);
            generatedAds.push({
                index,
                dataURL,
                filename: `${(row['Client Company Name'] || 'Ad').replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.png`,
                company: row['Client Company Name'] || 'Unknown'
            });
            processed++;
            batchFeedback.textContent = `Generated ${processed}/${total} ads...`;
        } catch (error) {
            console.error('Error generating ad for row', index, error);
            batchFeedback.textContent = `Error generating ad ${index + 1}, continuing...`;
        }
    }

    batchFeedback.textContent = `Generation complete: ${generatedAds.length}/${total} ads created.`;
    if (generatedAds.length > 0) {
        displayAdPreviews();
        adPreviews.style.display = 'block';
    }
    generateAllBtn.disabled = false;
});

// ---- MAIN: GENERATE SINGLE AD ----
async function generateAdForRow(row, index) {
    return new Promise((resolve, reject) => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 1080;
        offCanvas.height = 1080;
        const offCtx = offCanvas.getContext('2d');

        let bgImg = null;
        let logoImg = null;

        const imgFile = row.ImageFileName;
        const logoFile = row['Logo File'];

        let loaded = 0;
        const totalLoads = (imgFile ? 1 : 0) + (logoFile ? 1 : 0);

        const checkComplete = () => {
            loaded++;
            if (loaded === totalLoads) renderAd();
        };

        if (imgFile) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => { bgImg = img; checkComplete(); };
            img.onerror = () => { console.warn('BG load fail', imgFile); checkComplete(); };
            img.src = 'images/' + imgFile;
        }

        if (logoFile) {
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            logo.onload = () => { logoImg = logo; checkComplete(); };
            logo.onerror = () => { console.warn('Logo load fail', logoFile); checkComplete(); };
            logo.src = 'logos/' + logoFile;
        }

        if (totalLoads === 0) {
            // nothing to load, just render
            renderAd();
        }

        // ---- RENDER FUNCTION ----
        function renderAd() {
            try {
                offCtx.clearRect(0, 0, 1080, 1080);

                // -------- Background (aspect-fill) --------
                if (bgImg) {
                    const canvasRatio = 1080 / 1080;
                    const imageRatio = bgImg.width / bgImg.height;
                    let drawW, drawH, drawX, drawY;

                    if (imageRatio > canvasRatio) {
                        drawH = 1080;
                        drawW = drawH * imageRatio;
                        drawX = (1080 - drawW) / 2;
                        drawY = 0;
                    } else {
                        drawW = 1080;
                        drawH = drawW / imageRatio;
                        drawX = 0;
                        drawY = (1080 - drawH) / 2;
                    }

                    offCtx.drawImage(bgImg, drawX, drawY, drawW, drawH);
                } else {
                    // fallback plain background if no image
                    offCtx.fillStyle = '#111';
                    offCtx.fillRect(0, 0, 1080, 1080);
                }

                // -------- Logo (top-right) --------
                if (logoImg) {
                    const logoScale = 0.25; // sweet spot
                    let logoW = 1080 * logoScale;
                    let logoH = logoImg.height * (logoW / logoImg.width);
                    const maxLogoH = 160; // cap height
                    if (logoH > maxLogoH) {
                        logoH = maxLogoH;
                        logoW = logoImg.width * (logoH / logoImg.height);
                    }
                    const logoX = 1080 - logoW - 28;
                    const logoY = 28;
                    offCtx.drawImage(logoImg, logoX, logoY, logoW, logoH);
                }

                // -------- Contact panel (top-left) dynamic height --------
                const contactPaddingX = 14;
                const contactPaddingY = 10;
                const contactX = 30;
                const contactY = 30;
                const maxContactW = 420; // max width allowed
                const contactText = row['Contact ID'] || row['Contact Email'] || row['Contact'] || '';

                // measure contact text with appropriate font
                offCtx.fillStyle = '#FFF';
                offCtx.font = '28px Montserrat';
                let contactLines = contactText ? wrapText(offCtx, contactText, maxContactW - contactPaddingX * 2) : [];
                // if too many lines, truncate last line with ellipsis
                const maxContactLines = 2;
                if (contactLines.length > maxContactLines) {
                    contactLines = contactLines.slice(0, maxContactLines);
                    const last = contactLines[contactLines.length - 1];
                    contactLines[contactLines.length - 1] = truncateLineWithEllipsis(offCtx, last, maxContactW - contactPaddingX * 2);
                }
                const contactW = Math.min(maxContactW, Math.max(180, ...contactLines.map(l => offCtx.measureText(l).width + contactPaddingX * 2)));
                const contactH = Math.max(44, contactLines.length * 32 + contactPaddingY * 2);

                offCtx.fillStyle = 'rgba(0,0,0,0.65)';
                offCtx.fillRect(contactX, contactY, contactW, contactH);

                // draw contact text
                offCtx.fillStyle = '#FFF';
                offCtx.font = '28px Montserrat';
                let ty = contactY + contactPaddingY + 22;
                contactLines.forEach(line => {
                    offCtx.fillText(line, contactX + contactPaddingX, ty);
                    ty += 32;
                });

                // -------- Slogan panel (bottom) --------
                const sloganPanelH = 320;
                const sloganPanelY = 1080 - sloganPanelH;
                offCtx.fillStyle = 'rgba(0,0,0,0.78)';
                offCtx.fillRect(0, sloganPanelY, 1080, sloganPanelH);

                // ---- Slogan autofit and truncation ----
                const slogan = String(row.Slogan || row['Headline'] || row.Title || '');
                if (slogan) {
                    const panelPaddingX = 40;
                    const panelMaxW = 1080 - panelPaddingX * 2;
                    const panelMaxH = sloganPanelH - 40; // top/bottom padding

                    let fontSize = 90;
                    const minFont = 26;
                    let lines = [];
                    let lineHeight = 0;

                    while (fontSize >= minFont) {
                        offCtx.font = `${fontSize}px Montserrat`;
                        lineHeight = Math.round(fontSize * 1.12);
                        const candidate = wrapText(offCtx, slogan, panelMaxW);
                        const totalH = candidate.length * lineHeight;
                        if (totalH <= panelMaxH && candidate.length <= 4) { // limit to 4 lines
                            lines = candidate;
                            break;
                        }
                        fontSize -= 3;
                    }

                    // if after reducing font it's still too long, force truncate to max allowed lines
                    if (lines.length === 0) {
                        // pick a fontSize we stopped at
                        offCtx.font = `${Math.max(minFont, fontSize)}px Montserrat`;
                        lineHeight = Math.round(Math.max(minFont, fontSize) * 1.12);
                        const candidate = wrapText(offCtx, slogan, panelMaxW);
                        const maxLines = Math.floor(panelMaxH / lineHeight) || 1;
                        lines = candidate.slice(0, maxLines);
                        // ellipsize last line
                        if (candidate.length > maxLines) {
                            lines[maxLines - 1] = truncateLineWithEllipsis(offCtx, lines[maxLines - 1], panelMaxW);
                        }
                    }

                    // vertical centering inside panel
                    const totalTextHeight = lines.length * lineHeight;
                    let startY = sloganPanelY + Math.round((sloganPanelH - totalTextHeight) / 2) + Math.round(lineHeight * 0.8);

                    offCtx.fillStyle = '#FFF';
                    // use the computed font (leave as last set)
                    lines.forEach((ln, i) => {
                        offCtx.fillText(ln, panelPaddingX, startY + i * lineHeight);
                    });
                }

                // finish
                const dataURL = offCanvas.toDataURL('image/png');
                resolve(dataURL);

            } catch (error) {
                reject(error);
            }
        } // end renderAd
    });
}

// ---- PREVIEWS ----
function displayAdPreviews() {
    previewsContainer.innerHTML = '';
    generatedAds.forEach(ad => {
        const item = document.createElement('div');
        item.className = 'preview-item';

        const img = document.createElement('img');
        img.src = ad.dataURL;
        img.className = 'preview-thumbnail';
        img.title = ad.company;

        img.addEventListener('click', () => {
            showAdModal(ad.dataURL, ad.filename, ad.index);
        });

        const label = document.createElement('div');
        label.className = 'preview-label';
        label.textContent = ad.company;

        item.appendChild(img);
        item.appendChild(label);
        previewsContainer.appendChild(item);
    });
}

// ---- ZIP DOWNLOAD ----
downloadAllBtn.addEventListener('click', async () => {
    if (!generatedAds || generatedAds.length === 0) return;

    downloadAllBtn.disabled = true;
    downloadAllBtn.textContent = 'Preparing ZIP...';

    try {
        const zip = new JSZip();
        generatedAds.forEach(ad => {
            const base64 = ad.dataURL.split(',')[1];
            zip.file(ad.filename, base64, { base64: true });
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'generated_ads.zip';
        a.click();

        downloadAllBtn.textContent = 'Download All Ads (ZIP)';
    } catch (err) {
        alert('ZIP Error: ' + err.message);
        downloadAllBtn.textContent = 'Download All Ads (ZIP)';
    } finally {
        downloadAllBtn.disabled = false;
    }
});

// ---- MODAL VIEWER ----
function showAdModal(dataURL, filename, rowIndex) {
    const modal = document.getElementById('ad-modal');
    const modalImg = document.getElementById('modal-image');
    const modalDownloadBtn = document.getElementById('modal-download-btn');
    const modalAdData = document.getElementById('modal-ad-data');

    modalImg.src = dataURL;
    modal.style.display = 'flex';
    modal.classList.remove('modal-full-image'); // Reset to split view

    // Add click handler for full image view
    modalImg.onclick = () => {
        modal.classList.toggle('modal-full-image');
    };

    // Populate right panel with ad data if rowIndex provided
    if (rowIndex !== undefined && rowsData && rowsData[rowIndex]) {
        const row = rowsData[rowIndex];
        modalAdData.innerHTML = '';

        // Show key fields
        const fieldsToShow = [
            'Client Company Name',
            'Slogan',
            'Headline',
            'Title',
            'Contact ID',
            'Contact Email',
            'Contact',
            'Advertise' // The user mentioned this
        ];

        fieldsToShow.forEach(field => {
            if (row[field] && row[field].toString().trim()) {
                const div = document.createElement('div');
                div.className = 'data-row';
                div.innerHTML = `<strong>${field}:</strong><span>${row[field]}</span>`;
                modalAdData.appendChild(div);
            }
        });

        // Show any other fields
        Object.keys(row).forEach(key => {
            if (!fieldsToShow.includes(key) && row[key] && row[key].toString().trim()) {
                const div = document.createElement('div');
                div.className = 'data-row';
                div.innerHTML = `<strong>${key}:</strong><span>${row[key]}</span>`;
                modalAdData.appendChild(div);
            }
        });
    } else {
        // If no row data, perhaps show filename or something
        modalAdData.innerHTML = '<div class="data-row"><strong>Ad File:</strong><span>' + filename + '</span></div>';
    }

    modalDownloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.click();
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('ad-modal');
    const modalClose = document.querySelector('.modal-close');

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
});
