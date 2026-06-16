// Guarda simples: se o usuário já estiver logado como funcionário, deixa continuar.
// Caso contrário, marca como funcionário e redireciona.

function setEmployeeLoggedIn() {
  const AUTH_STORAGE_KEY = "servesync-auth";
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ employee: true }));
}

// se o formulário enviar para home.html, a gente só marca e redireciona
window.addEventListener("DOMContentLoaded", () => {
  setEmployeeLoggedIn();
});

