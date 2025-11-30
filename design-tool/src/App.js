import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

// History manager for undo/redo
class HistoryManager {
  constructor() {
    this.states = [[]];
    this.currentIndex = 0;
  }

  push(state) {
    this.states = this.states.slice(0, this.currentIndex + 1);
    this.states.push([...state]);
    this.currentIndex = this.states.length - 1;
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return [...this.states[this.currentIndex]];
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      return [...this.states[this.currentIndex]];
    }
    return null;
  }

  canUndo() { return this.currentIndex > 0; }
  canRedo() { return this.currentIndex < this.states.length - 1; }
}

function App() {
  const canvasRef = useRef();
  const fileInputRef = useRef();
  const backgroundInputRef = useRef();
  const xlsxInputRef = useRef();

  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [background, setBackground] = useState(null);
  const [xlsxData, setXlsxData] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const history = useRef(new HistoryManager());

  // Canvas configuration
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Update history when elements change
  const updateElements = (newElements) => {
    history.current.push(newElements);
    setElements([...newElements]);
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height)
    };
  };

  const isPointInRect = (px, py, x, y, w, h) => {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  };

  const getElementAtPoint = (x, y) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (isPointInRect(x, y, element.x, element.y, element.width, element.height)) {
        return element;
      }
    }
    return null;
  };

  const getResizeHandle = (mouseX, mouseY, element) => {
    const handleSize = 8;
    const handles = [
      { name: 'top-left', x: element.x - handleSize/2, y: element.y - handleSize/2 },
      { name: 'top-right', x: element.x + element.width - handleSize/2, y: element.y - handleSize/2 },
      { name: 'bottom-left', x: element.x - handleSize/2, y: element.y + element.height - handleSize/2 },
      { name: 'bottom-right', x: element.x + element.width - handleSize/2, y: element.y + element.height - handleSize/2 },
    ];

    for (let handle of handles) {
      if (isPointInRect(mouseX, mouseY, handle.x, handle.y, handleSize, handleSize)) {
        return handle.name;
      }
    }
    return null;
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    if (background) {
      ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw elements
    elements.forEach(element => {
      ctx.save();
      ctx.globalAlpha = element.opacity || 1;

      if (element.rotation) {
        ctx.translate(element.x + element.width/2, element.y + element.height/2);
        ctx.rotate(element.rotation * Math.PI / 180);
        ctx.translate(-(element.x + element.width/2), -(element.y + element.height/2));
      }

      if (element.type === 'text') {
        ctx.fillStyle = element.fill || '#000000';
        ctx.font = `${element.fontSize || 20}px ${element.fontFamily || 'Arial'}`;
        ctx.fillText(element.text, element.x, element.y + element.fontSize);
      } else if (element.type === 'image' && element.image) {
        ctx.drawImage(element.image, element.x, element.y, element.width, element.height);
      }

      // Draw selection outline
      if (selectedElement && element.id === selectedElement.id) {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        ctx.setLineDash([]);

        // Draw resize handles
        const handleSize = 8;
        ctx.fillStyle = '#007bff';
        ctx.fillRect(element.x - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(element.x + element.width - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(element.x - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
        ctx.fillRect(element.x + element.width - handleSize/2, element.y + element.height - handleSize/2, handleSize, handleSize);
      }

      ctx.restore();
    });
  };

  const handleMouseDown = (e) => {
    const mouse = getMousePos(e);

    if (selectedElement) {
      const handle = getResizeHandle(mouse.x, mouse.y, selectedElement);
      if (handle) {
        setIsResizing(true);
        setResizeHandle(handle);
        return;
      }
    }

    const element = getElementAtPoint(mouse.x, mouse.y);
    if (element) {
      setSelectedElement(element);
      setIsDragging(true);
      setDragOffset({
        x: mouse.x - element.x,
        y: mouse.y - element.y
      });
    } else {
      setSelectedElement(null);
    }
    renderCanvas();
  };

  const handleMouseMove = (e) => {
    const mouse = getMousePos(e);

    if (isResizing && selectedElement) {
      let newX = selectedElement.x;
      let newY = selectedElement.y;
      let newWidth = selectedElement.width;
      let newHeight = selectedElement.height;

      switch (resizeHandle) {
        case 'top-left':
          newX = mouse.x;
          newY = mouse.y;
          newWidth = selectedElement.x + selectedElement.width - mouse.x;
          newHeight = selectedElement.y + selectedElement.height - mouse.y;
          break;
        case 'top-right':
          newWidth = mouse.x - selectedElement.x;
          newY = mouse.y;
          newHeight = selectedElement.y + selectedElement.height - mouse.y;
          break;
        case 'bottom-left':
          newX = mouse.x;
          newWidth = selectedElement.x + selectedElement.width - mouse.x;
          newHeight = mouse.y - selectedElement.y;
          break;
        case 'bottom-right':
          newWidth = mouse.x - selectedElement.x;
          newHeight = mouse.y - selectedElement.y;
          break;
      }

      if (newWidth > 10 && newHeight > 10) {
        const updatedElement = {
          ...selectedElement,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        };
        setElements(elements.map(el => el.id === selectedElement.id ? updatedElement : el));
        setSelectedElement(updatedElement);
      }
    } else if (isDragging && selectedElement) {
      const updatedElement = {
        ...selectedElement,
        x: mouse.x - dragOffset.x,
        y: mouse.y - dragOffset.y
      };
      setElements(elements.map(el => el.id === selectedElement.id ? updatedElement : el));
      setSelectedElement(updatedElement);
    }
    renderCanvas();
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      history.current.push(elements);
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const handleAddText = () => {
    const newElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      text: 'New Text',
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
      rotation: 0,
      opacity: 1,
    };
    const newElements = [...elements, newElement];
    updateElements(newElements);
    setSelectedElement(newElement);
    renderCanvas();
  };

  const handleAddImage = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newElement = {
          id: `image_${Date.now()}`,
          type: 'image',
          image: img,
          x: 50,
          y: 50,
          width: Math.min(img.width, 300),
          height: Math.min(img.height, 300),
          rotation: 0,
          opacity: 1,
        };
        const newElements = [...elements, newElement];
        updateElements(newElements);
        setSelectedElement(newElement);
        renderCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setBackground(img);
        renderCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (selectedElement) {
      const newElements = elements.filter(el => el.id !== selectedElement.id);
      updateElements(newElements);
      setSelectedElement(null);
      renderCanvas();
    }
  };

  const undo = () => {
    const previousState = history.current.undo();
    if (previousState) {
      setElements(previousState);
      setSelectedElement(null);
      renderCanvas();
    }
  };

  const redo = () => {
    const nextState = history.current.redo();
    if (nextState) {
      setElements(nextState);
      renderCanvas();
    }
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedElement) {
      handleDelete();
    }
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redo();
    }
    if (e.key === 't') {
      handleAddText();
    }
    if (e.key === 'i') {
      handleAddImage();
    }
  };

  const updateSelectedElement = (updates) => {
    if (selectedElement) {
      const updatedElement = { ...selectedElement, ...updates };
      setElements(elements.map(el => el.id === selectedElement.id ? updatedElement : el));
      setSelectedElement(updatedElement);
      renderCanvas();
    }
  };

  const handleXlsxImport = () => {
    xlsxInputRef.current.click();
  };

  const handleXlsxUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet);
        processBatchImport(rows);
      } catch (error) {
        alert('Error reading XLSX file. Please ensure it\'s a valid Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processBatchImport = async (rows) => {
    const generatedImages = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (row.ImageFileName && row.Advertise) {
        try {
          const imageUrl = `/images/${row.ImageFileName}`;
          const logoUrl = row['Logo File'] ? `/images/logos/${row['Logo File']}` : null;

          console.log(`Processing row ${i + 1}: ${row.ImageFileName} with advertise text: ${row.Advertise}`);
          if (logoUrl) console.log(`  Including logo: ${row['Logo File']}`);

          const backgroundImage = await loadImage(imageUrl);

          // Load logo if specified
          let logoImage = null;
          if (logoUrl) {
            try {
              logoImage = await loadImage(logoUrl);
            } catch (logoError) {
              console.log(`  Logo not found: ${row['Logo File']}, continuing without logo`);
            }
          }

          const mergedImage = await createMergedImage(backgroundImage, row.Advertise, logoImage);

          generatedImages.push({
            id: `generated_${i}`,
            imageFile: row.ImageFileName,
            slogan: row.Advertise,
            logoFile: row['Logo File'],
            mergedImage: mergedImage,
            rowIndex: i + 1
          });
        } catch (error) {
          console.log(`Failed to process row ${i + 1}: ${error.message}`);
        }
      } else {
        console.log(`Skipping row ${i + 1} - missing Advertise or ImageFileName column`);
        if (!row.Advertise) console.log('  Missing Advertise column');
        if (!row.ImageFileName) console.log('  Missing ImageFileName column');
      }
    }

    setGeneratedImages(generatedImages);
    setShowGallery(true);
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const createMergedImage = (backgroundImg, slogan, logoImg = null) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = backgroundImg.width;
      canvas.height = backgroundImg.height;

      // Draw background image
      ctx.drawImage(backgroundImg, 0, 0);

      // Add logo in top-right corner if provided
      if (logoImg) {
        // Scale logo to fit in top-right corner (max 15% of canvas width)
        const maxLogoWidth = canvas.width * 0.15;
        const maxLogoHeight = canvas.height * 0.15;

        // Calculate scaled dimensions maintaining aspect ratio
        const logoAspectRatio = logoImg.width / logoImg.height;
        let logoWidth, logoHeight;

        if (logoAspectRatio > 1) {
          // Landscape logo
          logoWidth = Math.min(maxLogoWidth, logoImg.width);
          logoHeight = logoWidth / logoAspectRatio;
        } else {
          // Portrait logo
          logoHeight = Math.min(maxLogoHeight, logoImg.height);
          logoWidth = logoHeight * logoAspectRatio;
        }

        // Position in top-right with padding
        const padding = canvas.width * 0.03;
        const logoX = canvas.width - logoWidth - padding;
        const logoY = padding;

        // Semi-transparent background for logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10);

        // Draw logo
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
      }

      // Add text overlay
      const fontSize = Math.min(canvas.width / 20, 32);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text shadow for better visibility
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw text in the center-bottom area
      const textX = canvas.width / 2;
      const textY = canvas.height * 0.85;

      // Background rectangle for text
      const textMetrics = ctx.measureText(slogan);
      const padding = fontSize * 0.5;
      const rectWidth = textMetrics.width + padding * 2;
      const rectHeight = fontSize + padding * 2;
      const rectX = textX - rectWidth / 2;
      const rectY = textY - rectHeight / 2;

      // Semi-transparent background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText(slogan, textX, textY);
      ctx.fillText(slogan, textX, textY);

      resolve(canvas.toDataURL('image/png'));
    });
  };

  const downloadMergedImage = (imageDataURL, fileName) => {
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = fileName;
    link.click();
  };

  const editGeneratedImage = (imageDataURL, slogan, rowIndex, imageFile) => {
    // Close gallery
    setShowGallery(false);

    // Convert dataURL to image and add to canvas
    const img = new Image();
    img.onload = () => {
      const newElement = {
        id: `generated_edit_${Date.now()}`,
        type: 'image',
        image: img,
        x: 50,
        y: 50,
        width: Math.min(img.width, 400), // Slightly larger default size
        height: Math.min(img.height, 300),
        rotation: 0,
        opacity: 1,
      };

      const newElements = [...elements, newElement];
      updateElements(newElements);
      setSelectedElement(newElement);
      renderCanvas();
    };
    img.src = imageDataURL;
  };

  const loadBackground = () => {
    backgroundInputRef.current.click();
  };

  useEffect(() => {
    renderCanvas();
  }, [elements, selectedElement, background]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  const canUndo = history.current.canUndo();
  const canRedo = history.current.canRedo();

  return (
    <div className="App">
      <div className="header">
        <h1>🎨 Simple Design Tool</h1>
      </div>

      <div className="toolbar">
        <button onClick={handleAddText} title="Add Text (T)">
          <span>✏️</span> Text
        </button>
        <button onClick={handleAddImage} title="Add Image (I)">
          <span>🖼️</span> Image
        </button>
        <button onClick={handleXlsxImport} title="Import from Excel">
          <span>📊</span> XLSX
        </button>
        <button onClick={loadBackground} title="Load Background">
          <span>🌄</span> Background
        </button>
        <button onClick={exportCanvas} title="Export PNG">
          <span>💾</span> Export
        </button>
        <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <span>↶</span> Undo
        </button>
        <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <span>↷</span> Redo
        </button>
        {selectedElement && (
          <button onClick={handleDelete} title="Delete (Del)">
            <span>🗑️</span> Delete
          </button>
        )}
      </div>

      <div className="workspace">
        <div className="canvas-panel">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              border: '2px solid #ddd',
              cursor: isDragging ? 'grabbing' : isResizing ? 'nw-resize' : 'default'
            }}
          />
        </div>

        <div className="properties-panel">
          <h3>Properties</h3>
          {selectedElement ? (
            <div className="properties">
              {selectedElement.type === 'text' && (
                <>
                  <div className="property-group">
                    <label>Text:</label>
                    <input
                      type="text"
                      value={selectedElement.text}
                      onChange={(e) => updateSelectedElement({ text: e.target.value })}
                    />
                  </div>
                  <div className="property-group">
                    <label>Font Size:</label>
                    <input
                      type="number"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                      min="8"
                      max="100"
                    />
                  </div>
                  <div className="property-group">
                    <label>Color:</label>
                    <input
                      type="color"
                      value={selectedElement.fill}
                      onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                    />
                  </div>
                  <div className="property-group">
                    <label>Font:</label>
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                  <div className="property-group">
                    <label>Rotation:</label>
                    <input
                      type="number"
                      value={selectedElement.rotation}
                      onChange={(e) => updateSelectedElement({ rotation: Number(e.target.value) })}
                      min="0"
                      max="360"
                    />
                  </div>
                  <div className="property-group">
                    <label>Opacity:</label>
                    <input
                      type="range"
                      value={selectedElement.opacity}
                      onChange={(e) => updateSelectedElement({ opacity: Number(e.target.value) })}
                      min="0.1"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </>
              )}

              {selectedElement.type === 'image' && (
                <>
                  <div className="property-group">
                    <label>Rotation:</label>
                    <input
                      type="number"
                      value={selectedElement.rotation}
                      onChange={(e) => updateSelectedElement({ rotation: Number(e.target.value) })}
                      min="0"
                      max="360"
                    />
                  </div>
                  <div className="property-group">
                    <label>Opacity:</label>
                    <input
                      type="range"
                      value={selectedElement.opacity}
                      onChange={(e) => updateSelectedElement({ opacity: Number(e.target.value) })}
                      min="0.1"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>Select an element to edit properties</p>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={backgroundInputRef}
        onChange={handleBackgroundUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={xlsxInputRef}
        onChange={handleXlsxUpload}
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
      />

      {/* Gallery Modal */}
      {showGallery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <div className="gallery-modal-header" style={{
            padding: '20px',
            backgroundColor: '#2c3e50',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1001
          }}>
            <div>
              <h2 className="gallery-modal-title" style={{ margin: 0, marginBottom: '5px' }}>Design Gallery</h2>
              <p className="gallery-modal-subtitle" style={{ margin: 0, opacity: 0.8 }}>Generated images with slogans and logos ({generatedImages.length} items)</p>
            </div>
            <button
              onClick={() => setShowGallery(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                color: 'white',
                opacity: 0.8
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ×
            </button>
          </div>

          <div className="gallery-grid" style={{
            flex: 1,
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
          }}>
            {generatedImages.map((item) => (
              <div key={item.id} className="gallery-item" style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                cursor: 'default'
              }}>
                <div style={{ paddingBottom: '20px' }}>
                  <img
                    src={item.mergedImage}
                    alt={`Design ${item.rowIndex}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>

                <div style={{ padding: '0 20px 15px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{
                      margin: '0 0 5px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#2c3e50',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={item.slogan}>
                      {item.slogan}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#7f8c8d',
                      fontWeight: '500'
                    }}>
                      Row {item.rowIndex} • {item.imageFile}
                      {item.logoFile && (
                        <span style={{
                          display: 'block',
                          color: '#9ca3af',
                          fontSize: '12px',
                          fontWeight: '400',
                          marginTop: '2px'
                        }}>
                          🪶 Logo: {item.logoFile}
                        </span>
                      )}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    <button
                      onClick={() => editGeneratedImage(item.mergedImage, item.slogan, item.rowIndex, item.imageFile)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                      ✏️ Edit Image
                    </button>
                    <button
                      onClick={() => downloadMergedImage(item.mergedImage, `design_${item.rowIndex}_${item.imageFile}`)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#219a52'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {generatedImages.length === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3>No images generated</h3>
                <p>Make sure your Excel file has "ImageFileName", "Advertise", and optionally "Logo File" columns</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="shortcuts">
        <p><strong>Keyboard Shortcuts:</strong></p>
        <p>T: Add Text | I: Add Image | Del: Delete Selected</p>
        <p>Ctrl+Z: Undo | Ctrl+Y: Redo | Click to Select</p>
      </div>
    </div>
  );
}

export default App;
