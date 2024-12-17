import React from 'react';

const RenderOptionsModal = ({ isOpen, onClose, onSave }) => {
  const [renderMargins, setRenderMargins] = React.useState(50);
  const [backgroundColor, setBackgroundColor] = React.useState('#ffffff');
  const [transparentBackground, setTransparentBackground] = React.useState(false);
  const [renderSize, setRenderSize] = React.useState({ width: 1000, height: 1000 });
  const [imageFormat, setImageFormat] = React.useState('JPG');

  if (!isOpen) return null;

  return (
    <div className="config-modal">
      <div className="config-modal-content">
        <h2>Render Options</h2>
        <div>
          <label>Render Margins: {renderMargins}%</label>
          <input type="range" min="50" max="90" value={renderMargins} onChange={(e) => setRenderMargins(e.target.value)} />
        </div>
        <div>
          <label>Background Color:</label>
          <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} disabled={transparentBackground} />
          <label>
            <input type="checkbox" checked={transparentBackground} onChange={(e) => setTransparentBackground(e.target.checked)} />
            Transparent Background
          </label>
        </div>
        <div>
          <label>Render Size:</label>
          <input type="number" placeholder="Width" value={renderSize.width} onChange={(e) => setRenderSize({ ...renderSize, width: e.target.value })} />
          <input type="number" placeholder="Height" value={renderSize.height} onChange={(e) => setRenderSize({ ...renderSize, height: e.target.value })} />
        </div>
        <div>
          <label>Image Format:</label>
          <select value={imageFormat} onChange={(e) => setImageFormat(e.target.value)}>
            <option value="JPG">JPG</option>
            <option value="PNG">PNG</option>
            <option value="TIFF">TIFF</option>
          </select>
        </div>
        <button onClick={() => onSave({ renderMargins, backgroundColor: transparentBackground ? 'transparent' : backgroundColor, renderSize, imageFormat })}>Save Options</button>
        <button onClick={onClose}>Cancel</button> </div>
    </div>
  );
};

export default RenderOptionsModal;