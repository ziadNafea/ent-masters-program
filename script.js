// ===== Smooth scroll (Lenis) + animations (GSAP) =====
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) document.documentElement.classList.add("reduce");
const hasAnimations =
  typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (hasAnimations) gsap.registerPlugin(ScrollTrigger);

// 1) Smooth scrolling
const useLenis =
  hasAnimations &&
  typeof Lenis !== "undefined" &&
  !reduce &&
  window.matchMedia("(min-width: 1200px) and (pointer: fine)").matches;
const lenis = useLenis
  ? new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    })
  : {
      scrollTo(target, { offset = 0 } = {}) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY + offset,
          behavior: reduce ? "auto" : "smooth",
        });
      },
      stop() {},
      start() {},
    };
if (useLenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Nav links scroll smoothly to their section
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    if (a.hasAttribute("data-apply")) return; // opens the form instead
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -40 });
  });
});

if (!reduce && hasAnimations) {
  // 2) Hero intro (plays once on page load)
  gsap
    .timeline({ defaults: { ease: "power3.out", duration: 1 } })
    .from(".nav", { y: -30, opacity: 0 })
    .from(".hero .eyebrow", { y: 30, opacity: 0 }, "-=0.6")
    .from(".hero h1 > *", { y: 50, opacity: 0, stagger: 0.12 }, "-=0.7")
    .from(".hero .lead", { y: 30, opacity: 0 }, "-=0.7")
    .from(".hero .btn--lg", { y: 30, opacity: 0 }, "-=0.7")
    .from(".nose", { opacity: 0, scale: 0.92, duration: 1.6 }, 0.2)
    .from(".organized", { opacity: 0, y: 20 }, "-=1");

  // 3) Nose image drifts slower than the page (parallax)
  gsap.to(".nose", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // 4) "The Edge" section
  gsap.from(".edge__title > *", {
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".edge__content", start: "top 80%" },
  });
  gsap.from(".edge__copy", {
    y: 40,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: "power3.out",
    scrollTrigger: { trigger: ".edge__content", start: "top 80%" },
  });

  // 5) "The Format" section
  gsap.from(".format__head > *", {
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".format__head", start: "top 85%" },
  });
  gsap.from(".day--1", {
    x: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    clearProps: "opacity,transform",
    scrollTrigger: { trigger: ".timeline", start: "top 70%" },
  });
  gsap.from(".day--2", {
    x: -60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    clearProps: "opacity,transform",
    scrollTrigger: { trigger: ".day--2", start: "top 85%" },
  });

  // 6) "The Faculty" section
  gsap.from(".faculty__head > *", {
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".faculty__head", start: "top 85%" },
  });

  // 7) Gold dot travels down the timeline as you scroll; the line above it and the passed day dim
  const tl = document.querySelector(".tl");
  const dot = tl.querySelector(".tl__dot");
  const getMax = () => tl.offsetHeight - dot.offsetHeight * 1.5; // dot keeps its size, just moves
  const state = { y: 0 };
  let day2Active = null;
  const render = () => {
    dot.style.transform = `translateY(${state.y}px)`;
    tl.style.setProperty("--y", state.y + "px");
    const active2 = state.y > getMax() * 0.45;
    if (active2 !== day2Active) {
      day2Active = active2;
      document.querySelector(".day--1").classList.toggle("is-dim", active2);
      document.querySelector(".day--2").classList.toggle("is-dim", !active2);
    }
  };
  render();
  gsap.to(state, {
    y: () => getMax(),
    ease: "none",
    onUpdate: render,
    invalidateOnRefresh: true,
    scrollTrigger: {
      trigger: ".timeline",
      start: "top 60%",
      end: "bottom 55%",
      scrub: 0.6,
    },
  });

  // 8) Faculty: the section pins and vertical scroll moves the cards sideways
  const wrap = document.querySelector(".cards-wrap");
  const track = document.querySelector(".cards");
  const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
  gsap
    .matchMedia()
    .add(
      "(min-width: 768px) and (min-height: 600px) and (pointer: fine)",
      () => {
        document.querySelector(".faculty").classList.add("faculty--pinned");
        gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: ".faculty",
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        return () =>
          document
            .querySelector(".faculty")
            .classList.remove("faculty--pinned");
      },
    );
  gsap.from(".card", {
    y: 50,
    opacity: 0,
    stagger: 0.08,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: ".faculty", start: "top 70%" },
  });
  // 9) Suitable for + What you'll experience
  gsap.from(".suitable__title", {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".suitable__title", start: "top 88%" },
  });
  gsap.from(".marquee", {
    y: 30,
    opacity: 0,
    stagger: 0.15,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".suitable", start: "top 55%" },
  });
  gsap.from(".exp__head > *", {
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".experience", start: "top 80%" },
  });
  // steps appear one after another (quick), each card: box -> number -> text
  const steps = gsap.utils.toArray(".exp-card");
  steps.forEach((card) => {
    gsap.set(card, { y: 40, opacity: 0 });
    gsap.set(card.querySelector(".exp-card__num"), { x: -24, opacity: 0 });
    gsap.set(card.querySelector(".exp-card__text"), { y: 16, opacity: 0 });
  });
  ScrollTrigger.batch(steps, {
    start: "top 90%",
    once: true,
    onEnter: (batch) => {
      batch.forEach((card, i) => {
        gsap
          .timeline({ delay: i * 0.12, defaults: { ease: "power3.out" } })
          .to(card, { y: 0, opacity: 1, duration: 0.5 })
          .to(
            card.querySelector(".exp-card__num"),
            { x: 0, opacity: 1, duration: 0.45 },
            "-=0.3",
          )
          .to(
            card.querySelector(".exp-card__text"),
            { y: 0, opacity: 1, duration: 0.45 },
            "-=0.35",
          );
      });
    },
  });
  // 10) Application & verification
  gsap.from(".apply__left > *", {
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: ".apply", start: "top 80%" },
  });
  gsap.from(".apply__card", {
    y: 60,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: ".apply", start: "top 80%" },
  });
  gsap.from(".apply__list li", {
    x: 30,
    opacity: 0,
    stagger: 0.08,
    duration: 0.5,
    ease: "power3.out",
    delay: 0.25,
    scrollTrigger: { trigger: ".apply__card", start: "top 75%" },
  });
}

if (reduce) {
  const tl = document.querySelector(".tl");
  tl.querySelector(".tl__dot").style.transform =
    `translateY(${tl.offsetHeight - tl.querySelector(".tl__dot").offsetHeight * 1.5}px)`;
}

// ===== Apply form: multi-step overlay -> Google Sheets (+ license file to Google Drive) =====
// Paste your Web App URL between the quotes below:
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzZv7l6gaHQT1-EJIbxC7PEMiiDtLvmiliYIO__5_37sWTbRM6NR_NGiQoxhBcp3rCM/exec";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Côte d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

(() => {
  const modal = document.getElementById("applyModal");
  const form = document.getElementById("applyForm");
  const success = modal.querySelector(".modal__success");
  const steps = [...form.querySelectorAll(".step")];
  const bars = [...form.querySelectorAll(".wizard__bar i")];
  const countEl = form.querySelector(".wizard__count");
  const nameEl = form.querySelector(".wizard__name");
  const backBtn = form.querySelector("[data-back]");
  const nextBtn = form.querySelector("[data-next]");
  const submitBtn = form.querySelector("[data-submit]");
  const errorEl = form.querySelector(".form__error");
  const goals = form.elements.goals;
  const drop = document.getElementById("drop");
  const fileInput = document.getElementById("licenseFile");
  const chip = document.getElementById("fileChip");
  const phoneIn = document.getElementById("f-phone");
  const MAX_BYTES = 5 * 1024 * 1024;
  const FILE_TYPES = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  let idx = 0,
    file = null,
    lastFocus = null,
    openSel = null;

  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m],
    );
  const CHEV =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const flag = (iso) =>
    `<img class="flag" src="https://flagcdn.com/w40/${iso}.png" alt="" width="20" height="14">`;
  // [country, ISO code for the flag, dial code]
  const DIAL = [
    ["Egypt", "eg", "20"],
    ["Saudi Arabia", "sa", "966"],
    ["United Arab Emirates", "ae", "971"],
    ["Kuwait", "kw", "965"],
    ["Qatar", "qa", "974"],
    ["Bahrain", "bh", "973"],
    ["Oman", "om", "968"],
    ["Jordan", "jo", "962"],
    ["Lebanon", "lb", "961"],
    ["Iraq", "iq", "964"],
    ["Syria", "sy", "963"],
    ["Palestine", "ps", "970"],
    ["Yemen", "ye", "967"],
    ["Libya", "ly", "218"],
    ["Tunisia", "tn", "216"],
    ["Algeria", "dz", "213"],
    ["Morocco", "ma", "212"],
    ["Sudan", "sd", "249"],
    ["Turkey", "tr", "90"],
    ["United Kingdom", "gb", "44"],
    ["United States", "us", "1"],
    ["Canada", "ca", "1"],
    ["Germany", "de", "49"],
    ["France", "fr", "33"],
    ["Italy", "it", "39"],
    ["Spain", "es", "34"],
    ["Netherlands", "nl", "31"],
    ["Pakistan", "pk", "92"],
    ["India", "in", "91"],
    ["Nigeria", "ng", "234"],
    ["South Africa", "za", "27"],
    ["Australia", "au", "61"],
  ].map(([name, iso, code]) => ({
    text: name + " +" + code,
    name,
    code,
    html: `${flag(iso)}<span>${esc(name)}</span><em>+${code}</em>`,
    btn: `${flag(iso)}<span>+${code}</span>`,
  }));

  // ----- custom dropdown (used for countries and the phone code) -----
  const closeSel = () => {
    if (!openSel) return;
    openSel.classList.remove("is-open");
    openSel.querySelector(".sel__panel").hidden = true;
    openSel = null;
  };
  const makeSel = (host, { items, ph, search, onPick }) => {
    host.innerHTML = `<button type="button" class="sel__btn" aria-haspopup="listbox"><span class="sel__val"></span>${CHEV}</button><div class="sel__panel" hidden>${search ? '<input class="sel__search" type="text" placeholder="Search…" autocomplete="off">' : ""}<ul class="sel__list" role="listbox"></ul></div>`;
    const btn = host.querySelector(".sel__btn"),
      valEl = host.querySelector(".sel__val"),
      panel = host.querySelector(".sel__panel");
    const list = host.querySelector(".sel__list"),
      q = host.querySelector(".sel__search");
    let cur = null;
    const draw = (f = "") => {
      const r = items.filter((i) =>
        i.text.toLowerCase().includes(f.trim().toLowerCase()),
      );
      list.innerHTML = r.length
        ? r
            .map(
              (i) =>
                `<li role="option" data-i="${items.indexOf(i)}" aria-selected="${i === cur}">${i.html}</li>`,
            )
            .join("")
        : '<li class="none">No match</li>';
    };
    const set = (i) => {
      cur = i;
      valEl.innerHTML = i ? i.btn : esc(ph || "");
      host.classList.toggle("has-value", !!i);
    };
    btn.addEventListener("click", () => {
      if (host.classList.contains("is-open")) return closeSel();
      closeSel();
      host.classList.add("is-open");
      panel.hidden = false;
      openSel = host;
      draw();
      if (q) {
        q.value = "";
        q.focus();
      }
      list
        .querySelector('[aria-selected="true"]')
        ?.scrollIntoView({ block: "center" });
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest("[data-i]");
      if (!li) return;
      const i = items[+li.dataset.i];
      set(i);
      closeSel();
      btn.focus();
      onPick && onPick(i);
    });
    if (q) {
      q.addEventListener("input", () => draw(q.value));
      q.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          list.querySelector("[data-i]")?.click();
        }
      });
    }
    set(null);
    return { set, reset: () => set(null), get: () => cur };
  };
  document.addEventListener("click", (e) => {
    if (openSel && !openSel.contains(e.target)) closeSel();
  });

  const syncPhone = () => {
    const n = phoneIn.value.trim();
    form.elements.phone.value = n ? `+${dial.get().code} ${n}` : "";
  };
  const egypt = DIAL[0];
  const dial = makeSel(document.getElementById("dialSel"), {
    items: DIAL,
    search: true,
    onPick: syncPhone,
  });
  dial.set(egypt);

  const countryItems = COUNTRIES.map((c) => ({
    text: c,
    html: esc(c),
    btn: esc(c),
  }));
  const selects = {};
  ["country", "registrationCountry"].forEach((n) => {
    const host = form.querySelector(`[data-sel="${n}"]`);
    selects[n] = makeSel(host, {
      items: countryItems,
      ph: host.dataset.ph,
      search: true,
      onPick: (i) => {
        form.elements[n].value = i.text;
        setError(n, "");
        if (n === "country") {
          const d = DIAL.find((x) => x.name === i.text);
          if (d) {
            dial.set(d);
            syncPhone();
          }
        }
      },
    });
  });

  // ----- validation -----
  const inList = (v) =>
    COUNTRIES.some((c) => c.toLowerCase() === v.trim().toLowerCase());
  const filled = (msg) => (v) => v.trim().length > 0 || msg;
  const RULES = {
    fullName: (v) => v.trim().length >= 3 || "Please enter your full name",
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ||
      "Enter a valid email address",
    phone: (v) =>
      /^\+\d{1,4} [\d\s-]{6,15}$/.test(v) || "Enter your phone number",
    country: (v) => inList(v) || "Please select your country",
    city: filled("Please enter your city"),
    specialty: filled("Please enter your medical specialty"),
    position: filled("Please enter your current position"),
    institution: filled("Please enter your hospital, clinic or institution"),
    clinicalYears: (v) =>
      (v !== "" && +v >= 0 && +v <= 70) || "Enter a number between 0 and 70",
    registrationCountry: (v) =>
      inList(v) || "Please select the country of registration",
    rhinoYears: (v) => !!v || "Please choose one option",
    previousCourses: (v) => !!v || "Please choose one option",
    licenseFile: () => !!file || "Please upload your medical ID or license",
    agree: () => form.elements.agree.checked || "Please confirm to continue",
  };
  const fieldEl = (name) => form.querySelector(`[data-field="${name}"]`);
  const setError = (name, msg) => {
    const f = fieldEl(name);
    f.classList.toggle("has-error", !!msg);
    f.querySelector(".field__msg").textContent = msg || "";
  };
  const validateStep = (i) => {
    let first = null;
    steps[i].querySelectorAll("[data-field]").forEach((f) => {
      const name = f.dataset.field;
      if (!RULES[name]) return;
      const r = RULES[name](
        name === "licenseFile" || name === "agree"
          ? ""
          : form.elements[name].value,
      );
      setError(name, r === true ? "" : r);
      if (r !== true && !first) first = f;
    });
    first
      ?.querySelector(
        "input:not([type=hidden]):not([type=file]),textarea,button,.drop",
      )
      ?.focus?.();
    return !first;
  };
  form.addEventListener("input", (e) => {
    if (e.target === phoneIn) syncPhone();
    const f = e.target.closest("[data-field]");
    if (f && f.classList.contains("has-error")) setError(f.dataset.field, "");
    if (e.target === goals)
      document.getElementById("goalsCount").textContent = goals.value.length;
  });
  form.addEventListener("change", (e) => {
    const f = e.target.closest("[data-field]");
    if (f && f.classList.contains("has-error")) setError(f.dataset.field, "");
  });

  // ----- file upload -----
  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!FILE_TYPES[ext])
      return setError("licenseFile", "Accepted formats: PDF, JPG, PNG");
    if (f.size > MAX_BYTES)
      return setError("licenseFile", "File is too large (max 5 MB)");
    file = f;
    setError("licenseFile", "");
    chip.querySelector(".file__name").textContent =
      `${f.name} · ${(f.size / 1024 / 1024).toFixed(2)} MB`;
    chip.hidden = false;
    drop.hidden = true;
  };
  const clearFile = () => {
    file = null;
    fileInput.value = "";
    chip.hidden = true;
    drop.hidden = false;
  };
  fileInput.addEventListener("change", () => pickFile(fileInput.files[0]));
  chip.querySelector(".file__remove").addEventListener("click", clearFile);
  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("is-over");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove("is-over");
    }),
  );
  drop.addEventListener("drop", (e) => pickFile(e.dataTransfer.files[0]));

  // ----- steps -----
  const show = (i, dir) => {
    closeSel();
    steps[idx].classList.remove("is-active");
    idx = i;
    steps[idx].dataset.dir = dir;
    steps[idx].classList.add("is-active");
    bars.forEach((b, n) => b.classList.toggle("is-done", n <= idx));
    countEl.textContent = `Step ${idx + 1} / ${steps.length}`;
    nameEl.innerHTML = steps[idx].dataset.title;
    const last = idx === steps.length - 1;
    backBtn.hidden = idx === 0;
    nextBtn.hidden = last;
    submitBtn.hidden = !last;
    modal
      .querySelector(".modal__panel")
      .scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(
      () =>
        steps[idx]
          .querySelector(
            "input:not([type=file]):not([type=radio]):not([type=hidden]):not([type=checkbox]),textarea",
          )
          ?.focus({ preventScroll: true }),
      120,
    );
  };
  const next = () => {
    if (validateStep(idx) && idx < steps.length - 1) show(idx + 1, "next");
  };
  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", () => idx > 0 && show(idx - 1, "back"));

  // ----- open / close -----
  const openModal = () => {
    lastFocus = document.activeElement;
    form.hidden = false;
    success.hidden = true;
    errorEl.hidden = true;
    steps.forEach((s) => s.classList.remove("is-active"));
    idx = 0;
    steps[0].classList.add("is-active");
    show(0, "back");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.querySelector(".page").inert = true;
    requestAnimationFrame(() => modal.classList.add("is-open"));
    if (typeof lenis !== "undefined") lenis.stop();
  };
  const closeModal = () => {
    closeSel();
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    document.querySelector(".page").inert = false;
    if (typeof lenis !== "undefined") lenis.start();
    setTimeout(() => {
      modal.hidden = true;
    }, 300);
    lastFocus?.focus();
  };
  document.querySelectorAll("[data-apply]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    }),
  );
  modal
    .querySelectorAll("[data-close]")
    .forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !modal.hidden) {
      const focusable = [
        ...modal.querySelectorAll(
          'a[href],button,input,textarea,select,[tabindex="0"]',
        ),
      ].filter(
        (el) =>
          !el.disabled && el.getClientRects().length && el.type !== "hidden",
      );
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    if (e.key !== "Escape" || modal.hidden) return;
    if (openSel) closeSel();
    else closeModal();
  });

  // ----- submit -----
  const toBase64 = (f) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(",")[1]);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(f);
    });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (idx < steps.length - 1) return next(); // Enter key on earlier steps = Next
    if (form.elements.website.value) return; // spam trap: real people leave it empty
    errorEl.hidden = true;
    if (!steps.every((_, i) => validateStep(i) || (show(i, "back"), false)))
      return;
    if (!SHEET_URL.startsWith("https://")) {
      errorEl.textContent =
        "The form is not connected yet. Paste your Web App URL in script.js (SHEET_URL).";
      errorEl.hidden = false;
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    try {
      const body = new URLSearchParams(new FormData(form));
      body.delete("website");
      body.set("fileName", file.name);
      body.set(
        "fileType",
        FILE_TYPES[file.name.split(".").pop().toLowerCase()],
      );
      body.set("fileData", await toBase64(file));
      const res = await fetch(SHEET_URL, { method: "POST", body });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Request failed");
      form.reset();
      clearFile();
      document.getElementById("goalsCount").textContent = "0";
      ["country", "registrationCountry", "phone"].forEach(
        (n) => (form.elements[n].value = ""),
      );
      Object.values(selects).forEach((s) => s.reset());
      dial.set(egypt);
      form.hidden = true;
      success.hidden = false;
    } catch (err) {
      console.error(err);
      errorEl.textContent =
        "Something went wrong. Please try again in a moment, or contact us on WhatsApp.";
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit application";
    }
  });
})();
