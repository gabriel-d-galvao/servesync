const AUTH_STORAGE_KEY = "servesync-auth";

// Este projeto é front-end estático.
// Quando você “Entrar como funcionário”, simulamos um login guardando um flag no localStorage.

function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function isEmployeeLoggedIn() {
  const auth = getAuth();
  return Boolean(auth && auth.employee === true);
}

function requireEmployeeLogin() {
  if (!isEmployeeLoggedIn()) {
    window.location.href = "./login.html";
    return false;
  }
  return true;
}

