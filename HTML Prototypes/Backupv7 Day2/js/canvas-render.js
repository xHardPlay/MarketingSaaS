// canvas-render.js - Canvas rendering and drawing functions

// Function to render the canvas
function renderCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (backgroundImage) {
        // Draw at original size, centered (may be clipped if larger than canvas)
        const x = (canvas.width - backgroundImage.width) / 2;
        const y = (canvas.height - backgroundImage.height) / 2;
        ctx.drawImage(backgroundImage, x, y);
    }

    // Draw all elements (text and images)
    elements.forEach(element => {
        // Save context for each element
        ctx.save();

        if (element.type === 'text') {
            ctx.fillStyle = element.color;
            ctx.strokeStyle = element.color;
            ctx.lineWidth = 2;
            ctx.font = `${element.fontSize}px ${element.font}`;

            const lines = wrapText(element.text, element.width - 20); // 20px padding
            const lineHeight = element.fontSize * 1.2;

            for (let i = 0; i < lines.length; i++) {
                const lineY = element.y + (i + 1) * lineHeight;
                const lineX = element.x + 10; // 10px left padding

                if (element.outline) {
                    ctx.strokeText(lines[i], lineX, lineY);
                } else {
                    ctx.fillText(lines[i], lineX, lineY);
                }
            }

            // Draw selection rectangle if selected
            const rectHeight = lines.length * lineHeight + 20; // 20px total vertical padding
            element.height = Math.max(element.height, rectHeight);
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
