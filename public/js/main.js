/* Swift Wave Group — Shared Interactions */

(function initSwiftWaveMain() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileBackdrop = mobileMenu
    ? mobileMenu.querySelector(".mobile-menu-backdrop")
    : null;

  function setMenuOpen(open) {
    if (!mobileMenu || !mobileToggle) return;
    mobileMenu.classList.toggle("is-open", open);
    mobileToggle.classList.toggle("is-open", open);
    mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("menu-open", open);
  }

  if (mobileToggle && mobileMenu && mobileToggle.dataset.swBound !== "true") {
    mobileToggle.dataset.swBound = "true";
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-controls", "mobile-menu");

    mobileToggle.addEventListener("click", function () {
      setMenuOpen(!mobileMenu.classList.contains("is-open"));
    });

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener("click", function () {
        setMenuOpen(false);
      });
    }

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMenuOpen(false);
      }
    });
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".fade-up").forEach(function (el) {
    observer.observe(el);
  });

  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const counters = entry.target.querySelectorAll(".stat-counter");
        counters.forEach(function (counter) {
          if (counter.dataset.animated === "true") return;
          counter.dataset.animated = "true";

          const target = parseInt(counter.dataset.target, 10);
          let current = 0;
          const step = Math.ceil(target / 60);
          const interval = setInterval(function () {
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
  if (contactForm && contactForm.dataset.swBound !== "true") {
    contactForm.dataset.swBound = "true";
    var contactSubmitting = false;

    function isValidContact(value) {
      var trimmed = String(value || "").trim();
      if (trimmed.length < 3 || trimmed.length > 120) return false;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;
      var digits = trimmed.replace(/\D/g, "");
      return digits.length >= 9 && digits.length <= 15;
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (contactSubmitting) return;

      var success = document.getElementById("form-success");
      var error = document.getElementById("form-error");
      var submitBtn = document.getElementById("contact-submit");
      var name = (document.getElementById("cf-name").value || "").trim();
      var contact = (document.getElementById("cf-contact").value || "").trim();
      var subject = (document.getElementById("cf-subject").value || "general").trim();
      var message = (document.getElementById("cf-msg").value || "").trim();

      if (success) success.classList.add("is-hidden");
      if (error) {
        error.classList.add("is-hidden");
        error.textContent = "";
      }

      if (!name) {
        if (error) {
          error.textContent = "Please enter your full name.";
          error.classList.remove("is-hidden");
        }
        return;
      }
      if (!isValidContact(contact)) {
        if (error) {
          error.textContent = "Please enter a valid email address or phone number.";
          error.classList.remove("is-hidden");
        }
        return;
      }
      if (!message) {
        if (error) {
          error.textContent = "Please enter your message.";
          error.classList.remove("is-hidden");
        }
        return;
      }

      contactSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          contact: contact,
          subject: subject,
          message: message
        })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.data.ok) {
            throw new Error("failed");
          }
          contactForm.reset();
          if (success) success.classList.remove("is-hidden");
        })
        .catch(function () {
          if (error) {
            error.textContent = "Something went wrong. Please try again.";
            error.classList.remove("is-hidden");
          }
        })
        .finally(function () {
          contactSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          }
        });
    });
  }

  const navbar = document.getElementById("navbar");
  if (navbar && navbar.dataset.swBound !== "true") {
    navbar.dataset.swBound = "true";
    const onScroll = function () {
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
    toastEl.innerHTML =
      '<span class="dot" aria-hidden="true"></span><span>Coming soon</span>';
    document.body.appendChild(toastEl);
  }

  if (!window.__swComingSoonBound) {
    window.__swComingSoonBound = true;
    let toastTimer = null;
    function showComingSoon() {
      toastEl.classList.add("is-visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toastEl.classList.remove("is-visible");
      }, 2600);
    }

    document.addEventListener("click", function (e) {
      const link = e.target.closest(
        "a[data-coming-soon], a.coming-soon-link, a[href*='catering.html'], a[href*='travels.html'], a[href='/companies/catering'], a[href='/companies/travels']"
      );
      if (!link) return;
      e.preventDefault();
      showComingSoon();
    });
  }
})();
