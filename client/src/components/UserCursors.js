import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const CursorWrapper = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.08s linear;
  animation: ${fadeIn} 0.2s ease-out;
  z-index: ${props => props.isActive ? 100 : 50};
`;

const Cursor = styled.svg`
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  transform: rotate(-45deg) translate(-4px, -4px);
`;

const UserLabel = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: ${props => props.color};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 8px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid ${props => props.color};
  }
`;

const CursorTrail = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: ${props => props.color};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
  pointer-events: none;
`;

function UserCursors({ cursors, canvasRef, isDrawing }) {
  const [canvasOffset, setCanvasOffset] = useState({ top: 0, left: 0 });
  const [activeCursors, setActiveCursors] = useState({});

  useEffect(() => {
    const updateOffset = () => {
      if (canvasRef?.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasOffset({
          top: rect.top,
          left: rect.left
        });
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    window.addEventListener('scroll', updateOffset);

    return () => {
      window.removeEventListener('resize', updateOffset);
      window.removeEventListener('scroll', updateOffset);
    };
  }, [canvasRef]);

  useEffect(() => {
    // Track active cursors for smooth animations
    const newActiveCursors = {};
    Object.entries(cursors).forEach(([userId, cursor]) => {
      if (cursor.x >= 0 && cursor.y >= 0) {
        newActiveCursors[userId] = cursor;
      }
    });
    setActiveCursors(newActiveCursors);
  }, [cursors]);

  return (
    <Container>
      {Object.entries(activeCursors).map(([userId, cursor]) => {
        const isMoving = cursor.x !== cursor.prevX || cursor.y !== cursor.prevY;
        
        return (
          <CursorWrapper
            key={userId}
            style={{
              left: cursor.x,
              top: cursor.y,
            }}
            isActive={isMoving}
          >
            <Cursor viewBox="0 0 24 24" fill="none">
              <path
                d="M5.5 3.5L20.5 12L12 12L8 20.5L5.5 3.5Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </Cursor>
            <UserLabel color={cursor.color}>
              {cursor.userName || 'Anonymous'}
            </UserLabel>
            {isMoving && (
              <CursorTrail color={cursor.color} />
            )}
          </CursorWrapper>
        );
      })}
    </Container>
  );
}

export default UserCursors;