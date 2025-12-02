# Ad Generator App

An automated web-based tool for creating production-ready Instagram advertisements. Upload an Excel spreadsheet with client data, and generate professional ad images combining backgrounds, logos, and text overlays.

## Features

- **Excel Import**: Upload XLSX files with client information
- **Automated Generation**: Process multiple rows to create ads automatically
- **Instagram Optimized**: Generates 1080x1080 images with proper aspect ratios
- **Batch Processing**: Generate hundreds of ads at once
- **Preview & Download**: View all generated ads and download individually or as ZIP
- **Professional Design**: Dark overlay panels ensure text readability
- **Template-based**: Uses fixed layout for consistent branding

## File Structure

```
AdGeneratorApp/
├── index.html          # Main interface
├── styles.css          # Styling
├── README.md           # This file
├── Sheetexample.xlsx   # Sample Excel template
├── images/             # Background images (z-image_00055_.png, etc.)
├── logos/              # Client logos (logo1.png, logo2.png, etc.)
└── js/
    ├── script.js           # Main app logic
    ├── global-vars.js      # DOM element references
    ├── canvas-render.js    # Canvas drawing functions
    ├── canvas-controls.js  # Interactive controls
    ├── ui-controls.js      # UI synchronization
    ├── canvas-interactions.js # Mouse/keyboard handlers
    ├── file-handling.js    # File operations & Excel parsing
    ├── elements.js         # Element creation utilities
    └── utils.js            # Helper functions
```

## Excel Template Format

The Excel file should contain columns with specific names:

- **Client Company Name**: Company/client name
- **Logo File**: Logo filename (e.g., logo1.png) located in logos/ folder
- **Slogan**: Main text content for the ad
- **Contact ID**: Additional contact text (appears smaller at bottom)
- **ImageFileName**: Background image filename (e.g., z-image_00055_.png)
- **ImagesPath**: Path to images (currently uses local images/ folder)

See `Sheetexample.xlsx` for a complete example.

## How to Use

1. **Setup**: Place background images in `images/` folder and logos in `logos/` folder
2. **Open App**: Open `index.html` in a modern web browser
3. **Upload Excel**: Click "Choose File" and select your client data Excel file
4. **Review Clients**: Check the client list to ensure data is parsed correctly
5. **Generate Ads**: Click "Generate All Ads" to create ad images for all clients
6. **Preview**: View generated thumbnails below the canvas
7. **Download**:
   - Click individual thumbnails to download single ads
   - Click "Download All Ads (ZIP)" for bulk download

## Technical Details

- **Canvas Size**: 1080x1080 pixels (Instagram square format)
- **Background Scaling**: Aspect-fill fitting (maintaining proportions)
- **Text Overlay**: White text on dark semi-transparent panels
- **Font Sizes**: Slogan auto-fit (up to 100px Montserrat), Contact (30px Impact)
- **Logo Placement**: Top-right corner, auto-sized to 20% canvas width
- **Output Format**: PNG images
- **Dependencies**: SheetJS (XLSX parsing), JSZip (bulk download)

## Layout Positions

- **Logo**: Top right (20px margin from right/top)
- **Contact Panel**: Top right side (824px, 20px, 236px×40px)
- **Slogan Panel**: Full bottom 1/3 height (0px, 720px, 1080px×360px, auto-fit font)

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 11+
- Edge 79+

## Local Development

For development or to avoid CORS issues with external resources:

```bash
# Use a local web server
cd AdGeneratorApp
python -m http.server 8000
# Then open http://localhost:8000
```

## Future Enhancements

- [ ] Customizable layout templates
- [ ] Logo size and position controls
- [ ] Font family and size customization
- [ ] Multiple text overlays per ad
- [ ] Video ad support
- [ ] Cloud storage integration
- [ ] Bulk image upload
- [ ] WebAssembly for faster processing

## License

This project is for demonstration purposes. Commercial use requires appropriate licensing.
