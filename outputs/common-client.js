// Helpers compartilhados entre telas do cliente (Index_clientes) e integrações simples.

(function () {
  const MENU_PRODUCTS_KEY = 'servesync-menu-products';

  function loadProductsFromGerencia() {
    try {
      const saved = localStorage.getItem(MENU_PRODUCTS_KEY);
      if (!saved) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  function formatPriceBR(value) {
    const num = Number(value) || 0;
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  }

  // Expose no window para facilitar.
  window.__serveSyncClient = window.__serveSyncClient || {};
  window.__serveSyncClient.loadProductsFromGerencia = loadProductsFromGerencia;
  window.__serveSyncClient.formatPriceBR = formatPriceBR;
})();

