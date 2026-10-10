const itemsBody = document.querySelector("#items-body");
const searchInput = document.querySelector("#search");
const message = document.querySelector("#message");
const dialog = document.querySelector("#item-dialog");
const form = document.querySelector("#item-form");
const formError = document.querySelector("#form-error");
let allItems = [];
let searchTimer;

const money = value => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD"
}).format(value);

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
  if (text) window.setTimeout(() => {
    if (message.textContent === text) message.textContent = "";
  }, 3500);
}

function updateStats(items) {
  document.querySelector("#stat-products").textContent = items.length;
  document.querySelector("#stat-units").textContent = items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString();
  document.querySelector("#stat-value").textContent = money(items.reduce((sum, item) => sum + item.quantity * item.price, 0));
  document.querySelector("#stat-low").textContent = items.filter(item => item.quantity < 5).length;
}

function statusFor(quantity) {
  if (quantity === 0) return { label: "Out of stock", className: "stock-out" };
  if (quantity < 5) return { label: "Low stock", className: "stock-low" };
  return { label: "In stock", className: "stock-ok" };
}

function renderItems(items) {
  updateStats(allItems);
  document.querySelector("#result-count").textContent =
    `Showing ${items.length} of ${allItems.length} products`;

  if (!items.length) {
    itemsBody.innerHTML = '<tr><td colspan="6" class="empty">No products found. Try another search or add an item.</td></tr>';
    return;
  }

  // Build nodes using textContent for user-provided strings to avoid HTML injection.
  itemsBody.replaceChildren();
  for (const item of items) {
    const row = document.createElement("tr");
    const product = document.createElement("td");
    const productWrap = document.createElement("div");
    productWrap.className = "product-cell";
    const icon = document.createElement("span");
    icon.className = "product-icon";
    icon.textContent = "▧";
    const name = document.createElement("span");
    name.textContent = item.name;
    productWrap.append(icon, name);
    product.append(productWrap);

    const category = document.createElement("td");
    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = item.category;
    category.append(tag);

    const quantity = document.createElement("td");
    quantity.textContent = item.quantity.toLocaleString();
    const price = document.createElement("td");
    price.textContent = money(item.price);
    const stock = document.createElement("td");
    const badge = document.createElement("span");
    const status = statusFor(item.quantity);
    badge.className = `stock-badge ${status.className}`;
    badge.textContent = status.label;
    stock.append(badge);

    const action = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.title = `Delete ${item.name}`;
    deleteButton.setAttribute("aria-label", `Delete ${item.name}`);
    deleteButton.addEventListener("click", () => deleteItem(item.id));
    action.append(deleteButton);
    row.append(product, category, quantity, price, stock, action);
    itemsBody.append(row);
  }
}

async function loadItems(query = "") {
  try {
    const response = await fetch(`/api/items${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Could not load items.");
    allItems = query ? await fetchAllItems() : result.data;
    renderItems(result.data);
  } catch (error) {
    itemsBody.innerHTML = '<tr><td colspan="6" class="empty">Could not connect to the API. Is the server running?</td></tr>';
    showMessage(error.message, true);
  }
}

async function fetchAllItems() {
  const response = await fetch("/api/items");
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error || "Could not load inventory totals.");
  return result.data;
}

async function deleteItem(id) {
  if (!window.confirm("Delete this inventory item?")) return;
  try {
    const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Could not delete item.");
    showMessage("Item deleted successfully.");
    await loadItems(searchInput.value.trim());
  } catch (error) {
    showMessage(error.message, true);
  }
}

document.querySelector("#open-add").addEventListener("click", () => {
  form.reset();
  formError.textContent = "";
  dialog.showModal();
});
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());

form.addEventListener("submit", async event => {
  event.preventDefault();
  formError.textContent = "";
  const data = Object.fromEntries(new FormData(form).entries());
  data.quantity = Number(data.quantity);
  data.price = Number(data.price);
  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Could not save item.");
    dialog.close();
    showMessage("New item added successfully.");
    searchInput.value = "";
    await loadItems();
  } catch (error) {
    formError.textContent = error.message;
  }
});

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadItems(searchInput.value.trim()), 180);
});

document.querySelector("#theme-toggle").addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  document.querySelector("#theme-toggle").setAttribute("aria-pressed", String(dark));
});

loadItems();
