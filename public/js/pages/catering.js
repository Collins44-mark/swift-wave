/* Migrated inline script from companies/catering.html */
(function () {
  function showToast() {
    var toast = document.getElementById("coming-soon-toast");
    if (toast) toast.classList.add("is-visible");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showToast);
  } else {
    showToast();
  }
})();
