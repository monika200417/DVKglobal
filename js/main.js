/* ============================================================
   DVK Global — Main JavaScript
   McLarens-style: hero slideshow, stats counter, scroll reveal,
   sticky header, mobile nav, contact form
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // ── Year ──────────────────────────────────────────────────
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    // ── Sticky header shadow ──────────────────────────────────
    const header = document.getElementById("siteHeader");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("scrolled", window.scrollY > 30);
        }, { passive: true });
    }

    // ── Mobile menu toggle ────────────────────────────────────
    const toggle = document.getElementById("menuToggle");
    const nav    = document.getElementById("mainNav");

    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            const open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
            // Animate hamburger to X
            const spans = toggle.querySelectorAll("span");
            if (open) {
                spans[0].style.transform = "translateY(7px) rotate(45deg)";
                spans[1].style.opacity   = "0";
                spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
            } else {
                spans[0].style.transform = "";
                spans[1].style.opacity   = "";
                spans[2].style.transform = "";
            }
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                nav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.setAttribute("aria-label", "Open navigation");
                toggle.querySelectorAll("span").forEach((s) => {
                    s.style.transform = "";
                    s.style.opacity   = "";
                });
            });
        });
    }

    // ── Smooth scrolling for anchor links ────────────────────
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const href   = anchor.getAttribute("href");
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = header ? header.offsetHeight : 0;
            const top    = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });

    // ── Active nav highlight on scroll ───────────────────────
    const sections  = document.querySelectorAll("section[id]");
    const navLinks  = document.querySelectorAll(".main-nav a[data-nav]");

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    link.classList.toggle("is-active",
                        link.getAttribute("data-nav") === id);
                });
            }
        });
    }, { rootMargin: "-30% 0px -50% 0px", threshold: 0 });

    sections.forEach((s) => navObserver.observe(s));

    // ── Scroll Reveal ─────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    document.querySelectorAll(".scroll-reveal, .stagger-children").forEach((el) => {
        revealObserver.observe(el);
    });

    // ── Run modules ───────────────────────────────────────────
    initHeroSlider();
    initStatsCounter();
    initContactForm();
});


/* ────────────────────────────────────────────────────────────
   HERO SLIDESHOW
──────────────────────────────────────────────────────────── */
function initHeroSlider() {
    const slides    = Array.from(document.querySelectorAll(".hero-slide"));
    const dotsWrap  = document.getElementById("heroDots");
    const prevBtn   = document.getElementById("heroPrev");
    const nextBtn   = document.getElementById("heroNext");

    if (!slides.length || !dotsWrap) return;

    const INTERVAL      = 6200;
    const reduceMotion  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = 0;
    let timer  = null;

    // Build dots
    slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => { go(i); restartTimer(); });
        dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.querySelectorAll("button"));

    function go(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
        dots.forEach((dot,  i) => dot.classList.toggle("is-active",  i === active));
    }

    function restartTimer() {
        if (reduceMotion) return;
        clearInterval(timer);
        timer = setInterval(() => go(active + 1), INTERVAL);
    }

    prevBtn?.addEventListener("click", () => { go(active - 1); restartTimer(); });
    nextBtn?.addEventListener("click", () => { go(active + 1); restartTimer(); });

    // Keyboard support
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft")  { go(active - 1); restartTimer(); }
        if (e.key === "ArrowRight") { go(active + 1); restartTimer(); }
    });

    // Swipe support
    let touchStartX = 0;
    const hero = document.querySelector(".home-hero");
    hero?.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    hero?.addEventListener("touchend",   (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) { go(diff > 0 ? active + 1 : active - 1); restartTimer(); }
    });

    go(0);
    restartTimer();
}


/* ────────────────────────────────────────────────────────────
   ANIMATED STATS COUNTER
──────────────────────────────────────────────────────────── */
function initStatsCounter() {
    const counters = document.querySelectorAll(".stat-number[data-count]");
    if (!counters.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);

            const el      = entry.target;
            const target  = parseInt(el.dataset.count, 10);
            const suffix  = el.dataset.suffix || "";

            if (reduceMotion) { el.textContent = target + suffix; return; }

            const duration = 1800;
            const start    = performance.now();

            function tick(now) {
                const elapsed  = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // easeOutExpo
                const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const value    = Math.round(eased * target);
                el.textContent = value + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        });
    }, { threshold: 0.3 });

    counters.forEach((el) => observer.observe(el));
}


/* ────────────────────────────────────────────────────────────
   CONTACT FORM
──────────────────────────────────────────────────────────── */
function initContactForm() {
    const form   = document.getElementById("contactForm");
    const note   = document.getElementById("contactNote");
    const submit = document.getElementById("submitBtn");
    if (!form || !note) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            shakeElement(form);
            return;
        }

        // Disable button
        if (submit) {
            submit.disabled = true;
            submit.textContent = "Sending…";
        }

        const data    = new FormData(form);
        const name    = data.get("name")    || "";
        const email   = data.get("email")   || "";
        const phone   = data.get("phone")   || "";
        const service = data.get("service") || "Website enquiry";
        const message = data.get("message") || "";

        const subject = `DVK Global Enquiry — ${service}`;
        const body = [
            `Name:    ${name}`,
            `Email:   ${email}`,
            `Phone:   ${phone}`,
            `Service: ${service}`,
            "",
            "Assignment Details:",
            message
        ].join("\n");

        note.className  = "form-note success";
        note.textContent = "✓ Thank you! Your enquiry email is opening now…";

        setTimeout(() => {
            window.location.href = `mailto:office@dvkgisla.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            form.reset();
            if (submit) {
                submit.disabled     = false;
                submit.textContent  = "Send Enquiry";
            }
        }, 500);
    });
}


/* ────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────── */
function shakeElement(el) {
    el.style.animation = "none";
    el.offsetHeight; // reflow
    el.style.animation = "shake 0.5s ease";
    setTimeout(() => { el.style.animation = ""; }, 550);
}


/* ────────────────────────────────────────────────────────────
   TESTIMONIAL FORM + STAR RATING
──────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
    initStarRating();
    initTestimonialForm();
});

function initStarRating() {
    const wrap   = document.getElementById("starRating");
    const hidden = document.getElementById("tRatingVal");
    if (!wrap || !hidden) return;

    const stars = Array.from(wrap.querySelectorAll(".star"));
    let selected = 0;

    function paint(upTo) {
        stars.forEach((s, i) => {
            s.classList.toggle("hovered", i < upTo);
            s.classList.toggle("active",  i < selected);
        });
    }

    stars.forEach((star, idx) => {
        star.addEventListener("mouseenter", () => paint(idx + 1));
        star.addEventListener("click", () => {
            selected       = idx + 1;
            hidden.value   = selected;
            stars.forEach((s, i) => s.classList.toggle("active", i < selected));
        });
    });

    wrap.addEventListener("mouseleave", () => paint(selected));
}

function initTestimonialForm() {
    const form   = document.getElementById("testimonialForm");
    const note   = document.getElementById("testimonialNote");
    const btn    = document.getElementById("testimonialSubmitBtn");
    if (!form || !note) return;

    const KEY    = "dvk-testimonials";

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; }
        catch { return []; }
    }

    function save(items) {
        try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
    }

    function escape(str) {
        return String(str)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function renderNew(item) {
        // Insert a new card into the existing testimonial grid
        const grid = document.querySelector(".testimonial-grid");
        if (!grid) return;

        const initials = item.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
        const stars    = "★".repeat(item.rating || 5) + "☆".repeat(5 - (item.rating || 5));

        const card = document.createElement("article");
        card.className = "testimonial-card new-testimonial";
        card.innerHTML = `
            <span class="quote-icon">&ldquo;</span>
            <div style="color:#f5a623; font-size:1.1rem; margin-bottom:10px;">${stars}</div>
            <blockquote>${escape(item.message)}</blockquote>
            <div class="testimonial-footer">
                <div class="testimonial-avatar">${initials}</div>
                <div class="testimonial-meta">
                    <strong>${escape(item.name)}</strong>
                    <span>${escape(item.role)} &mdash; ${escape(item.service)}</span>
                </div>
            </div>`;
        // Prepend to grid
        grid.insertBefore(card, grid.firstChild);

        // Animate in
        requestAnimationFrame(() => {
            card.style.opacity    = "0";
            card.style.transform  = "translateY(20px)";
            card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            requestAnimationFrame(() => {
                card.style.opacity   = "1";
                card.style.transform = "translateY(0)";
            });
        });
    }

    // Restore saved testimonials on page load
    load().forEach(renderNew);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); shakeElement(form); return; }

        if (btn) { btn.disabled = true; btn.textContent = "Submitting…"; }

        const data = new FormData(form);
        const item = {
            name:    data.get("name")    || "",
            role:    data.get("role")    || "",
            email:   data.get("email")   || "",
            service: data.get("service") || "",
            rating:  parseInt(data.get("rating") || "5", 10),
            message: data.get("message") || ""
        };

        const stored = [item, ...load()].slice(0, 12);
        save(stored);
        renderNew(item);

        note.className   = "form-note success";
        note.textContent = "✓ Thank you! Your testimonial has been submitted and is visible on the page.";
        form.reset();

        // Reset stars
        document.querySelectorAll(".star").forEach(s => s.classList.remove("active", "hovered"));
        const hidden = document.getElementById("tRatingVal");
        if (hidden) hidden.value = "";

        if (btn) {
            btn.disabled    = false;
            btn.textContent = "Submit Testimonial";
        }

        // Also send via email to office
        const subject = `DVK Global Testimonial — ${item.name}`;
        const body = [
            `Name:    ${item.name}`,
            `Role:    ${item.role}`,
            `Email:   ${item.email}`,
            `Service: ${item.service}`,
            `Rating:  ${item.rating}/5`,
            "",
            "Testimonial:",
            item.message
        ].join("\n");

        setTimeout(() => {
            window.location.href = `mailto:office@dvkgisla.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }, 800);
    });
}
function activateSlide(index){

    slides.forEach(slide=>{
        slide.classList.remove("is-active");
    });

    void slides[index].offsetWidth;

    slides[index].classList.add("is-active");

}