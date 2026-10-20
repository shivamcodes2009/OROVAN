/* =========================================================
   OROVAN — Main interactions
   - WhatsApp enquiry links
   - Hero slider (buttons, dots, autoplay, swipe, keyboard)
   - Responsive mobile navigation
   - Missing-image fallbacks
   - Current year and navigation state
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     WhatsApp configuration
     Change the number below to update every product enquiry.
     Use the full international number without "+", spaces,
     or dashes. Example: 919430932904
     --------------------------------------------------------- */
  var WHATSAPP_NUMBER = "919430932904";

  var productLinks = document.querySelectorAll("[data-whatsapp-product]");

  productLinks.forEach(function (link) {
    var product = link.getAttribute("data-whatsapp-product");
    var category = link.getAttribute("data-whatsapp-category");
    var message =
      "Hello OROVAN, I would like to enquire about " +
      product +
      (category ? " (" + category + ")" : "") +
      ". Please share launch details.";

    link.href =
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.setAttribute(
      "aria-label",
      "Enquire on WhatsApp about " + product + " (opens in a new tab)"
    );
  });

  // Keep the general contact links in sync with the number above.
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (link) {
    link.href = link.href.replace(
      /^https:\/\/wa\.me\/\d+/,
      "https://wa.me/" + WHATSAPP_NUMBER
    );
  });

  /* ---------------------------------------------------------
     Missing image fallbacks
     Images that cannot load are replaced with an on-brand
     placeholder instead of a broken image icon.
     --------------------------------------------------------- */
  document.querySelectorAll(".slide img, .product-media img").forEach(function (img) {
    var fallback = img.parentElement.querySelector(
      ".slide-fallback, .product-fallback"
    );

    if (!fallback) return;

    function showFallback() {
      img.hidden = true;
      fallback.hidden = false;
    }

    img.addEventListener("error", showFallback, { once: true });

    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    }
  });

  /* ---------------------------------------------------------
     Dynamic copyright year
     --------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  /* ---------------------------------------------------------
     Header elevation on scroll
     --------------------------------------------------------- */
  var header = document.getElementById("site-header");
  var lastScrollState = false;

  function updateHeader() {
    if (!header) return;
    var isScrolled = window.scrollY > 8;
    if (isScrolled !== lastScrollState) {
      header.classList.toggle("is-scrolled", isScrolled);
      lastScrollState = isScrolled;
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");

  if (navToggle && nav) {
    var navLabel = navToggle.querySelector(".sr-only");

    function setMenu(open, returnFocus) {
      navToggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (navLabel) {
        navLabel.textContent = open ? "Close menu" : "Open menu";
      }
      if (!open && returnFocus) {
        navToggle.focus();
      }
    }

    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen, false);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false, false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false, true);
      }
    });

    document.addEventListener("click", function (event) {
      if (
        nav.classList.contains("is-open") &&
        !nav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        setMenu(false, false);
      }
    });

    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth > 860 && nav.classList.contains("is-open")) {
          setMenu(false, false);
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     Slider
     --------------------------------------------------------- */
  var slider = document.querySelector("[data-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(
      slider.querySelectorAll("[data-slide]")
    );
    var prevButton = slider.querySelector("[data-slider-prev]");
    var nextButton = slider.querySelector("[data-slider-next]");
    var dots = Array.prototype.slice.call(
      slider.querySelectorAll("[data-slide-to]")
    );
    var autoplayButton = slider.querySelector("[data-slider-autoplay]");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    var currentIndex = 0;
    var autoplayTimer = null;
    var userPaused = reducedMotion.matches;
    var touchStartX = null;
    var touchStartY = null;
    var AUTOPLAY_DELAY = 6500;

    function showSlide(nextIndex) {
      if (!slides.length) return;

      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        var isActive = index === currentIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach(function (dot, index) {
        if (index === currentIndex) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function syncAutoplay() {
      var shouldPlay = !userPaused && !document.hidden && slides.length > 1;

      if (shouldPlay && !autoplayTimer) {
        autoplayTimer = window.setInterval(function () {
          showSlide(currentIndex + 1);
        }, AUTOPLAY_DELAY);
      } else if (!shouldPlay && autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }

      if (autoplayButton) {
        autoplayButton.setAttribute("data-playing", String(shouldPlay));
        autoplayButton.setAttribute(
          "aria-label",
          shouldPlay ? "Pause slideshow" : "Play slideshow"
        );
      }
    }

    function restartAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      syncAutoplay();
    }

    function goTo(nextIndex) {
      showSlide(nextIndex);
      restartAutoplay();
    }

    showSlide(0);
    syncAutoplay();

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        goTo(currentIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        goTo(currentIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-slide-to"));
        if (!Number.isNaN(target)) {
          goTo(target);
        }
      });
    });

    if (autoplayButton) {
      autoplayButton.addEventListener("click", function () {
        userPaused = !userPaused;
        syncAutoplay();
      });
    }

    document.addEventListener("visibilitychange", syncAutoplay);

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", function (event) {
        if (event.matches) {
          userPaused = true;
        }
        syncAutoplay();
      });
    }

    slider.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(currentIndex + 1);
      }
    });

    slider.addEventListener(
      "touchstart",
      function (event) {
        if (event.touches.length !== 1) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      function (event) {
        if (touchStartX === null || !event.changedTouches.length) return;

        var deltaX = event.changedTouches[0].clientX - touchStartX;
        var deltaY = event.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > 46 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
          goTo(currentIndex + (deltaX < 0 ? 1 : -1));
        }

        touchStartX = null;
        touchStartY = null;
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     Current section indicator in the main navigation
     --------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".primary-nav a[href^='#']")
  );

  if ("IntersectionObserver" in window && navLinks.length) {
    var sections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href");
        return id && id.length > 1 ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          navLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-38% 0px -56% 0px" }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }
})();
