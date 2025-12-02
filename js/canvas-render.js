// canvas-render.js - Canvas rendering and drawing functions

// Function to render the canvas
function renderCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (backgroundImage) {
        // Resize background to fill 1080x1080 canvas, maintaining aspect ratio with cropping if needed (aspect fill)
        const canvasRatio = canvas.width / canvas.height;
        const imageRatio = backgroundImage.width / backgroundImage.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (imageRatio > canvasRatio) {
            // Image is wider, crop sides
            drawHeight = canvas.height;
            drawWidth = drawHeight * imageRatio;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
        } else {
            // Image is taller, crop top/bottom
            drawWidth = canvas.width;
            drawHeight = drawWidth / imageRatio;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);
    }

    // Draw all elements (text and images)
    elements.forEach(element => {
        // Save context for each element
        ctx.save();

        if (element.type === 'text') {
            // Draw dark semi-transparent overlay panel for text readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(element.x, element.y, element.width, element.height);

            ctx.fillStyle = element.color;
            ctx.strokeStyle = element.color;
            ctx.lineWidth = 2;
            ctx.font = `${element.fontSize}px ${element.font}`;

            const lines = wrapText(element.text, element.width - 20); // 20px padding
            const lineHeight = element.fontSize * 1.2;

            for (let i = 0; i < lines.length; i++) {
                const lineY = element.y + (i + 1) * lineHeight;
                const lineWidth = ctx.measureText(lines[i]).width;
                let lineX = element.x + 10; // default left padding

                if (element.align === 'center') {
                    lineX = element.x + (element.width - lineWidth) / 2;
                }

                if (element.outline) {
                    ctx.strokeText(lines[i], lineX, lineY);
                } else {
                    ctx.fillText(lines[i], lineX, lineY);
                }
            }

            // Adjust height and width to fit content
            const rectHeight = lines.length * lineHeight + 20; // 20px total vertical padding
            element.height = Math.max(element.height, rectHeight);

            // Adjust width to fit longest line
            const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
            element.width = Math.max(element.width, maxLineWidth + 20); // 20px horizontal padding
        } else if (element.type === 'image') {
            // Handle image tinting
            if (element.tint) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = element.tint;
                ctx.fillRect(element.x, element.y, element.width, element.height);
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.globalAlpha = element.opacity;
            if (element.image && element.image.complete) {
                ctx.drawImage(element.image, element.x, element.y, element.width, element.height);
            }
        }

        // Draw selection rectangle and handles if selected
        if (element.isSelected) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            ctx.setLineDash([]);

            // Draw resize handles
            ctx.fillStyle = '#007bff';
            const handleSize = 8;
            // Corner handles
            ctx.fillRect(element.x - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
            // Edge handles
            ctx.fillRect(element.x + element.width/2 - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x - handleSize/2, element.y + element.height/2 - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width - handleSize/2, element.y + element.height/2 - handleSize/2, handleSize, handleSize);
            ctx.fillRect(element.x + element.width/2 - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
        }

        // Restore context
        ctx.restore();
    });
}
