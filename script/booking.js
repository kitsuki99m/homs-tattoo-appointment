// Copyright (c) 2026 Kyle Serina. All Rights Reserved.
// Proprietary and confidential. Unauthorized use prohibited.

import { util } from "../util/utility.js";

export function bookingJodex() {
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

  function renderCalendar() {
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
        el.classList.add("text-info", "opacity-40", "cursor-not-allowed");
      } else {
        if (isSelected) {
          el.classList.add("bg-darkgray", "text-white");
        } else if (isToday) {
          el.classList.add(
            "text-blue-500",
            "font-medium",
            "hover:bg-neutral-primary-soft",
          );
        } else {
          el.classList.add("text-heading", "hover:bg-neutral-primary-soft");
        }

        el.addEventListener("click", () => {
          selectedDate = thisDate;
          selLabel.innerHTML = `Selected: <span class="text-heading font-medium">${months[viewMonth]} ${d}, ${viewYear}</span>`;
          renderCalendar();
        });
      }

      grid.appendChild(el);
    }
  }

  document.getElementById("prev-btn").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear--;
    }
    renderCalendar();
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear++;
    }
    renderCalendar();
  });

  document.querySelector("#phone").addEventListener("keypress", (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });

  document.getElementById("submit-btn").addEventListener("click", () => {
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const size = document.getElementById("size").value;
    const time = document.getElementById("time").value;
    const err = document.getElementById("error-msg");

    if (!fname || !lname || !phone || !size || !time || !selectedDate) {
      err.classList.remove("hidden");
      return;
    }

    err.classList.add("hidden");
    submitAppointment(); // let submitAppointment handle everything
  });

  renderCalendar();

  document.getElementById("again-btn").addEventListener("click", () => {
    selectedDate = null;
    renderCalendar();

    document.getElementById("fname").value = "";
    document.getElementById("lname").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("size").value = "";
    document.getElementById("time").value = "";
    document.getElementById("placement").value = "";
    document.getElementById("desc").value = "";
    const err = document.getElementById("error-msg");
    const datePicker = document.getElementById("datepicker");
    const bookedMsg = document.querySelector("#booking-title h2");
    const bookedMsgQuote = document.querySelector("#booking-title p");
    const informationContainerSpan = document.querySelector(
      ".information-container",
    );

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

    err.classList.add("hidden");
    document.getElementById("selected-date-label").textContent =
      "No date selected";
    document.getElementById("success-text").textContent = ``;
    document.getElementById("success-sub").textContent = ``;
    document.getElementById("form-content").style.display = "flex";
    document.getElementById("success-msg").classList.add("hidden");
    document.getElementById("success-msg").classList.remove("flex");
    informationContainerSpan.classList.remove("md:col-span-12");
    informationContainerSpan.classList.add("md:col-span-8");
    datePicker.style.display = "block";
    bookedMsg.textContent = "Book nasab ta!";
    bookedMsg.classList.remove("text-center");
    bookedMsgQuote.style.display = "block";
  });

  function submitAppointment() {
    const submit = async () => {
      const capChar = (str) => str.charAt(0).toUpperCase() + str.slice(1);
      const fname = document.querySelector("#fname").value.trim();
      const lname = document.querySelector("#lname").value.trim();
      const size = document.querySelector("#size").value.trim();
      const placement = document.querySelector("#placement").value.trim();
      const desc = document.querySelector("#desc").value.trim();
      const fullName = `${capChar(fname)} ${capChar(lname)}`;
      const fSize = capChar(size);
      const fPlacement = capChar(placement);
      const fDesc = capChar(desc);
      const phone = document.querySelector("#phone").value.trim();
      const email = document.querySelector("#email").value.trim();
      const dateStr = `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
      const time = document.querySelector("#time").value;
      const err = document.getElementById("error-msg");

      // validation
      if (!util.nameValidation(fname, lname, err)) return;
      if (!util.phoneValidation(phone, err)) return;

      

      try {
        const res = await fetch("http://localhost:3000/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            status: 'Pending',
            phone,
            email,
            size: fSize,
            placement: fPlacement || "Not specified",
            description: fDesc || "No description",
            date: dateStr,
            time,
            createdAt: new Date().toISOString(),
          }),
        });

        const data = await res.json();

        if (data.success) {
          const datePicker = document.getElementById("datepicker");
          const bookedMsg = document.querySelector("#booking-title h2");
          const bookedMsgQuote = document.querySelector("#booking-title p");
          const informationContainerSpan = document.querySelector(
            ".information-container",
          );
          const sizeText = document
            .getElementById("size")
            .options[
              document.getElementById("size").selectedIndex
            ].text.split("—")[0]
            .trim();

          document.getElementById("success-text").textContent =
            `Appointment requested, ${fname}!`;
          document.getElementById("success-sub").textContent =
            `${dateStr} at ${time} · ${sizeText}`;
          document.getElementById("form-content").style.display = "none";
          document.getElementById("success-msg").classList.remove("hidden");
          document.getElementById("success-msg").classList.add("flex");
          informationContainerSpan.classList.remove("md:col-span-8");
          informationContainerSpan.classList.add("md:col-span-12");
          datePicker.style.display = "none";
          bookedMsg.textContent = "Booked na bay!";
          bookedMsg.classList.add("text-center");
          bookedMsgQuote.style.display = "none";
        }
      } catch (err) {
        console.error("Booking failed:", err);
        alert("Something went wrong. Please try again.");
      }
    };
    submit();
  }

  const validateInput = (input, condition) => {
    if (condition) {
      input.classList.add("ring-1", "ring-green-500");
      input.classList.remove("ring-1", "ring-red-500");
    } else {
      input.classList.add("ring-1", "ring-red-500");
      input.classList.remove("ring-1", "ring-green-500");
    }
  };

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
}
