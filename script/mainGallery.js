class Gallery {
  constructor() {
    const BASE_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://api.homstattoo.online";
    this.apiGallery = `${BASE_URL}/api/gallery`;
    this.cache_gallery = null;
  }

  async getGallery(force = false) {
    if (this.cache_gallery && !force) {
      return this.cache_gallery;
    }

    try {
      const images = await fetch(this.apiGallery, {
        headers: {},
      });
      this.cache_gallery = await images.json();
      return this.cache_gallery;
    } catch (err) {
      console.error("Failed to load gallery", err);
    }
  }

  async renderGallery() {
    const imageContainer = document.querySelector(".images-container");
    if (!imageContainer) return;

    // FIX 1: Pass the force parameter down to get fresh images

    const data = await this.getGallery();
    const images = this.cache_gallery.data || [];

    // 3. CORRECT LOGIC FLOW: Check if the images array has anything in it!
    if (!images || images.length === 0) {
      imageContainer.innerHTML = `<div class="flex justify-center items-center col-span-2 md:!col-span-4"><p class="text-center">There are no images found.</p></div>`;
    } else {
      // This will finally run now!
      imageContainer.innerHTML = images
        .map(
          (image) => `
        <div class="image-item w-full h-full md:h-full overflow-clip">
          <img
            class="w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-out hover:scale-110"
            src="${image.filepath}"
            data-image-id="${image._id}"
            alt="Tattoo design by Jodex Abellona"
            width="400"
            height="500"
            loading="lazy"
            decoding="async"
          />
        </div>`,
        )
        .join("");

      // Event delegation setup
      imageContainer.onclick = (e) => {
        this.openModal(e);
        document.body.classList.add("overflow-hidden");
      };
    }
  }

  openModal(e) {
    console.log("element clicked", e.target);

    // Find the image element that was clicked
    const clickedImg = e.target.closest(".image-item img");
    window.scroll = false;

    // If they clicked the container background instead of an image, exit safely
    if (!clickedImg) return;

    // Grab the setup details
    const id = clickedImg.dataset.imageId;
    const src = clickedImg.src;

    // Create the modal wrapper
    const modal = document.createElement("div");
    modal.classList.add(
      "modal-img",
      "fixed",
      "inset-0",
      "z-50",
      "flex",
      "justify-center",
      "items-center",
      "bg-black/90",
    );

    // Create the modal image
    const modalImg = document.createElement("img");
    modalImg.src = src;
    modalImg.classList.add(
      "max-w-[90%]",
      "max-h-[90%]",
      "object-contain",
      "shadow-2xl",
    );

    // Assemble and append
    modal.appendChild(modalImg);
    document.body.appendChild(modal);

    // Close modal on click
    modal.addEventListener("click", () => {
      modal.remove();
      document.body.classList.remove("overflow-hidden");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.querySelector(".modal-img");
        modal.remove();
        document.body.classList.remove("overflow-hidden");
      }
    });
  }

  initGallery() {
    // Force true overrides the cache and requests fresh data from the server
    this.renderGallery();
  }
}

export const gallery = new Gallery();
