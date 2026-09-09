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

    if (digits.length < 10 || digits.length > 15) {
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

  /** Reliable on mobile after async work — avoids popup blockers breaking wa.me. */
  function openWhatsAppUrl(url) {
    if (!url) return false;
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  global.SwiftWaveWhatsApp = {
    normalizeWhatsAppNumber: normalizeWhatsAppNumber,
    buildWhatsAppUrl: buildWhatsAppUrl,
    openWhatsAppUrl: openWhatsAppUrl,
    UNAVAILABLE_MESSAGE: "WhatsApp ordering is currently unavailable.",
  };
})(typeof window !== "undefined" ? window : globalThis);
