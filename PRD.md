# Product Requirements Document (PRD): Ad Generator App

## 1. Overview

The Ad Generator App is a web-based tool designed to automate the creation of production-ready social media advertisements for Instagram. The app reads data from an Excel spreadsheet containing client information, including texts (slogans, descriptions) and image paths. It generates professional ad images by combining background images, company logos, and text overlays in an Instagram-optimized format (1:1 aspect ratio, ideally 1080x1080 pixels). Each ad features a dark semi-transparent panel with white text for readability and branding consistency.

## 2. Target Audience

- Marketing agencies and freelance marketers creating ads for multiple clients
- Small business owners needing quick ad generation without graphic design skills
- Teams handling bulk ad production for social media campaigns

## 3. Core Features

### 3.1 Spreadsheet Data Import
- Upload and read Excel files (.xlsx format)
- Parse client data including:
  - Company name
  - Job description
  - Contact information
  - Logo file paths (PNG format expected)
  - Slogan/text content
  - Background image file paths (PNG format expected)

### 3.2 Ad Generation Engine
- Automatically resize background images to Instagram size (1080x1080 pixels)
- Apply a dark semi-transparent overlay panel (e.g., RGBA: 0,0,0,0.8) for text readability
- Add white text with high contrast (font: e.g., Montserrat Bold, size 48px, color: #FFFFFF)
- Overlay company logo in top-left or top-right corner (resized to fit, e.g., 100x100px)
- Output high-quality PNG/JPG images ready for social media posting

### 3.3 User Interface
- Drag-and-drop for Excel file upload
- Preview of generated ads before download
- Batch processing for multiple rows in the spreadsheet
- Download individual or bulk ads

### 3.4 Customization Options
- Adjustable panel transparency and position
- Text font, size, and positioning
- Logo size and placement

## 4. Requirements

### 4.1 Functional Requirements
- [ ] Parse specific Excel columns: Client Company Name, Job Description, Contact ID, Logo File, Slogan, ImagesPath, ImageFileName
- [ ] Handle missing data gracefully (e.g., skip rows with incomplete info)
- [ ] Generate one ad per valid row
- [ ] Canvas rendering using HTML5 Canvas or similar for image composition

### 4.2 Non-Functional Requirements
- [ ] Responsive web interface (works on desktop)
- [ ] Fast processing for up to 100 ads at once
- [ ] Browser compatibility (Chrome, Firefox, Safari)
- [ ] Image generation without server-side processing (client-side JavaScript)

### 4.3 Technical Stack
- Frontend: HTML5, CSS3, JavaScript (Vanilla JS or React)
- Image processing: Canvas API for overlaying images and text
- File handling: FileReader API for reading images and Excel

## 5. User Stories

- As a marketer, I want to upload an Excel file with client data so that I can generate ads quickly for multiple campaigns.
- As a user, I want to preview generated ads before downloading to ensure quality.
- As a small business owner, I want downloadable high-resolution images that I can post directly to Instagram.
- As an admin, I want to customize text styling and logo placement to match brand guidelines.

## 6. Assumptions and Constraints

- Background images are pre-generated and stored in accessible file paths listed in the spreadsheet
- Logos are PNG format and sized appropriately
- Text content fits within the overlay panel (no wrapping issues initially)
- No video ad support (images only)

## 7.Timeline and Milestones

- MVP Development: Implement basic upload, parsing, and generation
- UI Polish: Add preview and customization
- Testing: Validate with sample spreadsheet
- Launch: Ready for production use

## 8. Notes

This PRD is a starting point and should be edited based on additional details or feedback. Refer to Sheetexample.xlsx for data structure reference.
