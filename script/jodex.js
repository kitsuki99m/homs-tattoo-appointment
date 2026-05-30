// Copyright (c) 2026 Kyle Serina. All Rights Reserved.
// Proprietary and confidential. Unauthorized use prohibited.

import { infoCards } from "./animation-cards.js";
import { bookingJodex } from "./booking.js";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

// go back to top every refresh

if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

// constant var

const navMenu = document.querySelector("#nav-menu");
const topNav = document.querySelector("#top-nav");
const nav = document.querySelector("#nav-menu ul");
const navLinks = document.querySelectorAll(".desk-nav li");
const counters = document.querySelectorAll(".stat-num");
const header = document.querySelector("#header-bar");
const navli = document.querySelectorAll(".desk-nav-ul li");
const burger = document.querySelector("#nav-toggle");
const logo = document.querySelector(".desk-nav nav h1");
const book = document.querySelector(".book-btn");
const photoFrame = document.querySelector('.photo-frame');

// header state changes whenever resize and scrolling

const headerChanges = {
  currentState: null,

  setHeader() {
    const isShortViewport = window.innerHeight <= 560;
    if (isShortViewport !== this.currentState) {
      this.currentState = isShortViewport;
      this._applyHeaderStyles(isShortViewport);
    }
  },

  _applyHeaderStyles(isDark) {
    header.classList.toggle("bg-darkgray", isDark);
    header.classList.toggle("shadow-md", isDark);
    header.classList.toggle("bg-transparent", !isDark);

    logo.classList.toggle("text-white", isDark);
    logo.classList.toggle("text-darkgray", !isDark);

    burger.classList.toggle("text-white", isDark);
    burger.classList.toggle("text-darkgray", !isDark);

    navli.forEach((li) => {
      li.classList.toggle("text-white", isDark);
      li.classList.toggle("text-darkgray", !isDark);
    });

    book.classList.toggle("bg-whitebg", isDark);
    book.classList.toggle("text-darkgray", isDark);
    book.classList.toggle("bg-darkgray", !isDark);
    book.classList.toggle("text-white", !isDark);
  },

  scrolledHeader() {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isShortViewport = window.innerHeight <= 560;
          const scrolled =
            (window.scrollY /
              (document.body.scrollHeight - window.innerHeight)) *
              100 >=
            1.5;
          const isDark = isShortViewport ? true : scrolled;

          if (isDark !== this.currentState) {
            this.currentState = isDark;
            this._applyHeaderStyles(isDark);
          } 
          ticking = false;
        });
        ticking = true;
      }
    });
  },
};

// counter animation

function animateCounter(counter) {
  const target = parseInt(counter.getAttribute("data-target"));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current += step;
    if (current < target) {
      counter.textContent = Math.floor(current) + "+";
      requestAnimationFrame(update);
    } else {
      counter.textContent = target + "+";
    }
  };
  update();
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });
  counters.forEach((counter) => observer.observe(counter));
}

// mobile navigation menu

function topNavChangesMobile() {
  ["w-full", "h-150"].forEach((cls) => topNav.classList.toggle(cls));
}

export function openMenu() {
  const menu = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (window.innerWidth >= 768) return !isOpening;

  const isOpening = navMenu.classList.contains("pointer-events-none");
  menu.name = isOpening ? "close" : "menu";

  navMenu.classList.toggle("opacity-0", !isOpening);
  navMenu.classList.toggle("opacity-100", isOpening);
  navMenu.classList.toggle("pointer-events-none", !isOpening);
  navMenu.classList.toggle("translate-y-[-10px]", !isOpening);
  navMenu.classList.toggle("translate-y-0", isOpening);

  if (isOpening && !navMenu.dataset.listenerAttached) {
    navMenu.addEventListener("click", (event) => {
      if (event.target.closest("li") || event.target.tagName === "A") {
        navMenu.classList.add(
          "opacity-0",
          "pointer-events-none",
          "translate-y-[-10px]",
        );
        navMenu.classList.remove("opacity-100", "translate-y-0");
        menu.name = "menu";
      }
    });
    navMenu.dataset.listenerAttached = "true";
  }

  document.addEventListener("click", (event) => {
    const navMenu = document.getElementById("nav-menu");
    const toggle = document.getElementById("nav-toggle");
    const isOpen = navMenu.classList.contains("opacity-100");
    const clickedOutside =
      !navMenu.contains(event.target) && !toggle.contains(event.target);

    if (isOpen && clickedOutside) {
      navMenu.classList.add(
        "opacity-0",
        "pointer-events-none",
        "translate-y-[-10px]",
      );
      navMenu.classList.remove("opacity-100", "translate-y-0");
      toggle.name = "menu";
      document.body.classList.remove("overflow-hidden");
    }
  });
}

// eventListeners

burger.addEventListener("click", () => {
  console.log("clicked");
  openMenu();
});

window.addEventListener("resize", () => {
  const menu = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  applyResponsiveStyles();


  if (window.innerWidth >= 768) {
    navMenu.classList.add("opacity-0", "pointer-events-none", "translate-y-[-10px]");
    navMenu.classList.remove("opacity-100", "translate-y-0");
    menu.name = "menu";
  };


});

// Jodex Border changes when resizing

function applyResponsiveStyles() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  const ifPhoneSize = width < 768;
  const isDesktopSize = width >= 1024;
  const isTabletSize = width >= 768 && width < 1024;

  photoFrame.classList.toggle('border', ifPhoneSize || isDesktopSize);
}



/////////////////////////////////////////////////


// Initial

document.addEventListener("DOMContentLoaded", () => {
  initCounters();
  infoCards();
  bookingJodex();
  headerChanges.setHeader();
  headerChanges.scrolledHeader();
  applyResponsiveStyles();
});
