// --- PULSENEST APPLICATION CONTROLLER ---

// 1. Catalog Data
const catalog = [
  {
    id: "pulsepods-pro",
    name: "PulsePods Pro",
    category: "Wireless Earbuds",
    price: 129,
    badge: "bestseller",
    specs: ["Active Noise Cancellation", "Wireless Charging", "30-Hour Battery"],
    variants: ["black", "white", "navy"],
    details: {
      battery: "30 Hours total (6h earbuds + 24h case)",
      charging: "Qi Wireless & USB-C Quick Charge",
      connectivity: "Bluetooth 5.3, AAC/SBC",
      weight: "5.4g per earbud, 45g case",
      compatibility: "iOS, Android, Windows, macOS",
      warranty: "1-Year Limited Warranty"
    }
  },
  {
    id: "pulsepods-lite",
    name: "PulsePods Lite",
    category: "Wireless Earbuds",
    price: 79,
    badge: null,
    specs: ["Bluetooth 5.4", "Fast Pair", "20-Hour Battery"],
    variants: ["black", "white"],
    details: {
      battery: "20 Hours total (5h earbuds + 15h case)",
      charging: "USB-C Fast Charge",
      connectivity: "Bluetooth 5.4, Fast Pair",
      weight: "4.2g per earbud, 38g case",
      compatibility: "iOS, Android, Windows",
      warranty: "1-Year Limited Warranty"
    }
  },
  {
    id: "pulsemax",
    name: "PulseMax Headphones",
    category: "Wireless Headphones",
    price: 199,
    badge: "new",
    specs: ["Hybrid ANC", "40-Hour Battery", "USB-C Fast Charge"],
    variants: ["black", "silver"],
    details: {
      battery: "40 Hours (ANC On) / 50 Hours (ANC Off)",
      charging: "USB-C Quick Charge (10 min = 5 hours)",
      connectivity: "Bluetooth 5.3, Multi-point Connection",
      weight: "260g",
      compatibility: "iOS, Android, Windows, macOS, Jack 3.5mm",
      warranty: "1-Year Limited Warranty"
    }
  },
  {
    id: "magcharge",
    name: "MagCharge Wireless Pad",
    category: "Mobile Accessories",
    price: 39,
    badge: "promo",
    specs: ["15W Charging", "Magnetic Alignment", "USB-C"],
    variants: ["black", "white"],
    details: {
      battery: "N/A (Wall powered)",
      charging: "15W wireless (Qi compatible)",
      connectivity: "Integrated USB-C Cable",
      weight: "80g",
      compatibility: "iPhone 12/13/14/15, Qi-compatible devices",
      warranty: "1-Year Limited Warranty"
    }
  },
  {
    id: "powervault",
    name: "PowerVault 10000",
    category: "Mobile Accessories",
    price: 59,
    badge: "promo",
    specs: ["10000mAh Capacity", "USB-C PD Output", "Dual Output"],
    variants: ["black", "blue"],
    details: {
      battery: "10000mAh (37Wh)",
      charging: "20W USB-C PD Input/Output",
      connectivity: "1x USB-C, 1x USB-A",
      weight: "220g",
      compatibility: "Smartphones, Tablets, USB-C accessories",
      warranty: "1-Year Limited Warranty"
    }
  },
  {
    id: "flexcharge",
    name: "FlexCharge Cable",
    category: "Mobile Accessories",
    price: 19,
    badge: null,
    specs: ["Fast Charging Support", "Braided Nylon", "2m Length"],
    variants: ["black", "gray"],
    details: {
      battery: "N/A (Cable)",
      charging: "Up to 60W (20V/3A) delivery",
      connectivity: "USB-C to USB-C",
      weight: "45g",
      compatibility: "Any USB-C power device",
      warranty: "Lifetime Limited Warranty"
    }
  }
];

// Product image map — maps product IDs to their image paths
const productImages = {
  "pulsepods-pro":  "images/product-earbuds.png",
  "pulsepods-lite": "images/product-earbuds.png",
  "pulsemax":        "images/product-headphones.png",
  "magcharge":       "images/product-headphones.png",
  "powervault":      "images/product-gaming.png",
  "flexcharge":      "images/product-sports.png",
};

// 2. Application State
const state = {
  cart: (() => {
    try {
      const saved = localStorage.getItem("pulsenest_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })(),
  wishlist: new Set(),
  compareList: [], // stores product ids
  activeVariants: {
    "pulsepods-pro": "black",
    "pulsepods-lite": "black",
    "pulsemax": "black",
    "magcharge": "black",
    "powervault": "black",
    "flexcharge": "black"
  },
  recentSearches: ["PulsePods Pro", "USB-C Cable", "ANC Headphones"],
  popularSearches: ["PulsePods Pro", "PulseMax Headphones", "MagCharge Pad"],
  // Listing Page state
  filters: {
    categories: [],
    priceMax: 200,
    colors: [],
    features: []
  },
  sortBy: "featured",
  currentPage: 1,
  pageSize: 4
};

// 3. UI Helpers
function saveCartState() {
  try {
    localStorage.setItem("pulsenest_cart", JSON.stringify(state.cart));
  } catch (e) {
    console.error("Failed to save cart state:", e);
  }
}

function updateGlobalCartBadges() {
  const total = state.cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge").forEach(b => b.textContent = total);
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast ${type === "success" ? "toast-success" : ""}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// 4. Modal Interactions
const modalOverlay = document.getElementById("quickview-modal");
const modalContent = document.getElementById("modal-dynamic-content");
const modalClose = document.getElementById("modal-close-btn");

function openQuickView(productId) {
  const product = catalog.find(p => p.id === productId);
  if (!product) return;
  
  const activeColor = state.activeVariants[productId];
  
  modalContent.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <div class="product-illustration-large" style="--product-color: var(--color-variant-${activeColor});">
          ${getSvgMarkup(product.id, activeColor, true)}
        </div>
      </div>
      <div class="modal-details">
        <span class="card-category">${product.category}</span>
        <h2>${product.name}</h2>
        <div class="modal-price-row">
          <span class="modal-price">$${product.price}</span>
        </div>
        <p>Premium wireless accessory designed for work, travel, and reliable everyday use. Engineered with premium components for maximum durability.</p>
        
        <div class="modal-section">
          <span class="modal-section-title">Color variant</span>
          <div class="card-variants">
            ${product.variants.map(v => `
              <button 
                class="variant-dot ${v === activeColor ? 'active' : ''}" 
                data-color="${v}" 
                data-product-id="${product.id}"
                aria-label="Select color ${v}"
              ></button>
            `).join('')}
          </div>
        </div>

        <div class="modal-section">
          <span class="modal-section-title">Product specifications</span>
          <ul class="modal-specs-list">
            <li class="modal-spec-item"><strong>Battery:</strong> ${product.details.battery}</li>
            <li class="modal-spec-item"><strong>Charging:</strong> ${product.details.charging}</li>
            <li class="modal-spec-item"><strong>Wireless:</strong> ${product.details.connectivity}</li>
            <li class="modal-spec-item"><strong>Weight:</strong> ${product.details.weight}</li>
            <li class="modal-spec-item"><strong>Compatibility:</strong> ${product.details.compatibility}</li>
            <li class="modal-spec-item"><strong>Warranty:</strong> ${product.details.warranty}</li>
          </ul>
        </div>

        <div class="modal-section" style="margin-top: auto; padding-top: var(--space-24); display: flex; flex-direction: column; gap: var(--space-8);">
          <button class="btn btn-primary btn-add-to-cart" data-product-id="${product.id}" style="width: 100%;">
            Add to Cart
          </button>
          <a href="product.html?id=${product.id}" class="btn btn-secondary" style="width: 100%; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center;">
            View Full Details
          </a>
        </div>
      </div>
    </div>
  `;
  
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  
  // Set focus on close button for accessibility
  modalClose.focus();
}

function closeQuickView() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

// 5. SVG Render Engine for Vector Assets
function getSvgMarkup(id, color, isLarge = false) {
  const size = isLarge ? "180" : "120";

  // ── Real image path if available ─────────────────────────────────────────
  if (productImages[id]) {
    const imgSize = isLarge ? "180px" : "120px";
    return `<img
      src="${productImages[id]}"
      alt="${id} product image"
      class="card-image product-real-img"
      width="${size}"
      height="${size}"
      loading="lazy"
      decoding="async"
      style="width:${imgSize};height:${imgSize};object-fit:contain;"
      onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
    /><span style="display:none">${getSvgFallback(id, color, isLarge)}</span>`;
  }

  return getSvgFallback(id, color, isLarge);
}

// ── SVG fallback illustrations (original code, renamed) ───────────────────
function getSvgFallback(id, color, isLarge = false) {
  const size = isLarge ? "180" : "120";
  let gradStart = "#4B5563";
  let gradEnd   = "#111827";

  if (color === "white")  { gradStart = "#FFFFFF"; gradEnd = "#E2E8F0"; }
  if (color === "navy")   { gradStart = "#3B82F6"; gradEnd = "#1E3A8A"; }
  if (color === "silver") { gradStart = "#F3F4F6"; gradEnd = "#9CA3AF"; }
  if (color === "blue")   { gradStart = "#60A5FA"; gradEnd = "#2563EB"; }
  if (color === "gray")   { gradStart = "#9CA3AF"; gradEnd = "#4B5563"; }

  const gradientId = `grad-${id}-${color}-${isLarge ? 'lg' : 'sm'}`;
  const caseGradientId = `case-${gradientId}`;

  // Earbuds
  if (id === "pulsepods-pro" || id === "pulsepods-lite") {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${id} illustration">
        <defs>
          <linearGradient id="${caseGradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#E2E8F0"/>
          </linearGradient>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${gradStart}"/>
            <stop offset="100%" stop-color="${gradEnd}"/>
          </linearGradient>
          <filter id="shadow-${gradientId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.08"/>
          </filter>
        </defs>
        <!-- Charging Case -->
        <rect x="25" y="35" width="70" height="60" rx="20" fill="url(#${caseGradientId})" stroke="#CBD5E1" stroke-width="2.5" filter="url(#shadow-${gradientId})" />
        <rect x="35" y="45" width="50" height="2" fill="#CBD5E1" />
        <circle cx="60" cy="70" r="4" fill="#10B981" />
        <path d="M45 20 C45 10, 55 10, 55 20 L55 35 L45 35 Z" fill="url(#${gradientId})" filter="url(#shadow-${gradientId})" />
        <path d="M75 20 C75 10, 65 10, 65 20 L65 35 L75 35 Z" fill="url(#${gradientId})" filter="url(#shadow-${gradientId})" />
      </svg>
    `;
  }
  // Headphones
  if (id === "pulsemax") {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PulseMax illustration">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${gradStart}"/>
            <stop offset="100%" stop-color="${gradEnd}"/>
          </linearGradient>
          <filter id="shadow-${gradientId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.08"/>
          </filter>
        </defs>
        <!-- Headband -->
        <path d="M25 65 C25 25, 95 25, 95 65" stroke="url(#${gradientId})" stroke-width="8" stroke-linecap="round" fill="none" filter="url(#shadow-${gradientId})"/>
        <!-- Ear Cups -->
        <rect x="15" y="55" width="16" height="30" rx="8" fill="url(#${gradientId})" filter="url(#shadow-${gradientId})" />
        <rect x="89" y="55" width="16" height="30" rx="8" fill="url(#${gradientId})" filter="url(#shadow-${gradientId})" />
        <!-- Joints -->
        <rect x="20" y="50" width="6" height="10" fill="#CBD5E1" />
        <rect x="94" y="50" width="6" height="10" fill="#CBD5E1" />
      </svg>
    `;
  }
  // Charging Pad
  if (id === "magcharge") {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MagCharge illustration">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${gradStart}"/>
            <stop offset="100%" stop-color="${gradEnd}"/>
          </linearGradient>
          <filter id="shadow-${gradientId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.08"/>
          </filter>
        </defs>
        <!-- Base Pad -->
        <circle cx="60" cy="60" r="45" fill="url(#${gradientId})" stroke="#CBD5E1" stroke-width="2" filter="url(#shadow-${gradientId})" />
        <!-- Inner ring -->
        <circle cx="60" cy="60" r="30" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-dasharray="4 3" />
        <!-- Charging Lightning Icon -->
        <path d="M60 45 L50 62 L58 62 L56 75 L68 56 L60 56 Z" fill="#2563EB" />
      </svg>
    `;
  }
  // Power Vault
  if (id === "powervault") {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PowerVault illustration">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${gradStart}"/>
            <stop offset="100%" stop-color="${gradEnd}"/>
          </linearGradient>
          <filter id="shadow-${gradientId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.08"/>
          </filter>
        </defs>
        <!-- Body -->
        <rect x="35" y="25" width="50" height="75" rx="10" fill="url(#${gradientId})" stroke="#475569" stroke-width="2.5" filter="url(#shadow-${gradientId})" />
        <!-- Screen/Indicator -->
        <rect x="45" y="35" width="30" height="12" rx="3" fill="#1e293b" />
        <circle cx="52" cy="41" r="2.5" fill="#10B981" />
        <circle cx="60" cy="41" r="2.5" fill="#10B981" />
        <circle cx="68" cy="41" r="2.5" fill="#10B981" />
        <!-- Ports -->
        <rect x="48" y="90" width="10" height="4" rx="1" fill="#E2E8F0" />
        <rect x="62" y="90" width="10" height="4" rx="1" fill="#CBD5E1" />
      </svg>
    `;
  }
  // Cable
  if (id === "flexcharge") {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FlexCharge illustration">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${gradStart}"/>
            <stop offset="100%" stop-color="${gradEnd}"/>
          </linearGradient>
          <filter id="shadow-${gradientId}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.08"/>
          </filter>
        </defs>
        <!-- Coiled Cable -->
        <path d="M30 65 C40 85, 80 85, 90 65 C100 45, 60 35, 50 50 C40 65, 80 85, 90 90" stroke="url(#${gradientId})" stroke-width="4.5" stroke-linecap="round" fill="none" filter="url(#shadow-${gradientId})" />
        <!-- Connector 1 -->
        <rect x="24" y="55" width="8" height="16" rx="2" fill="#94A3B8" transform="rotate(-15 24 55)"/>
        <!-- Connector 2 -->
        <rect x="85" y="85" width="8" height="16" rx="2" fill="#94A3B8" transform="rotate(30 85 85)"/>
      </svg>
    `;
  }
  return "";
}



// Update card color variant
function handleVariantChange(productId, color) {
  state.activeVariants[productId] = color;
  
  // Find card and replace the illustration
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (card) {
    // Update illustration
    const imgWrapper = card.querySelector(".card-image-wrapper");
    if (imgWrapper) {
      const illustration = imgWrapper.querySelector(".product-illustration");
      if (illustration) {
        illustration.innerHTML = getSvgMarkup(productId, color, false);
      }
    }
    
    // Update dots status
    const dots = card.querySelectorAll(".variant-dot");
    dots.forEach(dot => {
      if (dot.getAttribute("data-color") === color) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }
}

// 6. Comparison Engine
const compareDrawer = document.getElementById("compare-drawer");
const compareDrawerProducts = document.getElementById("compare-drawer-products");
const compareDrawerCount = document.getElementById("compare-count");
const btnClearCompare = document.getElementById("clear-compare-btn");
const btnViewCompare = document.getElementById("view-compare-btn");
const comparisonSection = document.getElementById("comparison-table-section");
const comparisonTableWrapper = document.getElementById("comparison-table-wrapper");

function updateComparisonUI() {
  const count = state.compareList.length;
  
  // Update all compare checkboxes on the page
  const checkboxes = document.querySelectorAll(".compare-checkbox");
  checkboxes.forEach(cb => {
    const pid = cb.getAttribute("data-product-id");
    cb.checked = state.compareList.includes(pid);
    
    // Disable unchecked boxes if limit reached
    if (count >= 3 && !state.compareList.includes(pid)) {
      cb.disabled = true;
    } else {
      cb.disabled = false;
    }
  });

  // Toggle drawer visibility
  if (count > 0) {
    compareDrawerCount.textContent = count;
    compareDrawer.classList.add("active");
    
    // Build drawer preview products
    compareDrawerProducts.innerHTML = state.compareList.map(pid => {
      const p = catalog.find(prod => prod.id === pid);
      const activeColor = state.activeVariants[pid];
      return `
        <div class="compare-drawer-item" data-id="${pid}">
          <div class="compare-drawer-item-img">
            ${getSvgMarkup(p.id, activeColor, false)}
          </div>
          <span class="compare-drawer-item-name">${p.name}</span>
          <button class="compare-drawer-item-remove" data-id="${pid}" aria-label="Remove ${p.name} from comparison">&times;</button>
        </div>
      `;
    }).join("");
  } else {
    compareDrawer.classList.remove("active");
  }

  renderComparisonTable();
}

function handleCompareCheckbox(productId, isChecked) {
  const index = state.compareList.indexOf(productId);
  if (isChecked && index === -1) {
    if (state.compareList.length >= 3) {
      showToast("You can compare up to 3 products at a time.", "error");
      return;
    }
    state.compareList.push(productId);
    showToast(`Added ${catalog.find(p => p.id === productId).name} to comparison`);
  } else if (!isChecked && index !== -1) {
    state.compareList.splice(index, 1);
  }
  updateComparisonUI();
}

function renderComparisonTable() {
  if (!comparisonTableWrapper) return;

  const count = state.compareList.length;
  if (count === 0) {
    comparisonTableWrapper.innerHTML = `
      <div class="compare-placeholder-cell">
        <p>Select up to 3 products using the checkboxes above to compare their specifications side-by-side.</p>
      </div>
    `;
    return;
  }

  const productsToCompare = state.compareList.map(pid => catalog.find(p => p.id === pid));
  
  // Headers row
  let headerHtml = `<tr><th>Specification</th>`;
  productsToCompare.forEach(p => {
    const activeColor = state.activeVariants[p.id];
    headerHtml += `
      <td>
        <div class="compare-table-header-prod">
          <div class="compare-table-img">
            ${getSvgMarkup(p.id, activeColor, false)}
          </div>
          <span class="compare-table-name">${p.name}</span>
          <span class="compare-table-price">$${p.price}</span>
        </div>
      </td>
    `;
  });
  // fill remaining columns if less than 3
  for (let i = count; i < 3; i++) {
    headerHtml += `<td><div class="compare-placeholder-cell">Empty Slot</div></td>`;
  }
  headerHtml += `</tr>`;

  // Specs rows
  const specRows = [
    { label: "Battery Life", key: "battery" },
    { label: "Charging", key: "charging" },
    { label: "Connectivity", key: "connectivity" },
    { label: "Weight", key: "weight" },
    { label: "Compatibility", key: "compatibility" }
  ];

  let bodyHtml = "";
  specRows.forEach(row => {
    bodyHtml += `<tr><th>${row.label}</th>`;
    productsToCompare.forEach(p => {
      bodyHtml += `<td>${p.details[row.key]}</td>`;
    });
    for (let i = count; i < 3; i++) {
      bodyHtml += `<td>-</td>`;
    }
    bodyHtml += `</tr>`;
  });

  comparisonTableWrapper.innerHTML = `
    <table class="compare-table">
      <thead>${headerHtml}</thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  `;
}

// --- PRODUCT LISTING CONTROLLERS (shop.html) ---

function renderProductCard(p) {
  const activeColor = state.activeVariants[p.id] || p.variants[0];
  const isWishlisted = state.wishlist.has(p.id) ? "active" : "";
  const isCompareChecked = state.compareList.includes(p.id) ? "checked" : "";
  
  let badgeHtml = "";
  if (p.badge === "bestseller") {
    badgeHtml = `<span class="product-badge badge-bestseller">Best Seller</span>`;
  } else if (p.badge === "new") {
    badgeHtml = `<span class="product-badge badge-new">New</span>`;
  } else if (p.badge === "promo") {
    badgeHtml = `<span class="product-badge badge-promo">Special Offer</span>`;
  }

  return `
    <article class="product-card ${state.compareList.includes(p.id) ? 'compare-active' : ''}" data-id="${p.id}">
      ${badgeHtml}
      <button class="card-wishlist-btn ${isWishlisted}" data-product-id="${p.id}" aria-label="Add ${p.name} to wishlist">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>
      </button>
      
      <div class="card-image-wrapper">
        <div class="product-illustration">
          ${getSvgMarkup(p.id, activeColor, false)}
        </div>
        <button class="card-quickview-btn" data-product-id="${p.id}">Quick View</button>
      </div>

      <div class="card-content">
        <div class="card-meta">
          <span class="card-category">${p.category}</span>
          <h3 class="card-title">${p.name}</h3>
          <span class="card-price">$${p.price}</span>
        </div>
        
        <div class="card-specs">
          ${p.specs.map(spec => `<span class="card-spec-item">${spec}</span>`).join('')}
        </div>

        <div class="card-variants">
          ${p.variants.map(v => `
            <button class="variant-dot ${v === activeColor ? 'active' : ''}" data-color="${v}" data-product-id="${p.id}" aria-label="Select ${v} color variant"></button>
          `).join('')}
        </div>

        <div class="card-actions" style="display: flex; flex-direction: column; gap: var(--space-8); margin-top: var(--space-12);">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <label class="compare-checkbox-label">
              <input type="checkbox" class="compare-checkbox" data-product-id="${p.id}" ${isCompareChecked}>
              Compare
            </label>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); width: 100%;">
            <a href="product.html?id=${p.id}" class="btn btn-secondary btn-view-product" data-product-id="${p.id}" style="height: 40px; min-width: unset; font-size: 13px; padding: 0 var(--space-8); display: flex; align-items: center; justify-content: center; text-decoration: none;">
              Details
            </a>
            <button class="btn btn-primary btn-add-to-cart-card" data-product-id="${p.id}" style="height: 40px; min-width: unset; font-size: 13px; padding: 0 var(--space-8); display: flex; align-items: center; justify-content: center; gap: var(--space-4);">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 22a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2zm3-4H5.75L3 2H1m4 4h16l-2 9H6.25"></path></svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>

  `;
}

function renderShopGrid() {
  const productsGrid = document.getElementById("shop-products-grid");
  const resultsCount = document.getElementById("shop-results-count");
  const emptyState = document.getElementById("shop-empty-state");
  const paginationContainer = document.getElementById("shop-pagination-container");

  if (!productsGrid) return; // Not on shop.html

  // 1. Filter Catalog
  let filtered = catalog.filter(p => {
    // Category filter
    if (state.filters.categories.length > 0 && !state.filters.categories.includes(p.category)) {
      return false;
    }
    // Price filter
    if (p.price > state.filters.priceMax) {
      return false;
    }
    // Color filter (check if product supports at least one selected color variant)
    if (state.filters.colors.length > 0) {
      const hasColor = p.variants.some(c => state.filters.colors.includes(c));
      if (!hasColor) return false;
    }
    // Feature filter
    if (state.filters.features.length > 0) {
      const pSpecsLower = p.specs.map(s => s.toLowerCase());
      const hasAllFeatures = state.filters.features.every(f => {
        if (f === "noise cancellation") return pSpecsLower.some(s => s.includes("noise cancellation") || s.includes("anc"));
        if (f === "wireless charging") return pSpecsLower.some(s => s.includes("wireless charging"));
        if (f === "fast charge") return pSpecsLower.some(s => s.includes("fast") || s.includes("pd") || s.includes("usb-c"));
        return false;
      });
      if (!hasAllFeatures) return false;
    }
    return true;
  });

  // 2. Sort Catalog
  if (state.sortBy === "price-low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === "price-high-low") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === "newest") {
    filtered.sort((a, b) => {
      if (a.badge === "new" && b.badge !== "new") return -1;
      if (b.badge === "new" && a.badge !== "new") return 1;
      return 0;
    });
  } // 'featured' keeps original catalog ordering

  const totalFilteredCount = filtered.length;

  // 3. Paginate
  const totalPages = Math.ceil(totalFilteredCount / state.pageSize);
  // Bounds check currentPage
  if (state.currentPage > totalPages) {
    state.currentPage = Math.max(1, totalPages);
  }
  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = Math.min(startIndex + state.pageSize, totalFilteredCount);
  const sliced = filtered.slice(startIndex, endIndex);

  // 4. Update UI Elements
  if (totalFilteredCount === 0) {
    productsGrid.style.display = "none";
    paginationContainer.style.display = "none";
    emptyState.style.display = "block";
    resultsCount.textContent = "Showing 0 of 0 products";
  } else {
    productsGrid.style.display = "grid";
    paginationContainer.style.display = "flex";
    emptyState.style.display = "none";
    resultsCount.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalFilteredCount} products`;
    productsGrid.innerHTML = sliced.map(p => renderProductCard(p)).join("");
  }

  // 5. Render Pagination controls
  if (totalFilteredCount > 0 && totalPages > 1) {
    let paginationHtml = `
      <button class="pagination-btn" id="pagination-prev-btn" ${state.currentPage === 1 ? "disabled" : ""} aria-label="Previous Page">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
    `;
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <button class="pagination-btn ${state.currentPage === i ? "active" : ""}" data-page="${i}" aria-label="Page ${i}">${i}</button>
      `;
    }
    paginationHtml += `
      <button class="pagination-btn" id="pagination-next-btn" ${state.currentPage === totalPages ? "disabled" : ""} aria-label="Next Page">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `;
    paginationContainer.innerHTML = paginationHtml;
  } else {
    paginationContainer.innerHTML = "";
  }
}

// --- LANDING PAGE FEATURED PRODUCTS RENDERER ---
function renderFeaturedGrid() {
  const grid = document.getElementById("featured-products-grid");
  if (!grid) return; // only runs on index.html
  grid.innerHTML = catalog.map(p => renderProductCard(p)).join("");
}

// --- HERO PRODUCT SLIDER ---
function initHeroSlider() {
  const slider  = document.getElementById("hero-slider");
  if (!slider) return; // only runs on index.html

  const track   = document.getElementById("hero-slider-track");
  const prevBtn = document.getElementById("hero-slider-prev");
  const nextBtn = document.getElementById("hero-slider-next");
  const dotsEl  = document.getElementById("hero-slider-dots");
  const slides  = Array.from(track.querySelectorAll(".hero-slide"));
  const dots    = Array.from(dotsEl.querySelectorAll(".hero-dot"));
  const TOTAL   = slides.length;
  const DELAY   = 4000;  // autoplay interval ms

  let current    = 0;
  let autoTimer  = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragDeltaX = 0;

  // ── Core go-to function ──────────────────────────────────────────
  function goTo(index, wrap = true) {
    if (wrap) {
      index = ((index % TOTAL) + TOTAL) % TOTAL;
    } else {
      if (index < 0 || index >= TOTAL) return;
    }
    current = index;

    // Slide the track
    track.style.transform = `translateX(-${current * 100}%)`;

    // Sync dots
    dots.forEach((d, i) => {
      const isActive = i === current;
      d.classList.toggle("active", isActive);
      d.setAttribute("aria-selected", String(isActive));
    });

    // Update tabindex on slide links (only active slide is tabbable)
    slides.forEach((slide, i) => {
      const link = slide.querySelector(".hero-slide-link");
      if (link) link.setAttribute("tabindex", i === current ? "0" : "-1");
    });

    // ARIA live announcement
    slider.setAttribute("aria-label", `Featured Products – slide ${current + 1} of ${TOTAL}`);
  }

  // ── Autoplay ─────────────────────────────────────────────────────
  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => goTo(current + 1), DELAY);
  }
  function stopAutoplay() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Pause on hover / resume on leave
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  // Pause while focused inside for keyboard users
  slider.addEventListener("focusin",  stopAutoplay);
  slider.addEventListener("focusout", (e) => {
    if (!slider.contains(e.relatedTarget)) startAutoplay();
  });

  // ── Arrow buttons ────────────────────────────────────────────────
  prevBtn.addEventListener("click", () => { goTo(current - 1); startAutoplay(); });
  nextBtn.addEventListener("click", () => { goTo(current + 1); startAutoplay(); });

  // ── Dot clicks ───────────────────────────────────────────────────
  dotsEl.addEventListener("click", (e) => {
    const dot = e.target.closest(".hero-dot");
    if (!dot) return;
    goTo(parseInt(dot.dataset.slide, 10));
    startAutoplay();
  });

  // ── Keyboard navigation ──────────────────────────────────────────
  slider.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":  e.preventDefault(); goTo(current - 1); startAutoplay(); break;
      case "ArrowRight": e.preventDefault(); goTo(current + 1); startAutoplay(); break;
      case "Home":       e.preventDefault(); goTo(0);           startAutoplay(); break;
      case "End":        e.preventDefault(); goTo(TOTAL - 1);   startAutoplay(); break;
    }
  });

  // ── Touch / Mouse swipe drag ─────────────────────────────────────
  function onDragStart(clientX) {
    isDragging = true;
    dragStartX = clientX;
    dragDeltaX = 0;
    track.style.transition = "none"; // disable CSS transition while dragging
    stopAutoplay();
  }
  function onDragMove(clientX) {
    if (!isDragging) return;
    dragDeltaX = clientX - dragStartX;
    // Follow finger/mouse in real time
    const baseOffset = current * 100; // in percent of track width
    const pixelWidth = slider.offsetWidth;
    const percentDelta = (dragDeltaX / pixelWidth) * 100;
    track.style.transform = `translateX(calc(-${baseOffset}% + ${percentDelta}px))`;
  }
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = ""; // restore CSS transition
    const threshold = slider.offsetWidth * 0.2; // 20% of width to commit
    if (dragDeltaX < -threshold) {
      goTo(current + 1);
    } else if (dragDeltaX > threshold) {
      goTo(current - 1);
    } else {
      goTo(current); // snap back
    }
    startAutoplay();
  }

  // Touch events
  slider.addEventListener("touchstart", (e) => onDragStart(e.touches[0].clientX), { passive: true });
  slider.addEventListener("touchmove",  (e) => onDragMove(e.touches[0].clientX),  { passive: true });
  slider.addEventListener("touchend",   onDragEnd);

  // Mouse drag events
  slider.addEventListener("mousedown",  (e) => { e.preventDefault(); onDragStart(e.clientX); });
  window.addEventListener("mousemove",  (e) => { if (isDragging) onDragMove(e.clientX); });
  window.addEventListener("mouseup",    () => { if (isDragging) onDragEnd(); });

  // ── Initialise ───────────────────────────────────────────────────
  goTo(0);        // set initial state
  startAutoplay();
}

// --- PRODUCT DETAIL PAGE CONTROLLER ---
function initPDP() {
  if (!document.getElementById("pdp-main")) return; // only runs on product.html

  // Read product id from URL query param; fall back to pulsepods-pro for direct access
  const urlParams = new URLSearchParams(window.location.search);
  const pdpId = urlParams.get("id") || "pulsepods-pro";
  const pdpProduct = catalog.find(p => p.id === pdpId) || catalog.find(p => p.id === "pulsepods-pro");
  if (!pdpProduct) return;

  // Update page title & meta dynamically
  document.title = `${pdpProduct.name} – PulseNest`;
  const nameEl = document.getElementById("pdp-product-name");
  if (nameEl) nameEl.textContent = pdpProduct.name;
  const priceEl = document.getElementById("pdp-price");
  if (priceEl) priceEl.textContent = `$${pdpProduct.price}`;

  // Colour name map
  const colorNames = {
    black: "Midnight Black",
    white: "Pearl White",
    navy: "Deep Navy",
    silver: "Brushed Silver",
    blue: "Ocean Blue",
    gray: "Storm Gray"
  };

  // Colour hex map for swatch backgrounds
  const colorHex = {
    black: "#1F2937",
    white: "#F9FAFB",
    navy: "#1E3A5F",
    silver: "#C0C0C0",
    blue: "#3B82F6",
    gray: "#9CA3AF"
  };

  let pdpQty = 1;
  let pdpActiveColor = pdpProduct.variants[0];
  let pdpActiveThumb = 0; // index of current thumbnail

  // Thumbnail "angles" – we simulate 3 views using the same SVG with slight variation
  const thumbLabels = ["Front View", "Side View", "Case View"];

  function renderPDPGallery() {
    const mainIllus = document.getElementById("pdp-main-illustration");
    const thumbsContainer = document.getElementById("pdp-thumbnails");
    if (!mainIllus || !thumbsContainer) return;

    // Main large SVG
    mainIllus.innerHTML = getSvgMarkup(pdpProduct.id, pdpActiveColor, true);

    // Three thumbnail buttons
    thumbsContainer.innerHTML = thumbLabels.map((label, i) => `
      <button class="pdp-thumb ${pdpActiveThumb === i ? "active" : ""}" 
              data-thumb="${i}" 
              aria-label="${label}"
              aria-pressed="${pdpActiveThumb === i}">
        ${getSvgMarkup(pdpProduct.id, pdpActiveColor, false)}
      </button>
    `).join("");
  }

  function renderPDPColorSelector() {
    const container = document.getElementById("pdp-color-selector");
    const label = document.getElementById("pdp-selected-color-label");
    if (!container || !label) return;

    label.textContent = colorNames[pdpActiveColor] || pdpActiveColor;

    container.innerHTML = pdpProduct.variants.map(v => `
      <button class="pdp-color-swatch ${v === pdpActiveColor ? "active" : ""}"
              data-color="${v}"
              style="background: ${colorHex[v] || "#ccc"}; ${v === "white" ? "border: 1px solid #D1D5DB;" : ""}"
              aria-label="Select ${colorNames[v] || v}"
              aria-pressed="${v === pdpActiveColor}">
      </button>
    `).join("");
  }

  function renderSpecPills() {
    const container = document.getElementById("pdp-spec-pills");
    if (!container) return;
    container.innerHTML = pdpProduct.specs.map(s =>
      `<span class="pdp-spec-pill">${s}</span>`
    ).join("");
  }

  function renderRelatedProducts() {
    const grid = document.getElementById("pdp-related-grid");
    if (!grid) return;
    const related = catalog.filter(p => p.id !== pdpProduct.id).slice(0, 3);
    grid.innerHTML = related.map(p => renderProductCard(p)).join("");
  }

  // Calculate delivery estimate (3 business days from today)
  function getDeliveryEstimate() {
    const now = new Date();
    let biz = 0, d = new Date(now);
    while (biz < 3) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) biz++;
    }
    return `Estimated by ${d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
  }

  // Initial render
  renderPDPGallery();
  renderPDPColorSelector();
  renderSpecPills();
  renderRelatedProducts();
  const deliveryEl = document.getElementById("pdp-delivery-estimate");
  if (deliveryEl) deliveryEl.textContent = getDeliveryEstimate();

  // -- Gallery thumbnail click --
  document.getElementById("pdp-thumbnails")?.addEventListener("click", e => {
    const btn = e.target.closest(".pdp-thumb");
    if (!btn) return;
    pdpActiveThumb = parseInt(btn.dataset.thumb);
    renderPDPGallery();
  });

  // -- Colour swatch click --
  document.getElementById("pdp-color-selector")?.addEventListener("click", e => {
    const swatch = e.target.closest(".pdp-color-swatch");
    if (!swatch) return;
    pdpActiveColor = swatch.dataset.color;
    state.activeVariants[pdpProduct.id] = pdpActiveColor;
    renderPDPGallery();
    renderPDPColorSelector();
  });

  // -- Size buttons --
  document.querySelectorAll(".pdp-size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pdp-size-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    });
  });

  // -- Quantity stepper --
  document.getElementById("pdp-qty-up")?.addEventListener("click", () => {
    if (pdpQty < 10) {
      pdpQty++;
      document.getElementById("pdp-qty-value").textContent = pdpQty;
    }
  });
  document.getElementById("pdp-qty-down")?.addEventListener("click", () => {
    if (pdpQty > 1) {
      pdpQty--;
      document.getElementById("pdp-qty-value").textContent = pdpQty;
    }
  });

  // -- Tab switching --
  document.querySelectorAll(".pdp-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pdp-tab-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".pdp-tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add("active");
    });
  });

  // -- Accordion toggling (specs & FAQ) --
  document.querySelectorAll(".pdp-accordion-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      const bodyId = trigger.getAttribute("aria-controls");
      const body = document.getElementById(bodyId);
      if (!body) return;

      if (expanded) {
        trigger.setAttribute("aria-expanded", "false");
        body.style.maxHeight = "0";
        body.style.overflow = "hidden";
      } else {
        trigger.setAttribute("aria-expanded", "true");
        body.style.maxHeight = body.scrollHeight + 100 + "px";
        body.style.overflow = "visible";
      }
    });
  });

  // -- Zoom overlay --
  const zoomBtn = document.getElementById("pdp-zoom-btn");
  const zoomOverlay = document.getElementById("pdp-zoom-overlay");
  const zoomClose = document.getElementById("pdp-zoom-close");
  const zoomIllus = document.getElementById("pdp-zoom-illustration");

  if (zoomBtn && zoomOverlay && zoomIllus) {
    zoomBtn.addEventListener("click", () => {
      zoomIllus.innerHTML = getSvgMarkup(pdpProduct.id, pdpActiveColor, true);
      // Make the zoomed SVG even bigger
      const zoomedSvg = zoomIllus.querySelector("svg");
      if (zoomedSvg) {
        zoomedSvg.setAttribute("width", "360");
        zoomedSvg.setAttribute("height", "360");
      }
      zoomOverlay.classList.add("active");
      zoomOverlay.setAttribute("aria-hidden", "false");
    });
  }

  if (zoomClose && zoomOverlay) {
    zoomClose.addEventListener("click", () => {
      zoomOverlay.classList.remove("active");
      zoomOverlay.setAttribute("aria-hidden", "true");
    });
    zoomOverlay.addEventListener("click", e => {
      if (e.target === zoomOverlay) {
        zoomOverlay.classList.remove("active");
        zoomOverlay.setAttribute("aria-hidden", "true");
      }
    });
  }

  // -- Add to Cart (PDP buttons) --
  document.querySelectorAll(".pdp-add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      for (let i = 0; i < pdpQty; i++) {
        state.cart.push({ id: pdpProduct.id, color: pdpActiveColor, qty: 1 });
      }
      saveCartState();
      updateGlobalCartBadges();
      showToast(`Added ${pdpQty}× ${pdpProduct.name} (${colorNames[pdpActiveColor] || pdpActiveColor}) to cart!`, "success");
    });
  });

  // -- Wishlist (PDP) --
  const pdpWishlistBtn = document.getElementById("pdp-wishlist-btn");
  if (pdpWishlistBtn) {
    pdpWishlistBtn.addEventListener("click", () => {
      const pid = pdpProduct.id;
      if (state.wishlist.has(pid)) {
        state.wishlist.delete(pid);
        pdpWishlistBtn.style.color = "";
        showToast("Removed from wishlist");
      } else {
        state.wishlist.add(pid);
        pdpWishlistBtn.style.color = "var(--color-primary)";
        showToast("Added to your wishlist", "success");
      }
    });
  }

  // -- Sticky CTA scroll spy (mobile only) --
  const stickyCTA = document.getElementById("pdp-sticky-cta");
  const mainCTA = document.getElementById("pdp-add-to-cart-btn");
  if (stickyCTA && mainCTA) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          stickyCTA.classList.add("visible");
        } else {
          stickyCTA.classList.remove("visible");
        }
      });
    }, { threshold: 0.1 });
    observer.observe(mainCTA);
  }
}

// --- CART PAGE CONTROLLER ---
function initCart() {
  if (!document.getElementById("cart-main")) return; // only runs on cart.html

  // Valid promo codes: code → { label, pct }
  const PROMOS = {
    "PULSE10":   { label: "PULSE10 – 10% off",  pct: 0.10 },
    "WELCOME15": { label: "WELCOME15 – 15% off", pct: 0.15 },
    "AUDIO20":   { label: "AUDIO20 – 20% off",   pct: 0.20 },
  };

  const colorNames = {
    black: "Midnight Black", white: "Pearl White", navy: "Deep Navy",
    silver: "Brushed Silver", blue: "Ocean Blue",  gray: "Storm Gray"
  };
  const colorHex = {
    black: "#1F2937", white: "#F9FAFB", navy: "#1E3A5F",
    silver: "#C0C0C0", blue: "#3B82F6", gray: "#9CA3AF"
  };

  // Seed demo cart if empty (so cart.html always has content to demonstrate)
  if (state.cart.length === 0) {
    state.cart = [
      { uid: "uid-1", id: "pulsepods-pro",       color: "black",  qty: 1 },
      { uid: "uid-2", id: "pulsemax",            color: "silver", qty: 2 },
      { uid: "uid-3", id: "magcharge",           color: "white",  qty: 1 },
    ];
  }
  // Ensure every item has a uid (for keying rows)
  state.cart = state.cart.map((item, i) => ({
    uid: item.uid || `uid-${Date.now()}-${i}`,
    id:    item.id,
    color: item.color || "black",
    qty:   item.qty   || 1,
  }));

  let activePromo      = null; // { label, pct }
  let editingItemUid   = null; // uid of item being variant-edited

  /* ── helpers ─────────────────────────────────────────────────── */

  function getProduct(id) { return catalog.find(p => p.id === id); }

  function calcSubtotal() {
    return state.cart.reduce((sum, item) => {
      const p = getProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  function calcDiscount(subtotal) {
    return activePromo ? Math.round(subtotal * activePromo.pct * 100) / 100 : 0;
  }

  function calcShipping(subtotal, discount) {
    return (subtotal - discount) >= 75 ? 0 : 7.99;
  }

  function getDeliveryDate() {
    let biz = 0;
    let d = new Date();
    while (biz < 3) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) biz++;
    }
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  }

  /* ── render helpers ───────────────────────────────────────────── */

  function updateCartBadges() {
    const total = state.cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll(".cart-badge").forEach(b => b.textContent = total);
    // item count label
    const countLabel = document.getElementById("cart-item-count-label");
    if (countLabel) countLabel.textContent = `(${state.cart.length} item${state.cart.length !== 1 ? "s" : ""})`;
  }

  function renderSummary() {
    const subtotal = calcSubtotal();
    const discount = calcDiscount(subtotal);
    const shipping  = calcShipping(subtotal, discount);
    const total     = subtotal - discount + shipping;

    // Breakdown
    const bdEl = document.getElementById("cart-summary-breakdown");
    if (bdEl) {
      let rows = `
        <div class="cart-breakdown-row">
          <span>Subtotal (${state.cart.reduce((s, i) => s + i.qty, 0)} items)</span>
          <strong>$${subtotal.toFixed(2)}</strong>
        </div>`;
      if (activePromo) {
        rows += `
        <div class="cart-breakdown-row discount">
          <span>Discount (${activePromo.label})</span>
          <span>−$${discount.toFixed(2)}</span>
        </div>`;
      }
      if (shipping === 0) {
        rows += `<div class="cart-breakdown-row free-ship"><span>Shipping</span><span>Free 🎉</span></div>`;
      } else {
        rows += `<div class="cart-breakdown-row"><span>Shipping</span><strong>$${shipping.toFixed(2)}</strong></div>`;
      }
      bdEl.innerHTML = rows;
    }

    // Shipping estimate
    const shipEl = document.getElementById("cart-shipping-estimate");
    if (shipEl) {
      if (shipping === 0) {
        shipEl.innerHTML = `<strong>🚚 Free Express Shipping</strong>Estimated delivery by <b>${getDeliveryDate()}</b>. You qualify for free shipping!`;
      } else {
        const gap = (75 - (subtotal - discount)).toFixed(2);
        shipEl.innerHTML = `<strong>📦 Standard Shipping – $${shipping.toFixed(2)}</strong>Add <b>$${gap}</b> more to unlock free shipping. Estimated delivery by <b>${getDeliveryDate()}</b>.`;
      }
    }

    // Total
    const totalEl = document.getElementById("cart-summary-total");
    if (totalEl) {
      totalEl.innerHTML = `
        <span class="cart-total-label">Total (incl. taxes)</span>
        <span class="cart-total-value">$${total.toFixed(2)}</span>`;
    }
  }

  function renderCartItem(item) {
    const p = getProduct(item.id);
    if (!p) return "";
    const hex  = colorHex[item.color] || "#ccc";
    const name = colorNames[item.color] || item.color;
    const linePrice = (p.price * item.qty).toFixed(2);

    return `
    <article class="cart-item-row" data-uid="${item.uid}" role="listitem" aria-label="${p.name}">
      <div class="cart-item-image">
        ${getSvgMarkup(p.id, item.color, false)}
      </div>
      <div class="cart-item-details">
        <div class="cart-item-meta">
          <span class="cart-item-category">${p.category}</span>
          <h3 class="cart-item-name">${p.name}</h3>
          <div style="display: flex; align-items: center; gap: var(--space-8); flex-wrap: wrap;">
            <span class="cart-item-variant-badge">
              <span class="cart-item-variant-dot" style="background:${hex};${item.color==="white"?"border-color:#D1D5DB;":""}"></span>
              ${name}
            </span>
            <button class="cart-item-edit-btn" data-uid="${item.uid}" aria-label="Edit colour for ${p.name}">
              Edit variant
            </button>
          </div>
        </div>
        <div class="cart-item-bottom">
          <div class="cart-item-qty-stepper">
            <button class="cart-qty-btn cart-qty-down" data-uid="${item.uid}" aria-label="Decrease quantity" ${item.qty <= 1 ? "disabled" : ""}>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span class="cart-qty-val" id="qty-val-${item.uid}">${item.qty}</span>
            <button class="cart-qty-btn cart-qty-up" data-uid="${item.uid}" aria-label="Increase quantity" ${item.qty >= 10 ? "disabled" : ""}>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div class="cart-item-price-col">
            <span class="cart-item-line-price" id="line-price-${item.uid}">$${linePrice}</span>
            ${item.qty > 1 ? `<span class="cart-item-unit-price">$${p.price} each</span>` : ""}
          </div>
          <button class="cart-item-remove" data-uid="${item.uid}" aria-label="Remove ${p.name} from cart">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
            Remove
          </button>
        </div>
      </div>
    </article>`;
  }

  function renderAllItems() {
    const list = document.getElementById("cart-items-list");
    const empty = document.getElementById("cart-empty-state");
    const wrapper = document.getElementById("cart-content-wrapper");

    if (state.cart.length === 0) {
      if (list)    list.innerHTML = "";
      if (empty)   empty.style.display = "flex";
      if (wrapper) wrapper.style.display = "none";
      // disable checkout CTA
      const cta = document.getElementById("cart-checkout-cta");
      if (cta) { cta.style.pointerEvents = "none"; cta.style.opacity = "0.5"; }
    } else {
      if (empty)   empty.style.display = "none";
      if (wrapper) wrapper.style.display = "grid";
      if (list)    list.innerHTML = state.cart.map(renderCartItem).join("");
      const cta = document.getElementById("cart-checkout-cta");
      if (cta) { cta.style.pointerEvents = ""; cta.style.opacity = ""; }
    }
    updateCartBadges();
    renderSummary();
  }

  /* ── event delegation on cart list ───────────────────────────── */

  document.getElementById("cart-items-list")?.addEventListener("click", e => {
    // Qty down
    const downBtn = e.target.closest(".cart-qty-down");
    if (downBtn) {
      const uid = downBtn.dataset.uid;
      const item = state.cart.find(i => i.uid === uid);
      if (item && item.qty > 1) {
        item.qty--;
        saveCartState();
        renderAllItems();
        renderSummary();
      }
      return;
    }

    // Qty up
    const upBtn = e.target.closest(".cart-qty-up");
    if (upBtn) {
      const uid = upBtn.dataset.uid;
      const item = state.cart.find(i => i.uid === uid);
      if (item && item.qty < 10) {
        item.qty++;
        saveCartState();
        renderAllItems();
        renderSummary();
      }
      return;
    }

    // Remove
    const removeBtn = e.target.closest(".cart-item-remove");
    if (removeBtn) {
      const uid = removeBtn.dataset.uid;
      const row = document.querySelector(`.cart-item-row[data-uid="${uid}"]`);
      if (row) row.classList.add("removing");
      setTimeout(() => {
        state.cart = state.cart.filter(i => i.uid !== uid);
        saveCartState();
        renderAllItems();
        showToast("Item removed from cart");
      }, 240);
      return;
    }

    // Edit variant
    const editBtn = e.target.closest(".cart-item-edit-btn");
    if (editBtn) {
      const uid = editBtn.dataset.uid;
      openVariantDrawer(uid);
      return;
    }
  });

  /* ── variant edit drawer ──────────────────────────────────────── */

  let pendingColor = null;

  function openVariantDrawer(uid) {
    editingItemUid = uid;
    const item = state.cart.find(i => i.uid === uid);
    if (!item) return;
    const p = getProduct(item.id);
    pendingColor = item.color;

    const body = document.getElementById("cart-variant-drawer-body");
    if (body) {
      body.innerHTML = `
        <div style="padding: var(--space-24) var(--space-24) 0;">
          <p style="font-size: 14px; color: var(--color-text-secondary); margin: 0 0 var(--space-8);">
            Editing: <strong style="color: var(--color-text-primary);">${p.name}</strong>
          </p>
          <p style="font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin: 0 0 var(--space-4);">
            Colour: <span id="drawer-color-label">${colorNames[item.color] || item.color}</span>
          </p>
          <div class="cart-variant-swatch-group" id="drawer-swatches">
            ${p.variants.map(v => `
              <button class="cart-edit-swatch ${v === item.color ? "active" : ""}"
                      data-color="${v}"
                      style="background: ${colorHex[v] || "#ccc"}; ${v === "white" ? "border: 1px solid #D1D5DB;" : ""}"
                      aria-label="Select ${colorNames[v] || v}"
                      aria-pressed="${v === item.color}">
              </button>
            `).join("")}
          </div>
        </div>`;

      // Swatch clicks inside drawer
      body.querySelector("#drawer-swatches")?.addEventListener("click", e2 => {
        const sw = e2.target.closest(".cart-edit-swatch");
        if (!sw) return;
        pendingColor = sw.dataset.color;
        body.querySelectorAll(".cart-edit-swatch").forEach(s => {
          s.classList.toggle("active", s.dataset.color === pendingColor);
          s.setAttribute("aria-pressed", s.dataset.color === pendingColor);
        });
        const lbl = body.querySelector("#drawer-color-label");
        if (lbl) lbl.textContent = colorNames[pendingColor] || pendingColor;
      });
    }

    const overlay = document.getElementById("cart-variant-overlay");
    const drawer  = document.getElementById("cart-variant-drawer");
    if (overlay) overlay.classList.add("active");
    if (drawer)  drawer.classList.add("active");
  }

  function closeVariantDrawer() {
    document.getElementById("cart-variant-overlay")?.classList.remove("active");
    document.getElementById("cart-variant-drawer")?.classList.remove("active");
    editingItemUid = null;
    pendingColor   = null;
  }

  document.getElementById("cart-variant-close-btn")?.addEventListener("click", closeVariantDrawer);
  document.getElementById("cart-variant-cancel-btn")?.addEventListener("click", closeVariantDrawer);
  document.getElementById("cart-variant-overlay")?.addEventListener("click", closeVariantDrawer);

  document.getElementById("cart-variant-save-btn")?.addEventListener("click", () => {
    if (!editingItemUid || !pendingColor) { closeVariantDrawer(); return; }
    const item = state.cart.find(i => i.uid === editingItemUid);
    if (item) {
      item.color = pendingColor;
      saveCartState();
      renderAllItems();
      showToast(`Variant updated to ${colorNames[pendingColor]}`, "success");
    }
    closeVariantDrawer();
  });

  /* ── promo code ───────────────────────────────────────────────── */

  document.getElementById("apply-promo-btn")?.addEventListener("click", () => {
    const input    = document.getElementById("promo-code-input");
    const feedback = document.getElementById("promo-feedback");
    if (!input || !feedback) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      feedback.textContent = "Please enter a promo code.";
      feedback.className = "cart-promo-feedback error";
      return;
    }

    if (PROMOS[code]) {
      activePromo = PROMOS[code];
      feedback.textContent = `✓ ${PROMOS[code].label} applied!`;
      feedback.className = "cart-promo-feedback success";
      renderSummary();
      showToast(`Promo code ${code} applied!`, "success");
    } else {
      activePromo = null;
      feedback.textContent = "Invalid promo code. Try PULSE10, WELCOME15, or AUDIO20.";
      feedback.className = "cart-promo-feedback error";
      renderSummary();
    }
  });

  // Allow Enter key in promo field
  document.getElementById("promo-code-input")?.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("apply-promo-btn")?.click();
  });

  /* ── initial render ───────────────────────────────────────────── */
  renderAllItems();
}

// --- CHECKOUT PAGE CONTROLLER ---
function initCheckout() {
  if (!document.getElementById("checkout-main")) return;

  const colorNames = {
    black: "Midnight Black", white: "Pearl White", navy: "Deep Navy",
    silver: "Brushed Silver", blue: "Ocean Blue", gray: "Storm Gray"
  };

  const SHIPPING_COSTS = { standard: 7.99, express: 14.99, overnight: 29.99 };
  let selectedShipping = "standard";

  // -- Seed demo cart if empty --
  if (state.cart.length === 0) {
    state.cart = [
      { uid: "uid-1", id: "pulsepods-pro",      color: "black",  qty: 1 },
      { uid: "uid-2", id: "pulsemax",           color: "silver", qty: 2 },
      { uid: "uid-3", id: "magcharge",          color: "white",  qty: 1 },
    ];
  }

  // -- Helpers --
  function getProduct(id) { return catalog.find(p => p.id === id); }

  function calcSubtotal() {
    return state.cart.reduce((sum, item) => {
      const p = getProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  function getDeliveryDate(days) {
    let biz = 0, d = new Date();
    while (biz < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) biz++;
    }
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  // -- Render summary sidebar --
  function renderCheckoutSummary() {
    // Items
    const itemsEl = document.getElementById("checkout-items-list");
    if (itemsEl) {
      itemsEl.innerHTML = state.cart.map(item => {
        const p = getProduct(item.id);
        if (!p) return "";
        return `
        <div class="checkout-item-row">
          <div class="checkout-item-thumb">
            ${getSvgMarkup(p.id, item.color, false)}
            <span class="checkout-item-qty-badge">${item.qty}</span>
          </div>
          <div class="checkout-item-info">
            <p class="checkout-item-name">${p.name}</p>
            <span class="checkout-item-variant">${colorNames[item.color] || item.color}</span>
          </div>
          <span class="checkout-item-price">$${(p.price * item.qty).toFixed(2)}</span>
        </div>`;
      }).join("");
    }

    const subtotal = calcSubtotal();
    const shipCost = subtotal >= 75 ? 0 : SHIPPING_COSTS[selectedShipping] || 7.99;
    const total    = subtotal + shipCost;

    // CTA amount
    const ctaAmt = document.getElementById("cta-total-amount");
    if (ctaAmt) ctaAmt.textContent = `$${total.toFixed(2)}`;

    // Breakdown
    const bdEl = document.getElementById("checkout-breakdown");
    if (bdEl) {
      let rows = `
        <div class="checkout-brow"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></div>`;
      if (shipCost === 0) {
        rows += `<div class="checkout-brow free-ship"><span>Shipping</span><span>Free 🎉</span></div>`;
      } else {
        rows += `<div class="checkout-brow"><span>Shipping (${selectedShipping})</span><strong>$${shipCost.toFixed(2)}</strong></div>`;
      }
      rows += `<div class="checkout-brow"><span>Estimated Tax</span><strong>$${(subtotal * 0.08).toFixed(2)}</strong></div>`;
      bdEl.innerHTML = rows;

      // Recompute total with tax
      const totalWithTax = subtotal + shipCost + subtotal * 0.08;
      if (ctaAmt) ctaAmt.textContent = `$${totalWithTax.toFixed(2)}`;

      // Total row
      const totalEl = document.getElementById("checkout-total-row");
      if (totalEl) {
        totalEl.innerHTML = `
          <span class="checkout-total-label">Total (USD)</span>
          <span class="checkout-total-val">$${totalWithTax.toFixed(2)}</span>`;
      }
    }

    // Delivery
    const delivEl = document.getElementById("checkout-delivery-info");
    if (delivEl) {
      const etaDays = { standard: 7, express: 3, overnight: 1 };
      const eta = getDeliveryDate(etaDays[selectedShipping] || 7);
      delivEl.innerHTML = `🚚 Estimated delivery by <strong>${eta}</strong>`;
    }
  }

  // -- Card type detection --
  function detectCardType(num) {
    const n = num.replace(/\s/g, "");
    if (/^4/.test(n))          return "visa";
    if (/^5[1-5]/.test(n))     return "mastercard";
    if (/^3[47]/.test(n))      return "amex";
    if (/^6(?:011|5)/.test(n)) return "discover";
    return "unknown";
  }

  const cardTypeIcons = {
    visa: `<svg width="36" height="24" viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="750" height="471" rx="40" fill="#1A1F71"/><text x="375" y="300" text-anchor="middle" font-family="Arial" font-weight="900" font-size="180" fill="white" letter-spacing="-4">VISA</text></svg>`,
    mastercard: `<svg width="36" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="12" r="11" fill="#EB001B"/><circle cx="25" cy="12" r="11" fill="#F79E1B"/><path d="M20 4.8a11 11 0 010 14.4A11 11 0 0120 4.8z" fill="#FF5F00"/></svg>`,
    amex: `<svg width="36" height="24" viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="750" height="471" rx="40" fill="#2557D6"/><text x="375" y="300" text-anchor="middle" font-family="Arial" font-weight="900" font-size="130" fill="white">AMEX</text></svg>`,
    discover: `<svg width="36" height="24" viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="750" height="471" rx="40" fill="#FF6600"/><text x="375" y="300" text-anchor="middle" font-family="Arial" font-weight="900" font-size="110" fill="white">DISCOVER</text></svg>`,
  };

  // -- Card number formatting --
  const cardInput = document.getElementById("card-number");
  const cardTypeEl = document.getElementById("card-type-icon");

  if (cardInput) {
    cardInput.addEventListener("input", e => {
      let val = e.target.value.replace(/\D/g, "");
      const type = detectCardType(val);

      // Amex: 4-6-5 pattern; others: 4-4-4-4
      if (type === "amex") {
        val = val.slice(0, 15);
        val = val.replace(/^(\d{4})(\d{1,6})?(\d{1,5})?$/, (_, a, b, c) =>
          [a, b, c].filter(Boolean).join(" "));
      } else {
        val = val.slice(0, 16);
        val = val.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      }
      e.target.value = val;

      // Update card type icon
      if (cardTypeEl) {
        cardTypeEl.innerHTML = cardTypeIcons[type] || `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
      }

      // Adjust CVV max for Amex
      const cvvInput = document.getElementById("card-cvv");
      if (cvvInput) cvvInput.maxLength = type === "amex" ? 4 : 3;
    });
  }

  // -- Expiry auto-slash --
  const expiryInput = document.getElementById("card-expiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", e => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + " / " + val.slice(2);
      e.target.value = val;
    });
  }

  // -- Billing toggle --
  const sameCheck = document.getElementById("same-as-shipping");
  const billingFields = document.getElementById("billing-fields");
  if (sameCheck && billingFields) {
    sameCheck.addEventListener("change", () => {
      billingFields.style.display = sameCheck.checked ? "none" : "grid";
    });
  }

  // -- Shipping method change → update summary --
  document.querySelectorAll("input[name='shipping-method']").forEach(radio => {
    radio.addEventListener("change", e => {
      selectedShipping = e.target.value;
      // Update standard price label if subtotal qualifies for free
      renderCheckoutSummary();
    });
  });

  // -- Real-time field validation on blur --
  function validateField(input, errorId, rule, message) {
    const errEl = document.getElementById(errorId);
    if (!errEl) return true;
    if (!rule(input.value)) {
      input.classList.add("error");
      input.classList.remove("valid");
      errEl.textContent = message;
      return false;
    } else {
      input.classList.remove("error");
      input.classList.add("valid");
      errEl.textContent = "";
      return true;
    }
  }

  const validations = [
    { id: "ship-first-name", errId: "err-ship-first-name", rule: v => v.trim().length >= 2,          msg: "Enter your first name." },
    { id: "ship-last-name",  errId: "err-ship-last-name",  rule: v => v.trim().length >= 2,          msg: "Enter your last name." },
    { id: "ship-email",      errId: "err-ship-email",      rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Enter a valid email address." },
    { id: "ship-address",    errId: "err-ship-address",    rule: v => v.trim().length >= 5,          msg: "Enter a full street address." },
    { id: "ship-city",       errId: "err-ship-city",       rule: v => v.trim().length >= 2,          msg: "Enter your city." },
    { id: "ship-zip",        errId: "err-ship-zip",        rule: v => /^\d{4,10}$/.test(v.replace(/\s/g, "")), msg: "Enter a valid postal code." },
    { id: "ship-country",    errId: "err-ship-country",    rule: v => v !== "",                       msg: "Select a country." },
    { id: "card-number",     errId: "err-card-number",     rule: v => v.replace(/\s/g, "").length >= 15, msg: "Enter a valid card number." },
    { id: "card-name",       errId: "err-card-name",       rule: v => v.trim().length >= 3,          msg: "Enter the cardholder name." },
    { id: "card-expiry",     errId: "err-card-expiry",     rule: v => /^\d{2}\s*\/\s*\d{2}$/.test(v), msg: "Enter expiry as MM / YY." },
    { id: "card-cvv",        errId: "err-card-cvv",        rule: v => /^\d{3,4}$/.test(v),           msg: "Enter 3 or 4-digit CVV." },
  ];

  validations.forEach(({ id, errId, rule, msg }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("blur", () => validateField(el, errId, rule, msg));
    }
  });

  // -- Progress steps scroll spy --
  const sections = ["section-shipping", "section-billing", "section-payment"];
  const steps    = ["step-shipping",    "step-billing",     "step-payment", "step-review"];

  const stepObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sections.indexOf(entry.target.id);
        if (idx < 0) return;
        steps.forEach((stepId, i) => {
          const el = document.getElementById(stepId);
          if (!el) return;
          if (i < idx)      { el.classList.add("done");   el.classList.remove("active"); }
          else if (i === idx){ el.classList.add("active"); el.classList.remove("done");  }
          else               { el.classList.remove("active", "done"); }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) stepObserver.observe(el);
  });

  // -- Form submission --
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();

      // Run all validations
      let valid = true;
      validations.forEach(({ id, errId, rule, msg }) => {
        const el = document.getElementById(id);
        if (el && el.closest("#billing-fields") && document.getElementById("same-as-shipping")?.checked) return;
        if (el && !validateField(el, errId, rule, msg)) valid = false;
      });

      if (!valid) {
        // Scroll to first error
        const firstError = form.querySelector(".form-control.error");
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("Please fix the errors above before continuing.", "error");
        return;
      }

      // Show loading state
      const btn       = document.getElementById("place-order-btn");
      const textEl    = document.getElementById("place-order-text");
      const loadingEl = document.getElementById("place-order-loading");
      if (btn && textEl && loadingEl) {
        btn.disabled = true;
        textEl.style.display = "none";
        loadingEl.style.display = "flex";
      }

      // Simulate payment processing delay
      setTimeout(() => {
        // Store minimal order data for confirmation page
        const subtotal = calcSubtotal();
        const shipCost = subtotal >= 75 ? 0 : SHIPPING_COSTS[selectedShipping] || 7.99;
        state.lastOrder = {
          orderNumber:  "PN-" + Math.floor(100000 + Math.random() * 900000),
          email:        document.getElementById("ship-email")?.value || "",
          name:         (document.getElementById("ship-first-name")?.value || "") + " " + (document.getElementById("ship-last-name")?.value || ""),
          items:        [...state.cart],
          shipping:     selectedShipping,
          shipCost,
          subtotal,
          total:        subtotal + shipCost + subtotal * 0.08,
          deliveryDate: getDeliveryDate({ standard: 7, express: 3, overnight: 1 }[selectedShipping] || 7),
        };
        state.cart = []; // clear cart after order
        saveCartState();
        window.location.href = "confirmation.html";
      }, 1800);
    });
  }

  // -- Initial render --
  renderCheckoutSummary();
}

// --- ORDER CONFIRMATION CONTROLLER ---
function initConfirmation() {
  const mainEl = document.getElementById("confirmation-main");
  if (!mainEl) return;

  const colorNames = {
    black: "Midnight Black", white: "Pearl White", navy: "Deep Navy",
    silver: "Brushed Silver", blue: "Ocean Blue", gray: "Storm Gray"
  };

  // Seed demo order if empty (for direct page testing)
  if (!state.lastOrder) {
    state.lastOrder = {
      orderNumber: "PN-482910",
      email: "alex.morgan@example.com",
      name: "Alex Morgan",
      items: [
        { uid: "uid-101", id: "pulsepods-pro", color: "black", qty: 1 },
        { uid: "uid-102", id: "magcharge", color: "white", qty: 1 }
      ],
      shipping: "standard",
      shipCost: 0, // Free over $75
      subtotal: 168.00,
      total: 181.44, // Subtotal + Tax
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    };
  }

  const order = state.lastOrder;
  const getProduct = (id) => catalog.find(p => p.id === id);

  // Set order details
  const numEl = document.getElementById("order-number");
  if (numEl) numEl.textContent = order.orderNumber;

  const emailEl = document.getElementById("customer-email");
  if (emailEl) emailEl.textContent = order.email;

  const timelineEl = document.getElementById("shipping-timeline");
  if (timelineEl) {
    timelineEl.innerHTML = `🚚 Your package will arrive by <strong>${order.deliveryDate}</strong> via ${order.shipping.charAt(0).toUpperCase() + order.shipping.slice(1)} shipping.`;
  }

  // Render items
  const itemsEl = document.getElementById("order-items");
  if (itemsEl) {
    itemsEl.innerHTML = order.items.map(item => {
      const p = getProduct(item.id);
      if (!p) return "";
      return `
        <div class="checkout-item-row" style="padding: var(--space-12) 0; border-bottom: 1px solid var(--color-border); justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: var(--space-16);">
            <div class="checkout-item-thumb">
              ${getSvgMarkup(p.id, item.color, false)}
              <span class="checkout-item-qty-badge">${item.qty}</span>
            </div>
            <div class="checkout-item-info">
              <p class="checkout-item-name">${p.name}</p>
              <span class="checkout-item-variant">${colorNames[item.color] || item.color}</span>
            </div>
          </div>
          <span class="checkout-item-price">$${(p.price * item.qty).toFixed(2)}</span>
        </div>`;
    }).join("");
  }

  // Render total breakdown
  const totalEl = document.getElementById("order-total");
  if (totalEl) {
    const tax = order.subtotal * 0.08;
    totalEl.innerHTML = `
      <div class="checkout-brow" style="margin-top: var(--space-16);"><span>Subtotal</span><strong>$${order.subtotal.toFixed(2)}</strong></div>
      <div class="checkout-brow"><span>Shipping</span><strong>${order.shipCost === 0 ? "Free" : "$" + order.shipCost.toFixed(2)}</strong></div>
      <div class="checkout-brow"><span>Estimated Tax (8%)</span><strong>$${tax.toFixed(2)}</strong></div>
      <div class="checkout-total-row">
        <span class="checkout-total-label">Total Paid</span>
        <span class="checkout-total-val">$${order.total.toFixed(2)}</span>
      </div>
    `;
  }

  // Render recommended items
  const recEl = document.getElementById("recommended-products");
  if (recEl) {
    // Select products not in order
    const orderedIds = order.items.map(i => i.id);
    const recs = catalog.filter(p => !orderedIds.includes(p.id)).slice(0, 3);
    recEl.innerHTML = recs.map(p => renderProductCard(p)).join("");
  }
}

// --- FAQ ACCORDION CONTROLLER ---
function initFaqAccordion() {
  const accordion = document.getElementById("faq-accordion");
  if (!accordion) return; // only runs where the FAQ section exists

  const triggers = Array.from(accordion.querySelectorAll(".faq-trigger"));

  function openItem(trigger) {
    const panelId = trigger.getAttribute("aria-controls");
    const panel   = document.getElementById(panelId);
    if (!panel) return;
    trigger.setAttribute("aria-expanded", "true");
    // Use scrollHeight so the animation works for any content length
    panel.style.maxHeight = panel.scrollHeight + "px";
  }

  function closeItem(trigger) {
    const panelId = trigger.getAttribute("aria-controls");
    const panel   = document.getElementById(panelId);
    if (!panel) return;
    trigger.setAttribute("aria-expanded", "false");
    panel.style.maxHeight = "0";
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      // Close ALL panels first (exclusive-open behaviour)
      triggers.forEach(closeItem);
      // If this one was closed, open it now
      if (!isExpanded) openItem(trigger);
    });

    // Keyboard accessibility: Space and Enter are handled natively for buttons;
    // Add Home/End navigation across the trigger list
    trigger.addEventListener("keydown", (e) => {
      const idx = triggers.indexOf(trigger);
      if (e.key === "Home") { e.preventDefault(); triggers[0].focus(); }
      if (e.key === "End")  { e.preventDefault(); triggers[triggers.length - 1].focus(); }
      if (e.key === "ArrowDown") { e.preventDefault(); triggers[(idx + 1) % triggers.length].focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); triggers[(idx - 1 + triggers.length) % triggers.length].focus(); }
    });
  });

  // Initialise: set correct maxHeight for the item that starts open (aria-expanded="true")
  triggers.forEach((trigger) => {
    if (trigger.getAttribute("aria-expanded") === "true") {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
}

// --- SCROLL-IN ANIMATION CONTROLLER ---
function initScrollAnimations() {
  // Nothing to do if IntersectionObserver isn't supported
  if (!("IntersectionObserver" in window)) {
    // Fallback: just show everything immediately
    document.querySelectorAll("[data-animate]").forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,      // trigger when 12% of element is visible
      rootMargin: "0px 0px -40px 0px", // slight offset from bottom
    }
  );

  document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
}

// --- HERO PARALLAX CONTROLLER ---
function initHeroParallax() {
  // Respect reduced-motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const heroBgArt   = document.querySelector(".hero-bg-art");
  const heroShapes  = document.querySelector(".hero-shapes");
  const hero        = document.querySelector(".hero");

  if (!heroBgArt || !hero) return; // only run on pages with a hero section

  let ticking = false;
  let lastY    = 0;

  function applyParallax() {
    const scrollY = window.pageYOffset;
    const heroH   = hero.offsetHeight;

    // Only run while hero is visible
    if (scrollY > heroH) {
      ticking = false;
      return;
    }

    // Background art: moves at 25% of scroll speed (slower = more depth)
    const bgOffset = scrollY * 0.25;
    heroBgArt.style.transform = `translateY(${bgOffset}px)`;

    // Floating shapes: move at 15% (slightly faster than bg, slower than content)
    if (heroShapes) {
      heroShapes.style.transform = `translateY(${scrollY * 0.15}px)`;
    }

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    lastY = window.pageYOffset;
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
}

// 7. Event Listeners & Delegations
document.addEventListener("DOMContentLoaded", () => {

  // Update global cart count badges from persisted cart state
  updateGlobalCartBadges();

  // Render landing page featured products grid
  renderFeaturedGrid();

  // Initialise Hero Slider
  initHeroSlider();

  // Initialise PDP
  initPDP();

  // Initialise Cart
  initCart();

  // Initialise Checkout
  initCheckout();

  // Initialise Confirmation
  initConfirmation();

  // Initialise FAQ accordion (index.html only)
  initFaqAccordion();

  // Initialise scroll-in animations
  initScrollAnimations();

  // Initialise hero parallax (only active on pages with .hero)
  initHeroParallax();


  // Mobile navigation toggles
  const btnMenuToggle = document.getElementById("menu-toggle-btn");
  const mobileNav = document.getElementById("mobile-nav-panel");
  const btnMobileClose = document.getElementById("mobile-nav-close-btn");

  if (btnMenuToggle && mobileNav && btnMobileClose) {
    btnMenuToggle.addEventListener("click", () => {
      mobileNav.classList.add("active");
    });
    btnMobileClose.addEventListener("click", () => {
      mobileNav.classList.remove("active");
    });
    mobileNav.addEventListener("click", (e) => {
      if (e.target === mobileNav) {
        mobileNav.classList.remove("active");
      }
    });
  }

  // Global Search Autocomplete Simulator
  const searchInput = document.getElementById("global-search-input");
  const searchDropdown = document.getElementById("search-autocomplete-dropdown");
  
  if (searchInput && searchDropdown) {
    searchInput.addEventListener("focus", () => {
      searchDropdown.classList.add("active");
    });
    
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove("active");
      }
    });

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const listContainer = searchDropdown.querySelector(".search-list");
      const titleContainer = searchDropdown.querySelector(".search-title");
      
      if (!query) {
        titleContainer.textContent = "Popular searches";
        listContainer.innerHTML = state.popularSearches.map(item => `
          <li><button class="search-item-btn">${item}</button></li>
        `).join("");
      } else {
        const filtered = catalog.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
        titleContainer.textContent = "Suggestions";
        if (filtered.length > 0) {
          listContainer.innerHTML = filtered.map(p => `
            <li><button class="search-item-btn" data-id="${p.id}">${p.name} - $${p.price}</button></li>
          `).join("");
        } else {
          listContainer.innerHTML = `<li><div style="padding: 8px 12px; font-size: 14px; color: var(--color-text-secondary);">No products found</div></li>`;
        }
      }
    });

    // Handle search item clicks
    searchDropdown.addEventListener("click", (e) => {
      const btn = e.target.closest(".search-item-btn");
      if (btn) {
        const pid = btn.getAttribute("data-id");
        if (pid) {
          openQuickView(pid);
        } else {
          searchInput.value = btn.textContent;
        }
        searchDropdown.classList.remove("active");
      }
    });
  }

  // Cards Variant Selection & Clicks
  document.addEventListener("click", (e) => {
    // 1. Variant Dots click
    const dot = e.target.closest(".variant-dot");
    if (dot) {
      const pid = dot.getAttribute("data-product-id");
      const color = dot.getAttribute("data-color");
      handleVariantChange(pid, color);
      
      // If we are currently inside the modal, keep the modal active variant state synced
      if (modalOverlay.classList.contains("active")) {
        // Find inside modal-content
        const modalDots = modalContent.querySelectorAll(".variant-dot");
        modalDots.forEach(md => {
          if (md.getAttribute("data-color") === color) {
            md.classList.add("active");
          } else {
            md.classList.remove("active");
          }
        });
        // Update modal illustration
        const modalGallery = modalContent.querySelector(".modal-gallery");
        if (modalGallery) {
          modalGallery.innerHTML = `
            <div class="product-illustration-large" style="--product-color: var(--color-variant-${color});">
              ${getSvgMarkup(pid, color, true)}
            </div>
          `;
        }
      }
    }

    // 2. Wishlist Button click
    const wishlistBtn = e.target.closest(".card-wishlist-btn");
    if (wishlistBtn) {
      const pid = wishlistBtn.getAttribute("data-product-id");
      if (state.wishlist.has(pid)) {
        state.wishlist.delete(pid);
        wishlistBtn.classList.remove("active");
        showToast("Removed from wishlist");
      } else {
        state.wishlist.add(pid);
        wishlistBtn.classList.add("active");
        showToast("Added to your wishlist", "success");
      }
    }

    // 3. Quick View Button click
    const quickViewBtn = e.target.closest(".card-quickview-btn") || e.target.closest(".btn-view-product");
    if (quickViewBtn) {
      const pid = quickViewBtn.getAttribute("data-product-id");
      openQuickView(pid);
    }

    // 4. Modal Close click
    if (e.target.closest("#modal-close-btn") || e.target === modalOverlay) {
      closeQuickView();
    }

    // 5. Add to Cart inside Modal
    const addToCartBtn = e.target.closest(".btn-add-to-cart");
    if (addToCartBtn) {
      const pid = addToCartBtn.getAttribute("data-product-id");
      const activeColor = state.activeVariants[pid];
      const p = catalog.find(prod => prod.id === pid);
      
      state.cart.push({ id: pid, color: activeColor, qty: 1 });
      
      // Update badge
      const badges = document.querySelectorAll(".cart-badge");
      badges.forEach(badge => {
        badge.textContent = state.cart.length;
      });
      
      closeQuickView();
      showToast(`Added ${p.name} (${activeColor}) to cart!`, "success");
    }

    // 5b. Add to Cart on Card
    const cardAddToCartBtn = e.target.closest(".btn-add-to-cart-card");
    if (cardAddToCartBtn) {
      e.preventDefault();
      const pid = cardAddToCartBtn.getAttribute("data-product-id");
      const activeColor = state.activeVariants[pid] || "black";
      const p = catalog.find(prod => prod.id === pid);
      
      state.cart.push({ id: pid, color: activeColor, qty: 1 });
      saveCartState();
      updateGlobalCartBadges();
      showToast(`Added ${p.name} (${activeColor}) to cart!`, "success");
    }

    // 5c. Click Header Cart to navigate
    const headerCartBtn = e.target.closest(".cart-btn-wrapper") || e.target.closest("[aria-label='Shopping Cart']");
    if (headerCartBtn) {
      e.preventDefault();
      window.location.href = "cart.html";
    }

    // 6. Remove item from compare drawer
    const removeCompareBtn = e.target.closest(".compare-drawer-item-remove");
    if (removeCompareBtn) {
      const pid = removeCompareBtn.getAttribute("data-id");
      handleCompareCheckbox(pid, false);
    }
  });

  // Compare Checkbox click
  document.addEventListener("change", (e) => {
    const cb = e.target.closest(".compare-checkbox");
    if (cb) {
      const pid = cb.getAttribute("data-product-id");
      handleCompareCheckbox(pid, cb.checked);
    }
  });

  // Drawer Compare Action
  if (btnViewCompare) {
    btnViewCompare.addEventListener("click", () => {
      if (comparisonSection) {
        comparisonSection.scrollIntoView({ behavior: "smooth" });
        // briefly flash border or table to guide eye
        comparisonSection.style.outline = "2px solid var(--color-primary)";
        setTimeout(() => {
          comparisonSection.style.outline = "none";
        }, 1500);
      }
    });
  }

  // Clear Comparison list
  if (btnClearCompare) {
    btnClearCompare.addEventListener("click", () => {
      state.compareList = [];
      updateComparisonUI();
      showToast("Comparison cleared");
    });
  }

  // Newsletter form submission
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector(".input-control");
      const email = emailInput.value.trim();
      const feedback = document.getElementById("newsletter-feedback");
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        feedback.style.color = "#EF4444";
        feedback.textContent = "Please enter a valid email address.";
        emailInput.focus();
      } else {
        feedback.style.color = "#10B981";
        feedback.textContent = "Thank you for subscribing! Check your inbox for updates.";
        emailInput.value = "";
        showToast("Successfully subscribed to newsletter!", "success");
      }
    });
  }
  // --- INITIATE PRODUCT LISTING PAGE (shop.html) ---
  if (document.getElementById("shop-products-grid")) {
    renderShopGrid();

    // 1. Desktop Price range slider
    const priceSlider = document.getElementById("price-slider");
    const priceValue = document.getElementById("price-slider-value");
    if (priceSlider && priceValue) {
      priceSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        priceValue.textContent = `$${val}`;
        state.filters.priceMax = val;
        state.currentPage = 1;
        renderShopGrid();
        toggleClearFiltersBtn();
      });
    }

    // 2. Mobile Price range slider
    const mobilePriceSlider = document.getElementById("mobile-price-slider");
    const mobilePriceValue = document.getElementById("mobile-price-slider-value");
    if (mobilePriceSlider && mobilePriceValue) {
      mobilePriceSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        mobilePriceValue.textContent = `$${val}`;
      });
    }

    // 3. Handle filters toggles (Desktop checkboxes)
    document.querySelectorAll(".filter-category-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        const activeCategories = Array.from(document.querySelectorAll(".filter-category-checkbox:checked")).map(c => c.value);
        state.filters.categories = activeCategories;
        state.currentPage = 1;
        renderShopGrid();
        toggleClearFiltersBtn();
      });
    });

    document.querySelectorAll(".filter-color-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        const activeColors = Array.from(document.querySelectorAll(".filter-color-checkbox:checked")).map(c => c.value);
        state.filters.colors = activeColors;
        state.currentPage = 1;
        renderShopGrid();
        toggleClearFiltersBtn();
      });
    });

    document.querySelectorAll(".filter-feature-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        const activeFeatures = Array.from(document.querySelectorAll(".filter-feature-checkbox:checked")).map(c => c.value);
        state.filters.features = activeFeatures;
        state.currentPage = 1;
        renderShopGrid();
        toggleClearFiltersBtn();
      });
    });

    function toggleClearFiltersBtn() {
      const clearBtn = document.getElementById("desktop-clear-filters-btn");
      if (clearBtn) {
        const hasFilters = state.filters.categories.length > 0 || state.filters.colors.length > 0 || state.filters.features.length > 0 || state.filters.priceMax < 200;
        clearBtn.style.display = hasFilters ? "inline-block" : "none";
      }
    }

    // Desktop Clear All click
    const clearBtn = document.getElementById("desktop-clear-filters-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        resetAllFiltersState();
      });
    }

    function resetAllFiltersState() {
      // Clear inputs
      document.querySelectorAll(".filter-checkbox").forEach(cb => cb.checked = false);
      const priceSlider = document.getElementById("price-slider");
      if (priceSlider) {
        priceSlider.value = 200;
        document.getElementById("price-slider-value").textContent = "$200";
      }
      state.filters = { categories: [], priceMax: 200, colors: [], features: [] };
      state.currentPage = 1;
      renderShopGrid();
      toggleClearFiltersBtn();
    }

    // Reset filters from empty state
    const resetFiltersBtn = document.getElementById("reset-filters-btn");
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", () => {
        resetAllFiltersState();
      });
    }

    // 4. Sort Dropdown
    const sortSelect = document.getElementById("shop-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        renderShopGrid();
      });
    }

    // 5. Pagination Page click listeners
    const paginationContainer = document.getElementById("shop-pagination-container");
    if (paginationContainer) {
      paginationContainer.addEventListener("click", (e) => {
        const pageBtn = e.target.closest(".pagination-btn");
        if (!pageBtn || pageBtn.disabled) return;

        if (pageBtn.id === "pagination-prev-btn") {
          state.currentPage = Math.max(1, state.currentPage - 1);
        } else if (pageBtn.id === "pagination-next-btn") {
          state.currentPage = state.currentPage + 1;
        } else {
          const page = parseInt(pageBtn.getAttribute("data-page"));
          if (page) state.currentPage = page;
        }
        
        renderShopGrid();
        
        // Scroll back to top of product grid
        const mainGrid = document.getElementById("shop-products-grid");
        if (mainGrid) {
          mainGrid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    // 6. Mobile bottom sheet filters drawer
    const mobileTrigger = document.getElementById("mobile-filter-trigger-btn");
    const filterDrawer = document.getElementById("filter-drawer");
    const drawerOverlay = document.getElementById("filter-drawer-overlay");
    const drawerCloseBtn = document.getElementById("filter-drawer-close-btn");
    const applyBtn = document.getElementById("mobile-apply-filters-btn");
    const mobileClearBtn = document.getElementById("mobile-clear-filters-btn");

    if (mobileTrigger && filterDrawer && drawerOverlay && drawerCloseBtn) {
      mobileTrigger.addEventListener("click", () => {
        syncMobileDrawerInputs();
        filterDrawer.classList.add("active");
        drawerOverlay.classList.add("active");
      });

      const closeDrawer = () => {
        filterDrawer.classList.remove("active");
        drawerOverlay.classList.remove("active");
      };

      drawerCloseBtn.addEventListener("click", closeDrawer);
      drawerOverlay.addEventListener("click", closeDrawer);

      function syncMobileDrawerInputs() {
        document.querySelectorAll(".mobile-filter-category-checkbox").forEach(cb => {
          cb.checked = state.filters.categories.includes(cb.value);
        });
        document.querySelectorAll(".mobile-filter-color-checkbox").forEach(cb => {
          cb.checked = state.filters.colors.includes(cb.value);
        });
        document.querySelectorAll(".mobile-filter-feature-checkbox").forEach(cb => {
          cb.checked = state.filters.features.includes(cb.value);
        });
        const mSlider = document.getElementById("mobile-price-slider");
        if (mSlider) {
          mSlider.value = state.filters.priceMax;
          document.getElementById("mobile-price-slider-value").textContent = `$${state.filters.priceMax}`;
        }
      }

      // Apply Filters click
      if (applyBtn) {
        applyBtn.addEventListener("click", () => {
          state.filters.categories = Array.from(document.querySelectorAll(".mobile-filter-category-checkbox:checked")).map(c => c.value);
          state.filters.colors = Array.from(document.querySelectorAll(".mobile-filter-color-checkbox:checked")).map(c => c.value);
          state.filters.features = Array.from(document.querySelectorAll(".mobile-filter-feature-checkbox:checked")).map(c => c.value);
          const mSlider = document.getElementById("mobile-price-slider");
          if (mSlider) {
            state.filters.priceMax = parseInt(mSlider.value);
          }
          state.currentPage = 1;
          renderShopGrid();
          
          // Sync desktop check states to match mobile drawer selections
          document.querySelectorAll(".filter-category-checkbox").forEach(cb => {
            cb.checked = state.filters.categories.includes(cb.value);
          });
          document.querySelectorAll(".filter-color-checkbox").forEach(cb => {
            cb.checked = state.filters.colors.includes(cb.value);
          });
          document.querySelectorAll(".filter-feature-checkbox").forEach(cb => {
            cb.checked = state.filters.features.includes(cb.value);
          });
          const dSlider = document.getElementById("price-slider");
          if (dSlider) {
            dSlider.value = state.filters.priceMax;
            document.getElementById("price-slider-value").textContent = `$${state.filters.priceMax}`;
          }
          toggleClearFiltersBtn();

          // update mobile summary text
          const sumActive = state.filters.categories.length + state.filters.colors.length + state.filters.features.length + (state.filters.priceMax < 200 ? 1 : 0);
          document.getElementById("mobile-filter-summary").textContent = `${sumActive} filter${sumActive === 1 ? '' : 's'} active`;

          closeDrawer();
        });
      }

      // Mobile Clear All click
      if (mobileClearBtn) {
        mobileClearBtn.addEventListener("click", () => {
          document.querySelectorAll(".mobile-filter-category-checkbox, .mobile-filter-color-checkbox, .mobile-filter-feature-checkbox").forEach(cb => cb.checked = false);
          const mSlider = document.getElementById("mobile-price-slider");
          if (mSlider) {
            mSlider.value = 200;
            document.getElementById("mobile-price-slider-value").textContent = "$200";
          }
          state.filters = { categories: [], priceMax: 200, colors: [], features: [] };
          state.currentPage = 1;
          renderShopGrid();
          resetAllFiltersState();
          document.getElementById("mobile-filter-summary").textContent = "0 filters active";
          closeDrawer();
        });
      }
    }
  }

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeQuickView();
    }
  });
});
