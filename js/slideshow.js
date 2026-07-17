/* Swift Wave — modern background image slideshows */
(function () {
  function initSlideshow(root) {
    const slides = Array.from(root.querySelectorAll(".slideshow-slide"));
    if (slides.length < 2) return;

    const interval = parseInt(root.dataset.interval || "5500", 10);
    let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (index < 0) index = 0;

    // Build dots if a dots container exists or should be created
    let dotsWrap = root.querySelector(".slideshow-dots");
    const showDots = root.dataset.dots !== "false";

    if (showDots && !dotsWrap) {
      dotsWrap = document.createElement("div");
      dotsWrap.className = "slideshow-dots";
      dotsWrap.setAttribute("aria-hidden", "true");
      root.appendChild(dotsWrap);
    }

    const dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slideshow-dot" + (i === index ? " is-active" : "");
        btn.setAttribute("aria-label", "Go to slide " + (i + 1));
        btn.addEventListener("click", () => goTo(i, true));
        dotsWrap.appendChild(btn);
        dots.push(btn);
      });
    }

    function goTo(next, userTriggered) {
      slides[index].classList.remove("is-active");
      if (dots[index]) dots[index].classList.remove("is-active");

      index = (next + slides.length) % slides.length;

      // Restart ken-burns by forcing reflow
      const active = slides[index];
      active.classList.remove("is-active");
      void active.offsetWidth;
      active.classList.add("is-active");
      if (dots[index]) dots[index].classList.add("is-active");

      if (userTriggered) restartTimer();
    }

    let timer = null;
    function restartTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1, false), interval);
    }

    // Pause when tab is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(timer);
      else restartTimer();
    });

    restartTimer();
  }

  function mount() {
    document.querySelectorAll("[data-slideshow]").forEach(initSlideshow);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
