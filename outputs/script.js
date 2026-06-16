const STORAGE_KEYS = {
  tables: "servesync-reception-tables",
  waitlist: "servesync-reception-waitlist",
};

const statusLabels = {
  available: "Disponível",
  occupied: "Ocupada",
  reserved: "Reservada",
};

const defaultTables = [
  { id: "t1", number: 1, shape: "rect", status: "available", people: 0, x: 24, y: 20 },
  { id: "t2", number: 2, shape: "rect", status: "occupied", people: 4, x: 34, y: 20 },
  { id: "t3", number: 3, shape: "rect", status: "available", people: 0, x: 44, y: 20 },
  { id: "t4", number: 4, shape: "rect", status: "occupied", people: 4, x: 54, y: 20 },
  { id: "t24", number: 24, shape: "round", status: "available", people: 0, x: 70, y: 20 },
  { id: "t25", number: 25, shape: "round", status: "available", people: 0, x: 80, y: 20 },
  { id: "t5", number: 5, shape: "rect", status: "available", people: 0, x: 34, y: 40 },
  { id: "t6", number: 6, shape: "rect", status: "available", people: 0, x: 44, y: 40 },
  { id: "t7", number: 7, shape: "rect", status: "occupied", people: 2, x: 54, y: 40 },
  { id: "t8", number: 8, shape: "rect", status: "reserved", people: 2, x: 80, y: 40 },
  { id: "t9", number: 9, shape: "rect", status: "available", people: 0, x: 68, y: 53 },
  { id: "t10", number: 10, shape: "rect", status: "available", people: 0, x: 80, y: 53 },
  { id: "t15", number: 15, shape: "round", status: "available", people: 0, x: 27, y: 64 },
  { id: "t16", number: 16, shape: "round", status: "available", people: 0, x: 38, y: 64 },
  { id: "t17", number: 17, shape: "round", status: "available", people: 0, x: 49, y: 64 },
  { id: "t12", number: 12, shape: "rect", status: "available", people: 0, x: 80, y: 66 },
  { id: "t18", number: 18, shape: "round", status: "available", people: 0, x: 27, y: 78 },
  { id: "t19", number: 19, shape: "round", status: "available", people: 0, x: 38, y: 78 },
  { id: "t20", number: 20, shape: "round", status: "available", people: 0, x: 49, y: 78 },
  { id: "t11", number: 11, shape: "rect", status: "available", people: 0, x: 68, y: 78 },
  { id: "t13", number: 13, shape: "rect", status: "occupied", people: 3, x: 80, y: 86 },
];

const floorPlan = document.querySelector("#floorPlan");
const dashboard = document.querySelector("#dashboard");
const mapCard = document.querySelector(".map-card");
const editLayoutButton = document.querySelector("#editLayoutButton");
const addTableButton = document.querySelector("#addTableButton");
const cancelEditButton = document.querySelector("#cancelEditButton");
const confirmEditButton = document.querySelector("#confirmEditButton");
const editActions = document.querySelector(".edit-actions");
const normalActions = document.querySelector(".normal-actions");
const editorPanel = document.querySelector("#editorPanel");
const closeEditorButton = document.querySelector("#closeEditorButton");
const editorHint = document.querySelector("#editorHint");
const tableForm = document.querySelector("#tableForm");
const tableNumberInput = document.querySelector("#tableNumberInput");
const tableShapeInput = document.querySelector("#tableShapeInput");
const tableStatusInput = document.querySelector("#tableStatusInput");
const deleteTableButton = document.querySelector("#deleteTableButton");
const waitlistElement = document.querySelector("#waitlist");
const checkinDialog = document.querySelector("#checkinDialog");
const checkinForm = document.querySelector("#checkinForm");
const openCheckinButton = document.querySelector("#openCheckinButton");
const tableStatusDialog = document.querySelector("#tableStatusDialog");
const tableStatusForm = document.querySelector("#tableStatusForm");
const statusDialogTitle = document.querySelector("#statusDialogTitle");
const statusDialogSelect = document.querySelector("#statusDialogSelect");
const statusPeopleInput = document.querySelector("#statusPeopleInput");

let tables = normalizeTables(loadFromStorage(STORAGE_KEYS.tables, defaultTables));
let waitlist = loadFromStorage(STORAGE_KEYS.waitlist, []);
let editMode = false;
let selectedTableId = null;
let tablesBeforeEdit = null;
let dragState = null;

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function normalizeTables(items) {
  return items.map((table) => ({
    people: 0,
    ...table,
  }));
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function render() {
  renderTables();
  renderStats();
  renderWaitlist();
  renderEditor();
}

function renderTables() {
  floorPlan.innerHTML = "";

  tables
    .slice()
    .sort((a, b) => a.number - b.number)
    .forEach((table) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = [
        "table-seat",
        table.shape === "round" ? "round" : "rect",
        table.status,
        selectedTableId === table.id ? "selected" : "",
      ]
        .filter(Boolean)
        .join(" ");
      button.textContent = table.number;
      button.style.left = `${table.x}%`;
      button.style.top = `${table.y}%`;
      button.dataset.tableId = table.id;
      button.setAttribute("aria-label", `Mesa ${table.number}, ${statusLabels[table.status]}`);
      button.title = editMode ? "Arraste para mover ou clique para editar" : "Clique para atualizar status";

      button.addEventListener("click", () => {
        selectedTableId = table.id;
        if (!editMode) {
          openTableStatusDialog(table.id);
        }
        render();
      });

      button.addEventListener("pointerdown", (event) => {
        if (!editMode) {
          return;
        }
        selectedTableId = table.id;
        startDrag(event, table, button);
      });

      floorPlan.appendChild(button);
    });
}

function renderStats() {
  const totals = tables.reduce(
    (acc, table) => {
      acc[table.status] += 1;
      return acc;
    },
    { available: 0, occupied: 0, reserved: 0 }
  );

  document.querySelector("#availableCount").textContent = totals.available;
  document.querySelector("#occupiedCount").textContent = totals.occupied;
  document.querySelector("#reservedCount").textContent = totals.reserved;
  document.querySelector("#waitingCount").textContent = waitlist.length;
}

function renderWaitlist() {
  waitlistElement.innerHTML = "";

  if (waitlist.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum cliente na lista de espera.";
    waitlistElement.appendChild(empty);
    return;
  }

  waitlist.forEach((guest) => {
    const item = document.createElement("article");
    item.className = "wait-item";

    const top = document.createElement("div");
    top.className = "wait-item-top";

    const lines = document.createElement("div");
    lines.className = "guest-lines";

    const name = document.createElement("strong");
    name.className = "guest-name";
    if (guest.name) {
      name.textContent = guest.name;
    } else {
      name.innerHTML = '<span class="blank-line" aria-label="Nome em branco"></span>';
    }

    const phone = document.createElement("span");
    phone.className = "guest-phone";
    if (guest.phone) {
      phone.textContent = guest.phone;
    } else {
      phone.innerHTML = '<span class="blank-line short" aria-label="Telefone em branco"></span>';
    }

    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = "Chamado";

    lines.append(name, phone);
    top.append(lines, chip);

    const meta = document.createElement("div");
    meta.className = "wait-meta";
    const dateLabel = guest.date ? `Reserva ${guest.date}` : "Sem data";
    const timeLabel = guest.time ? guest.time : "Sem horário";
    meta.innerHTML = `<span>${guest.people} pessoa${guest.people === 1 ? "" : "s"}</span><span>${dateLabel} ${timeLabel}</span>`;

    const button = document.createElement("button");
    button.className = "button button-primary";
    button.type = "button";
    button.textContent = "Confirmar entrada";
    button.addEventListener("click", () => confirmGuestEntry(guest.id));

    item.append(top, meta, button);
    waitlistElement.appendChild(item);
  });
}

function renderEditor() {
  if (!editMode) {
    return;
  }

  const table = getSelectedTable();
  editorHint.hidden = Boolean(table);
  tableForm.hidden = !table;

  if (!table) {
    return;
  }

  tableNumberInput.value = table.number;
  tableShapeInput.value = table.shape;
  tableStatusInput.value = table.status;
}

function getSelectedTable() {
  return tables.find((table) => table.id === selectedTableId);
}

function enterEditMode() {
  editMode = true;
  tablesBeforeEdit = structuredClone(tables);
  dashboard.classList.add("editing");
  mapCard.classList.add("edit-mode");
  editActions.hidden = false;
  normalActions.hidden = true;
  editorPanel.hidden = false;
  selectedTableId = selectedTableId || tables[0]?.id || null;
  render();
}

function exitEditMode({ keepChanges }) {
  if (!keepChanges && tablesBeforeEdit) {
    tables = structuredClone(tablesBeforeEdit);
  }

  editMode = false;
  tablesBeforeEdit = null;
  dashboard.classList.remove("editing");
  mapCard.classList.remove("edit-mode");
  editActions.hidden = true;
  normalActions.hidden = false;
  editorPanel.hidden = true;
  saveToStorage(STORAGE_KEYS.tables, tables);
  render();
}

function addTable() {
  const usedNumbers = new Set(tables.map((table) => table.number));
  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  const table = {
    id: `t${Date.now()}`,
    number: nextNumber,
    shape: "rect",
    status: "available",
    people: 0,
    x: 50,
    y: 50,
  };

  tables.push(table);
  selectedTableId = table.id;
  render();
}

function saveTable(event) {
  event.preventDefault();
  const table = getSelectedTable();
  if (!table) {
    return;
  }

  const nextNumber = Number(tableNumberInput.value);
  const duplicatedNumber = tables.some((item) => item.id !== table.id && item.number === nextNumber);

  if (!nextNumber || nextNumber < 1) {
    alert("Informe um número válido para a mesa.");
    return;
  }

  if (duplicatedNumber) {
    alert("Já existe uma mesa com esse número.");
    return;
  }

  table.number = nextNumber;
  table.shape = tableShapeInput.value;
  table.status = tableStatusInput.value;
  if (table.status === "available") {
    table.people = 0;
  }
  saveToStorage(STORAGE_KEYS.tables, tables);
  render();
}

function deleteSelectedTable() {
  if (!selectedTableId) {
    return;
  }

  tables = tables.filter((table) => table.id !== selectedTableId);
  selectedTableId = tables[0]?.id || null;
  saveToStorage(STORAGE_KEYS.tables, tables);
  render();
}

function startDrag(event, table, button) {
  event.preventDefault();
  button.setPointerCapture(event.pointerId);
  button.classList.add("dragging");

  const bounds = floorPlan.getBoundingClientRect();
  dragState = { table, button, bounds };
  moveDraggedTable(event);

  button.addEventListener("pointermove", moveDraggedTable);
  button.addEventListener(
    "pointerup",
    () => {
      button.classList.remove("dragging");
      button.releasePointerCapture(event.pointerId);
      button.removeEventListener("pointermove", moveDraggedTable);
      dragState = null;
      saveToStorage(STORAGE_KEYS.tables, tables);
      render();
    },
    { once: true }
  );
}

function moveDraggedTable(event) {
  if (!dragState) {
    return;
  }

  const { table, button, bounds } = dragState;
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;

  table.x = clamp(x, 6, 94);
  table.y = clamp(y, 8, 92);
  button.style.left = `${table.x}%`;
  button.style.top = `${table.y}%`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function confirmGuestEntry(guestId) {
  const guest = waitlist.find((item) => item.id === guestId);
  waitlist = waitlist.filter((item) => item.id !== guestId);

  const firstAvailable = tables.find((table) => table.status === "available");
  if (firstAvailable) {
    firstAvailable.status = "occupied";
    firstAvailable.people = guest?.people || 0;
  }

  saveToStorage(STORAGE_KEYS.waitlist, waitlist);
  saveToStorage(STORAGE_KEYS.tables, tables);
  render();
}

function openCheckinDialog() {
  checkinForm.reset();
  document.querySelector("#guestPartyInput").value = 0;
  checkinDialog.showModal();
  document.querySelector("#guestNameInput").focus();
}

function addGuest(event) {
  event.preventDefault();
  const formData = new FormData(checkinForm);
  const people = Number(formData.get("guestParty")) || 0;

  waitlist.push({
    id: `g${Date.now()}`,
    name: String(formData.get("guestName") || "").trim(),
    phone: String(formData.get("guestPhone") || "").trim(),
    people,
    date: String(formData.get("guestDate") || "").trim(),
    time: String(formData.get("guestTime") || "").trim(),
    createdAt: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  });

  saveToStorage(STORAGE_KEYS.waitlist, waitlist);
  checkinDialog.close();
  render();
}

function openTableStatusDialog(tableId) {
  const table = tables.find((item) => item.id === tableId);
  if (!table) {
    return;
  }

  statusDialogTitle.textContent = `Mesa ${table.number}`;
  statusDialogSelect.value = table.status;
  statusPeopleInput.value = table.people || 0;
  tableStatusDialog.showModal();
}

function saveTableStatus(event) {
  event.preventDefault();
  const table = getSelectedTable();
  if (!table) {
    tableStatusDialog.close();
    return;
  }

  table.status = statusDialogSelect.value;
  table.people = table.status === "available" ? 0 : Number(statusPeopleInput.value) || 0;
  saveToStorage(STORAGE_KEYS.tables, tables);
  tableStatusDialog.close();
  render();
}

editLayoutButton.addEventListener("click", enterEditMode);
addTableButton.addEventListener("click", addTable);
cancelEditButton.addEventListener("click", () => exitEditMode({ keepChanges: false }));
confirmEditButton.addEventListener("click", () => exitEditMode({ keepChanges: true }));
closeEditorButton.addEventListener("click", () => {
  selectedTableId = null;
  render();
});
tableForm.addEventListener("submit", saveTable);
deleteTableButton.addEventListener("click", deleteSelectedTable);
openCheckinButton.addEventListener("click", openCheckinDialog);
checkinForm.addEventListener("submit", addGuest);
tableStatusForm.addEventListener("submit", saveTableStatus);

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => closeClosestDialog(button));
});

render();
