/* =====================================================
   DATA
===================================================== */
const PIZZAS = [
  { id:1,  name:"Margherita",              type:"veg",    price:249, rating:5, desc:"Classic cheese pizza with fresh basil.",              img:"images/margherita.jpg", badge:"Best Seller" },
  { id:2,  name:"Pepperoni",               type:"nonveg", price:349, rating:5, desc:"Loaded with delicious spiced pepperoni.",             img:"images/pepperoni.jpg",  badge:"Best Seller" },
  { id:3,  name:"Veggie Delight",          type:"veg",    price:299, rating:5, desc:"Loaded with fresh garden vegetables.",                img:"images/veggie.jpg",     badge:"Best Seller" },
  { id:4,  name:"Farmhouse",               type:"veg",    price:319, rating:4, desc:"Onion, capsicum, mushroom and sweet corn.",           img:"images/farmhouse.jpg" },
  { id:5,  name:"Paneer Tikka",            type:"veg",    price:339, rating:5, desc:"Tandoori-spiced paneer, onion and capsicum.",         img:"images/paneertikka.jpg",     badge:"Spicy" },
  { id:6,  name:"Chicken Tikka",           type:"nonveg", price:379, rating:5, desc:"Smoky tandoori chicken chunks, red onion.",           img:"images/chickentikka.jpg",  badge:"Spicy" },
  { id:7,  name:"BBQ Chicken",             type:"nonveg", price:399, rating:4, desc:"Smoky BBQ sauce, grilled chicken, red onion.",        img:"images/bbqchicken.jpg" },
  { id:8,  name:"Peri Peri Paneer",        type:"veg",    price:349, rating:4, desc:"Fiery peri peri sauce with grilled paneer.",          img:"images/periperipaneer.jpg",     badge:"Spicy" },
  { id:9,  name:"Four Cheese",             type:"veg",    price:379, rating:5, desc:"Mozzarella, cheddar, parmesan and feta blend.",       img:"images/fourcheese.jpg" },
  { id:10, name:"Mexican Green Wave",      type:"veg",    price:329, rating:4, desc:"Jalapeño, capsicum, corn and tangy salsa.",           img:"images/mexicangreenwave.jpg",     badge:"Spicy" },
  { id:11, name:"Chicken Sausage",         type:"nonveg", price:359, rating:4, desc:"Sliced chicken sausage, onion and oregano.",          img:"images/chickensausage.jpg" },
  { id:12, name:"Tandoori Paneer",         type:"veg",    price:339, rating:4, desc:"Char-grilled paneer in tandoori masala.",             img:"images/tandooripaneer.jpg" },
  { id:13, name:"Corn & Cheese",           type:"veg",    price:279, rating:4, desc:"Sweet corn loaded with extra mozzarella.",            img:"images/cornandcheese.jpg" },
  { id:14, name:"Keema Do Pyaza",          type:"nonveg", price:389, rating:5, desc:"Spiced minced mutton with double onion.",             img:"images/keemadopyaza.jpg" },
  { id:15, name:"Mushroom Truffle",        type:"veg",    price:349, rating:5, desc:"Fresh mushroom finished with truffle oil.",           img:"images/mushroontruffle.jpg",     badge:"New" },
  { id:16, name:"Hawaiian",                type:"nonveg", price:329, rating:3, desc:"Ham and pineapple on a sweet tomato base.",           img:"images/hawaiian.jpg" },
  { id:17, name:"Spinach Corn",            type:"veg",    price:299, rating:4, desc:"Baby spinach, sweet corn and mozzarella.",            img:"images/spinach.jpg" },
  { id:18, name:"Smoked BBQ Supreme",      type:"nonveg", price:419, rating:5, desc:"Our loaded meat-supreme pie, smoked to order.",       img:"images/smokedbbq.jpg",  badge:"New" },
];

const SEED_REVIEWS = [
  { name:"Emily", rating:5, text:"The best pizza I've ever had! Super cheesy and delivered hot!" },
  { name:"James",  rating:5, text:"Absolutely loved the crust. Will definitely order again." },
  { name:"Sophia", rating:5, text:"Fast delivery and amazing taste!" },
];

const GST_RATE = 0.05;        // 5% GST, standard for non-AC food delivery in India
const DELIVERY_FEE = 49;      // flat fee
const FREE_DELIVERY_ABOVE = 499;

/* =====================================================
   STATE (persisted to localStorage)
===================================================== */
let cart = JSON.parse(localStorage.getItem("sh_cart") || "{}");        // { pizzaId: qty }
let currentUser = JSON.parse(localStorage.getItem("sh_current_user") || "null");
let reviews = JSON.parse(localStorage.getItem("sh_reviews") || "null") || SEED_REVIEWS.slice();
let activeFilter = "all";
let searchTerm = "";
let selectedRating = 5;

/* =====================================================
   UTIL
===================================================== */
function money(n){ return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`; }

function toast(msg){
  const stack = document.getElementById("toastStack");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function saveCart(){ localStorage.setItem("sh_cart", JSON.stringify(cart)); }
function saveUser(){ localStorage.setItem("sh_current_user", JSON.stringify(currentUser)); }
function saveReviews(){ localStorage.setItem("sh_reviews", JSON.stringify(reviews)); }
function getUsers(){ return JSON.parse(localStorage.getItem("sh_users") || "{}"); }
function saveUsers(u){ localStorage.setItem("sh_users", JSON.stringify(u)); }

/* =====================================================
   MENU RENDERING
===================================================== */
function renderMenu(){
  const grid = document.getElementById("menuGrid");
  const filtered = PIZZAS.filter(p => {
    const matchesFilter = activeFilter === "all" || p.type === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0){
    grid.innerHTML = `<p style="grid-column:1/-1;color:#9a917f;">No pizzas match your search.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const qty = cart[p.id] || 0;
    return `
    <div class="card">
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='images/margherita.jpg'">
        <div class="veg-dot ${p.type}"></div>
        ${p.badge ? `<div class="badge">${p.badge}</div>` : ""}
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="rating">${"⭐".repeat(p.rating)}${"☆".repeat(5 - p.rating)}</div>
        <p>${p.desc}</p>
        <div class="card-footer">
          <span class="price">${money(p.price)}</span>
          <div class="qty-stepper">
            <button onclick="stepQty(${p.id}, -1)">−</button>
            <span id="qty-${p.id}">${qty}</span>
            <button onclick="stepQty(${p.id}, 1)">+</button>
          </div>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>`;
  }).join("");
}

// temporary per-card quantity selector before adding to cart
const pendingQty = {};
function stepQty(id, delta){
  const current = pendingQty[id] || 1;
  const next = Math.max(1, current + delta);
  pendingQty[id] = next;
  document.getElementById(`qty-${id}`).textContent = next;
}

function addToCart(id){
  const qty = pendingQty[id] || 1;
  cart[id] = (cart[id] || 0) + qty;
  pendingQty[id] = 1;
  saveCart();
  renderMenu();
  renderCart();
  const pizza = PIZZAS.find(p => p.id === id);
  toast(`🍕 ${qty} × ${pizza.name} added to cart`);
}

/* =====================================================
   CART DRAWER + BILLING
===================================================== */
function renderCart(){
  const itemsEl = document.getElementById("cartItems");
  const billEl = document.getElementById("cartBill");
  const cartCount = document.getElementById("cartCount");

  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  cartCount.textContent = entries.reduce((sum, [, qty]) => sum + qty, 0);

  if (entries.length === 0){
    itemsEl.innerHTML = `<div class="empty-cart">Your cart is empty.<br>Add a pizza to get started 🍕</div>`;
    billEl.innerHTML = "";
    return;
  }

  itemsEl.innerHTML = entries.map(([id, qty]) => {
    const p = PIZZAS.find(pz => pz.id === Number(id));
    return `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-meta">${money(p.price)} × ${qty}</div>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeCartQty(${p.id}, -1)">−</button>
        <span>${qty}</span>
        <button onclick="changeCartQty(${p.id}, 1)">+</button>
        <span class="remove-item" onclick="removeFromCart(${p.id})">✕</span>
      </div>
    </div>`;
  }).join("");

  const { subtotal, delivery, gst, total } = calcBill();
  billEl.innerHTML = `
    <div class="bill-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="bill-row"><span>Delivery Fee</span><span>${delivery === 0 ? "FREE" : money(delivery)}</span></div>
    <div class="bill-row"><span>GST (5%)</span><span>${money(gst)}</span></div>
    <div class="bill-row total"><span>Total</span><span>${money(total)}</span></div>
  `;
}

function calcBill(){
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PIZZAS.find(pz => pz.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const gst = +(subtotal * GST_RATE).toFixed(2);
  const total = +(subtotal + delivery + gst).toFixed(2);
  return { subtotal, delivery, gst, total };
}

function changeCartQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
  renderMenu();
}
function removeFromCart(id){
  delete cart[id];
  saveCart();
  renderCart();
  renderMenu();
}

/* =====================================================
   AUTH (client-side demo only — see note below)
   NOTE: passwords are stored in plain text in localStorage.
   This is fine for a hackathon/demo, but a real production
   site must verify credentials against a real backend and
   never store plain-text passwords.
===================================================== */
function renderAuthSlot(){
  const slot = document.getElementById("authSlot");
  if (currentUser){
    slot.innerHTML = `
      <div class="user-pill">
        👤 ${currentUser.name.split(" ")[0]}
        <button onclick="logout()">Log out</button>
      </div>`;
  } else {
    slot.innerHTML = `<button class="btn-ghost" id="openAuthBtn">Sign In</button>`;
    document.getElementById("openAuthBtn").onclick = () => toggleModal("authOverlay", true);
  }
}

function logout(){
  currentUser = null;
  saveUser();
  renderAuthSlot();
  toast("You've been logged out.");
}

/* =====================================================
   REVIEWS
===================================================== */
function renderReviews(){
  const grid = document.getElementById("reviewGrid");
  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
      <h3>${r.name}</h3>
      <p>"${r.text}"</p>
      <div class="stars">${"⭐".repeat(r.rating)}</div>
    </div>
  `).join("");
}

/* =====================================================
   MODALS
===================================================== */
function toggleModal(id, show){
  document.getElementById(id).classList.toggle("show", show);
}

/* =====================================================
   INIT + EVENT WIRING
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  renderCart();
  renderReviews();
  renderAuthSlot();

  // --- Cart drawer open/close ---
  const cartDrawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  const openCart = () => { cartDrawer.classList.add("open"); overlay.classList.add("show"); };
  const closeCart = () => { cartDrawer.classList.remove("open"); overlay.classList.remove("show"); };
  document.getElementById("openCartBtn").onclick = openCart;
  document.getElementById("closeCartBtn").onclick = closeCart;
  document.getElementById("heroOrderBtn").onclick = () => document.getElementById("menu").scrollIntoView({behavior:"smooth"});
  overlay.onclick = () => { closeCart(); toggleModal("authOverlay", false); toggleModal("orderOverlay", false); };

  // --- Mobile nav ---
  document.getElementById("hamburgerBtn").onclick = () => document.getElementById("navLinks").classList.toggle("open");
  document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => document.getElementById("navLinks").classList.remove("open")));

  // --- Filter tabs ---
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter;
      renderMenu();
    });
  });

  // --- Search ---
  document.getElementById("menuSearch").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderMenu();
  });

  // --- Auth modal ---
  document.getElementById("closeAuthBtn").onclick = () => toggleModal("authOverlay", false);
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".auth-form").forEach(f => f.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab === "login" ? "loginForm" : "signupForm").classList.add("active");
    });
  });

  document.getElementById("signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const users = getUsers();
    if (users[email]){
      toast("An account with that email already exists.");
      return;
    }
    users[email] = { name, password };
    saveUsers(users);
    currentUser = { name, email };
    saveUser();
    renderAuthSlot();
    toggleModal("authOverlay", false);
    toast(`Welcome, ${name.split(" ")[0]}!`);
    e.target.reset();
  });

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const users = getUsers();
    if (!users[email] || users[email].password !== password){
      toast("Incorrect email or password.");
      return;
    }
    currentUser = { name: users[email].name, email };
    saveUser();
    renderAuthSlot();
    toggleModal("authOverlay", false);
    toast(`Welcome back, ${currentUser.name.split(" ")[0]}!`);
    e.target.reset();
  });

  // --- Review form ---
  const starInput = document.getElementById("starInput");
  function paintStars(){
    starInput.querySelectorAll("span").forEach(s => {
      s.classList.toggle("active", Number(s.dataset.val) <= selectedRating);
    });
  }
  paintStars();
  starInput.querySelectorAll("span").forEach(s => {
    s.addEventListener("click", () => { selectedRating = Number(s.dataset.val); paintStars(); });
  });

  document.getElementById("reviewForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    reviews.unshift({ name, rating: selectedRating, text });
    saveReviews();
    renderReviews();
    toast("Thanks for your review! 🍕");
    e.target.reset();
    selectedRating = 5;
    paintStars();
  });

  // --- Contact form (no backend — simulated) ---
  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Message sent — we'll get back to you soon!");
    e.target.reset();
  });

  // --- Checkout ---
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
    if (entries.length === 0){
      toast("Your cart is empty.");
      return;
    }
    if (!currentUser){
      closeCart();
      toggleModal("authOverlay", true);
      toast("Please sign in to check out.");
      return;
    }
    const { subtotal, delivery, gst, total } = calcBill();
    const orderId = "SH" + Math.floor(100000 + Math.random() * 900000);
    const itemsHtml = entries.map(([id, qty]) => {
      const p = PIZZAS.find(pz => pz.id === Number(id));
      return `<div class="bill-row"><span>${p.name} × ${qty}</span><span>${money(p.price * qty)}</span></div>`;
    }).join("");

    document.getElementById("orderContent").innerHTML = `
      <h3>🎉 Order Placed!</h3>
      <div class="order-id">Order #${orderId}</div>
      <p style="margin-bottom:20px;color:#6b6255;">Thanks, ${currentUser.name.split(" ")[0]} — your pizza is on its way. Estimated delivery: 25–30 min.</p>
      ${itemsHtml}
      <div class="bill-row"><span>Delivery Fee</span><span>${delivery === 0 ? "FREE" : money(delivery)}</span></div>
      <div class="bill-row"><span>GST (5%)</span><span>${money(gst)}</span></div>
      <div class="bill-row total"><span>Total Paid</span><span>${money(total)}</span></div>
    `;

    cart = {};
    saveCart();
    renderCart();
    renderMenu();
    closeCart();
    toggleModal("orderOverlay", true);
  });
  document.getElementById("closeOrderBtn").onclick = () => toggleModal("orderOverlay", false);

  // --- Back to top ---
  document.getElementById("topBtn").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
});