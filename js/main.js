import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jxvcekteoituffhkqrrl.supabase.co";
const SUPABASE_KEY = "sb_publishable_dzLwqnhBtnIRf5Mct3qxkQ_ZW-Pr68m";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = document.getElementById("app");

let currentPage = "home";
let player = null;
let playerCoins = 0;
let playerCards = [];
let playerBinders = [];
let loadingUserId = null;

let tcgCards = [];
let cardsLoading = false;
let cardsError = "";
let searchText = "";
let selectedSet = "all";

const navigation = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "packs", icon: "🎴", label: "Open Packs" },
  { id: "collection", icon: "📚", label: "Collection" },
  { id: "binders", icon: "📖", label: "Binders" },
  { id: "pokedex", icon: "🔴", label: "Pokédex" },
  { id: "shop", icon: "🛒", label: "Shop" },
  { id: "database", icon: "🗂️", label: "Card Database" }
];

function render() {
  app.innerHTML = `
    <header class="app-header">
      <div class="logo">POKÉMON COLLECTOR</div>
      <div class="header-right">
        <div class="currency">🪙 ${playerCoins}</div>
        <button class="profile-button" onclick="showLogin()">
          👤 ${player ? "Account" : "Sign In"}
        </button>
      </div>
    </header>

    <div class="main-layout">
      <aside class="sidebar">
        ${navigation.map(item => `
          <button
            class="nav-button ${currentPage === item.id ? "active" : ""}"
            onclick="navigate('${item.id}')"
          >
            <span>${item.icon}</span>
            ${item.label}
          </button>
        `).join("")}
      </aside>

      <main class="content" id="page-content"></main>
    </div>
  `;

  renderPage();
}

function navigate(page) {
  currentPage = page;
  render();
}

function renderPage() {
  const content = document.getElementById("page-content");

  const pages = {
    home: `
      <section class="welcome">
        <h1>Welcome to Pokémon Collector!</h1>
        <p>Your collection adventure starts here.</p>
      </section>

      <section class="featured">
        <h2>Discover Your Next Favorite Card</h2>
        <p>
          Open booster packs, discover rare Pokémon,
          complete sets and build your ultimate collection.
        </p>
        <button class="primary-button" onclick="navigate('packs')">
          EXPLORE PACKS
        </button>
        <button class="secondary-button" onclick="navigate('database')">
          EXPLORE CARD DATABASE
        </button>
      </section>

      <h2 class="section-title">Your Collection</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <span>Cards Collected</span>
          <h3>${playerCards.reduce((total, card) => total + card.quantity, 0)}</h3>
        </div>
        <div class="stat-card">
          <span>Sets Completed</span>
          <h3>0</h3>
        </div>
        <div class="stat-card">
          <span>Binders Created</span>
          <h3>${playerBinders.length}</h3>
        </div>
      </div>

      <h2 class="section-title">Recent Discoveries</h2>
      <div class="empty-card">Your card discoveries will appear here!</div>
    `,

    packs: `
      <h1 class="page-title">Booster Packs</h1>
      <p class="page-description">
        Choose a booster pack to discover new Pokémon cards.
      </p>
      <div class="empty-card">
        <h2>🎴 Pack Opening Coming Soon</h2>
        <p>Our booster pack system is being developed.</p>
      </div>
    `,

    collection: `
      <h1 class="page-title">My Collection</h1>
      <p class="page-description">
        Every card you discover will be stored here.
      </p>
      <div class="empty-card">
        You haven't discovered any cards yet.
      </div>
    `,

    binders: `
      <h1 class="page-title">My Binders</h1>
      <p class="page-description">
        Organize your favorite cards into beautiful binders.
      </p>
      <div class="empty-card">
        <h2>📖 Your Binders</h2>
        <p>Binder creation is coming soon.</p>
      </div>
    `,

    pokedex: `
      <h1 class="page-title">Pokédex</h1>
      <p class="page-description">
        Track all the Pokémon you discover.
      </p>
      <div class="empty-card">
        Your Pokédex is waiting to be filled!
      </div>
    `,

    shop: `
      <h1 class="page-title">Collector Shop</h1>
      <p class="page-description">
        Purchase packs and collection accessories.
      </p>
      <div class="empty-card">
        <h2>🛒 Shop Coming Soon</h2>
        <p>The shop and currency system are coming soon.</p>
      </div>
    `,

    database: `
      <h1 class="page-title">Pokémon TCG Card Database</h1>
      <p class="page-description">
        Browse your locally hosted Pokémon card database.
      </p>

      <div class="database-controls">
        <input
          id="card-search"
          type="search"
          placeholder="Search Pokémon, card names, or numbers..."
          value="${escapeHTML(searchText)}"
          oninput="searchCards(this.value)"
        >

        <select id="set-filter" onchange="filterCards(this.value)">
          <option value="all">All Sets</option>
          ${[...new Set(tcgCards.map(card => card.set))]
            .map(set => `
              <option value="${escapeHTML(set)}"
                ${selectedSet === set ? "selected" : ""}>
                ${escapeHTML(set)}
              </option>
            `).join("")}
        </select>
      </div>

      ${cardsLoading ? `
        <div class="empty-card">Loading Pokémon cards...</div>
      ` : ""}

      ${cardsError ? `
        <div class="empty-card">
          <h2>Unable to load cards</h2>
          <p>${escapeHTML(cardsError)}</p>
          <button class="primary-button" onclick="loadCardDatabase()">
            TRY AGAIN
          </button>
        </div>
      ` : ""}

      ${!cardsLoading && !cardsError ? `
        <p class="page-description">
          Showing ${getFilteredCards().length} cards
        </p>

        <div class="card-grid">
          ${getFilteredCards().map(card => `
            <article class="tcg-card">
              <div class="tcg-card-info">
                <h3>${escapeHTML(card.name)}</h3>
                <p>${escapeHTML(card.set)}</p>
                <p>Card #${escapeHTML(card.number)}</p>
                <p>${escapeHTML(card.rarity)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      ` : ""}
    `
  };

  content.innerHTML = pages[currentPage] || pages.home;

  if (
    currentPage === "database" &&
    !cardsLoading &&
    tcgCards.length === 0 &&
    !cardsError
  ) {
    loadCardDatabase();
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function getFilteredCards() {
  const query = searchText.trim().toLowerCase();

  return tcgCards.filter(card => {
    const matchesSearch =
      !query ||
      card.name?.toLowerCase().includes(query) ||
      String(card.number).toLowerCase().includes(query) ||
      card.rarity?.toLowerCase().includes(query) ||
      card.set?.toLowerCase().includes(query);

    const matchesSet =
      selectedSet === "all" || card.set === selectedSet;

    return matchesSearch && matchesSet;
  });
}

function searchCards(value) {
  searchText = value;

  const search = document.getElementById("card-search");
  const position = search?.selectionStart ?? value.length;

  renderPage();

  const newSearch = document.getElementById("card-search");

  if (newSearch) {
    newSearch.focus();
    newSearch.setSelectionRange(position, position);
  }
}

function filterCards(value) {
  selectedSet = value;
  renderPage();
}

async function loadCardDatabase() {
  if (cardsLoading) return;

  cardsLoading = true;
  cardsError = "";
  renderPage();

  try {
    const response = await fetch("./data/cards.json");

    if (!response.ok) {
      throw new Error(`Card file error: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The card database format is invalid.");
    }

    tcgCards = data;

  } catch (error) {
    console.error("Card database error:", error);
    cardsError = error.message || "Unable to load local cards.";
  } finally {
    cardsLoading = false;
    renderPage();
  }
}

function showLogin() {
  const content = document.getElementById("page-content");

  if (player) {
    const account = document.createElement("section");
    account.className = "auth-container";

    const title = document.createElement("h1");
    title.textContent = "My Account";

    const welcome = document.createElement("p");
    welcome.textContent = "Welcome to Pokémon Collector!";

    const form = document.createElement("div");
    form.className = "auth-form";

    const heading = document.createElement("h2");
    heading.textContent = "Account Details";

    const email = document.createElement("p");
    email.textContent = "Email: " + (player.email || "Unavailable");

    const status = document.createElement("p");
    status.textContent = "Status: Signed In";

    const button = document.createElement("button");
    button.className = "secondary-button";
    button.textContent = "SIGN OUT";
    button.onclick = logout;

    form.append(heading, email, status, button);
    account.append(title, welcome, form);
    content.replaceChildren(account);
    return;
  }

  content.innerHTML = `
    <section class="auth-container">
      <h1>Welcome to Pokémon Collector</h1>
      <p>Sign in or create your collector account.</p>

      <div class="auth-form">
        <h2>Sign In</h2>
        <input type="email" id="auth-email" placeholder="Email address">
        <input type="password" id="auth-password" placeholder="Password">
        <button class="primary-button" onclick="login()">SIGN IN</button>
        <button class="secondary-button" onclick="signup()">CREATE ACCOUNT</button>
        <p id="auth-message"></p>
      </div>
    </section>
  `;
}

async function signup() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const message = document.getElementById("auth-message");

  if (!email || !password) {
    message.textContent = "Enter your email and password.";
    return;
  }

  if (password.length < 8) {
    message.textContent = "Password must be at least 8 characters.";
    return;
  }

  message.textContent = "Creating your account...";

  try {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      message.textContent = error.message;
      return;
    }

    message.textContent =
      "Account created! Check your email to verify your account.";
  } catch (error) {
    message.textContent = "Connection error. Please try again.";
  }
}

async function login() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const message = document.getElementById("auth-message");

  if (!email || !password) {
    message.textContent = "Enter your email and password.";
    return;
  }

  message.textContent = "Signing in...";

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) message.textContent = error.message;
  } catch (error) {
    message.textContent = "Connection error. Please try again.";
  }
}

async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    player = null;
    playerCoins = 0;
    playerCards = [];
    playerBinders = [];
    currentPage = "home";
    render();
  } catch (error) {
    alert("Unable to sign out. Please try again.");
  }
}

async function loadPlayerData() {
  if (!player || loadingUserId === player.id) return;

  const userId = player.id;
  loadingUserId = userId;

  try {
    const [walletResult, cardsResult, bindersResult] = await Promise.all([
      supabase.from("player_wallets")
        .select("coins")
        .eq("user_id", userId)
        .maybeSingle(),

      supabase.from("player_cards")
        .select("card_id, quantity")
        .eq("user_id", userId),

      supabase.from("binders")
        .select("*")
        .eq("user_id", userId)
    ]);

    if (walletResult.error || cardsResult.error || bindersResult.error) {
      console.error("Cloud data loading error:", {
        wallet: walletResult.error,
        cards: cardsResult.error,
        binders: bindersResult.error
      });
      return;
    }

    if (!player || player.id !== userId) return;

    playerCoins = walletResult.data?.coins ?? 0;
    playerCards = cardsResult.data ?? [];
    playerBinders = bindersResult.data ?? [];

    render();
  } catch (error) {
    console.error("Cloud data loading failed:", error);
  } finally {
    if (loadingUserId === userId) loadingUserId = null;
  }
}

window.navigate = navigate;
window.showLogin = showLogin;
window.signup = signup;
window.login = login;
window.logout = logout;
window.searchCards = searchCards;
window.filterCards = filterCards;
window.loadCardDatabase = loadCardDatabase;

supabase.auth.onAuthStateChange((event, session) => {
  player = session?.user ?? null;

  if (player) {
    const userId = player.id;
    setTimeout(() => {
      if (player && player.id === userId) loadPlayerData();
    }, 0);
  } else {
    playerCoins = 0;
    playerCards = [];
    playerBinders = [];
    loadingUserId = null;
  }

  render();
});

render();

console.log("Pokémon Collector initialized!");
console.log("Supabase connection configured!");
