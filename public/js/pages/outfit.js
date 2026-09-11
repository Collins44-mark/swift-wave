/* Migrated inline script from companies/outfit.html */
(function(){

    (function () {
      if (typeof window.__swiftWaveLegacyCleanup === "function") {
        window.__swiftWaveLegacyCleanup();
      }

      let CATEGORIES = { All: [] };
      let PRODUCTS = [];

      let WHATSAPP_NUMBER = null;
      const COMPANY_SLUG = "outfit";
      const cartStore = window.SwiftWaveCart.createCartStore(COMPANY_SLUG);
      let cart = cartStore.load();
      let checkoutProcessing = false;
      let mainFilter = "All";
      let subFilter = "All";
      let pdpQty = 1;

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
      const checkoutForm = document.getElementById("checkout-form");
      const checkoutSubmitBtn = checkoutForm
        ? checkoutForm.querySelector('button[type="submit"]')
        : null;
      const checkoutSubmitDefaultHtml = checkoutSubmitBtn
        ? checkoutSubmitBtn.innerHTML
        : "";

      function lineKey(productId, colorId, sizeName) {
        return [
          String(productId || ""),
          colorId == null ? "" : String(colorId),
          sizeName == null ? "" : String(sizeName)
        ].join("|");
      }

      function setCart(nextCart) {
        cart = cartStore.save(nextCart);
        renderCart();
      }

      function clearCartState() {
        setCart([]);
      }

      function changeQty(lineId, delta) {
        const next = [];
        cart.forEach(function (item) {
          if (item.lineId !== lineId) {
            next.push(item);
            return;
          }
          const qty = item.qty + delta;
          if (qty >= 1) {
            next.push(Object.assign({}, item, { qty: qty }));
          }
        });
        setCart(next);
      }

      function removeLine(lineId) {
        setCart(cart.filter(function (i) { return i.lineId !== lineId; }));
      }

      function parsePrice(price) {
        return parseInt(String(price).replace(/[^\d]/g, ""), 10) || 0;
      }

      function cartCurrency() {
        const item = cart.find(function (i) { return i.currency; });
        return (item && item.currency) || "INR";
      }

      function formatTotal(n) {
        return cartCurrency() + " " + n.toLocaleString("en-US");
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
          cartStore.save([]);
          return;
        }

        empty.hidden = true;
        foot.hidden = false;
        document.getElementById("cart-total").textContent = formatTotal(cartTotal());

        cart.forEach(function (item) {
          const row = document.createElement("div");
          row.className = "med-cart-line";
          const variantBits = [];
          if (item.colorName) variantBits.push("Color: " + item.colorName);
          if (item.sizeName) variantBits.push("Size: " + item.sizeName);
          const compare =
            item.comparePriceNum && item.comparePriceNum > item.priceNum
              ? '<s class="co-price-was">' + formatTotal(item.comparePriceNum) + "</s> "
              : "";
          row.innerHTML =
            '<img src="' + item.image + '" alt="">' +
            '<div class="med-cart-line-info">' +
            "<strong>" + item.title + "</strong>" +
            (variantBits.length ? "<span>" + variantBits.join(" · ") + "</span>" : "") +
            "<span>" + compare + formatTotal(item.priceNum) + "</span>" +
            '<div class="med-cart-qty">' +
            '<button type="button" class="med-cart-qty-btn" data-line="' + item.lineId + '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
            '<span class="med-cart-qty-value">' + item.qty + "</span>" +
            '<button type="button" class="med-cart-qty-btn" data-line="' + item.lineId + '" data-delta="1" aria-label="Increase quantity">+</button>' +
            "</div>" +
            "</div>" +
            '<button type="button" class="med-cart-remove" data-line="' + item.lineId + '" aria-label="Remove">×</button>';
          wrap.insertBefore(row, empty);
        });

        wrap.querySelectorAll(".med-cart-qty-btn").forEach(function (btn) {
          btn.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            changeQty(btn.getAttribute("data-line"), Number(btn.getAttribute("data-delta")));
          });
        });
        wrap.querySelectorAll(".med-cart-remove").forEach(function (btn) {
          btn.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            removeLine(btn.getAttribute("data-line"));
          });
        });
        updateCartBadge();
      }

      function addToCart(product, selection) {
        selection = selection || {};
        const color = selection.color || null;
        const size = selection.size || null;
        const addQty = Math.max(1, Math.floor(Number(selection.qty) || 1));
        const lineId = lineKey(product.dbId || product.id, color && color.id, size && size.name);
        const image = (color && color.image) || product.image;
        const sale = product.priceNum != null ? product.priceNum : parsePrice(product.price);
        const next = cart.map(function (item) { return Object.assign({}, item); });
        const existing = next.find(function (i) { return i.lineId === lineId; });
        if (existing) {
          existing.qty += addQty;
        } else {
          next.push({
            id: product.id,
            lineId: lineId,
            dbId: product.dbId || null,
            title: product.title,
            price: product.price,
            priceNum: sale,
            comparePriceNum: product.comparePriceNum || null,
            discountAmount: product.discountAmount || 0,
            currency: product.currency || cartCurrency(),
            image: image,
            colorId: color ? color.id : null,
            colorName: color ? color.name : "",
            sizeName: size ? size.name : "",
            qty: addQty
          });
        }
        setCart(next);
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

      function paintSwatch(el, color) {
        if (color && color.hex) {
          el.style.backgroundColor = color.hex;
          if (color.light) el.classList.add("is-light");
        } else {
          el.classList.add("is-missing");
        }
      }

      function priceMarkup(product) {
        if (product.discountLabel && product.comparePrice) {
          return (
            '<span class="co-price-stack">' +
            '<s class="co-price-was">' + product.comparePrice + "</s>" +
            '<span class="co-price-now">' + product.price + "</span>" +
            '<span class="co-price-off">' + product.discountLabel + "</span>" +
            "</span>"
          );
        }
        return '<span class="co-price-now">' + product.price + "</span>";
      }

      function primaryColor(product) {
        const colors = Array.isArray(product.colors) ? product.colors : [];
        if (!colors.length) return null;
        return (
          colors.find(function (c) { return c.id === product.primaryColorId; }) ||
          colors[0]
        );
      }

      function productCard(p, opts) {
        opts = opts || {};
        const el = document.createElement(opts.asButton ? "button" : "article");
        el.type = opts.asButton ? "button" : undefined;
        el.className = "co-product co-product--cover glass-card fade-up visible";
        el.dataset.id = p.id;
        const cover = p.image || "";
        el.innerHTML =
          '<div class="co-product-media">' +
          '<img src="' + cover + '" alt="' + p.title + '" loading="lazy">' +
          '<span class="co-product-tag">' + p.sub + "</span>" +
          "</div>" +
          '<div class="co-product-body">' +
          '<h3 class="co-product-title">' + p.title + "</h3>" +
          '<p class="co-product-meta">' + p.category + " · " + p.sub + "</p>" +
          '<div class="co-product-row">' +
          '<span class="co-product-price">' + priceMarkup(p) + "</span>" +
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

        const colors = Array.isArray(product.colors) ? product.colors : [];
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
        let selectedColor = primaryColor(product);
        let selectedSize = null;
        pdpQty = 1;
        const pdpQtyValue = document.getElementById("pdp-qty-value");
        if (pdpQtyValue) pdpQtyValue.textContent = "1";

        catalogView.hidden = true;
        detailView.hidden = false;

        document.getElementById("pdp-image").src =
          (selectedColor && selectedColor.image) || product.image;
        document.getElementById("pdp-image").alt = product.title;
        document.getElementById("pdp-path").textContent =
          product.category + " › " + product.sub;
        document.getElementById("pdp-title").textContent = product.title;
        document.getElementById("pdp-rating-text").textContent = product.rating;
        document.getElementById("pdp-price").innerHTML = priceMarkup(product);
        document.getElementById("pdp-desc").textContent = product.desc;

        const bullets = document.getElementById("pdp-bullets");
        bullets.innerHTML = "";
        product.bullets.forEach(function (b) {
          const li = document.createElement("li");
          li.textContent = b;
          bullets.appendChild(li);
        });

        const colorWrap = document.getElementById("pdp-colors");
        const swatchWrap = document.getElementById("pdp-color-swatches");
        const colorNameEl = document.getElementById("pdp-color-name");
        if (!colors.length) {
          colorWrap.hidden = true;
          swatchWrap.innerHTML = "";
        } else {
          colorWrap.hidden = false;
          swatchWrap.innerHTML = "";
          colors.forEach(function (color) {
            const swatch = document.createElement("button");
            swatch.type = "button";
            swatch.className =
              "co-swatch" + (selectedColor && selectedColor.id === color.id ? " is-selected" : "");
            paintSwatch(swatch, color);
            swatch.setAttribute("aria-label", color.name);
            swatch.title = color.name;
            swatch.addEventListener("click", function () {
              selectedColor = color;
              colorNameEl.textContent = color.name;
              document.getElementById("pdp-image").src =
                color.image || product.image;
              swatchWrap.querySelectorAll(".co-swatch").forEach(function (n) {
                n.classList.remove("is-selected");
              });
              swatch.classList.add("is-selected");
            });
            swatchWrap.appendChild(swatch);
          });
          colorNameEl.textContent = selectedColor ? selectedColor.name : "";
        }

        const sizeWrap = document.getElementById("pdp-sizes");
        const sizeChips = document.getElementById("pdp-size-chips");
        if (!sizes.length) {
          sizeWrap.hidden = true;
          sizeChips.innerHTML = "";
        } else {
          sizeWrap.hidden = false;
          sizeChips.innerHTML = "";
          sizes.forEach(function (size) {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "co-size-chip";
            chip.textContent = size.name;
            chip.addEventListener("click", function () {
              selectedSize = size;
              sizeChips.querySelectorAll(".co-size-chip").forEach(function (n) {
                n.classList.remove("is-selected");
              });
              chip.classList.add("is-selected");
              document.getElementById("pdp-variant-error").hidden = true;
            });
            sizeChips.appendChild(chip);
          });
        }

        const toast = document.getElementById("pdp-toast");
        const variantError = document.getElementById("pdp-variant-error");
        toast.hidden = true;
        variantError.hidden = true;

        function selectionOrError() {
          if (colors.length && !selectedColor) {
            variantError.hidden = false;
            variantError.textContent = "Please select a color.";
            return null;
          }
          if (sizes.length && !selectedSize) {
            variantError.hidden = false;
            variantError.textContent = "Please select a size.";
            return null;
          }
          variantError.hidden = true;
          return { color: selectedColor, size: selectedSize, qty: pdpQty };
        }

        document.getElementById("pdp-add").onclick = function () {
          const selection = selectionOrError();
          if (!selection) return;
          addToCart(product, selection);
          toast.hidden = false;
          toast.textContent = "Added to cart";
          setTimeout(function () { toast.hidden = true; }, 1600);
        };
        document.getElementById("pdp-checkout-now").onclick = function () {
          const selection = selectionOrError();
          if (!selection) return;
          addToCart(product, selection);
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

      window.addEventListener("popstate", onOutfitPopState);

      function onOutfitPopState() {
        const match = (location.hash || "").match(/^#product\/(.+)$/);
        if (match) openProduct(match[1], false);
        else showCatalog();
      }

      var pdpQtyMinus = document.getElementById("pdp-qty-minus");
      var pdpQtyPlus = document.getElementById("pdp-qty-plus");
      if (pdpQtyMinus) {
        pdpQtyMinus.addEventListener("click", function () {
          pdpQty = Math.max(1, pdpQty - 1);
          var el = document.getElementById("pdp-qty-value");
          if (el) el.textContent = String(pdpQty);
        });
      }
      if (pdpQtyPlus) {
        pdpQtyPlus.addEventListener("click", function () {
          pdpQty += 1;
          var el = document.getElementById("pdp-qty-value");
          if (el) el.textContent = String(pdpQty);
        });
      }

      window.__swiftWaveLegacyCleanup = function () {
        window.removeEventListener("popstate", onOutfitPopState);
        window.__swiftWaveLegacyCleanup = undefined;
      };

      document.getElementById("cart-toggle").addEventListener("click", openCart);
      var heroCartBtn = document.getElementById("hero-cart-btn");
      if (heroCartBtn) heroCartBtn.addEventListener("click", openCart);
      document.getElementById("cart-close").addEventListener("click", closeCart);
      document.getElementById("cart-backdrop").addEventListener("click", closeCart);
      document.getElementById("open-checkout").addEventListener("click", openCheckout);
      var clearCartBtn = document.getElementById("clear-cart");
      if (clearCartBtn) {
        var clearArmed = false;
        clearCartBtn.addEventListener("click", function () {
          if (!cart.length) return;
          if (!clearArmed) {
            clearArmed = true;
            clearCartBtn.textContent = "Confirm clear";
            window.setTimeout(function () {
              clearArmed = false;
              clearCartBtn.textContent = "Clear cart";
            }, 4000);
            return;
          }
          clearArmed = false;
          clearCartBtn.textContent = "Clear cart";
          clearCartState();
        });
      }
      document.getElementById("checkout-close").addEventListener("click", closeCheckout);
      document.getElementById("checkout-backdrop").addEventListener("click", closeCheckout);

      checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (checkoutProcessing) return;

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
          var extra = [];
          if (item.colorName) extra.push("Color: " + item.colorName);
          if (item.sizeName) extra.push("Size: " + item.sizeName);
          lines.push(
            "• " + item.title +
            (extra.length ? " (" + extra.join(", ") + ")" : "") +
            " × " + item.qty + " — " + formatTotal(item.priceNum * item.qty)
          );
        });
        const total = cartTotal();
        if (total > 0) lines.push("", "*Estimated total:* " + formatTotal(total));
        lines.push("", "_Sent from Swift Wave Outfit checkout_");

        const orderPayload = {
          company_slug: COMPANY_SLUG,
          customer_name: name,
          customer_phone: mobile,
          currency: cartCurrency(),
          items: cart.map(function (item) {
            return {
              product_id: item.dbId || null,
              product_name: item.title,
              quantity: item.qty,
              unit_price: item.priceNum || parsePrice(item.price),
              original_unit_price: item.comparePriceNum || item.priceNum || parsePrice(item.price),
              discount_amount: item.discountAmount || 0,
              product_color_id: item.colorId || null,
              selected_color: item.colorName || null,
              selected_size: item.sizeName || null
            };
          })
        };

        var wa = window.SwiftWaveWhatsApp;
        var message = lines.join("\n");
        if (!wa.buildWhatsAppUrl(WHATSAPP_NUMBER, message)) {
          err.hidden = false;
          err.textContent = wa.UNAVAILABLE_MESSAGE;
          return;
        }

        checkoutProcessing = true;
        if (checkoutSubmitBtn) {
          checkoutSubmitBtn.disabled = true;
          checkoutSubmitBtn.textContent = "Preparing your order...";
        }

        fetch("/api/public/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload)
        })
          .then(function (res) {
            return res.json().then(function (data) {
              return { ok: res.ok, data: data };
            });
          })
          .then(function (result) {
            if (!result.ok || !result.data.ok) {
              throw new Error("order_failed");
            }
            return fetch("/api/public/company/" + COMPANY_SLUG)
              .then(function (res) {
                return res.ok ? res.json() : null;
              })
              .then(function (companyData) {
                var number =
                  companyData && companyData.whatsapp_number
                    ? companyData.whatsapp_number
                    : WHATSAPP_NUMBER;
                number = wa.normalizeWhatsAppNumber(number);
                var url = wa.buildWhatsAppUrl(number, message);
                if (!url || !wa.openWhatsAppUrl(url)) {
                  throw new Error("whatsapp_failed");
                }
                clearCartState();
                closeCheckout();
              });
          })
          .catch(function (failure) {
            err.hidden = false;
            err.textContent =
              failure && failure.message === "whatsapp_failed"
                ? "Couldn't open WhatsApp. Your cart is still saved."
                : "Couldn't place your order. Please try again.";
          })
          .finally(function () {
            checkoutProcessing = false;
            if (checkoutSubmitBtn) {
              checkoutSubmitBtn.disabled = false;
              checkoutSubmitBtn.innerHTML = checkoutSubmitDefaultHtml;
              if (typeof lucide !== "undefined") lucide.createIcons();
            }
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

      fetch("/api/public/catalog/" + COMPANY_SLUG, { cache: "no-store" })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (body) {
              console.error("[Outfit catalog]", res.status, body);
              return null;
            }).catch(function () {
              console.error("[Outfit catalog]", res.status);
              return null;
            });
          }
          return res.json();
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
