// Copyright (c) 2026 Kyle Serina. All Rights Reserved.
// Proprietary and confidential. Unauthorized use prohibited.

export function infoCards() {
  const pricingCards = document.querySelectorAll(".pricing-card");
  const knowMoreCard = document.querySelectorAll(".jodex-card");
  const heroTextLeft = document.querySelectorAll(".slide-left");
  const heroTextRight = document.querySelectorAll(".slide-right");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  pricingCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });

  knowMoreCard.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.075}s`;
    observer.observe(card);
  });

  heroTextLeft.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.05}s`;
    observer.observe(el);
  });

  heroTextRight.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.05}s`;
    observer.observe(el);
  });

}
