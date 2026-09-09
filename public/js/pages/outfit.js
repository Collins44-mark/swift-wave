/* Migrated inline script from companies/outfit.html */
(function(){

    (function () {
      let CATEGORIES = {
        All: [],
        Men: ["Shirts", "Trousers", "Outerwear", "Knitwear"],
        Women: ["Dresses", "Tops", "Bottoms", "Sets"],
        Footwear: ["Sneakers", "Formal", "Sandals", "Boots"],
        Accessories: ["Bags", "Belts", "Hats", "Scarves"]
      };

      let PRODUCTS = [
        {
          id: "linen-shirt",
          title: "Classic Linen Shirt",
          category: "Men",
          sub: "Shirts",
          price: "TZS 85,000",
          rating: "4.6 · 94 ratings",
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80",
          desc: "Breathable linen shirt with a clean collar and relaxed fit. Ideal for warm climates and smart-casual wear.",
          bullets: ["100% linen blend", "Sizes S–XXL", "Machine wash cold", "Colour: Sand"]
        },
        {
          id: "oxford-shirt",
          title: "Oxford Button-Down",
          category: "Men",
          sub: "Shirts",
          price: "TZS 72,000",
          rating: "4.4 · 61 ratings",
          image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
          desc: "Crisp oxford cotton shirt for office and evening wear. Structured yet comfortable through the day.",
          bullets: ["Oxford cotton", "Slim & regular fits", "Easy-iron finish", "Colour: Sky blue"]
        },
        {
          id: "chino-trousers",
          title: "Slim Chino Trousers",
          category: "Men",
          sub: "Trousers",
          price: "TZS 95,000",
          rating: "4.5 · 77 ratings",
          image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80",
          desc: "Tapered chinos with stretch for all-day comfort. Pair with sneakers or formal shoes.",
          bullets: ["Stretch twill", "Sizes 28–40", "Side & back pockets", "Colour: Olive"]
        },
        {
          id: "tailored-blazer",
          title: "Tailored Blazer",
          category: "Men",
          sub: "Outerwear",
          price: "TZS 220,000",
          rating: "4.7 · 42 ratings",
          image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
          desc: "Lightweight structured blazer for meetings and events. Soft shoulder with a modern cut.",
          bullets: ["Half-canvas construction", "Sizes 46–56 EU", "Unlined summer option", "Colour: Navy"]
        },
        {
          id: "merino-crew",
          title: "Merino Crew Knit",
          category: "Men",
          sub: "Knitwear",
          price: "TZS 110,000",
          rating: "4.3 · 38 ratings",
          image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80",
          desc: "Fine-gauge merino crewneck that layers cleanly under jackets or stands alone.",
          bullets: ["Merino wool", "Sizes S–XL", "Anti-itch finish", "Colour: Charcoal"]
        },
        {
          id: "ankara-dress",
          title: "Ankara Wrap Dress",
          category: "Women",
          sub: "Dresses",
          price: "TZS 145,000",
          rating: "4.8 · 112 ratings",
          image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
          desc: "Statement wrap dress in bold print. Flattering silhouette for day events and evenings.",
          bullets: ["Ankara print cotton", "Sizes XS–XL", "Adjustable wrap", "Lined bodice"]
        },
        {
          id: "midi-dress",
          title: "Satin Midi Dress",
          category: "Women",
          sub: "Dresses",
          price: "TZS 168,000",
          rating: "4.5 · 56 ratings",
          image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80",
          desc: "Fluid satin midi with a soft drape. Elevated piece for dinners and celebrations.",
          bullets: ["Satin finish", "Sizes XS–L", "Side zip", "Colour: Emerald"]
        },
        {
          id: "silk-blouse",
          title: "Silk Blouse",
          category: "Women",
          sub: "Tops",
          price: "TZS 95,000",
          rating: "4.6 · 89 ratings",
          image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1000&q=80",
          desc: "Soft silk-feel blouse with a refined neckline. Works from desk to dinner.",
          bullets: ["Silk-feel fabric", "Sizes XS–XL", "Hidden buttons", "Colour: Ivory"]
        },
        {
          id: "wide-trousers",
          title: "Wide-Leg Trousers",
          category: "Women",
          sub: "Bottoms",
          price: "TZS 98,000",
          rating: "4.4 · 47 ratings",
          image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80",
          desc: "High-rise wide-leg trousers with clean lines. Pair with fitted tops or blouses.",
          bullets: ["Crepe fabric", "Sizes 24–34", "Side pockets", "Colour: Black"]
        },
        {
          id: "coord-set",
          title: "Linen Co-ord Set",
          category: "Women",
          sub: "Sets",
          price: "TZS 175,000",
          rating: "4.7 · 63 ratings",
          image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80",
          desc: "Matching linen top and trousers set. Wear together or style as separates.",
          bullets: ["2-piece set", "Sizes XS–L", "Breathable linen", "Colour: Clay"]
        },
        {
          id: "court-sneakers",
          title: "Court Sneakers",
          category: "Footwear",
          sub: "Sneakers",
          price: "TZS 125,000",
          rating: "4.5 · 201 ratings",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
          desc: "Everyday court sneakers with cushioned sole and durable upper. Built for city miles.",
          bullets: ["Rubber outsole", "Sizes 36–45", "Breathable lining", "Colour: White / Red"]
        },
        {
          id: "runner-sneakers",
          title: "Urban Runner",
          category: "Footwear",
          sub: "Sneakers",
          price: "TZS 140,000",
          rating: "4.3 · 88 ratings",
          image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80",
          desc: "Lightweight runners with mesh panels for airflow. Casual and travel-ready.",
          bullets: ["Mesh upper", "Sizes 36–45", "Cushion midsole", "Colour: Grey"]
        },
        {
          id: "oxford-shoes",
          title: "Leather Oxfords",
          category: "Footwear",
          sub: "Formal",
          price: "TZS 210,000",
          rating: "4.6 · 54 ratings",
          image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1000&q=80",
          desc: "Polished leather oxfords for formal occasions and office wear.",
          bullets: ["Genuine leather", "Sizes 39–46", "Leather sole option", "Colour: Brown"]
        },
        {
          id: "loafer",
          title: "Penny Loafers",
          category: "Footwear",
          sub: "Formal",
          price: "TZS 185,000",
          rating: "4.4 · 39 ratings",
          image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80",
          desc: "Classic penny loafers with a soft footbed. Smart without a lace-up.",
          bullets: ["Leather upper", "Sizes 39–45", "Cushion insole", "Colour: Black"]
        },
        {
          id: "slide-sandals",
          title: "Leather Slide Sandals",
          category: "Footwear",
          sub: "Sandals",
          price: "TZS 78,000",
          rating: "4.2 · 71 ratings",
          image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1000&q=80",
          desc: "Minimal leather slides for warm days. Easy on, easy off.",
          bullets: ["Leather strap", "Sizes 36–44", "Rubber sole", "Colour: Tan"]
        },
        {
          id: "chelsea-boots",
          title: "Chelsea Boots",
          category: "Footwear",
          sub: "Boots",
          price: "TZS 245,000",
          rating: "4.7 · 48 ratings",
          image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80",
          desc: "Sleek chelsea boots with elastic side panels. Versatile with jeans or trousers.",
          bullets: ["Leather finish", "Sizes 39–46", "Pull tab", "Colour: Black"]
        },
        {
          id: "canvas-tote",
          title: "Canvas Tote",
          category: "Accessories",
          sub: "Bags",
          price: "TZS 38,000",
          rating: "4.5 · 133 ratings",
          image: "https://images.unsplash.com/photo-1590874103328-eac38a67437a?auto=format&fit=crop&w=1000&q=80",
          desc: "Sturdy canvas tote for daily carry. Spacious enough for laptop and essentials.",
          bullets: ["Heavy canvas", "Inner pocket", "Reinforced handles", "Colour: Natural"]
        },
        {
          id: "crossbody",
          title: "Crossbody Bag",
          category: "Accessories",
          sub: "Bags",
          price: "TZS 92,000",
          rating: "4.4 · 67 ratings",
          image: "https://images.unsplash.com/photo-1548036328-c9fa89d128ac?auto=format&fit=crop&w=1000&q=80",
          desc: "Compact crossbody with adjustable strap. Hands-free for city days.",
          bullets: ["Vegan leather", "Zip close", "Adjustable strap", "Colour: Cognac"]
        },
        {
          id: "leather-belt",
          title: "Leather Belt",
          category: "Accessories",
          sub: "Belts",
          price: "TZS 45,000",
          rating: "4.6 · 90 ratings",
          image: "https://images.unsplash.com/photo-1624222247344-550fb60583fd?auto=format&fit=crop&w=1000&q=80",
          desc: "Full-grain leather belt with brushed buckle. Essential finishing piece.",
          bullets: ["Full-grain leather", "Sizes 80–110 cm", "Reversible option", "Colour: Black / Brown"]
        },
        {
          id: "cap",
          title: "Structured Cap",
          category: "Accessories",
          sub: "Hats",
          price: "TZS 32,000",
          rating: "4.3 · 55 ratings",
          image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80",
          desc: "Clean structured cap with adjustable strap. Everyday sun cover.",
          bullets: ["Cotton twill", "One size", "Adjustable", "Colour: Navy"]
        },
        {
          id: "scarf",
          title: "Lightweight Scarf",
          category: "Accessories",
          sub: "Scarves",
          price: "TZS 42,000",
          rating: "4.5 · 41 ratings",
          image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1000&q=80",
          desc: "Soft lightweight scarf for layering and travel. Packs flat in any bag.",
          bullets: ["Viscose blend", "180 × 70 cm", "Fringe edge", "Print assortment"]
        }
      ];

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
          title: product.title,
          price: product.price,
          priceNum: parsePrice(product.price),
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
        el.className = "co-product glass-card fade-up visible";
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
      document.getElementById("hero-cart-btn").addEventListener("click", openCart);
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
              product_name: item.title,
              quantity: item.qty,
              unit_price: item.priceNum || parsePrice(item.price)
            };
          })
        };

        function openWhatsApp() {
          var wa = window.SwiftWaveWhatsApp;
          var url = wa.buildWhatsAppUrl(WHATSAPP_NUMBER, lines.join("\n"));
          if (!url) {
            err.hidden = false;
            err.textContent = wa.UNAVAILABLE_MESSAGE;
            return;
          }
          window.open(url, "_blank", "noopener,noreferrer");
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
          if (data && Array.isArray(data.products) && data.products.length > 0) {
            PRODUCTS = data.products;
            if (data.categories && typeof data.categories === "object") {
              CATEGORIES = data.categories;
            }
          }
        })
        .catch(function () {})
        .then(function () {
          bootUI();
        });
    })();
  
})();
