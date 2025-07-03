import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Text = styled.p`
  margin-top: 20px;
  font-size: 18px;
  color: #4a5568;
  font-weight: 500;
`;

function LoadingScreen({ message = 'Loading...' }) {
  return (
    <Container>
      <Spinner />
      <Text>{message}</Text>
    </Container>
  );
}

export default Loading