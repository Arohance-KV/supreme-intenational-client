const SESSION_KEY = 'x-session-id';
const ID_LENGTH = 24;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateId(): string {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return id;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing && existing.length >= ID_LENGTH) {
    return existing;
  }

  const id = generateId();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}
