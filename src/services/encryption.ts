import CryptoJS from 'crypto-js';

// Get encryption key from environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('VITE_ENCRYPTION_KEY is not defined in environment variables');
}

export const encryptToken = (token: string): string => {
  try {
    return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Error encrypting token:', error);
    return token; // Fallback to unencrypted token if encryption fails
  }
};

export const decryptToken = (encryptedToken: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting token:', error);
    return encryptedToken; // Fallback to encrypted token if decryption fails
  }
}; 