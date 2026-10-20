/* =========================================================
   OROVAN — Demo checkout interactions
   This demo does not send, save, or store any form data.
   No localStorage or sessionStorage is used.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     WhatsApp configuration
     Change this number to update all WhatsApp links on this page.
     Use the full international number without "+", spaces,
     or dashes. Example: 919430932904
     --------------------------------------------------------- */
  var WHATSAPP_NUMBER = "919430932904";

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (link) {
    link.href = link.href.replace(
      /^https:\/\/wa\.me\/\d+/,
      "https://wa.me/" + WHATSAPP_NUMBER
    );
  });

  var YEAR = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = YEAR;
  });

  /* ---------------------------------------------------------
     QR image fallback
     --------------------------------------------------------- */
  var qrImage = document.querySelector("[data-qr-image]");
  var qrFallback = document.querySelector("[data-qr-fallback]");

  function showQrFallback() {
    if (!qrImage || !qrFallback) return;
    qrImage.hidden = true;
    qrFallback.hidden = false;
  }

  if (qrImage && qrFallback) {
    qrImage.addEventListener("error", showQrFallback, { once: true });
    if (qrImage.complete && qrImage.naturalWidth === 0) {
      showQrFallback();
    }
  }

  /* ---------------------------------------------------------
     Demo form validation
     --------------------------------------------------------- */
  var form = document.getElementById("demo-checkout-form");
  var status = document.getElementById("form-status");
  var touched = {};

  if (form) {
    var fields = {
      fullName: {
        input: document.getElementById("full-name"),
        error: document.getElementById("full-name-error"),
        validate: function (value) {
          var name = value.trim();
          if (name.length < 2) {
            return "Please enter your full name.";
          }
          if (/\d/.test(name)) {
            return "Please enter a name without numbers.";
          }
          return "";
        }
      },
      mobile: {
        input: document.getElementById("mobile"),
        error: document.getElementById("mobile-error"),
        validate: function (value) {
          if (!value.trim()) {
            return "Please enter your mobile number.";
          }

          var digits = value.replace(/\D/g, "");

          if (digits.indexOf("0091") === 0 && digits.length === 14) {
            digits = digits.slice(4);
          } else if (digits.length === 12 && digits.indexOf("91") === 0) {
            digits = digits.slice(2);
          } else if (digits.length === 11 && digits.charAt(0) === "0") {
            digits = digits.slice(1);
          }

          if (!/^[6-9]\d{9}$/.test(digits)) {
            return "Enter a valid 10-digit Indian mobile number.";
          }
          return "";
        }
      },
      email: {
        input: document.getElementById("email"),
        error: document.getElementById("email-error"),
        validate: function (value) {
          var email = value.trim();
          if (!email) {
            return "";
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            return "Enter a valid email address, or leave this field blank.";
          }
          return "";
        }
      },
      address: {
        input: document.getElementById("address"),
        error: document.getElementById("address-error"),
        validate: function (value) {
          if (value.trim().length < 6) {
            return "Please enter a complete delivery address.";
          }
          return "";
        }
      },
      city: {
        input: document.getElementById("city"),
        error: document.getElementById("city-error"),
        validate: function (value) {
          if (value.trim().length < 2) {
            return "Please enter your city.";
          }
          return "";
        }
      },
      state: {
        input: document.getElementById("state"),
        error: document.getElementById("state-error"),
        validate: function (value) {
          if (value.trim().length < 2) {
            return "Please enter your state.";
          }
          return "";
        }
      },
      pin: {
        input: document.getElementById("pin"),
        error: document.getElementById("pin-error"),
        validate: function (value) {
          var pin = value.replace(/\s/g, "");
          if (!/^[1-9]\d{5}$/.test(pin)) {
            return "Enter a valid 6-digit PIN code.";
          }
          return "";
        }
      }
    };

    function setFieldState(config, message) {
      var field = config.input.closest(".field");

      if (message) {
        if (field) field.classList.add("has-error");
        config.input.setAttribute("aria-invalid", "true");
        config.error.textContent = message;
        return false;
      }

      if (field) field.classList.remove("has-error");
      config.input.removeAttribute("aria-invalid");
      config.error.textContent = "";
      return true;
    }

    function validateField(key) {
      var config = fields[key];
      var message = config.validate(config.input.value);
      return setFieldState(config, message);
    }

    Object.keys(fields).forEach(function (key) {
      var input = fields[key].input;

      if (!input) return;

      input.addEventListener("blur", function () {
        touched[key] = true;
        validateField(key);
      });

      input.addEventListener("input", function () {
        if (touched[key]) {
          validateField(key);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;

      Object.keys(fields).forEach(function (key) {
        touched[key] = true;
        var isValid = validateField(key);
        if (!isValid && !firstInvalid) {
          firstInvalid = fields[key].input;
        }
      });

      if (!status) return;

      status.hidden = false;

      if (firstInvalid) {
        status.classList.add("is-error");
        status.innerHTML =
          "<strong>Please review the highlighted fields.</strong>" +
          "Some details are missing or incomplete. No order has been placed, " +
          "nothing was sent, and no payment has been requested.";
        firstInvalid.focus();
        return;
      }

      status.classList.remove("is-error");
      status.innerHTML =
        "<strong>Demo only &mdash; no order has been placed.</strong>" +
        "This form does not send, save, or process your details, and no payment " +
        "has been requested. OROVAN fragrances are coming soon. " +
        '<a href="https://wa.me/' +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(
          "Hello OROVAN, I would like to know more about the collection."
        ) +
        '" target="_blank" rel="noopener noreferrer">Message OROVAN on WhatsApp</a> ' +
        "for launch updates.";

      status.focus();

      if (typeof status.scrollIntoView === "function") {
        var reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        status.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    });
  }
})();
