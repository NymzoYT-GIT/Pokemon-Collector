const app = document.getElementById("app");

const navigation = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "packs", icon: "🎴", label: "Open Packs" },
  { id: "collection", icon: "📚", label: "Collection" },
  { id: "binders", icon: "📖", label: "Binders" },
  { id: "pokedex", icon: "🔴", label: "Pokédex" },
  { id: "shop", icon: "🛒", label: "Shop" }
];

let currentPage = "home";

function render() {
  app.innerHTML = 
    <header class="app-header">
      <div class="logo">POKÉMON COLLECTOR</div>
      <div class="header-right">
        <div class="currency">🪙 0</div>
        <button class="profile-button" onclick="showLogin()">
          👤 Account
        </button>
      </div>
    </header>

    <div class="main-layout">
      <aside class="sidebar">
        ${navigation.map(item => 
          <button class="nav-button ${currentPage === item.id ? "active" : ""}"
            onclick="navigate('${item.id}')">
            <span>${item.icon}</span>
            ${item.label}
          </button>
        ).join("")}
      </aside>

      <main class="content" id="page-content"></main>
    </div>
  ;

  renderPage();
}

function navigate(page) {
  currentPage = page;
  render();
}

function renderPage() {
  const content = document.getElementById("page-content");

  const pages = {
    home: 
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
        <button class="primary-button"
          onclick="navigate('packs')">
          EXPLORE PACKS
        </button>
      </section>

      <h2 class="section-title">Your Collection</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <span>Cards Collected</span>
          <h3>0</h3>
        </div>
        <div class="stat-card">
          <span>Sets Completed</span>
          <h3>0</h3>
        </div>
        <div class="stat-card">
          <span>Binders Created</span>
          <h3>0</h3>
        </div>
      </div>

      <h2 class="section-title">Recent Discoveries</h2>
      <div class="empty-card">
        Your card discoveries will appear here!
      </div>
    
    packs: 
      <h1 class="page-title">Booster Packs</h1>
      <p class="page-description">
        Choose a booster pack to discover new Pokémon cards.
      </p>
      <div class="empty-card">
        <h2>🎴 Pack Opening Coming Soon</h2>
        <p>Our booster pack system is being developed.</p>
      </div>
  
    collection:
      <h1 class="page-title">My Collection</h1>
      <p class="page-description">
        Every card you discover will be stored here.
      </p>
      <div class="empty-card">
        You haven't discovered any cards yet.
      </div>

    binders:
      <h1 class="page-title">My Binders</h1>
      <p class="page-description">
        Organize your favorite cards into beautiful binders.
      </p>
      <div class="empty-card">
        <h2>📖 Your Binders</h2>
        <p>Binder creation is coming soon.</p>
      </div>

    pokedex:
      <h1 class="page-title">Pokédex</h1>
      <p class="page-description">
        Track all the Pokémon you discover.
      </p>
      <div class="empty-card">
        Your Pokédex is waiting to be filled!
      </div>

    shop: 
      <h1 class="page-title">Collector Shop</h1>
      <p class="page-description">
        Purchase packs and collection accessories.
      </p>
      <div class="empty-card">
        <h2>🛒 Shop Coming Soon</h2>
        <p>The shop and currency system are coming soon.</p>
      </div>
    
  };

  content.innerHTML = pages[currentPage] || pages.home;
}

function showLogin() {
  alert("Account registration and login are coming soon!");
}

render();
