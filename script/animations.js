


export function initAnimation()  {

  
const counters = document.querySelectorAll(".stat-num");

function animateCounter(counter) {
  const target = parseInt(counter.getAttribute("data-target"), 10);
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

function infoCards() {
    
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
    card.style.transitionDelay = `${index * 0.15}s`;
    observer.observe(card);
  });

  knowMoreCard.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.10}s`;
    observer.observe(card);
  });

  heroTextLeft.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.10}s`;
    observer.observe(el);
  });

  heroTextRight.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.10}s`;
    observer.observe(el);
  });

}

initCounters();
infoCards();

};