import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100px;
  background: white;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.08);
  z-index: 10;
`;

const ToolSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const Label = styled.div`
  font-size: 11px;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
`;

const ColorButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 3px solid ${props => props.selected ? '#4a5568' : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px ${props => props.color}40;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  ${props => props.selected && `
    &::after {
      content: '✓';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  `}
`;

const StrokeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: 100%;
`;

const StrokePreview = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 12px;
  position: relative;
`;

const StrokeDot = styled.div`
  width: ${props => Math.min(props.size * 2, 40)}px;
  height: ${props => Math.min(props.size * 2, 40)}px;
  background: ${props => props.color};
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StrokeSlider = styled.input`
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e2e8f0;
  outline: none;
  border-radius: 3px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #667eea;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.2s;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    background: #5a67d8;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #667eea;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const StrokeValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
`;

const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 2px solid #f7fafc;
  margin: 0;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${props => props.danger ? '#fed7d7' : '#f7fafc'};
  color: ${props => props.danger ? '#e53e3e' : '#4a5568'};
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.danger ? '#fc8181' : '#e2e8f0'};
    color: ${props => props.danger ? 'white' : '#2d3748'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d3748;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: ${props => props.show ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.2s;
`;

function Toolbar({ currentTool, onToolChange, onClear }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = [
    { hex: '#000000', name: 'Black' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#10b981', name: 'Green' }
  ];
  
  const handleColorChange = (color) => {
    onToolChange({
      ...currentTool,
      color: color.hex
    });
  };
  
  const handleStrokeChange = (e) => {
    onToolChange({
      ...currentTool,
      strokeWidth: parseInt(e.target.value)
    });
  };

  return (
    <Container>
      <ToolSection>
        <Label>Colors</Label>
        <ColorGrid>
          {colors.map(color => (
            <ColorButton
              key={color.hex}
              color={color.hex}
              selected={currentTool.color === color.hex}
              onClick={() => handleColorChange(color)}
              title={color.name}
              onMouseEnter={() => setShowTooltip(color.hex)}
              onMouseLeave={() => setShowTooltip(false)}
              style={{ position: 'relative' }}
            >
              <Tooltip show={showTooltip === color.hex}>
                {color.name}
              </Tooltip>
            </ColorButton>
          ))}
        </ColorGrid>
      </ToolSection>
      
      <Divider />
      
      <StrokeSection>
        <Label>Brush Size</Label>
        <StrokePreview>
          <StrokeDot size={currentTool.strokeWidth} color={currentTool.color} />
        </StrokePreview>
        <StrokeSlider
          type="range"
          min="1"
          max="20"
          value={currentTool.strokeWidth}
          onChange={handleStrokeChange}
        />
        <StrokeValue>{currentTool.strokeWidth}px</StrokeValue>
      </StrokeSection>
      
      <Divider />
      
      <ToolSection>
        <ActionButton danger onClick={onClear}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Clear All
        </ActionButton>
      </ToolSection>
    </Container>
  );
}

export default Toolbar;