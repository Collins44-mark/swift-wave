/* Client-side cart persistence for ecommerce storefronts */
(function (global) {
  function createCartStore(companySlug) {
    var key = "swiftwave_cart_" + companySlug;

    return {
      load: function () {
        try {
          var raw = localStorage.getItem(key);
          if (!raw) return [];
          var parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch (_err) {
          return [];
        }
      },
      save: function (cart) {
        try {
          if (!cart || !cart.length) {
            localStorage.removeItem(key);
            return;
          }
          localStorage.setItem(key, JSON.stringify(cart));
        } catch (_err) {
          /* ignore quota / private mode */
        }
      },
      clear: function () {
        try {
          localStorage.removeItem(key);
        } catch (_err) {
          /* ignore */
        }
      },
    };
  }

  global.SwiftWaveCart = {
    createCartStore: createCartStore,
  };
})(typeof window !== "undefined" ? window : globalThis);
