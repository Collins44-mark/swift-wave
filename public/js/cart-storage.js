/* Client-side cart persistence for ecommerce storefronts */
(function (global) {
  var PREFIX = "swiftwave_cart_";

  function cloneItem(item) {
    var qty = Math.floor(Number(item.qty));
    if (!Number.isFinite(qty) || qty < 1) return null;
    var priceNum = Number(item.priceNum);
    if (!Number.isFinite(priceNum) || priceNum < 0) priceNum = 0;
    var productId = String(item.dbId || item.id || "").trim();
    var colorId = item.colorId == null ? "" : String(item.colorId);
    var sizeName = item.sizeName == null ? "" : String(item.sizeName);
    var lineId = String(item.lineId || "").trim();
    if (!lineId) {
      lineId = [productId, colorId, sizeName].join("|");
    }
    if (!lineId || lineId === "||") return null;
    var next = {};
    Object.keys(item).forEach(function (key) {
      next[key] = item[key];
    });
    next.qty = qty;
    next.priceNum = priceNum;
    next.lineId = lineId;
    next.dbId = item.dbId || productId || null;
    next.colorId = colorId || null;
    next.sizeName = sizeName;
    return next;
  }

  function sanitizeItems(parsed) {
    if (!Array.isArray(parsed)) return [];
    return parsed.map(cloneItem).filter(Boolean);
  }

  function readKey(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      return sanitizeItems(JSON.parse(raw));
    } catch (_err) {
      return [];
    }
  }

  function writeKey(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  function removeKey(key) {
    try {
      localStorage.removeItem(key);
    } catch (_err) {
      /* ignore */
    }
  }

  function legacyKeysFor(slug) {
    var keys = ["swiftwave_cart", slug + "_cart"];
    if (slug === "outfit") keys.push("outfit_cart");
    if (slug === "medical") keys.push("medical_cart");
    return keys.filter(function (key, index, all) {
      return all.indexOf(key) === index;
    });
  }

  function createCartStore(companySlug) {
    var key = PREFIX + companySlug;

    function persist(items) {
      var next = sanitizeItems(items);
      try {
        writeKey(key, next);
        legacyKeysFor(companySlug).forEach(function (legacy) {
          if (legacy !== key) removeKey(legacy);
        });
      } catch (_err) {
        try {
          writeKey(key, next);
        } catch (_ignored) {
          /* quota / private mode */
        }
      }
      return next;
    }

    return {
      load: function () {
        var items = readKey(key);
        if (items.length) {
          persist(items);
          return items;
        }
        var migrated = [];
        legacyKeysFor(companySlug).forEach(function (legacy) {
          if (legacy === key) return;
          var found = readKey(legacy);
          if (found.length) migrated = migrated.concat(found);
        });
        return persist(migrated);
      },
      save: function (cart) {
        return persist(cart);
      },
      clear: function () {
        return persist([]);
      },
    };
  }

  global.SwiftWaveCart = {
    createCartStore: createCartStore,
  };
})(typeof window !== "undefined" ? window : globalThis);
