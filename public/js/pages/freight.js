/* Migrated inline script from companies/freight.html */
(function(){

    (function () {
      var WHATSAPP_NUMBER = null;
      var COMPANY_SLUG = "freight";
      var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      // Collection weekdays by origin hub (0=Sun … 6=Sat)
      var HUB_DAYS = {
        China: [2, 5],
        "Dubai (UAE)": [1, 4],
        India: [3, 6],
        Tanzania: [1, 3, 5],
        Kenya: [2, 4],
        Other: [2, 5]
      };

      var form = document.getElementById("freight-form");
      var pickupFrom = document.getElementById("pickupFrom");
      var destination = document.getElementById("destination");
      var panelSlots = document.getElementById("panel-slots");
      var panelDetails = document.getElementById("panel-details");
      var slotsGrid = document.getElementById("slots-grid");
      var slotsEmpty = document.getElementById("slots-empty");
      var monthLabel = document.getElementById("month-label");
      var errorEl = document.getElementById("fr-error");
      var submitBtn = document.getElementById("fr-submit");
      var selectedSlotKey = null;

      function val(id) {
        return (document.getElementById(id).value || "").trim();
      }

      function resolvePlace(selectId, otherId) {
        var v = val(selectId);
        if (v === "Other") return val(otherId) || "Other";
        return v;
      }

      function toggleOther(selectId, wrapId, otherId) {
        var show = document.getElementById(selectId).value === "Other";
        document.getElementById(wrapId).hidden = !show;
        document.getElementById(otherId).required = show;
        if (!show) document.getElementById(otherId).value = "";
      }

      function hubKey(fromValue) {
        return HUB_DAYS[fromValue] ? fromValue : "Other";
      }

      function formatSlot(date) {
        return WEEKDAYS[date.getDay()] + " " + date.getDate() + " " + MONTHS[date.getMonth()] + " " + date.getFullYear();
      }

      function isoKey(date) {
        var m = date.getMonth() + 1;
        var d = date.getDate();
        return date.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (d < 10 ? "0" : "") + d;
      }

      function buildSlots(fromValue) {
        var days = HUB_DAYS[hubKey(fromValue)] || [2, 5];
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        var today = new Date(year, month, now.getDate());
        today.setHours(0, 0, 0, 0);

        var slots = [];
        var lastDay = new Date(year, month + 1, 0).getDate();
        for (var day = 1; day <= lastDay; day++) {
          var date = new Date(year, month, day);
          if (date < today) continue;
          if (days.indexOf(date.getDay()) === -1) continue;
          slots.push({
            key: isoKey(date),
            label: formatSlot(date),
            weekday: WEEKDAYS[date.getDay()],
            dayNum: day,
            mode: days.indexOf(date.getDay()) === 0 ? "Primary collection" : "Collection day"
          });
        }

        // If late in month and few slots, also show next month
        if (slots.length < 3) {
          var nextMonth = month + 1;
          var nextYear = year;
          if (nextMonth > 11) {
            nextMonth = 0;
            nextYear += 1;
          }
          var nextLast = new Date(nextYear, nextMonth + 1, 0).getDate();
          for (var d2 = 1; d2 <= nextLast && slots.length < 8; d2++) {
            var date2 = new Date(nextYear, nextMonth, d2);
            if (days.indexOf(date2.getDay()) === -1) continue;
            slots.push({
              key: isoKey(date2),
              label: formatSlot(date2),
              weekday: WEEKDAYS[date2.getDay()],
              dayNum: d2,
              mode: "Next month"
            });
          }
        }
        return slots;
      }

      function setStepIndicators(active) {
        document.querySelectorAll("[data-step-indicator]").forEach(function (el) {
          var n = Number(el.getAttribute("data-step-indicator"));
          el.classList.toggle("is-active", n <= active);
        });
      }

      function updateFlow() {
        toggleOther("pickupFrom", "field-from-other", "pickupFromOther");
        toggleOther("destination", "field-to-other", "destinationOther");

        var fromRaw = val("pickupFrom");
        var toRaw = val("destination");
        var fromOk = fromRaw && (fromRaw !== "Other" || val("pickupFromOther"));
        var toOk = toRaw && (toRaw !== "Other" || val("destinationOther"));
        var routeReady = fromOk && toOk && resolvePlace("pickupFrom", "pickupFromOther") !== resolvePlace("destination", "destinationOther");

        selectedSlotKey = null;
        slotsGrid.innerHTML = "";

        if (!routeReady) {
          panelSlots.hidden = true;
          panelDetails.hidden = true;
          submitBtn.disabled = true;
          setStepIndicators(1);
          return;
        }

        panelSlots.hidden = false;
        setStepIndicators(2);

        var fromLabel = resolvePlace("pickupFrom", "pickupFromOther");
        var toLabel = resolvePlace("destination", "destinationOther");
        var slots = buildSlots(fromRaw === "Other" ? "Other" : fromRaw);
        var now = new Date();
        monthLabel.textContent = MONTHS[now.getMonth()] + " " + now.getFullYear() + " · " + fromLabel + " → " + toLabel;

        if (!slots.length) {
          slotsEmpty.hidden = false;
          panelDetails.hidden = true;
          submitBtn.disabled = true;
          return;
        }

        slotsEmpty.hidden = true;
        slots.forEach(function (slot) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "fr-slot";
          btn.setAttribute("aria-pressed", "false");
          btn.dataset.key = slot.key;
          btn.innerHTML =
            '<span class="fr-slot-day">' + slot.weekday + "</span>" +
            '<span class="fr-slot-date">' + slot.dayNum + "</span>" +
            '<span class="fr-slot-meta">' + slot.label.split(" ").slice(2).join(" ") + "</span>" +
            '<span class="fr-slot-mode">' + slot.mode + "</span>";
          btn.addEventListener("click", function () {
            // Single select only — clear any previous choice
            slotsGrid.querySelectorAll(".fr-slot.is-selected").forEach(function (el) {
              el.classList.remove("is-selected");
              el.setAttribute("aria-pressed", "false");
            });

            if (selectedSlotKey === slot.key) {
              selectedSlotKey = null;
              panelDetails.hidden = true;
              submitBtn.disabled = true;
              setStepIndicators(2);
              return;
            }

            selectedSlotKey = slot.key;
            btn.classList.add("is-selected");
            btn.setAttribute("aria-pressed", "true");
            panelDetails.hidden = false;
            submitBtn.disabled = false;
            setStepIndicators(3);
          });
          slotsGrid.appendChild(btn);
        });

        panelDetails.hidden = true;
        submitBtn.disabled = true;
      }

      function showError(msg) {
        errorEl.hidden = !msg;
        errorEl.textContent = msg || "";
      }

      pickupFrom.addEventListener("change", updateFlow);
      destination.addEventListener("change", updateFlow);
      document.getElementById("pickupFromOther").addEventListener("input", updateFlow);
      document.getElementById("destinationOther").addEventListener("input", updateFlow);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        showError("");

        var fromLabel = resolvePlace("pickupFrom", "pickupFromOther");
        var toLabel = resolvePlace("destination", "destinationOther");
        var fullName = val("fullName");
        var mobile = val("mobile");
        var pickupLocation = val("pickupLocation");
        var cargoNotes = val("cargoNotes");

        if (!fromLabel || fromLabel === "Other") return showError("Please select where the items are.");
        if (!toLabel || toLabel === "Other") return showError("Please select the destination.");
        if (fromLabel === toLabel) return showError("Pickup and destination must be different.");
        if (!selectedSlotKey) return showError("Please select a collection slot.");
        if (!fullName) return showError("Please enter your full name.");
        if (!mobile || mobile.replace(/\D/g, "").length < 9) {
          return showError("Please enter a valid mobile number.");
        }
        if (!pickupLocation) return showError("Please enter the items pickup location.");

        var selectedEl = slotsGrid.querySelector('.fr-slot.is-selected');
        var slotLabel =
          selectedEl.querySelector(".fr-slot-day").textContent + " " +
          selectedEl.querySelector(".fr-slot-date").textContent + " " +
          selectedEl.querySelector(".fr-slot-meta").textContent;

        var lines = [
          "*Swift Wave Freight Booking*",
          "",
          "*From:* " + fromLabel,
          "*Destination:* " + toLabel,
          "*Collection slot:* " + slotLabel,
          "",
          "*Name:* " + fullName,
          "*Mobile:* " + mobile,
          "*Items pickup location:* " + pickupLocation
        ];
        if (cargoNotes) lines.push("*Cargo:* " + cargoNotes);
        lines.push("", "_Sent from Swift Wave Freight form_");

        var payload = {
          company_slug: COMPANY_SLUG,
          inquiry_type: "freight_booking",
          customer_name: fullName,
          customer_phone: mobile,
          payload: {
            from: fromLabel,
            destination: toLabel,
            collection_slot: slotLabel,
            collection_slot_key: selectedSlotKey,
            pickup_location: pickupLocation,
            cargo_notes: cargoNotes || null
          }
        };

        companyLoaded.then(function () {
          var wa = window.SwiftWaveWhatsApp;
          var url = wa.buildWhatsAppUrl(WHATSAPP_NUMBER, lines.join("\n"));
          if (!url) {
            return showError(wa.UNAVAILABLE_MESSAGE);
          }

          wa.openWhatsAppUrl(url);
          fetch("/api/public/inquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).catch(function () {});
        });
      });

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

      updateFlow();
      if (typeof lucide !== "undefined") lucide.createIcons();
    })();
  
})();
