// Copyright (c) 2026 Kyle Serina. All Rights Reserved.
// Proprietary and confidential. Unauthorized use prohibited.

import { openMenu } from "./jodex.js"

// Constants
const squareGallery = document.getElementById("square-gallery");
const modal         = document.getElementById("img-modal");
const modalBox      = document.getElementById("modal-box");
const modalImg      = document.getElementById("modal-img");
const modalClose    = document.getElementById("modal-close");
const toggle = document.getElementById("nav-toggle");

// ZoomState
const zoomState = {
  active: false,
  lastOrigin: "center center",
};

// Modal
function openModal(src) {
  modalImg.src = src;
  modal.style.display = "flex";
  document.body.classList.add("overflow-y-hidden");
  resetZoom();
}

function closeModal() {
  modal.style.display = "none";
  modalImg.src = null;
  document.body.classList.remove("overflow-y-hidden");
  resetZoom();
}

// Zoom functions
function resetZoom() {
  zoomState.active = false;
  zoomState.lastOrigin = "center center";
  applyZoom(false, zoomState.lastOrigin);
}

function applyZoom(zoomed, origin) {
  modalImg.style.transformOrigin = origin;
  modalImg.style.transform       = zoomed ? "scale(2)" : "scale(1)";
  modalImg.style.cursor          = zoomed ? "zoom-out" : "zoom-in";
  squareGallery.style.overflow      = zoomed ? "hidden" : "hidden";
  squareGallery.style.pointerEvents = zoomed ? "none"   : "auto";
}

function getClickOrigin(e) {
  const { left, top, width, height } = modalImg.getBoundingClientRect();
  const x = ((e.clientX - left) / width)  * 100;
  const y = ((e.clientY - top)  / height) * 100;
  return `${x}% ${y}%`;
}

// Render


function createGalleryItem({ image, id }) {
  const div = document.createElement("div");
  div.classList.add("break-inside-avoid", "mb-4");

  const img = document.createElement("img");
  img.src = `${import.meta.env.BASE_URL}${image}`;
  img.alt = id;
  img.classList.add("w-full", "h-auto", "object-cover", "rounded-xl", "cursor-pointer");
  img.addEventListener("click", () => openModal(image));

  div.appendChild(img);
  return div;
}

async function loadGallery() {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}data/gallery.json`);
    const data = await res.json();
    const fragment = document.createDocumentFragment();
    data.forEach((item) => fragment.appendChild(createGalleryItem(item)));
    squareGallery.appendChild(fragment);
  } catch (err) {
    console.error("Failed to load gallery:", err);
  }
}

// Click Events
modalImg.addEventListener("click", (e) => {
  zoomState.active = !zoomState.active;

  if (zoomState.active) {
    zoomState.lastOrigin = getClickOrigin(e);
  }

  applyZoom(zoomState.active, zoomState.lastOrigin);
});

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// Initial

loadGallery();

toggle.addEventListener("click", () => {
  jodex.openMenu();
});
