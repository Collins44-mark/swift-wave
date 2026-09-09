/* Shared WhatsApp URL helpers for public company storefronts */
(function (global) {
  function normalizeWhatsAppNumber(input) {
    if (input == null) return null;
    var digits = String(input).replace(/\D/g, "");
    if (!digits) return null;

    while (digits.charAt(0) === "0") {
      digits = digits.slice(1);
    }
    if (!digits) return null;

    if (digits.length === 9) {
      digits = "255" + digits;
    }

    if (digits.length < 10 || digits.length > 15 || digits.charAt(0) === "0") {
      return null;
    }

    return digits;
  }

  function buildWhatsAppUrl(number, message) {
    var normalized = normalizeWhatsAppNumber(number);
    if (!normalized) return null;

    var url = "https://wa.me/" + normalized;
    if (message != null && message !== "") {
      url += "?text=" + encodeURIComponent(message);
    }
    return url;
  }

  global.SwiftWaveWhatsApp = {
    normalizeWhatsAppNumber: normalizeWhatsAppNumber,
    buildWhatsAppUrl: buildWhatsAppUrl,
    UNAVAILABLE_MESSAGE: "WhatsApp ordering is currently unavailable.",
  };
})(typeof window !== "undefined" ? window : globalThis);
