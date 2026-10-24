/* =========================================================
   Perfect Fitness Gym — interactions
   ========================================================= */

/* ---------- EDIT THESE: your real gym details ---------- */
const CONFIG = {
  whatsapp: "910000000000",              // country code + number, digits only (e.g. 919876543210)
  phone: "+91 00000 00000",
  email: "hello@perfectfitnessgym.com",
  address: "Your gym address, City, State"
};

(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = window.matchMedia("(min-width: 960px) and (hover: hover)").matches;

  /* ---------- Apply contact config ---------- */
  $$('[data-cfg="phone"]').forEach(el => {
    el.textContent = CONFIG.phone;
    el.href = "tel:+" + CONFIG.whatsapp;
  });
  $$('[data-cfg="email"]').forEach(el => {
    el.textContent = CONFIG.email;
    el.href = "mailto:" + CONFIG.email;
  });
  $$('[data-cfg="address"]').forEach(el => (el.textContent = CONFIG.address));
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero entrance ---------- */
  window.addEventListener("load", () => {
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
  });
  // Safety net in case "load" is delayed by slow images
  setTimeout(() => document.body.classList.add("is-ready"), 1800);

  /* ---------- Nav: scrolled state, active link, floating CTA ---------- */
  const nav = $("#nav");
  const floatCta = $("#floatCta");
  const hero = $("#hero");
  const contact = $("#contact");
  const navLinks = $$(".nav__links a");
  const sections = navLinks
    .map(a => $(a.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);

    // Floating CTA: after hero, hidden near the contact form
    const heroEnd = hero.offsetHeight * 0.7;
    const contactTop = contact.getBoundingClientRect().top + y - window.innerHeight * 0.6;
    floatCta.classList.toggle("is-visible", y > heroEnd && y < contactTop);

    // Active nav link
    let current = null;
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= window.innerHeight * 0.4) current = sec.id;
    });
    navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));

    // Desktop-only scroll parallax (hero background + content)
    if (isDesktop && !reduceMotion && y < window.innerHeight * 1.2) {
      const bg = $(".hero__bg");
      if (bg) bg.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    }

    // Slow zoom on scroll for facilities image
    const fac = $("#facImg");
    if (fac && !reduceMotion) {
      const r = fac.parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom > 0 && r.top < vh) {
        const progress = 1 - (r.top + r.height) / (vh + r.height); // 0 → 1 as it passes
        fac.style.transform = `scale(${1.05 + Math.max(0, Math.min(1, progress)) * 0.14})`;
      }
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Hero mouse parallax (desktop only) ---------- */
  if (isDesktop && !reduceMotion) {
    const content = $(".hero__content");
    const orb = $(".hero__orb");
    hero.addEventListener("mousemove", e => {
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      content.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`;
      orb.style.translate = `${x * 50}px ${y * 40}px`;
    });
  }

  /* ---------- Mobile drawer ---------- */
  const burger = $("#burger");
  const drawer = $("#drawer");
  function setDrawer(open) {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
  $$("a", drawer).forEach(a => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setDrawer(false); });
  window.matchMedia("(min-width: 960px)").addEventListener("change", e => { if (e.matches) setDrawer(false); });

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el, i) => {
    // light stagger for siblings in grids
    const siblings = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains("reveal")) : [];
    const idx = siblings.indexOf(el);
    if (idx > 0 && !el.classList.contains("flist-item") && !el.matches("li")) {
      el.style.transitionDelay = Math.min(idx, 5) * 90 + "ms";
    }
    io.observe(el);
  });
  // When revealed, clear inline delay so hover feels instant
  document.addEventListener("transitionend", e => {
    if (e.propertyName === "opacity" && e.target.classList?.contains("is-in")) e.target.style.transitionDelay = "";
  });

  /* ---------- Statement: progressive word reveal on scroll ---------- */
  const split = $("[data-split]");
  if (split) {
    const words = split.textContent.trim().split(/\s+/);
    split.setAttribute("aria-label", words.join(" "));
    split.innerHTML = words.map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
    const wEls = $$(".w", split);

    if (reduceMotion) {
      wEls.forEach(w => w.classList.add("is-on"));
    } else {
      const update = () => {
        const r = split.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the title enters bottom 85%, 1 when it reaches ~35%
        const p = (vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.4);
        const on = Math.round(Math.max(0, Math.min(1, p)) * wEls.length);
        wEls.forEach((w, i) => w.classList.toggle("is-on", i < on));
      };
      window.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
      window.addEventListener("resize", update);
      update();
    }
  }

  /* ---------- Plan buttons preselect form ---------- */
  const planSelect = $("#plan");
  $$("[data-plan]").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.plan;
      const opt = [...planSelect.options].find(o => o.value === val || o.text === val);
      if (opt) planSelect.value = opt.value;
    });
  });

  /* ---------- Testimonial slider ---------- */
  const slides = $$(".slide");
  const dots = $$(".slider__dots button");
  let current = 0, timer;
  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === current));
    dots.forEach((d, n) => d.classList.toggle("is-active", n === current));
  }
  function auto() {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => show(current + 1), 6500);
  }
  dots.forEach((d, n) => d.addEventListener("click", () => { show(n); auto(); }));
  auto();

  /* ---------- Lead form → WhatsApp (works on static hosting) ---------- */
  const form = $("#leadForm");
  const msg = $("#formMsg");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const phone = f.phone.value.trim();
    const plan = f.plan.value;
    const goal = f.goal.value.trim();

    $$(".field", form).forEach(f => f.classList.remove("has-error"));
    msg.className = "form__msg";

    const digits = phone.replace(/\D/g, "");
    let error = "";
    if (name.length < 2) { error = "Please enter your name."; f.name.parentElement.classList.add("has-error"); f.name.focus(); }
    else if (digits.length < 10) { error = "Please enter a valid phone number."; f.phone.parentElement.classList.add("has-error"); f.phone.focus(); }

    if (error) { msg.textContent = error; msg.classList.add("is-error"); return; }

    const text =
      `Hi Perfect Fitness Gym! I'd like to enquire.\n\n` +
      `Name: ${name}\nPhone: ${phone}\nInterested in: ${plan}` +
      (goal ? `\nGoal: ${goal}` : "");

    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    msg.textContent = "Opening WhatsApp. Just press send to complete your enquiry.";
    msg.classList.add("is-ok");
    window.open(url, "_blank", "noopener");
    form.reset();
  });
})();
