
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

const navigation = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "packs", icon: "🎴", label: "Open Packs" },
  { id: "collection", icon: "📚", label: "Collection" },
  { id: "binders", icon: "📖", label: "Binders" },
  { id: "pokedex", icon: "🔴", label: "Pokédex" },
  { id: "shop", icon: "🛒", label: "Shop" }
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
          <button class="nav-button ${currentPage === item.id ? "active" : ""}" onclick="navigate('${item.id}')">
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
        <p>Open booster packs, discover rare Pokémon, complete sets and build your ultimate collection.</p>
        <button class="primary-button" onclick="navigate('packs')">EXPLORE PACKS</button>
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
      <p class="page-description">Choose a booster pack to discover new Pokémon cards.</p>
      <div class="empty-card">
        <h2>🎴 Pack Opening Coming Soon</h2>
        <p>Our booster pack system is being developed.</p>
      </div>
    `,

    collection: `
      <h1 class="page-title">My Collection</h1>
      <p class="page-description">Every card you discover will be stored here.</p>
      <div class="empty-card">You haven't discovered any cards yet.</div>
    `,

    binders: `
      <h1 class="page-title">My Binders</h1>
      <p class="page-description">Organize your favorite cards into beautiful binders.</p>
      <div class="empty-card">
        <h2>📖 Your Binders</h2>
        <p>Binder creation is coming soon.</p>
      </div>
    `,

    pokedex: `
      <h1 class="page-title">Pokédex</h1>
      <p class="page-description">Track all the Pokémon you discover.</p>
      <div class="empty-card">Your Pokédex is waiting to be filled!</div>
    `,

    shop: `
      <h1 class="page-title">Collector Shop</h1>
      <p class="page-description">Purchase packs and collection accessories.</p>
      <div class="empty-card">
        <h2>🛒 Shop Coming Soon</h2>
        <p>The shop and currency system are coming soon.</p>
      </div>
    `
  };

  content.innerHTML = pages[currentPage] || pages.home;
}

function showLogin() {
  const content = document.getElementById("page-content");

  content.innerHTML = `
    <section class="auth-container">
      <h1>Welcome to Pokémon Collector</h1>
      <p>Sign in or create your collector account.</p>

      <div class="auth-form">
        <h2>Sign In</h2>

        <input type="email" id="auth-email" placeholder="Email address">
        <input type="password" id="auth-password" placeholder="Password">

        <button class="primary-button" onclick="login()">
          SIGN IN
        </button>

        <button class="secondary-button" onclick="signup()">
          CREATE ACCOUNT
        </button>

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

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  message.textContent = "Account created! Check your email to verify your account.";
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  player = data.user;
  render();
}

window.navigate = navigate;
window.showLogin = showLogin;
window.signup = signup;
window.login = login;

supabase.auth.onAuthStateChange((event, session) => {
  player = session?.user ?? null;
  render();
});

render();

console.log("Pokémon Collector initialized!");
console.log("Supabase connection configured!");
