const menuItems = [
  { id: 1, name: "Truffle Pepperoni Pizza", category: "Pizza", price: 14.99, image: "images/pizza1.jpg", featured: true },
  { id: 2, name: "Veggie Garden Pizza", category: "Pizza", price: 12.49, image: "images/pizza2.jpg", featured: true },
  { id: 3, name: "Smoky Beef Burger", category: "Burger", price: 10.99, image: "images/burgar1.jpg", featured: true },
  { id: 4, name: "Classic Chicken Burger", category: "Burger", price: 9.49, image: "images/burgar2.jpg", featured: false },
  { id: 5, name: "Sparkling Berry Drink", category: "Drinks", price: 4.5, image: "images/drink1.jpg", featured: false },
  { id: 6, name: "Strawberry Red Cooler", category: "Drinks", price: 4.2, image: "images/drink2.jpg", featured: true },
  { id: 7, name: "Chocolate Lava Cake", category: "Desserts", price: 6.75, image: "images/cake3.jpg", featured: true },
  { id: 8, name: "Vanilla Cheesecake", category: "Desserts", price: 6.1, image: "images/cheess1.jpg", featured: false },
  { id: 9, name: "Caramel Layer Cake", category: "Desserts", price: 6.95, image: "images/cake1.jpg", featured: false },
  { id: 10, name: "Berry Cream Cake", category: "Desserts", price: 7.2, image: "images/cake2.jpg", featured: true },
  { id: 11, name: "Signature Celebration Cake", category: "Desserts", price: 7.6, image: "images/cake4.jpg", featured: false },
  { id: 12, name: "Citrus Fresh Cooler", category: "Drinks", price: 4.8, image: "images/drink3.jpg", featured: true }
];

const CART_KEY = "restaurant_cart";
const THEME_KEY = "restaurant_theme";
const FAVORITES_KEY = "restaurant_favorites";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function findItem(id) {
  return menuItems.find((item) => item.id === Number(id));
}

function addToCart(itemId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === itemId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: itemId, quantity });
  }

  saveCart(cart);
}

function removeFromCart(itemId) {
  const updated = getCart().filter((item) => item.id !== itemId);
  saveCart(updated);
}

function updateQuantity(itemId, quantity) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === itemId);
  if (!item) return;

  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }

  item.quantity = quantity;
  saveCart(cart);
}

function getCartTotal() {
  return getCart().reduce((total, cartItem) => {
    const item = findItem(cartItem.id);
    return item ? total + item.price * cartItem.quantity : total;
  }, 0);
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll("#cartCount");
  badges.forEach((badge) => {
    badge.textContent = count;
  });
}

function initializeTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  root.setAttribute("data-theme", savedTheme);

  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  toggle.innerHTML = savedTheme === "dark"
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';

  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    toggle.innerHTML = next === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  });
}

function initializeMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("siteNav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function createFoodCard(item) {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(item.id);

  return `
    <article class="card">
      <img src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="card-body">
        <div class="card-head">
          <h3>${item.name}</h3>
          <button class="favorite-btn ${isFavorite ? "active" : ""}" data-favorite-id="${item.id}">
            <i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
          </button>
        </div>
        <span class="category">${item.category}</span>
        <p class="price">${formatPrice(item.price)}</p>
        <button class="btn btn-primary add-to-cart" data-id="${item.id}"><i class="fa-solid fa-cart-plus"></i>&nbsp;Add to Cart</button>
      </div>
    </article>
  `;
}

function bindCardActions(scope = document) {
  scope.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      addToCart(id, 1);
      button.classList.add("added-feedback");
      button.innerHTML = '<i class="fa-solid fa-circle-check"></i>&nbsp;Added!';
      setTimeout(() => {
        button.classList.remove("added-feedback");
        button.innerHTML = '<i class="fa-solid fa-cart-plus"></i>&nbsp;Add to Cart';
      }, 700);
    });
  });

  scope.querySelectorAll(".favorite-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.favoriteId);
      const favorites = getFavorites();
      const exists = favorites.includes(id);
      const updated = exists ? favorites.filter((fav) => fav !== id) : [...favorites, id];
      saveFavorites(updated);
      button.classList.toggle("active");
      const icon = button.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-regular", exists);
        icon.classList.toggle("fa-solid", !exists);
      }
    });
  });
}

function renderFeatured() {
  const featuredGrid = document.getElementById("featuredGrid");
  if (!featuredGrid) return;

  const featured = menuItems.filter((item) => item.featured).slice(0, 4);
  featuredGrid.innerHTML = featured.map(createFoodCard).join("");
  bindCardActions(featuredGrid);
}


function renderHomeStats() {
  const menuCount = document.getElementById("menuCount");
  const categoryCount = document.getElementById("categoryCount");
  if (!menuCount || !categoryCount) return;

  const uniqueCategories = new Set(menuItems.map((item) => item.category));
  menuCount.textContent = `${menuItems.length}+`;
  categoryCount.textContent = uniqueCategories.size;
}

function renderBestSellers() {
  const bestSellersGrid = document.getElementById("bestSellersGrid");
  if (!bestSellersGrid) return;

  const bestSellers = [...menuItems]
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  bestSellersGrid.innerHTML = bestSellers.map(createFoodCard).join("");
  bindCardActions(bestSellersGrid);
}

function initializeMenuPage() {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) return;

  const searchInput = document.getElementById("menuSearch");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const emptyState = document.getElementById("noResults");

  let activeFilter = "All";
  let searchQuery = "";

  const render = () => {
    const filtered = menuItems.filter((item) => {
      const matchesCategory = activeFilter === "All" || item.category === activeFilter;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    menuGrid.innerHTML = filtered.map(createFoodCard).join("");
    bindCardActions(menuGrid);

    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.dataset.filter;
      render();
    });
  });

  searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    render();
  });

  render();
}

function renderCartItems() {
  const cartContainer = document.getElementById("cartContainer");
  const cartSummary = document.getElementById("cartSummary");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartContainer || !cartSummary || !cartTotal) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <p class="empty-state">Your cart is empty. <a class="link" href="menu.html">Add items from menu</a>.</p>
    `;
    cartSummary.classList.add("hidden");
    return;
  }

  cartSummary.classList.remove("hidden");

  cartContainer.innerHTML = cart
    .map((cartItem) => {
      const item = findItem(cartItem.id);
      if (!item) return "";

      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <p class="name">${item.name}</p>
            <p>${formatPrice(item.price)}</p>
          </div>
          <select class="quantity-select" data-qty-id="${item.id}">
            ${Array.from({ length: 10 }, (_, index) => {
              const value = index + 1;
              return `<option value="${value}" ${value === cartItem.quantity ? "selected" : ""}>${value}</option>`;
            }).join("")}
          </select>
          <div>
            <p class="line-price">${formatPrice(item.price * cartItem.quantity)}</p>
            <button class="remove-btn" data-remove-id="${item.id}"><i class="fa-solid fa-trash"></i> Remove</button>
          </div>
        </div>
      `;
    })
    .join("");

  cartTotal.textContent = formatPrice(getCartTotal());

  cartContainer.querySelectorAll(".quantity-select").forEach((select) => {
    select.addEventListener("change", () => {
      updateQuantity(Number(select.dataset.qtyId), Number(select.value));
      renderCartItems();
      renderCheckoutSummary();
    });
  });

  cartContainer.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(Number(button.dataset.removeId));
      renderCartItems();
      renderCheckoutSummary();
    });
  });
}

function renderCheckoutSummary() {
  const container = document.getElementById("checkoutSummary");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <h3>Order Summary</h3>
      <p class="empty-state">Your cart is empty. <a class="link" href="menu.html">Browse menu</a>.</p>
    `;
    return;
  }

  const itemsList = cart
    .map((cartItem) => {
      const item = findItem(cartItem.id);
      if (!item) return "";
      return `<li>${item.name} x ${cartItem.quantity} <strong>${formatPrice(item.price * cartItem.quantity)}</strong></li>`;
    })
    .join("");

  container.innerHTML = `
    <h3>Order Summary</h3>
    <ul>${itemsList}</ul>
    <p><strong>Total: ${formatPrice(getCartTotal())}</strong></p>
  `;
}

function initializeCheckout() {
  const form = document.getElementById("checkoutForm");
  const message = document.getElementById("orderMessage");
  if (!form || !message) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      message.classList.remove("hidden");
      message.textContent = "Your cart is empty. Add items before placing an order.";
      return;
    }

    const nameInput = document.getElementById("customerName");
    message.classList.remove("hidden");
    message.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, <strong>${nameInput.value}</strong>! Your order has been placed successfully.`;

    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCheckoutSummary();
    form.reset();
  });
}

function initializePage() {
  updateCartCount();
  initializeTheme();
  initializeMobileNav();

  const page = document.body.dataset.page;

  if (page === "home") {
    renderFeatured();
    renderHomeStats();
    renderBestSellers();
  }

  if (page === "menu") {
    initializeMenuPage();
  }

  if (page === "cart") {
    renderCartItems();
  }

  if (page === "checkout") {
    renderCheckoutSummary();
    initializeCheckout();
  }
}

document.addEventListener("DOMContentLoaded", initializePage);
