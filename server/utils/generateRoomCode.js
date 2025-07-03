/**
 * Generates a unique room code
 * Format: 6-8 alphanumeric characters (uppercase)
 * Example: ROOM123, ABCD5678
 */

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MIN_LENGTH = 6;
const MAX_LENGTH = 8;

function generateRoomCode(length = MIN_LENGTH) {
  let code = '';
  const codeLength = Math.min(Math.max(length, MIN_LENGTH), MAX_LENGTH);
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    code += CHARACTERS[randomIndex];
  }
  
  return code;
}

/**
 * Generates a unique room code and checks against existing codes
 * @param {Function} checkExistence - Async function to check if code exists
 * @param {Number} maxAttempts - Maximum attempts to generate unique code
 */
async function generateUniqueRoomCode(checkExistence, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode(MIN_LENGTH + Math.floor(attempt / 3));
    
    try {
      const exists = await checkExistence(code);
      if (!exists) {
        return code;
      }
    } catch (error) {
      console.error('Error checking room code existence:', error);
      throw error;
    }
  }
  
  throw new Error('Failed to generate unique room code after maximum attempts');
}

module.exports = {
  generateRoomCode,
  generateUniqueRoomCode
};