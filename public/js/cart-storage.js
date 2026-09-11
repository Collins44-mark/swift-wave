/* Client-side cart persistence for ecommerce storefronts */
(function (global) {
  function sanitizeItems(parsed) {
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(function (item) {
        if (!item || typeof item !== "object") return null;
        var qty = Number(item.qty);
        if (!Number.isFinite(qty) || qty < 1) return null;
        var priceNum = Number(item.priceNum);
        if (!Number.isFinite(priceNum) || priceNum < 0) priceNum = 0;
        var lineId = String(item.lineId || "").trim();
        if (!lineId) {
          lineId = [item.dbId || item.id, item.colorId, item.sizeName]
            .filter(Boolean)
            .join("|");
        }
        if (!lineId) return null;
        item.qty = Math.floor(qty);
        item.priceNum = priceNum;
        item.lineId = lineId;
        return item;
      })
      .filter(Boolean);
  }

  function createCartStore(companySlug) {
    var key = "swiftwave_cart_" + companySlug;

    return {
      load: function () {
        try {
          var raw = localStorage.getItem(key);
          if (!raw) return [];
          return sanitizeItems(JSON.parse(raw));
        } catch (_err) {
          return [];
        }
      },
      save: function (cart) {
        try {
          var items = sanitizeItems(cart);
          localStorage.setItem(key, JSON.stringify(items));
        } catch (_err) {
          /* ignore quota / private mode */
        }
      },
      clear: function () {
        try {
          localStorage.setItem(key, "[]");
        } catch (_err) {
          try {
            localStorage.removeItem(key);
          } catch (_ignored) {
            /* ignore */
          }
        }
      },
    };
  }

  global.SwiftWaveCart = {
    createCartStore: createCartStore,
  };
})(typeof window !== "undefined" ? window : globalThis);
