const getBackendUrl = () => {
  const isApp = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.platform !== 'web';
  // Use __BACKEND_IP__ (injected by Vite config at build time) for Capacitor app, otherwise use current hostname
  const host = isApp ? __BACKEND_IP__ : window.location.hostname;
  return `http://${host}:3001`;
};

export const syncPull = async (key) => {
  try {
    const res = await fetch(`${getBackendUrl()}/api/get?key=${key}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.value) {
        localStorage.setItem(key, data.value);
        return JSON.parse(data.value);
      }
    }
  } catch (e) {
    console.warn("Sync pull failed for key:", key, e);
  }
  return null;
};

export const syncPush = async (key, value) => {
  try {
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, strValue);
    await fetch(`${getBackendUrl()}/api/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: strValue })
    });
  } catch (e) {
    console.warn("Sync push failed for key:", key, e);
  }
};
