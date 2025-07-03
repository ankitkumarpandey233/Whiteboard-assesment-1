import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: #f8f9fa;
    overflow: hidden;
  }
`;

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [prefilledRoomCode, setPrefilledRoomCode] = useState('');

  useEffect(() => {
    // Check URL params for room code
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    
    if (roomFromUrl) {
      setPrefilledRoomCode(roomFromUrl.toUpperCase());
      // Clean up URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleJoinRoom = (roomData) => {
    console.log('Joined room:', roomData);
    setCurrentRoom(roomData);
    setPrefilledRoomCode(''); // Clear prefilled code
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        {!currentRoom ? (
          <RoomJoin 
            onJoinRoom={handleJoinRoom} 
            prefilledRoomCode={prefilledRoomCode}
          />
        ) : (
          <Whiteboard 
            roomData={currentRoom}
            onLeaveRoom={handleLeaveRoom} 
          />
        )}
      </AppContainer>
    </>
  );
}

export default App;