export const getSessionId = () => {
  const key = "pixel_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID(); // Generate a new session ID
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
};

export const getUserId = () => {
  const key = "user_id";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID(); // Generate a new session ID
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
};
