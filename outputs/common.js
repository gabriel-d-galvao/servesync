const SHARED_STORAGE_KEYS = {
  logo: "servesync-reception-logo",
};

function initSharedShell() {
  const currentPage = document.body.dataset.page;

  document.querySelectorAll("[data-nav-page]").forEach((link) => {
    const isActive = link.dataset.navPage === currentPage;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const logoInput = document.querySelector("#logoInput");
  const logoPreview = document.querySelector("#logoPreview");
  const logoPlaceholder = document.querySelector("#logoPlaceholder");

  if (!logoInput || !logoPreview || !logoPlaceholder) {
    return;
  }

  const savedLogo = localStorage.getItem(SHARED_STORAGE_KEYS.logo);
  if (savedLogo) {
    logoPreview.src = savedLogo;
    logoPreview.hidden = false;
    logoPlaceholder.hidden = true;
  } else {
    // Logo padrão (para aparecer já no carregamento da página)
    logoPreview.src = "./IMG/Logosspng 1.png";
    logoPreview.hidden = false;
    logoPlaceholder.hidden = true;
  }


  // Mantém a logo fixa do projeto (não troca ao selecionar outro arquivo)
  // Se você quiser reativar a troca manual depois, remova este bloco e descomente o handler original.
  logoInput.disabled = true;

}

function closeClosestDialog(button) {
  const dialog = button.closest("dialog");
  if (dialog) {
    dialog.close();
  }
}

document.addEventListener("DOMContentLoaded", initSharedShell);
