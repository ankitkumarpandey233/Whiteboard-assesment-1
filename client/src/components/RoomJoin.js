import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { joinRoom, createRoom } from '../services/api';
import socketService from '../services/socket';

const Container = styled.div`
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
`;

const Logo = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 8px;
  color: #1a1a1a;
  text-align: center;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 32px;
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #444;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const RoomCodeInput = styled(Input)`
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 3px;
  font-weight: 600;
  font-size: 20px;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f5f5f5;
  color: #333;
  
  &:hover {
    background: #e8e8e8;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-top: 12px;
  font-size: 14px;
  text-align: center;
  padding: 10px;
  background: #ffebee;
  border-radius: 8px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 24px 0;
  color: #999;
  font-size: 14px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e0e0e0;
  }
  
  span {
    background: white;
    padding: 0 16px;
    position: relative;
  }
`;

function RoomJoin({ onJoinRoom, prefilledRoomCode }) {
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefilledRoomCode) {
      setRoomCode(prefilledRoomCode);
    }
  }, [prefilledRoomCode]);

  const handleJoin = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await joinRoom(roomCode);
      
      if (response.success) {
        // Create user object with name
        const userId = `${userName.trim()}_${Math.random().toString(36).substr(2, 9)}`;
        const socketData = await socketService.joinRoom(roomCode, userId, userName.trim());
        onJoinRoom({ ...socketData, userName: userName.trim() });
      } else {
        setError(response.message || 'Failed to join room');
      }
    } catch (err) {
      console.error('Join error:', err);
      setError(err.message || 'Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createRoom();
      
      if (response.success) {
        const userId = `${userName.trim()}_${Math.random().toString(36).substr(2, 9)}`;
        const socketData = await socketService.joinRoom(response.room.roomCode, userId, userName.trim());
        onJoinRoom({ ...socketData, userName: userName.trim() });
      } else {
        setError(response.message || 'Failed to create room');
      }
    } catch (err) {
      console.error('Create error:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && userName.trim()) {
      if (roomCode.trim()) {
        handleJoin();
      } else {
        handleCreate();
      }
    }
  };

  return (
    <>
      <Container>
        <Logo>✏️</Logo>
        <Title>Collaborative Whiteboard</Title>
        <Subtitle>Draw, share, and collaborate in real-time with your team</Subtitle>
        
        <InputGroup>
          <Label>Your Name</Label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={loading}
            maxLength={20}
            autoFocus
          />
        </InputGroup>

        <InputGroup>
          <Label>Room Code (Optional)</Label>
          <RoomCodeInput
            type="text"
            placeholder="ENTER CODE"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={loading}
            maxLength={8}
          />
        </InputGroup>
        
        <Button 
          onClick={handleJoin} 
          disabled={loading || !userName.trim() || !roomCode.trim()}
        >
          Join Room
        </Button>
        
        <Divider><span>OR</span></Divider>
        
        <SecondaryButton 
          onClick={handleCreate} 
          disabled={loading || !userName.trim()}
        >
          Create New Room
        </SecondaryButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Container>

      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
    </>
  );
}

export default RoomJoin;