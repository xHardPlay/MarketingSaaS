# Canvas Elements Reference

This document provides reference information for the elements generated on the canvas when clicking the "Select" button for client rows in the ad generator app.

## Element Types

### 1. Slogan Text Element
- **Purpose**: Main text content from the Excel `Slogan` field
- **Default Position**: x=0, y=844
- **Default Dimensions**: width=1080, height=267
- **Font**: Montserrat, size dynamically fit (starts at 81px, decreases if overflow)
- **Color**: #ffffff (white)
- **Alignment**: center (centered horizontally within the element width)
- **Features**:
  - Auto-fits font size to prevent vertical overflow within 267px height limit
  - Text wraps at word boundaries to fit width
  - Dynamically centers each line horizontally

### 2. Logo Image Element
- **Purpose**: Company logo from `logos/` directory
- **Source**: `row['Logo File']` value
- **Default Position**: x=921, y=28 (top right area)
- **Default Dimensions**: width=100, height=100 (scales proportionally if different aspect ratio)
- **Features**:
  - Loaded from `logos/` directory matching Excel value
  - Auto-scaled to fit default dimensions while maintaining aspect ratio
  - No tint or opacity by default

### 3. Contact ID Text Element
- **Purpose**: Contact information from Excel `Contact ID` field
- **Default Position**: x=0, y=0 (top left, position may vary)
- **Dynamic Dimensions**: width and height expand to fit content
- **Font**: Impact, size=30px
- **Color**: #ffffff (white)
- **Features**:
  - Background box dynamically expands for long text
  - Height increases for multiple lines
  - Width expands to the longest line plus padding
  - Includes black semi-transparent overlay that adjusts to content size

## Behavior Details

### Text Overflow Handling
- **Slogan**: Reduces font size automatically if text exceeds available vertical space
- **Contact ID**: Expands both width and height of background box to accommodate any length of text

### Element Creation
All elements are created when `selectRow(index)` is called after clicking a client row's "Select" button. The function clears previous text elements and generates new ones based on the Excel row data.

### Canvas Rendering
Elements are rendered with:
- Black semi-transparent background overlay for text readability
- Dynamic sizing adjustments applied during each render cycle
- Selection handles for manipulation in interactive mode
- Layered rendering with images behind text

## Code Locations
- Element creation: `js/file-handling.js` - `selectRow()` function
- Element structure: `js/elements.js` - `createTextElement()` and `createImageElement()`
- Rendering logic: `js/canvas-render.js` - `renderCanvas()` function

## Default Canvas Size
The interactive canvas defaults to 1080x1080 pixels (social media format), but can be resized via the controls.
