import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import socketService from '../services/socket';

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  touch-action: none;
`;

const DrawingCanvas = forwardRef(({ 
  roomCode, 
  userId, 
  userColor, 
  currentTool, 
  initialDrawingData,
  isDrawing,
  setIsDrawing 
}, ref) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPath = useRef([]);
  const lastPoint = useRef({ x: 0, y: 0 });
  
  // Store all drawing commands locally
  const localDrawingHistory = useRef([]);
  const canvasSize = useRef({ width: 0, height: 0 });

  // Expose canvas element to parent
  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    
    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      
      // Store current canvas as image before resizing
      let imageData = null;
      if (canvas.width > 0 && canvas.height > 0 && contextRef.current) {
        imageData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
      }
      
      // Calculate scale factors
      const scaleX = rect.width / (canvasSize.current.width || rect.width);
      const scaleY = rect.height / (canvasSize.current.height || rect.height);
      
      // Update canvas size
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvasSize.current = { width: rect.width, height: rect.height };
      
      // Reset context
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;
      
      // Redraw everything
      if (localDrawingHistory.current.length > 0) {
        redrawAllCommands();
      } else if (imageData && canvasSize.current.width > 0) {
        // If no history but we have image data, put it back
        context.putImageData(imageData, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Load initial drawing data
  useEffect(() => {
    if (initialDrawingData && initialDrawingData.length > 0) {
      localDrawingHistory.current = [...initialDrawingData];
      redrawAllCommands();
    }
  }, [initialDrawingData]);

  // Socket event listeners
  useEffect(() => {
    socketService.onDrawStart((data) => {
      // Track remote drawing start if needed
    });

    socketService.onDrawMove((data) => {
      drawLine(
        data.prevX, 
        data.prevY, 
        data.x, 
        data.y, 
        data.color, 
        data.strokeWidth,
        false // don't save to history, it's from remote
      );
    });

    socketService.onDrawEnd((data) => {
      // Save remote user's complete stroke to history
      if (data.path && data.path.length > 0) {
        localDrawingHistory.current.push({
          type: 'stroke',
          data: {
            path: data.path,
            color: data.color,
            strokeWidth: data.strokeWidth
          },
          userId: data.userId
        });
      }
    });

    socketService.onCanvasCleared(() => {
      clearCanvas();
      localDrawingHistory.current = [{
        type: 'clear',
        timestamp: new Date()
      }];
    });

    return () => {
      // Cleanup handled in parent
    };
  }, []);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);
    isDrawingRef.current = true;
    setIsDrawing(true);
    currentPath.current = [pos];
    lastPoint.current = pos;
    
    socketService.startDrawing(pos.x, pos.y, currentTool.color, currentTool.strokeWidth);
    socketService.sendCursorPosition(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) {
      // Just moving cursor, not drawing
      const pos = getMousePos(e);
      socketService.sendCursorPosition(pos.x, pos.y);
      return;
    }

    const pos = getMousePos(e);
    
    drawLine(
      lastPoint.current.x,
      lastPoint.current.y,
      pos.x,
      pos.y,
      currentTool.color,
      currentTool.strokeWidth,
      true // save to history
    );
    
    socketService.drawing(
      pos.x,
      pos.y,
      lastPoint.current.x,
      lastPoint.current.y,
      currentTool.color,
      currentTool.strokeWidth
    );
    
    currentPath.current.push(pos);
    lastPoint.current = pos;
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    setIsDrawing(false);
    
    if (currentPath.current.length > 0) {
      // Save complete path to history
      localDrawingHistory.current.push({
        type: 'stroke',
        data: {
          path: [...currentPath.current],
          color: currentTool.color,
          strokeWidth: currentTool.strokeWidth
        },
        userId: userId,
        timestamp: new Date()
      });
      
      socketService.endDrawing(
        currentPath.current,
        currentTool.color,
        currentTool.strokeWidth
      );
    }
    
    currentPath.current = [];
  };

  const drawLine = (x1, y1, x2, y2, color, width, saveToHistory = false) => {
    const context = contextRef.current;
    if (!context) return;
    
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  };

  const drawPath = (path, color, width) => {
    if (!path || path.length < 2) return;
    
    const context = contextRef.current;
    if (!context) return;
    
    context.beginPath();
    context.moveTo(path[0].x, path[0].y);
    
    for (let i = 1; i < path.length; i++) {
      context.lineTo(path[i].x, path[i].y);
    }
    
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!context) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const redrawAllCommands = () => {
    clearCanvas();
    
    localDrawingHistory.current.forEach(command => {
      if (command.type === 'stroke' && command.data.path) {
        drawPath(command.data.path, command.data.color, command.data.strokeWidth);
      } else if (command.type === 'clear') {
        clearCanvas();
      }
    });
  };

  const handleMouseLeave = () => {
    if (isDrawingRef.current) {
      stopDrawing();
    }
    socketService.sendCursorPosition(-1, -1);
  };

  return (
    <Canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={handleMouseLeave}
      // Touch support
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvasRef.current.dispatchEvent(mouseEvent);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        canvasRef.current.dispatchEvent(mouseEvent);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvasRef.current.dispatchEvent(mouseEvent);
      }}
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;