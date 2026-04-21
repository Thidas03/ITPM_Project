const STORAGE_KEY = 'chat:lastReadBySession';

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

export function getLastReadAt(sessionId) {
  const store = readStore();
  const v = store?.[sessionId];
  return v ? new Date(v).getTime() : 0;
}

export function markSessionRead(sessionId, at = Date.now()) {
  const store = readStore();
  store[sessionId] = new Date(at).toISOString();
  writeStore(store);
}

export function isUnread({ sessionId, lastMessageAtMs }) {
  if (!lastMessageAtMs) return false;
  return lastMessageAtMs > getLastReadAt(sessionId);
}

