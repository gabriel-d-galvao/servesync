// Trata o botão "Sair" da área de funcionário (gerência)
// Requer auth.js no mesmo diretório.

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.logout-button');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
      const ok = confirm('Deseja realmente sair do sistema ServeSync?');
      if (!ok) return;

      try {
        if (typeof clearAuth === 'function') {
          clearAuth();
        } else {
          localStorage.removeItem('servesync-auth');
        }
      } catch (_) {
        try { localStorage.removeItem('servesync-auth'); } catch (_) {}
      }

      window.location.href = './login.html';
    });
  });
})();

