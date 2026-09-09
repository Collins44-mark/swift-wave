/* Migrated inline script from companies/medical.html */
(function(){

    (function () {
      var WHATSAPP_NUMBER = "255700000000";
      var COMPANY_SLUG = "medical";
      var CATEGORIES = {
        All: [],
        Supplies: [],
        Equipment: [],
        "Skin Care": ["Lotion", "Shampoo", "Oil", "Cleanser", "Gel"],
        Wellness: [],
        Contracts: []
      };

      var PRODUCTS = [
        { id: "ppe-kit", title: "PPE Kit (Box of 50)", category: "Supplies", sub: "", price: "TZS 95,000", priceNum: 95000, rating: "4.5 · 64 ratings", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80", desc: "Complete PPE set for clinics and facilities. Includes masks, gloves, and gowns.", bullets: ["Box of 50 kits", "Clinic grade", "Bulk pricing available"] },
        { id: "first-aid", title: "First Aid Station Pack", category: "Supplies", sub: "", price: "TZS 180,000", priceNum: 180000, rating: "4.6 · 41 ratings", image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=1000&q=80", desc: "Wall-ready first aid station pack with essential emergency supplies.", bullets: ["Clinic ready", "Refill options", "Wall mountable"] },
        { id: "consumables", title: "Hospital Consumables", category: "Supplies", sub: "", price: "Get Quote", priceNum: 0, rating: "4.4 · 28 ratings", image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1000&q=80", desc: "Bulk hospital consumables for ongoing facility supply.", bullets: ["Bulk order", "Custom list", "Scheduled delivery"] },
        { id: "bp-monitor", title: "Digital BP Monitor", category: "Equipment", sub: "", price: "TZS 210,000", priceNum: 210000, rating: "4.7 · 89 ratings", image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1000&q=80", desc: "Accurate digital blood pressure monitor for home and clinic use.", bullets: ["Large display", "Memory recall", "Arm cuff included"] },
        { id: "oximeter", title: "Pulse Oximeter", category: "Equipment", sub: "", price: "TZS 65,000", priceNum: 65000, rating: "4.5 · 112 ratings", image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1000&q=80", desc: "Finger pulse oximeter with SpO2 and pulse readout.", bullets: ["Portable", "OLED display", "Auto power-off"] },
        { id: "wellness-day", title: "Community Wellness Day", category: "Wellness", sub: "", price: "Enquire", priceNum: 0, rating: "4.8 · 22 ratings", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80", desc: "Organised wellness outreach day for communities and workplaces.", bullets: ["On-site team", "Screening options", "Custom package"] },
        { id: "clinic-contract", title: "Clinic Supply Contract", category: "Contracts", sub: "", price: "Enquire", priceNum: 0, rating: "4.6 · 18 ratings", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80", desc: "Monthly replenishment contract for clinics and pharmacies.", bullets: ["Monthly delivery", "Priority support", "Flexible SKUs"] },
        { id: "emergency-restock", title: "Emergency Restock", category: "Contracts", sub: "", price: "24/7 Order", priceNum: 0, rating: "4.7 · 35 ratings", image: "https://images.unsplash.com/photo-1631815589968-fdb8192b2a47?auto=format&fit=crop&w=1000&q=80", desc: "Urgent restock pathway for critical medical items.", bullets: ["Rapid response", "Critical items", "24/7 desk"] },
        { id: "body-lotion", title: "Hydrating Body Lotion", category: "Skin Care", sub: "Lotion", price: "TZS 28,000", priceNum: 28000, rating: "4.6 · 140 ratings", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=80", desc: "Light daily body lotion for soft, hydrated skin.", bullets: ["400ml", "Non-greasy", "For all skin types"] },
        { id: "face-cream", title: "Daily Face Cream", category: "Skin Care", sub: "Lotion", price: "TZS 35,000", priceNum: 35000, rating: "4.5 · 96 ratings", image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?auto=format&fit=crop&w=1000&q=80", desc: "Day and night face cream for everyday moisture.", bullets: ["Day & night", "Lightweight", "Fragrance balanced"] },
        { id: "shea-moisturizer", title: "Shea Butter Moisturizer", category: "Skin Care", sub: "Lotion", price: "TZS 32,000", priceNum: 32000, rating: "4.7 · 78 ratings", image: "https://images.unsplash.com/photo-1620916565916-b6b8a5f3a0d0?auto=format&fit=crop&w=1000&q=80", desc: "Rich shea butter cream for dry skin and elbows.", bullets: ["Rich cream", "Shea butter", "Deep moisture"] },
        { id: "hand-body", title: "Hand & Body Cream", category: "Skin Care", sub: "Lotion", price: "TZS 25,000", priceNum: 25000, rating: "4.4 · 61 ratings", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1000&q=80", desc: "Family-size hand and body cream for daily use.", bullets: ["Family pack", "Soft finish", "Everyday care"] },
        { id: "hair-shampoo", title: "Nourishing Hair Shampoo", category: "Skin Care", sub: "Shampoo", price: "TZS 22,000", priceNum: 22000, rating: "4.5 · 120 ratings", image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=1000&q=80", desc: "Gentle nourishing shampoo for clean, soft hair.", bullets: ["500ml", "Daily use", "Suitable for most hair"] },
        { id: "conditioner", title: "Repair Conditioner", category: "Skin Care", sub: "Shampoo", price: "TZS 24,000", priceNum: 24000, rating: "4.4 · 88 ratings", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80", desc: "Repair conditioner to soften and detangle.", bullets: ["400ml", "Pairs with shampoo", "Smooth finish"] },
        { id: "anti-dandruff", title: "Anti-Dandruff Shampoo", category: "Skin Care", sub: "Shampoo", price: "TZS 27,000", priceNum: 27000, rating: "4.3 · 74 ratings", image: "https://images.unsplash.com/photo-1571781926291-c77df8098c1f?auto=format&fit=crop&w=1000&q=80", desc: "Medicated anti-dandruff shampoo for scalp comfort.", bullets: ["Medicated", "Scalp care", "Regular use"] },
        { id: "coconut-oil", title: "Coconut Hair Oil", category: "Skin Care", sub: "Oil", price: "TZS 18,000", priceNum: 18000, rating: "4.6 · 155 ratings", image: "https://images.unsplash.com/photo-1608248543800-ba5401bb9cb0?auto=format&fit=crop&w=1000&q=80", desc: "Pure-feel coconut oil for hair shine and softness.", bullets: ["200ml", "Hair oil", "Easy absorb"] },
        { id: "vitamin-e-oil", title: "Vitamin E Skin Oil", category: "Skin Care", sub: "Oil", price: "TZS 26,000", priceNum: 26000, rating: "4.5 · 101 ratings", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80", desc: "Vitamin E oil for body and face nourishment.", bullets: ["Body & face", "Vitamin E", "Night care"] },
        { id: "argan-oil", title: "Argan Beauty Oil", category: "Skin Care", sub: "Oil", price: "TZS 40,000", priceNum: 40000, rating: "4.8 · 67 ratings", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fccb0?auto=format&fit=crop&w=1000&q=80", desc: "Argan beauty oil for hair and skin finishing.", bullets: ["Hair & skin", "Premium finish", "Small drop use"] },
        { id: "cleanser", title: "Gentle Facial Cleanser", category: "Skin Care", sub: "Cleanser", price: "TZS 30,000", priceNum: 30000, rating: "4.5 · 93 ratings", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80", desc: "Gentle facial cleanser for daily clean skin.", bullets: ["200ml", "Gentle formula", "Morning & night"] },
        { id: "aloe-gel", title: "Aloe Vera Gel", category: "Skin Care", sub: "Gel", price: "TZS 20,000", priceNum: 20000, rating: "4.7 · 130 ratings", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80", desc: "Soothing aloe vera gel for skin comfort after sun or dryness.", bullets: ["Soothing", "Fast absorb", "Multi-use"] }
      ];

      var cart = [];
      var mainFilter = "All";
      var subFilter = "All";

      var mainFiltersEl = document.getElementById("main-filters");
      var subFiltersEl = document.getElementById("sub-filters");
      var gridEl = document.getElementById("product-grid");
      var emptyEl = document.getElementById("catalog-empty");
      var catalogView = document.getElementById("catalog-view");
      var detailView = document.getElementById("detail-view");
      var relatedGrid = document.getElementById("related-grid");
      var crumbProduct = document.getElementById("crumb-product");
      var crumbSep = document.getElementById("crumb-product-sep");
      var cartDrawer = document.getElementById("cart-drawer");
      var checkoutModal = document.getElementById("checkout-modal");

      function formatTotal(n) {
        return "TZS " + n.toLocaleString("en-US");
      }

      function cartCount() {
        return cart.reduce(function (s, i) { return s + i.qty; }, 0);
      }

      function cartTotal() {
        return cart.reduce(function (s, i) { return s + i.priceNum * i.qty; }, 0);
      }

      function updateCartBadge() {
        var count = cartCount();
        var el = document.getElementById("cart-count");
        el.hidden = count === 0;
        el.textContent = String(count);
      }

      function renderCart() {
        var wrap = document.getElementById("cart-items");
        var empty = document.getElementById("cart-empty");
        var foot = document.getElementById("cart-foot");
        wrap.querySelectorAll(".med-cart-line").forEach(function (n) { n.remove(); });

        if (!cart.length) {
          empty.hidden = false;
          foot.hidden = true;
          updateCartBadge();
          return;
        }

        empty.hidden = true;
        foot.hidden = false;
        document.getElementById("cart-total").textContent = formatTotal(cartTotal());

        cart.forEach(function (item) {
          var row = document.createElement("div");
          row.className = "med-cart-line";
          row.innerHTML =
            '<img src="' + item.image + '" alt="">' +
            '<div class="med-cart-line-info">' +
            "<strong>" + item.title + "</strong>" +
            "<span>" + item.price + " · Qty " + item.qty + "</span>" +
            "</div>" +
            '<button type="button" class="med-cart-remove" data-id="' + item.id + '" aria-label="Remove">×</button>';
          wrap.insertBefore(row, empty);
        });

        wrap.querySelectorAll(".med-cart-remove").forEach(function (btn) {
          btn.addEventListener("click", function () {
            cart = cart.filter(function (i) { return i.id !== btn.getAttribute("data-id"); });
            renderCart();
          });
        });
        updateCartBadge();
      }

      function addToCart(product) {
        var existing = cart.find(function (i) { return i.id === product.id; });
        if (existing) existing.qty += 1;
        else cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          priceNum: product.priceNum,
          image: product.image,
          qty: 1
        });
        renderCart();
      }

      function openCart() {
        cartDrawer.classList.add("is-open");
        cartDrawer.setAttribute("aria-hidden", "false");
        renderCart();
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      function closeCart() {
        cartDrawer.classList.remove("is-open");
        cartDrawer.setAttribute("aria-hidden", "true");
      }

      function openCheckout() {
        if (!cart.length) return;
        closeCart();
        checkoutModal.hidden = false;
        checkoutModal.setAttribute("aria-hidden", "false");
        checkoutModal.classList.add("is-open");
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      function closeCheckout() {
        checkoutModal.classList.remove("is-open");
        checkoutModal.setAttribute("aria-hidden", "true");
        checkoutModal.hidden = true;
      }

      function productCard(p) {
        var el = document.createElement("button");
        el.type = "button";
        el.className = "co-product glass-card fade-up visible";
        el.innerHTML =
          '<div class="co-product-media">' +
          '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy">' +
          '<span class="co-product-tag">' + (p.sub || p.category) + "</span>" +
          "</div>" +
          '<div class="co-product-body">' +
          '<h3 class="co-product-title">' + p.title + "</h3>" +
          '<p class="co-product-meta">' + (p.sub ? p.category + " · " + p.sub : p.category) + "</p>" +
          '<div class="co-product-row">' +
          '<span class="co-product-price">' + p.price + "</span>" +
          '<span class="co-product-cta">View</span>' +
          "</div></div>";
        el.addEventListener("click", function () { openProduct(p.id, true); });
        return el;
      }

      function renderMainFilters() {
        mainFiltersEl.innerHTML = "";
        Object.keys(CATEGORIES).forEach(function (name) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "co-filter" + (name === mainFilter ? " is-active" : "");
          btn.textContent = name;
          btn.addEventListener("click", function () {
            mainFilter = name;
            subFilter = "All";
            renderMainFilters();
            renderSubFilters();
            renderCatalog();
          });
          mainFiltersEl.appendChild(btn);
        });
      }

      function renderSubFilters() {
        var subs = CATEGORIES[mainFilter] || [];
        if (!subs.length) {
          subFiltersEl.hidden = true;
          subFiltersEl.innerHTML = "";
          return;
        }
        subFiltersEl.hidden = false;
        subFiltersEl.innerHTML = "";
        ["All"].concat(subs).forEach(function (name) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "co-subfilter" + (name === subFilter ? " is-active" : "");
          btn.textContent = name;
          btn.addEventListener("click", function () {
            subFilter = name;
            renderSubFilters();
            renderCatalog();
          });
          subFiltersEl.appendChild(btn);
        });
      }

      function filteredProducts() {
        return PRODUCTS.filter(function (p) {
          if (mainFilter !== "All" && p.category !== mainFilter) return false;
          if (mainFilter === "Skin Care" && subFilter !== "All" && p.sub !== subFilter) return false;
          return true;
        });
      }

      function renderCatalog() {
        var list = filteredProducts();
        gridEl.innerHTML = "";
        emptyEl.hidden = list.length > 0;
        list.forEach(function (p) { gridEl.appendChild(productCard(p)); });
      }

      function relatedFor(product) {
        return PRODUCTS.filter(function (p) {
          return p.id !== product.id && (p.category === product.category || (product.sub && p.sub === product.sub));
        }).slice(0, 8);
      }

      function showCatalog() {
        catalogView.hidden = false;
        detailView.hidden = true;
        crumbProduct.classList.add("hidden");
        crumbSep.classList.add("hidden");
        document.title = "Swift Wave Medical — Swift Wave Group";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function openProduct(id, push) {
        var product = PRODUCTS.find(function (p) { return p.id === id; });
        if (!product) return;

        catalogView.hidden = true;
        detailView.hidden = false;

        document.getElementById("pdp-image").src = product.image;
        document.getElementById("pdp-image").alt = product.title;
        document.getElementById("pdp-path").textContent =
          product.category + (product.sub ? " › " + product.sub : "");
        document.getElementById("pdp-title").textContent = product.title;
        document.getElementById("pdp-rating-text").textContent = product.rating;
        document.getElementById("pdp-price").textContent = product.price;
        document.getElementById("pdp-desc").textContent = product.desc;

        var bullets = document.getElementById("pdp-bullets");
        bullets.innerHTML = "";
        product.bullets.forEach(function (b) {
          var li = document.createElement("li");
          li.textContent = b;
          bullets.appendChild(li);
        });

        var toast = document.getElementById("pdp-toast");
        toast.hidden = true;

        document.getElementById("pdp-add").onclick = function () {
          addToCart(product);
          toast.hidden = false;
          toast.textContent = "Added to cart";
          setTimeout(function () { toast.hidden = true; }, 1600);
        };
        document.getElementById("pdp-checkout-now").onclick = function () {
          addToCart(product);
          openCheckout();
        };

        crumbProduct.textContent = product.title;
        crumbProduct.classList.remove("hidden");
        crumbSep.classList.remove("hidden");
        document.title = product.title + " — Swift Wave Medical";

        relatedGrid.innerHTML = "";
        relatedFor(product).forEach(function (p) {
          relatedGrid.appendChild(productCard(p));
        });

        if (push) history.pushState({ productId: id }, "", "#product/" + id);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      document.getElementById("back-to-shop").addEventListener("click", function () {
        history.pushState({}, "", "/companies/medical");
        showCatalog();
      });
      document.getElementById("crumb-shop").addEventListener("click", function (e) {
        if (!detailView.hidden) {
          e.preventDefault();
          history.pushState({}, "", "/companies/medical");
          showCatalog();
        }
      });
      window.addEventListener("popstate", function () {
        var match = (location.hash || "").match(/^#product\/(.+)$/);
        if (match) openProduct(match[1], false);
        else showCatalog();
      });

      document.getElementById("cart-toggle").addEventListener("click", openCart);
      document.getElementById("hero-cart-btn").addEventListener("click", openCart);
      document.getElementById("cart-close").addEventListener("click", closeCart);
      document.getElementById("cart-backdrop").addEventListener("click", closeCart);
      document.getElementById("open-checkout").addEventListener("click", openCheckout);
      document.getElementById("checkout-close").addEventListener("click", closeCheckout);
      document.getElementById("checkout-backdrop").addEventListener("click", closeCheckout);

      document.getElementById("checkout-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var err = document.getElementById("checkout-error");
        err.hidden = true;
        var name = (document.getElementById("checkout-name").value || "").trim();
        var mobile = (document.getElementById("checkout-mobile").value || "").trim();
        if (!name) {
          err.hidden = false;
          err.textContent = "Please enter your full name.";
          return;
        }
        if (!mobile || mobile.replace(/\D/g, "").length < 9) {
          err.hidden = false;
          err.textContent = "Please enter a valid mobile number.";
          return;
        }
        if (!cart.length) {
          err.hidden = false;
          err.textContent = "Your cart is empty.";
          return;
        }

        var lines = [
          "*Swift Wave Medical Order*",
          "",
          "*Name:* " + name,
          "*Mobile:* " + mobile,
          "",
          "*Items:*"
        ];
        cart.forEach(function (item) {
          lines.push("• " + item.title + " × " + item.qty + " — " + item.price);
        });
        var total = cartTotal();
        if (total > 0) lines.push("", "*Estimated total:* " + formatTotal(total));
        lines.push("", "_Sent from Swift Wave Medical checkout_");

        var orderPayload = {
          company_slug: COMPANY_SLUG,
          customer_name: name,
          customer_phone: mobile,
          currency: "TZS",
          items: cart.map(function (item) {
            return {
              product_name: item.title,
              quantity: item.qty,
              unit_price: item.priceNum || 0
            };
          })
        };

        function openWhatsApp() {
          window.open(
            "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n")),
            "_blank",
            "noopener,noreferrer"
          );
        }

        fetch("/api/public/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload)
        })
          .catch(function () {})
          .then(function () {
            openWhatsApp();
          });
      });

      function bootUI() {
        renderMainFilters();
        renderSubFilters();
        renderCatalog();
        updateCartBadge();
        var boot = (location.hash || "").match(/^#product\/(.+)$/);
        if (boot) openProduct(boot[1], false);
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      fetch("/api/public/catalog/" + COMPANY_SLUG)
        .then(function (res) {
          return res.ok ? res.json() : null;
        })
        .then(function (data) {
          if (data && Array.isArray(data.products) && data.products.length > 0) {
            PRODUCTS = data.products;
            if (data.categories && typeof data.categories === "object") {
              CATEGORIES = data.categories;
            }
            if (data.company && data.company.whatsapp_number) {
              WHATSAPP_NUMBER = String(data.company.whatsapp_number).replace(/\D/g, "") || WHATSAPP_NUMBER;
            }
          }
        })
        .catch(function () {})
        .then(function () {
          bootUI();
        });
    })();
  
})();
