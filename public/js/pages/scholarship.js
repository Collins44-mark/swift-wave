/* Migrated inline script from companies/scholarship.html */
(function(){

    (function () {
      var WHATSAPP_NUMBER = null;
      var COMPANY_SLUG = "scholarship";
      var form = document.getElementById("scholarship-form");
      var errorEl = document.getElementById("sch-error");
      var fieldOfStudy = document.getElementById("fieldOfStudy");

      function toggleOther(selectId, fieldId, otherInputId) {
        var select = document.getElementById(selectId);
        var wrap = document.getElementById(fieldId);
        var other = document.getElementById(otherInputId);
        var show = select.value === "Other";
        wrap.hidden = !show;
        other.required = show;
        if (!show) other.value = "";
      }

      document.getElementById("nationality").addEventListener("change", function () {
        toggleOther("nationality", "field-nationality-other", "nationalityOther");
      });
      document.getElementById("destination").addEventListener("change", function () {
        toggleOther("destination", "field-destination-other", "destinationOther");
      });
      fieldOfStudy.addEventListener("change", function () {
        toggleOther("fieldOfStudy", "field-study-other", "fieldOfStudyOther");
      });

      function val(id) {
        return (document.getElementById(id).value || "").trim();
      }

      function resolveSelect(id, otherId) {
        var v = val(id);
        if (v === "Other") return val(otherId) || "Other";
        return v;
      }

      function showError(msg) {
        errorEl.hidden = !msg;
        errorEl.textContent = msg || "";
      }

      var companyLoaded = fetch("/api/public/company/" + COMPANY_SLUG)
        .then(function (res) {
          return res.ok ? res.json() : null;
        })
        .then(function (data) {
          if (data && data.whatsapp_number) {
            WHATSAPP_NUMBER = window.SwiftWaveWhatsApp.normalizeWhatsAppNumber(
              data.whatsapp_number
            );
          }
        })
        .catch(function () {});

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        showError("");

        var fullName = val("fullName");
        var mobile = val("mobile");
        var nationality = resolveSelect("nationality", "nationalityOther");
        var destination = resolveSelect("destination", "destinationOther");
        var notes = val("notes");
        var educationLevel = val("educationLevel");
        var field = resolveSelect("fieldOfStudy", "fieldOfStudyOther");

        if (!fullName) return showError("Please enter your full name.");
        if (!mobile || mobile.replace(/\D/g, "").length < 9) {
          return showError("Please enter a valid mobile number.");
        }
        if (!val("nationality") || (val("nationality") === "Other" && !val("nationalityOther"))) {
          return showError("Please select your nationality.");
        }
        if (!val("destination") || (val("destination") === "Other" && !val("destinationOther"))) {
          return showError("Please select the country you want to go to.");
        }
        if (!educationLevel) return showError("Please select your education level.");
        if (!val("fieldOfStudy") || (val("fieldOfStudy") === "Other" && !val("fieldOfStudyOther"))) {
          return showError("Please select your field of study.");
        }

        var lines = [
          "*Swift Wave Scholarship Application*",
          "",
          "*Full name:* " + fullName,
          "*Mobile:* " + mobile,
          "*Nationality:* " + nationality,
          "*Destination:* " + destination,
          "*Education level:* " + educationLevel,
          "*Field of study:* " + field
        ];

        if (notes) lines.push("*Notes:* " + notes);
        lines.push("", "_Sent from Swift Wave Scholarship form_");

        var payload = {
          company_slug: COMPANY_SLUG,
          inquiry_type: "scholarship_application",
          customer_name: fullName,
          customer_phone: mobile,
          payload: {
            nationality: nationality,
            destination: destination,
            education_level: educationLevel,
            field_of_study: field,
            notes: notes || null
          }
        };

        companyLoaded.then(function () {
          var wa = window.SwiftWaveWhatsApp;
          var url = wa.buildWhatsAppUrl(WHATSAPP_NUMBER, lines.join("\n"));
          if (!url) {
            return showError(wa.UNAVAILABLE_MESSAGE);
          }

          fetch("/api/public/inquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
            .catch(function () {})
            .then(function () {
              window.open(url, "_blank", "noopener,noreferrer");
            });
        });
      });

      if (typeof lucide !== "undefined") lucide.createIcons();
    })();
  
})();
