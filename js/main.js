/* Swift Wave Group — Shared Interactions */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  function setMenuOpen(open) {
    if (!mobileMenu || !mobileToggle) return;
    mobileMenu.classList.toggle("hidden", !open);
    mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
    const icon = mobileToggle.querySelector("[data-lucide]");
    if (icon) {
      icon.setAttribute("data-lucide", open ? "x" : "menu");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (mobileToggle && mobileMenu) {
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-controls", "mobile-menu");

    mobileToggle.addEventListener("click", () => {
      setMenuOpen(mobileMenu.classList.contains("hidden"));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });

    // Close mobile menu when switching to desktop
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMenuOpen(false);
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counters = entry.target.querySelectorAll(".stat-counter");
        counters.forEach((counter) => {
          if (counter.dataset.animated === "true") return;
          counter.dataset.animated = "true";

          const target = parseInt(counter.dataset.target, 10);
          let current = 0;
          const step = Math.ceil(target / 60);
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            counter.textContent = current.toLocaleString() + "+";
          }, 30);
        });

        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  const statsSection = document.getElementById("stats-section");
  if (statsSection) counterObserver.observe(statsSection);

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = document.getElementById("form-success");
      if (success) {
        success.classList.remove("hidden");
        contactForm.reset();
        setTimeout(() => success.classList.add("hidden"), 4000);
      }
    });
  }

  const navbar = document.getElementById("navbar");
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("shadow-md", window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Coming soon bubble for unfinished company / feature links
  let toastEl = document.getElementById("coming-soon-toast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "coming-soon-toast";
    toastEl.className = "coming-soon-toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.innerHTML = '<span class="dot" aria-hidden="true"></span><span>Coming soon</span>';
    document.body.appendChild(toastEl);
  }

  let toastTimer = null;
  function showComingSoon() {
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-coming-soon], a.coming-soon-link");
    if (!link) return;
    e.preventDefault();
    showComingSoon();
  });
});
