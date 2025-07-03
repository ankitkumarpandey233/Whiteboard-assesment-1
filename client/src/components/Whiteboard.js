import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';
import socketService from '../services/socket';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
`;

const Header = styled.div`
  background: white;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const RoomCode = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  background: #f7fafc;
  padding: 8px 16px;
  border-radius: 8px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #667eea;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
`;

const UserCount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  
  &::before {
    content: '👥';
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.primary ? 'white' : '#4a5568'};
  border: ${props => props.primary ? 'none' : '2px solid #e2e8f0'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LeaveButton = styled(ActionButton)`
  background: white;
  color: #e53e3e;
  border: 2px solid #fed7d7;
  
  &:hover {
    background: #fff5f5;
    border-color: #fc8181;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  background: white;
  margin: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const ConnectionStatus = styled.div`
  position: absolute;
  top: 86px;
  right: 24px;
  padding: 8px 16px;
  background: ${props => props.connected ? '#48bb78' : '#f56565'};
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    animation: ${props => props.connected ? 'none' : 'pulse 1.5s infinite'};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d3748;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translate(-50%, 100%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`;

function Whiteboard({ roomData, userId, onLeaveRoom }) {
  const [activeUsers, setActiveUsers] = useState(roomData.activeUsers || 1);
  const [isConnected, setIsConnected] = useState(true);
  const [drawingTool, setDrawingTool] = useState({
    color: '#000000',
    strokeWidth: 2
  });
  const [otherCursors, setOtherCursors] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const canvasRef = useRef(null);

  useEffect(() => {
    socketService.onUserJoined((data) => {
      console.log('User joined:', data);
      setActiveUsers(data.activeUsers);
      showToastMessage(`${data.userName || 'Someone'} joined the room`);
    });

    socketService.onUserLeft((data) => {
      console.log('User left:', data);
      setActiveUsers(data.activeUsers);
      setOtherCursors(prev => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
      showToastMessage(`${data.userName || 'Someone'} left the room`);
    });

    socketService.onCursorUpdate((data) => {
      setOtherCursors(prev => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          color: data.color,
          userName: data.userName
        }
      }));
    });

    const socket = socketService.socket;
    if (socket) {
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      socketService.disconnect();
      onLeaveRoom();
    }
  };

  const handleToolChange = (tool) => {
    setDrawingTool(tool);
  };

  const handleClearCanvas = () => {
    if (window.confirm('This will clear the canvas for everyone. Continue?')) {
      socketService.clearCanvas();
    }
  };

  const handleShare = async () => {
    const roomUrl = `${window.location.origin}?room=${roomData.roomCode}`;
    
    if (navigator.share) {
      // Use native share on mobile
      try {
        await navigator.share({
          title: 'Join my whiteboard room',
          text: `Join my collaborative whiteboard! Room code: ${roomData.roomCode}`,
          url: roomUrl
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Copy to clipboard on desktop
      navigator.clipboard.writeText(roomUrl);
      showToastMessage('Room link copied to clipboard!');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomData.roomCode);
    showToastMessage('Room code copied!');
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard-${roomData.roomCode}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    showToastMessage('Drawing downloaded!');
  };

  return (
    <Container>
      <Header>
        <LeftSection>
          <Logo>✏️</Logo>
          <RoomInfo>
            <RoomCode>
              Room: {roomData.roomCode}
              <CopyButton onClick={handleCopyCode} title="Copy room code">
                📋
              </CopyButton>
            </RoomCode>
            <UserCount>{activeUsers} {activeUsers === 1 ? 'user' : 'users'} online</UserCount>
          </RoomInfo>
        </LeftSection>
        
        <RightSection>
          <ActionButton onClick={handleShare}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </ActionButton>
          
          <ActionButton onClick={handleDownload}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </ActionButton>
          
          <LeaveButton onClick={handleLeaveRoom}>
            Leave Room
          </LeaveButton>
        </RightSection>
      </Header>

      {!isConnected && (
        <ConnectionStatus connected={false}>
          Reconnecting...
        </ConnectionStatus>
      )}

      <MainArea>
        <Toolbar 
          currentTool={drawingTool}
          onToolChange={handleToolChange}
          onClear={handleClearCanvas}
        />
        
        <CanvasContainer>
          <DrawingCanvas
            ref={canvasRef}
            roomCode={roomData.roomCode}
            userId={userId}
            userName={roomData.userName}
            userColor={roomData.userColor}
            currentTool={drawingTool}
            initialDrawingData={roomData.drawingData}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
          />
          <UserCursors 
            cursors={otherCursors}
            canvasRef={canvasRef}
            isDrawing={isDrawing}
          />
        </CanvasContainer>
      </MainArea>

      {showToast && <Toast>{toastMessage}</Toast>}
    </Container>
  );
}

export default Whiteboard;