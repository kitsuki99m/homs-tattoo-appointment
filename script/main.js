// Copyright (c) 2026 Kyle Serina. All Rights Reserved.
// Proprietary and confidential. Unauthorized use prohibited.

import "../src/style.css";
import { util } from "./util/utility.js";
import { initAnimation } from "./animations.js";
import dayjs from "dayjs";
import { gallery } from "./mainGallery.js";
import { showToast } from "./toast.js";

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
    const BASE_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://api.homstattoo.online";
    this.apiBooking = `${BASE_URL}/api/booking`;
    this.apiSchedules = `${BASE_URL}/api/schedule`;
    this.apiBooked = `${BASE_URL}/api/booking/slots`;
    this._schedules = null; // ← cache
    this._bookedSlots = null; // ← cache
  }

  async renderCalendar() {
    grid.innerHTML = "";
    label.textContent = months[viewMonth] + " " + viewYear;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();
    const now = dayjs();

    // only fetch if not cached
    if (!this._schedules || !this._bookedSlots) {
      const [scheduleRes, bookedRes] = await Promise.all([
        fetch(this.apiSchedules),
        fetch(this.apiBooked),
      ]);
      this._schedules = await scheduleRes.json();
      this._bookedSlots = await bookedRes.json();
    }

    const schedules = this._schedules;
    const bookedSlots = this._bookedSlots;

    const getAvailable = (dateStr) => {
      const match = schedules.find((s) => s.date === dateStr);
      if (!match) return null;

      const bookedDate = bookedSlots
        .filter((a) => a.date === dateStr)
        .map((a) => a.time); // ← fixed: was a.times

      return match.times.filter((t) => {
        const timeOnDate = dayjs(`${dateStr} ${t}`, "MMMM D, YYYY h:mm A");
        return !timeOnDate.isBefore(now) && !bookedDate.includes(t);
      });
    };

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      grid.appendChild(empty);
    }

    for (let d = 1; d <= totalDays; d++) {
      const el = document.createElement("div");
      const thisDate = new Date(viewYear, viewMonth, d);
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const isPast = thisDate < todayMidnight;
      const isToday = thisDate.toDateString() === today.toDateString();
      const isSelected =
        selectedDate && thisDate.toDateString() === selectedDate.toDateString();
      const dateStr = `${months[viewMonth]} ${d}, ${viewYear}`;

      const availableTimes = getAvailable(dateStr);
      const isInSchedule = availableTimes !== null;
      const isFullyBooked = isInSchedule && availableTimes.length === 0;
      const isAvailable = isInSchedule && availableTimes.length > 0;

      el.textContent = d;
      el.classList.add(
        "text-center",
        "text-sm",
        "py-1",
        "rounded-base",
        "calendar-cell",
      );

      if (isPast || !isInSchedule) {
        el.classList.add(
          "text-text-primary",
          "opacity-40",
          "cursor-not-allowed",
        );
      } else if (isFullyBooked) {
        el.classList.add(
          "bg-success",
          "text-white",
          "cursor-not-allowed",
          "opacity-80",
        );
        el.title = "Fully booked";
      } else if (isSelected) {
        el.classList.add("bg-text-primary", "text-white", "cursor-pointer");
      } else if (isToday && isAvailable) {
        el.classList.add(
          "text-blue-500",
          "font-medium",
          "hover:bg-text-primary",
          "cursor-pointer",
        );
      } else {
        el.classList.add(
          "text-text-primary",
          "hover:bg-bg-elevated",
          "cursor-pointer",
        );
      }

      if (isAvailable && !isPast) {
        el.addEventListener("click", async () => {
          selectedDate = thisDate;
          selLabel.innerHTML = `Selected: <span class="text-text-primary font-medium">${dateStr}</span>`;

          // remove selected state from previously selected cell
          const prevSelected = document.querySelector(
            ".calendar-cell.selected",
          );
          if (prevSelected) {
            prevSelected.classList.remove(
              "selected",
              "bg-text-primary",
              "text-white",
            );
            prevSelected.classList.add(
              "text-text-primary",
              "hover:bg-bg-elevated",
            );
          }

          // add selected state to clicked cell
          el.classList.add("selected", "bg-text-primary", "text-white");
          el.classList.remove("text-text-primary", "hover:bg-bg-elevated");

          await this.populateTimeSelect(dateStr, schedules, bookedSlots);
        });
      }

      grid.appendChild(el);
    }
  }

  async populateTimeSelect(dateStr, schedules, bookedSlots) {
    const timeSelect = document.querySelector("#time");
    if (!timeSelect) return;

    timeSelect.innerHTML = `<option value="">Select a time</option>`;

    const match = schedules.find((s) => s.date === dateStr);
    if (!match) {
      timeSelect.innerHTML = `<option value="">No available time</option>`;
      return;
    }

    const now = dayjs();
    const bookedTimes = bookedSlots
      .filter((a) => a.date === dateStr)
      .map((a) => a.time);

    const availableTimes = match.times.filter((t) => {
      const timeOnDate = dayjs(`${dateStr} ${t}`, "MMMM D, YYYY h:mm A");
      return !timeOnDate.isBefore(now) && !bookedTimes.includes(t);
    });

    if (availableTimes.length === 0) {
      timeSelect.innerHTML = `<option value="">No available times for this date</option>`;
      return;
    }

    availableTimes.forEach((t) => {
      const option = document.createElement("option");
      option.value = t;
      option.textContent = t;
      timeSelect.appendChild(option);
    });
  }

  async submitAppointment() {
    const capChar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // DOM refs
    const fname = document.querySelector("#fname").value.trim();
    const lname = document.querySelector("#lname").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    const email = document.querySelector("#email").value.trim();
    const size = document.querySelector("#size").value.trim();
    const placement = document.querySelector("#placement").value.trim();
    const serviceType = document.querySelector(
      "input[name='service_type']:checked",
    )?.value;
    const time = document.querySelector("#time").value;

    // Formatted values
    const fullName = `${capChar(fname)} ${capChar(lname)}`;
    const fSize = capChar(size);
    const fPlacement = capChar(placement);

    // Validation
    if (
      !fname &&
      !lname &&
      !phone &&
      !email &&
      !size &&
      !serviceType &&
      !selectedDate &&
      !time
    ) {
      showToast("Please complete the form before submitting.", "error");
      return;
    }

    if (!util.nameValidation(fname, lname)) return;
    if (!util.phoneValidation(phone)) return;
    if (!util.sizeValidation(size)) return;
    if (!util.typeValidation(serviceType)) return;
    if (!util.dateValidation(selectedDate)) return;
    if (!util.timeValidation(time)) return;

    const dateStr = `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

    try {
      const captchaToken = document.querySelector(
        "[name=h-captcha-response]",
      ).value;

      if (!captchaToken) {
        showToast("Please complete the captcha.", "error");
        return;
      }

      const res = await fetch(this.apiBooking, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone,
          email,
          size: fSize,
          placement: fPlacement || "Not specified",
          servicetype: serviceType,
          date: dateStr,
          time,
          createdAt: dayjs().format("MMMM D, YYYY hh:mm A"),
          captchaToken,
        }),
      });

      const data = await res.json();

      if (data.success) {
        this._bookedSlots = null;
        await this.renderCalendar();
        const sizeEl = document.getElementById("size");
        const sizeText = sizeEl.options[sizeEl.selectedIndex].text
          .split("—")[0]
          .trim();

        // Update success message
        document.getElementById("success-text").textContent =
          `Appointment requested, ${fname}!`;
        document.getElementById("success-sub").textContent =
          `${dateStr} at ${time} · ${sizeText} | Check email for confirmation`;

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
      const datePicker = document.getElementById("datepicker");
      const bookedMsg = document.querySelector("#booking-title h2");
      const bookedMsgQuote = document.querySelector("#booking-title p");
      const informationContainer = document.querySelector(
        ".information-container",
      );

      // Clear form fields
      ["fname", "lname", "phone", "email", "size", "time", "placement"].forEach(
        (id) => {
          document.getElementById(id).value = "";
        },
      );

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
      informationContainer.classList.replace("md:col-span-12", "md:col-span-8");
      datePicker.style.display = "block";

      // Reset heading
      bookedMsg.textContent = "Book nasab ta!";
      bookedMsg.classList.remove("text-center");
      bookedMsgQuote.style.display = "block";
    });
  }

  initBooking() {
    if (!document.getElementById("cal-days")) {
      console.log("Not on the booking page. Skipping calendar initialization.");
      return;
    }
    this.renderCalendar();
    this.validationEventListeners();
    initAnimation();
  }
}

const booking = new Booking();

// EVENT LISTENERS

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize the gallery immediately
  try {
    if (gallery && typeof gallery.initGallery === "function") {
      gallery.initGallery();
    }
  } catch (err) {
    console.error("Gallery failed to initialize:", err);
  }

  // 2. Initialize the booking system
  try {
    booking.initBooking();
  } catch (err) {
    console.error("Booking failed to initialize:", err);
  }

  // 3. Bind the submit button listener safely inside the DOM load block
  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      booking.submitAppointment();
    });
  }

  // 4. Handle typography layouts
  const jodexSpanAnimation = document.querySelector(".span-name");
  if (jodexSpanAnimation) {
    if (window.innerWidth <= 768) {
      jodexSpanAnimation.classList.remove("typing-text");
    } else {
      jodexSpanAnimation.classList.add("typing-text");
    }
  }

  navMenu();

});

// Navigation Menu 

export function openMenu() {
  const menu = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (!menu || !navMenu) return;

  if (window.innerWidth >= 768) return;

  const isOpening = navMenu.classList.contains("pointer-events-none");
  
  // Set icon states and ARIA helpers
  menu.setAttribute("name", isOpening ? "close" : "menu");
  menu.setAttribute("aria-expanded", isOpening ? "true" : "false");
  navMenu.setAttribute("aria-hidden", isOpening ? "false" : "true");

  // Animate view states using your setup class properties
  navMenu.classList.toggle("opacity-0", !isOpening);
  navMenu.classList.toggle("opacity-100", isOpening);
  navMenu.classList.toggle("pointer-events-none", !isOpening);
  navMenu.classList.toggle("-translate-y-2", !isOpening);
  navMenu.classList.toggle("translate-y-0", isOpening);

  // Close when clicking an anchor link item
  if (isOpening && !navMenu.dataset.listenerAttached) {
    navMenu.addEventListener("click", (event) => {
      if (event.target.closest("li") || event.target.tagName === "A") {
        closeMenuExplicitly(navMenu, menu);
      }
    });
    navMenu.dataset.listenerAttached = "true";
  }
}

function closeMenuExplicitly(navMenu, toggle) {
  navMenu.classList.add("opacity-0", "pointer-events-none", "-translate-y-2");
  navMenu.classList.remove("opacity-100", "translate-y-0");
  toggle.setAttribute("name", "menu");
  toggle.setAttribute("aria-expanded", "false");
  navMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden");
}

// Global UI handling setup block
function navMenu() {
  const burger = document.querySelector("#nav-toggle");
  if (!burger) return;

  burger.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevents immediate close from global listener
    openMenu();
  });

  // Global click monitoring to close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    const navMenuEl = document.getElementById("nav-menu");
    const toggleEl = document.getElementById("nav-toggle");
    if (!navMenuEl || !toggleEl) return;

    const isOpen = navMenuEl.classList.contains("opacity-100");
    const clickedOutside = !navMenuEl.contains(event.target) && !toggleEl.contains(event.target);

    if (isOpen && clickedOutside) {
      closeMenuExplicitly(navMenuEl, toggleEl);
    }
  });

  window.addEventListener("resize", () => {
    const menu = document.getElementById("nav-toggle");
    const navMenuEl = document.getElementById("nav-menu");
    if (!menu || !navMenuEl) return;

    if (window.innerWidth >= 768) {
      closeMenuExplicitly(navMenuEl, menu);
    }
  });
}