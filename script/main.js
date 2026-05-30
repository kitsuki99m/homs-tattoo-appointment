// Copyright (c) 2026 Kyle Serina. All Rights Reserved.
// Proprietary and confidential. Unauthorized use prohibited.

import { infoCards } from "./animation-cards.js";
import { bookingJodex } from "./booking.js";
import { util } from "../util/utility.js";
import { initAnimation } from "./animations.js"; 

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let selectedDate = null;
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

const grid = document.getElementById("cal-days");
const label = document.getElementById("cal-month-label");
const selLabel = document.getElementById("selected-date-label");

class Booking {
  constructor() {
    this.apiBooking = "http://localhost:3000/api/booking"; // ✓ booking
    this.apiSchedules = "http://localhost:3000/api/schedule";
  }

  async renderCalendar() {
    grid.innerHTML = "";
    label.textContent = months[viewMonth] + " " + viewYear;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      grid.appendChild(empty);
    }

    for (let d = 1; d <= totalDays; d++) {
      const el = document.createElement("div");
      const thisDate = new Date(viewYear, viewMonth, d);
      const isPast =
        thisDate <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = thisDate.getDay() === 0;
      const isToday = thisDate.toDateString() === today.toDateString();
      const isSelected =
        selectedDate && thisDate.toDateString() === selectedDate.toDateString();

      el.textContent = d;
      el.classList.add(
        "text-center",
        "text-sm",
        "py-1",
        "rounded-base",
        "cursor-pointer",
      );

      if (isPast) {
        el.classList.add(
          "text-text-primary",
          "opacity-40",
          "cursor-not-allowed",
        );
      } else {
        if (isSelected) {
          el.classList.add("bg-text-primary", "text-white");
        } else if (isToday) {
          el.classList.add(
            "text-blue-500",
            "font-medium",
            "hover:bg-text-primary",
          );
        } else {
          el.classList.add("text-text-primary", "hover:bg-bg-elevated");
        }

        el.addEventListener("click", () => {
          selectedDate = thisDate;
          selLabel.innerHTML = `Selected: <span class="text-text-primary font-medium">${months[viewMonth]} ${d}, ${viewYear}</span>`;
          this.renderCalendar();
        });
      }

      grid.appendChild(el);
    }
  }

  async submitAppointment() {
    const capChar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // DOM refs
    const err = document.getElementById("error-msg");
    const fname = document.querySelector("#fname").value.trim();
    const lname = document.querySelector("#lname").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    const email = document.querySelector("#email").value.trim();
    const size = document.querySelector("#size").value.trim();
    const placement = document.querySelector("#placement").value.trim();
    const desc = document.querySelector("#desc").value.trim();
    const time = document.querySelector("#time").value;

    // Formatted values
    const fullName = `${capChar(fname)} ${capChar(lname)}`;
    const fSize = capChar(size);
    const fPlacement = capChar(placement);
    const fDesc = capChar(desc);
    const dateStr = `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

    // Validation
    if (!util.nameValidation(fname, lname, err)) return;
    if (!util.phoneValidation(phone, err)) return;
    if (!selectedDate) {
      err.textContent = "Please select a date.";
      err.classList.remove("hidden");
      return;
    }

    try {
      const res = await fetch(this.apiBooking, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone,
          email,
          size: fSize,
          placement: fPlacement || "Not specified",
          description: fDesc || "No description",
          date: dateStr,
          time,
          createdAt: dayjs().format('MMMM D, YYYY hh:mm A')
        }),
      });

      const data = await res.json();

      if (data.success) {
        const sizeEl = document.getElementById("size");
        const sizeText = sizeEl.options[sizeEl.selectedIndex].text
          .split("—")[0]
          .trim();

        // Update success message
        document.getElementById("success-text").textContent =
          `Appointment requested, ${fname}!`;
        document.getElementById("success-sub").textContent =
          `${dateStr} at ${time} · ${sizeText}`;

        // Swap form → success
        document.getElementById("form-content").style.display = "none";
        document
          .getElementById("success-msg")
          .classList.replace("hidden", "flex");

        // Layout adjustments
        const informationContainer = document.querySelector(
          ".information-container",
        );
        informationContainer.classList.replace(
          "md:col-span-8",
          "md:col-span-12",
        );
        document.getElementById("datepicker").style.display = "none";

        // Update heading
        const bookedMsg = document.querySelector("#booking-title h2");
        const bookedMsgQuote = document.querySelector("#booking-title p");
        bookedMsg.textContent = "Booked na bay!";
        bookedMsg.classList.add("text-center");
        bookedMsgQuote.style.display = "none";
      }
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  validationEventListeners() {
    const validateInput = (input, condition) => {
      if (condition) {
        input.classList.add("ring-1", "ring-green-500");
        input.classList.remove("ring-1", "ring-red-500");
      } else {
        input.classList.add("ring-1", "ring-red-500");
        input.classList.remove("ring-1", "ring-green-500");
      }
    };

    document.getElementById("prev-btn").addEventListener("click", () => {
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      booking.renderCalendar();
    });

    document.getElementById("next-btn").addEventListener("click", () => {
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      booking.renderCalendar();
    });

    // fname
    document.getElementById("fname").addEventListener("input", (e) => {
      validateInput(
        e.target,
        /^[a-zA-Z\s]+$/.test(e.target.value.trim()) &&
          e.target.value.trim() !== "",
      );
    });

    // lname
    document.getElementById("lname").addEventListener("input", (e) => {
      validateInput(
        e.target,
        /^[a-zA-Z\s]+$/.test(e.target.value.trim()) &&
          e.target.value.trim() !== "",
      );
    });

    // phone
    document.getElementById("phone").addEventListener("input", (e) => {
      const val = e.target.value.trim();
      validateInput(
        e.target,
        /^\d+$/.test(val) && val.startsWith("09") && val.length === 11,
      );
    });

    // email
    document.getElementById("email").addEventListener("input", (e) => {
      validateInput(
        e.target,
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim()),
      );
    });

    document.getElementById("again-btn").addEventListener("click", () => {
      // Reset state
      selectedDate = null;
      booking.renderCalendar();

      // DOM refs
      const err = document.getElementById("error-msg");
      const datePicker = document.getElementById("datepicker");
      const bookedMsg = document.querySelector("#booking-title h2");
      const bookedMsgQuote = document.querySelector("#booking-title p");
      const informationContainer = document.querySelector(
        ".information-container",
      );

      // Clear form fields
      [
        "fname",
        "lname",
        "phone",
        "email",
        "size",
        "time",
        "placement",
        "desc",
      ].forEach((id) => {
        document.getElementById(id).value = "";
      });

      // Reset labels
      document.getElementById("selected-date-label").textContent =
        "No date selected";
      document.getElementById("success-text").textContent = "";
      document.getElementById("success-sub").textContent = "";

      // Swap success → form
      document.getElementById("form-content").style.display = "flex";
      document
        .getElementById("success-msg")
        .classList.replace("flex", "hidden");

      // Layout adjustments
      err.classList.add("hidden");
      informationContainer.classList.replace("md:col-span-12", "md:col-span-8");
      datePicker.style.display = "block";

      // Reset heading
      bookedMsg.textContent = "Book nasab ta!";
      bookedMsg.classList.remove("text-center");
      bookedMsgQuote.style.display = "block";
    });
  }

  initBooking() {
  booking.renderCalendar();
  booking.validationEventListeners();
  initAnimation();
  }
}

const booking = new Booking();

// EVENT LISTENERS

document.addEventListener("DOMContentLoaded", () => {
 booking.initBooking();
});

document.getElementById("submit-btn").addEventListener("click", () => {
  booking.submitAppointment();
});
