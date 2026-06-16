const ORDER_STORAGE_KEYS = {
  products: "servesync-menu-products",
  kitchenOrders: "servesync-kitchen-orders",
};

const categoryLabels = {
  burgers: "Burgers",
  bebidas: "Bebidas",
  acompanhamentos: "Acompanhamentos",
  pizzas: "Pizzas",
  sobremesas: "Sobremesas",
};

const defaultProducts = [
  {
    id: "p1",
    name: "BigSync",
    category: "burgers",
    price: 45,
    favorite: true,
    tone: "burger",
    image: "./IMG/Hamburguer 1.png",
  },
  {
    id: "p2",
    name: "Refrigerante",
    category: "bebidas",
    price: 12,
    favorite: true,
    tone: "drink",
    image: "./IMG/Refri.png",
  },
  {
    id: "p3",
    name: "Synchicken",
    category: "burgers",
    price: 32,
    favorite: true,
    tone: "burger-alt",
    image: "./IMG/Synchicken.png",
  },
  {
    id: "p4",
    name: "Fritas com Cheddar",
    category: "acompanhamentos",
    price: 25,
    favorite: true,
    tone: "fries",
    image: "./IMG/Fritas.png",
  },
  {
    id: "p5",
    name: "Tiras de Frango",
    category: "acompanhamentos",
    price: 30,
    favorite: true,
    tone: "chicken",
    image: "./IMG/Tiras de frango.png",
  },
  {
    id: "p6",
    name: "Petit Gateau",
    category: "sobremesas",
    price: 29,
    favorite: true,
    tone: "dessert",
    image: "./IMG/Petit gateau.png",
  },
];

const productGrid = document.querySelector("#productGrid");
const productSearch = document.querySelector("#productSearch");
const tableSelect = document.querySelector("#tableSelect");
const currentTableLabel = document.querySelector("#currentTableLabel");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const sendOrderButton = document.querySelector("#sendOrderButton");
const productDialog = document.querySelector("#productDialog");
const productForm = document.querySelector("#productForm");
const openProductButton = document.querySelector("#openProductButton");
const productImageInput = document.querySelector("#productImageInput");
const productImagePreview = document.querySelector("#productImagePreview");
const openIngredientButton = document.querySelector("#openIngredientButton");
const ingredientDialog = document.querySelector("#ingredientDialog");
const ingredientForm = document.querySelector("#ingredientForm");
const ingredientSelect = document.querySelector("#ingredientSelect");
const selectedIngredients = document.querySelector("#selectedIngredients");
const ingredientPreview = document.querySelector("#ingredientPreview");
const deleteDraftButton = document.querySelector("#deleteDraftButton");

let products = loadProducts();
let cart = [];
let activeCategory = "all";
let draftImage = "";
let draftIngredients = [];

function loadProducts() {
  try {
    const saved = localStorage.getItem(ORDER_STORAGE_KEYS.products);
    return saved ? JSON.parse(saved) : structuredClone(defaultProducts);
  } catch {
    return structuredClone(defaultProducts);
  }
}

function saveProducts() {
  localStorage.setItem(ORDER_STORAGE_KEYS.products, JSON.stringify(products));
}

function getOrders() {
  try {
    const saved = localStorage.getItem(ORDER_STORAGE_KEYS.kitchenOrders);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDER_STORAGE_KEYS.kitchenOrders, JSON.stringify(orders));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function renderProducts() {
  const query = productSearch.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" ? product.favorite : product.category === activeCategory;
    const matchesSearch = !query || product.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = "";

  if (visibleProducts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum produto encontrado.";
    productGrid.appendChild(empty);
    return;
  }

  visibleProducts.forEach((product) => {
    const article = document.createElement("article");
    article.className = "product-card";

    // id em dataset para facilitar deleção/edição futura
    article.dataset.productId = product.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "button button-danger";
    deleteBtn.textContent = "Apagar";
    deleteBtn.addEventListener("click", () => {
      const ok = confirm(`Apagar o produto "${product.name}"?`);
      if (!ok) return;
      products = products.filter((p) => p.id !== product.id);
      saveProducts();
      renderProducts();
    });



    const image = document.createElement("div");
    image.className = `product-image ${product.tone || "default"}`;
    if (product.image) {
      image.style.backgroundImage = `url("${product.image}")`;
    }

    const favorite = document.createElement("span");
    favorite.className = "favorite-mark";
    favorite.textContent = "*";

    const info = document.createElement("div");
    info.className = "product-info";
    info.innerHTML = `<strong>${product.name}</strong><span>${formatCurrency(product.price)}</span>`;

    const button = document.createElement("button");
    button.className = "button button-light";
    button.type = "button";
    button.textContent = "Adicionar";
    button.addEventListener("click", () => addToCart(product.id));

    // coloca o botão de apagar junto com as demais ações
    article.append(image, favorite, info, button, deleteBtn);

    productGrid.appendChild(article);
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      category: product.category,
    });
  }

  renderCart();
}

function renderCart() {
  currentTableLabel.textContent = tableSelect.value;
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("p");

    empty.className = "cart-empty";
    empty.textContent = "Nenhum item adicionado";
    cartItems.appendChild(empty);
  } else {
    cart.forEach((item) => {
      const row = document.createElement("article");
      row.className = "cart-row";
      row.innerHTML = `
        <div>
          <strong>${item.quantity}x ${item.name}</strong>
          <span>${categoryLabels[item.category]}</span>
        </div>
        <div class="cart-row-actions">
          <button type="button" aria-label="Remover ${item.name}" data-remove="${item.id}">-</button>
          <strong>${formatCurrency(item.price * item.quantity)}</strong>
        </div>
      `;
      cartItems.appendChild(row);
    });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatCurrency(total);
  sendOrderButton.disabled = cart.length === 0;
}

function removeFromCart(productId) {
  // remove 1 unidade do item
  const existing = cart.find((item) => item.id === productId);
  if (!existing) {
    return;
  }

  existing.quantity -= 1;
  if (existing.quantity <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  }

  renderCart();
}


function sendOrder() {
  if (cart.length === 0) {
    return;
  }

  const orders = getOrders();
  const table = tableSelect.value;
  const order = {
    id: `o${Date.now()}`,
    table,
    ticket: table,
    status: "new",
    minutes: 0,
    createdAt: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
    items: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
    })),
    // tempo inicial estimado para mostrar na cozinha
    minutes: 0,
  };


  orders.unshift(order);
  saveOrders(orders);
  cart = [];
  renderCart();
  window.location.href = "./cozinha.html";
}

function openProductDialog() {
  resetProductDraft();
  productDialog.showModal();
  document.querySelector("#productNameInput").focus();
}

function resetProductDraft() {
  productForm.reset();
  draftImage = "";
  draftIngredients = [];
  productImagePreview.style.backgroundImage = "";
  productImagePreview.classList.remove("has-image");
  renderIngredientDraft();
}

function renderIngredientDraft() {
  selectedIngredients.innerHTML = "";
  ingredientPreview.innerHTML = "";
  ingredientPreview.hidden = draftIngredients.length === 0;

  if (draftIngredients.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Nenhum ingrediente adicionado.";
    selectedIngredients.appendChild(empty);
    return;
  }

  draftIngredients.forEach((ingredient) => {
    const chip = document.createElement("span");
    chip.className = "ingredient-chip";
    chip.textContent = ingredient;
    selectedIngredients.appendChild(chip);

    const previewChip = chip.cloneNode(true);
    ingredientPreview.appendChild(previewChip);
  });
}

function addIngredient(event) {
  event.preventDefault();
  const value = ingredientSelect.value;
  if (!value || draftIngredients.includes(value)) {
    return;
  }

  draftIngredients.push(value);
  ingredientSelect.value = "";
  renderIngredientDraft();
}

function saveProduct(event) {
  event.preventDefault();
  const formData = new FormData(productForm);
  const name = String(formData.get("productName") || "").trim();
  const price = Number(formData.get("productPrice")) || 0;
  const category = String(formData.get("productCategory") || "burgers");

  // Se o usuário não escolher imagem no input, atribui uma imagem padrão
  // de acordo com a categoria (mantém coerência visual).
  if (!draftImage) {
    const defaultImageByCategory = {
      burgers: "./IMG/Hamburguer 1.png",
      bebidas: "./IMG/Refri.png",
      acompanhamentos: "./IMG/Fritas.png",
      pizzas: "./IMG/Hamburguer 1.png",
      sobremesas: "./IMG/Petit gateau.png",
    };

    draftImage = defaultImageByCategory[category] || "./IMG/Hamburguer 1.png";
  }

  if (!name) {

    alert("Informe o nome do produto.");
    return;
  }

  products.unshift({
    id: `p${Date.now()}`,
    name,
    price,
    category,
    favorite: true,
    image: draftImage,
    tone: "default",
    ingredients: [...draftIngredients],
  });
  saveProducts();
  productDialog.close();
  renderProducts();
}

function handleProductImage(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    draftImage = String(reader.result);
    productImagePreview.style.backgroundImage = `url("${draftImage}")`;
    productImagePreview.classList.add("has-image");
  });
  reader.readAsDataURL(file);
}

document.querySelectorAll(".category-tab").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".category-tab").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderProducts();
  });
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => closeClosestDialog(button));
});

productSearch.addEventListener("input", renderProducts);
tableSelect.addEventListener("change", renderCart);
cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    removeFromCart(removeButton.dataset.remove);
  }
});
sendOrderButton.addEventListener("click", sendOrder);
openProductButton.addEventListener("click", openProductDialog);
productForm.addEventListener("submit", saveProduct);
productImageInput.addEventListener("change", handleProductImage);
openIngredientButton.addEventListener("click", () => ingredientDialog.showModal());
ingredientForm.addEventListener("submit", addIngredient);
deleteDraftButton.addEventListener("click", resetProductDraft);

// Permite apagar rapidamente produtos criados pelo usuário (rascunho salvo no cardápio)
// (Se você quiser, podemos trocar por um modal de confirmação depois.)


renderProducts();
renderCart();
