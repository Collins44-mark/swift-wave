/* Migrated inline script from companies/outfit.html */
(function(){

    (function () {
      let CATEGORIES = { All: [] };
      let PRODUCTS = [];

      let WHATSAPP_NUMBER = null;
      const COMPANY_SLUG = "outfit";
      let cart = [];
      let mainFilter = "All";
      let subFilter = "All";

      const mainFiltersEl = document.getElementById("main-filters");
      const subFiltersEl = document.getElementById("sub-filters");
      const gridEl = document.getElementById("product-grid");
      const emptyEl = document.getElementById("catalog-empty");
      const catalogView = document.getElementById("catalog-view");
      const detailView = document.getElementById("detail-view");
      const relatedGrid = document.getElementById("related-grid");
      const crumbProduct = document.getElementById("crumb-product");
      const crumbSep = document.getElementById("crumb-product-sep");
      const cartDrawer = document.getElementById("cart-drawer");
      const checkoutModal = document.getElementById("checkout-modal");

      function parsePrice(price) {
        return parseInt(String(price).replace(/[^\d]/g, ""), 10) || 0;
      }

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
        const count = cartCount();
        const el = document.getElementById("cart-count");
        el.hidden = count === 0;
        el.textContent = String(count);
      }

      function renderCart() {
        const wrap = document.getElementById("cart-items");
        const empty = document.getElementById("cart-empty");
        const foot = document.getElementById("cart-foot");
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
          const row = document.createElement("div");
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
        const existing = cart.find(function (i) { return i.id === product.id; });
        if (existing) existing.qty += 1;
        else cart.push({
          id: product.id,
          dbId: product.dbId || null,
          title: product.title,
          price: product.price,
          priceNum: product.priceNum != null ? product.priceNum : parsePrice(product.price),
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

      function productCard(p, opts) {
        opts = opts || {};
        const el = document.createElement(opts.asButton ? "button" : "article");
        el.type = opts.asButton ? "button" : undefined;
        el.className = "co-product co-product--cover glass-card fade-up visible";
        el.dataset.id = p.id;
        el.innerHTML =
          '<div class="co-product-media">' +
          '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy">' +
          '<span class="co-product-tag">' + p.sub + "</span>" +
          "</div>" +
          '<div class="co-product-body">' +
          '<h3 class="co-product-title">' + p.title + "</h3>" +
          '<p class="co-product-meta">' + p.category + " · " + p.sub + "</p>" +
          '<div class="co-product-row">' +
          '<span class="co-product-price">' + p.price + "</span>" +
          '<span class="co-product-cta">' + (opts.cta || "View") + "</span>" +
          "</div></div>";
        el.addEventListener("click", function () {
          openProduct(p.id, true);
        });
        return el;
      }

      function renderMainFilters() {
        mainFiltersEl.innerHTML = "";
        Object.keys(CATEGORIES).forEach(function (name) {
          const btn = document.createElement("button");
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
        const subs = CATEGORIES[mainFilter] || [];
        if (!subs.length) {
          subFiltersEl.hidden = true;
          subFiltersEl.innerHTML = "";
          return;
        }
        subFiltersEl.hidden = false;
        subFiltersEl.innerHTML = "";
        ["All"].concat(subs).forEach(function (name) {
          const btn = document.createElement("button");
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
          if (subFilter !== "All" && p.sub !== subFilter) return false;
          return true;
        });
      }

      function renderCatalog() {
        const list = filteredProducts();
        gridEl.innerHTML = "";
        emptyEl.hidden = list.length > 0;
        list.forEach(function (p) {
          gridEl.appendChild(productCard(p));
        });
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      function relatedFor(product) {
        return PRODUCTS.filter(function (p) {
          return p.id !== product.id && (p.category === product.category || p.sub === product.sub);
        }).slice(0, 8);
      }

      function showCatalog() {
        catalogView.hidden = false;
        detailView.hidden = true;
        crumbProduct.classList.add("co-bc-hidden");
        crumbSep.classList.add("co-bc-hidden");
        document.title = "Swift Wave Outfit — Swift Wave Group";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function openProduct(id, push) {
        const product = PRODUCTS.find(function (p) {
          return p.id === id;
        });
        if (!product) return;

        catalogView.hidden = true;
        detailView.hidden = false;

        document.getElementById("pdp-image").src = product.image;
        document.getElementById("pdp-image").alt = product.title;
        document.getElementById("pdp-path").textContent =
          product.category + " › " + product.sub;
        document.getElementById("pdp-title").textContent = product.title;
        document.getElementById("pdp-rating-text").textContent = product.rating;
        document.getElementById("pdp-price").textContent = product.price;
        document.getElementById("pdp-desc").textContent = product.desc;

        const bullets = document.getElementById("pdp-bullets");
        bullets.innerHTML = "";
        product.bullets.forEach(function (b) {
          const li = document.createElement("li");
          li.textContent = b;
          bullets.appendChild(li);
        });

        const toast = document.getElementById("pdp-toast");
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
        crumbProduct.classList.remove("co-bc-hidden");
        crumbSep.classList.remove("co-bc-hidden");
        document.title = product.title + " — Swift Wave Outfit";

        relatedGrid.innerHTML = "";
        relatedFor(product).forEach(function (p) {
          relatedGrid.appendChild(productCard(p, { cta: "View" }));
        });

        if (push) {
          history.pushState({ productId: id }, "", "#product/" + id);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      document.getElementById("back-to-shop").addEventListener("click", function () {
        history.pushState({}, "", "/companies/outfit");
        showCatalog();
      });

      document.getElementById("crumb-shop").addEventListener("click", function (e) {
        if (!detailView.hidden) {
          e.preventDefault();
          history.pushState({}, "", "/companies/outfit");
          showCatalog();
        }
      });

      window.addEventListener("popstate", function () {
        const match = (location.hash || "").match(/^#product\/(.+)$/);
        if (match) openProduct(match[1], false);
        else showCatalog();
      });

      document.getElementById("cart-toggle").addEventListener("click", openCart);
      var heroCartBtn = document.getElementById("hero-cart-btn");
      if (heroCartBtn) heroCartBtn.addEventListener("click", openCart);
      document.getElementById("cart-close").addEventListener("click", closeCart);
      document.getElementById("cart-backdrop").addEventListener("click", closeCart);
      document.getElementById("open-checkout").addEventListener("click", openCheckout);
      document.getElementById("checkout-close").addEventListener("click", closeCheckout);
      document.getElementById("checkout-backdrop").addEventListener("click", closeCheckout);

      document.getElementById("checkout-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const err = document.getElementById("checkout-error");
        err.hidden = true;
        const name = (document.getElementById("checkout-name").value || "").trim();
        const mobile = (document.getElementById("checkout-mobile").value || "").trim();
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

        const lines = [
          "*Swift Wave Outfit Order*",
          "",
          "*Name:* " + name,
          "*Mobile:* " + mobile,
          "",
          "*Items:*"
        ];
        cart.forEach(function (item) {
          lines.push("• " + item.title + " × " + item.qty + " — " + item.price);
        });
        const total = cartTotal();
        if (total > 0) lines.push("", "*Estimated total:* " + formatTotal(total));
        lines.push("", "_Sent from Swift Wave Outfit checkout_");

        const orderPayload = {
          company_slug: COMPANY_SLUG,
          customer_name: name,
          customer_phone: mobile,
          currency: "TZS",
          items: cart.map(function (item) {
            return {
              product_id: item.dbId || null,
              product_name: item.title,
              quantity: item.qty,
              unit_price: item.priceNum || parsePrice(item.price)
            };
          })
        };

        var wa = window.SwiftWaveWhatsApp;
        var url = wa.buildWhatsAppUrl(WHATSAPP_NUMBER, lines.join("\n"));
        if (!url) {
          err.hidden = false;
          err.textContent = wa.UNAVAILABLE_MESSAGE;
          return;
        }

        wa.openWhatsAppUrl(url);
        fetch("/api/public/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload)
        }).catch(function () {});
      });

      function bootUI() {
        renderMainFilters();
        renderSubFilters();
        renderCatalog();
        updateCartBadge();
        const boot = (location.hash || "").match(/^#product\/(.+)$/);
        if (boot) openProduct(boot[1], false);
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      fetch("/api/public/catalog/" + COMPANY_SLUG)
        .then(function (res) {
          return res.ok ? res.json() : null;
        })
        .then(function (data) {
          if (data && data.company && data.company.whatsapp_number) {
            WHATSAPP_NUMBER = window.SwiftWaveWhatsApp.normalizeWhatsAppNumber(
              data.company.whatsapp_number
            );
          }
          if (data) {
            if (data.categories && typeof data.categories === "object") {
              CATEGORIES = data.categories;
            }
            if (Array.isArray(data.products)) {
              PRODUCTS = data.products;
            }
          }
        })
        .catch(function () {})
        .then(function () {
          bootUI();
        });
    })();
  
})();
