const KITCHEN_STORAGE_KEY = "servesync-kitchen-orders";

const defaultOrders = [
  {
    id: "demo1",
    table: "M7",
    ticket: "M7",
    status: "new",
    minutes: 2,
    items: [{ name: "Pizza Margherita", quantity: 1 }],
  },
  {
    id: "demo2",
    table: "M1",
    ticket: "M1",
    status: "preparing",
    minutes: 8,
    items: [
      { name: "Hambúrguer Clássico", quantity: 2 },
      { name: "Batata Frita", quantity: 1 },
    ],
  },
  {
    id: "demo3",
    table: "M2",
    ticket: "M2",
    status: "preparing",
    minutes: 18,
    items: [
      { name: "X-Bacon", quantity: 3 },
      { name: "Coca-Cola", quantity: 3 },
    ],
  },
  {
    id: "demo4",
    table: "M5",
    ticket: "M5",
    status: "preparing",
    minutes: 25,
    items: [{ name: "Pizza Margherita", quantity: 2 }],
  },
];

const columns = {
  new: document.querySelector("#newOrders"),
  preparing: document.querySelector("#preparingOrders"),
  ready: document.querySelector("#readyOrders"),
};

const pauseKitchenButton = document.querySelector("#pauseKitchenButton");
let orders = loadOrders();
let paused = false;
let kitchenIntervalId = null;

function ensureStartedAt(order) {
  // When order is moved to preparing/new, we use startedAt to count minutes.
  // If missing, initialize it to now.
  if (!order.startedAt) {
    order.startedAt = Date.now();
  }
}

function minutesFromStartedAt(order) {
  ensureStartedAt(order);
  const elapsedMs = Date.now() - order.startedAt;
  return Math.max(0, Math.floor(elapsedMs / 60000));
}


function loadOrders() {
  try {
    const saved = localStorage.getItem(KITCHEN_STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(defaultOrders);
  } catch {
    return structuredClone(defaultOrders);
  }
}

function saveOrders() {
  localStorage.setItem(KITCHEN_STORAGE_KEY, JSON.stringify(orders));
}

function renderKitchen() {
  Object.values(columns).forEach((column) => {
    column.innerHTML = "";
  });

  const grouped = {
    new: orders.filter((order) => order.status === "new"),
    preparing: orders.filter((order) => order.status === "preparing"),
    ready: orders.filter((order) => order.status === "ready"),
  };

  Object.entries(grouped).forEach(([status, list]) => {
    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "kitchen-empty";
      empty.textContent = "Nenhum pedido.";
      columns[status].appendChild(empty);
      return;
    }

    list.forEach((order) => {
      columns[status].appendChild(createOrderCard(order));
    });
  });

  document.querySelector("#kitchenTotal").textContent = orders.length;
  document.querySelector("#kitchenNew").textContent = grouped.new.length;
  document.querySelector("#kitchenPreparing").textContent = grouped.preparing.length;
  document.querySelector("#kitchenReady").textContent = grouped.ready.length;
  document.querySelector("#newCount").textContent = grouped.new.length;
  document.querySelector("#preparingCount").textContent = grouped.preparing.length;
  document.querySelector("#readyCount").textContent = grouped.ready.length;
}

function createOrderCard(order) {
  const article = document.createElement("article");
  article.className = "kitchen-order";

  const safeMinutes = minutesFromStartedAt(order);



  const items = order.items
    .map((item) => `<li>${item.quantity}x ${item.name}</li>`)
    .join("");

  const primaryAction =
    order.status === "new"
      ? `<button class="button button-primary" type="button" data-action="preparing" data-order="${order.id}">Iniciar preparo</button>`
      : "";
  const readyAction =
    order.status === "preparing"
      ? `<button class="button button-blue" type="button" data-action="ready" data-order="${order.id}">Marcar como pronto</button>`
      : "";
  const callAction =
    order.status !== "ready"
      ? `<button class="button button-light" type="button" data-action="call" data-order="${order.id}">Chamar garçom</button>`
      : `<button class="button button-light" type="button" data-action="done" data-order="${order.id}">Finalizar</button>`;

  article.innerHTML = `
    <header>
      <strong>${order.ticket}</strong>
      <span>${safeMinutes} min</span>

    </header>
    <ul>${items}</ul>
    <div class="kitchen-actions">${primaryAction}${readyAction}${callAction}</div>
  `;

  return article;
}

function updateOrder(orderId, status) {
  if (status === "call") {
    return;
  }

  // whenever an order enters new/preparing, make sure startedAt exists.
  if (status === "new" || status === "preparing") {
    const existing = orders.find((o) => o.id === orderId);
    if (existing) {
      ensureStartedAt(existing);
    }
  }


  if (status === "done") {
    orders = orders.filter((order) => order.id !== orderId);
  } else {
    orders = orders.map((order) => (order.id === orderId ? { ...order, status } : order));
  }

  saveOrders();
  renderKitchen();
}

document.querySelector(".kitchen-board").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  updateOrder(button.dataset.order, button.dataset.action);
});

pauseKitchenButton.addEventListener("click", () => {
  paused = !paused;
  pauseKitchenButton.textContent = paused ? "Retomar" : "Pausar";
  document.body.classList.toggle("kitchen-paused", paused);
});

// Atualiza o contador de minutos automaticamente
kitchenIntervalId = window.setInterval(() => {
  if (!paused) {
    renderKitchen();
  }
}, 1000);

renderKitchen();

