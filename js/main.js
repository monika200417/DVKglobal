document.addEventListener("DOMContentLoaded", () => {
    // Current year updater
    document.querySelectorAll("[data-year]").forEach((target) => {
        target.textContent = new Date().getFullYear();
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector(".menu-toggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const isOpen = document.body.classList.toggle("nav-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        });

        document.querySelectorAll(".main-nav a").forEach((link) => {
            link.addEventListener("click", () => {
                document.body.classList.remove("nav-open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open navigation");
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer to highlight active navigation link based on scroll position
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".main-nav a");
    const observerOptions = {
        root: null,
        rootMargin: "-30% 0px -50% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
                });
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    initHeroSlider();
    initContactForm();
    initTestimonials();
});

function initHeroSlider() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dotsWrap = document.querySelector(".hero-dots");
    if (!slides.length || !dotsWrap) return;

    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active = 0;
    let timer = null;

    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Show slide ${index + 1}`);
        dot.addEventListener("click", () => showSlide(index));
        dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.querySelectorAll("button"));

    function showSlide(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    function restartTimer() {
        if (reduceMotion) return;
        window.clearInterval(timer);
        timer = window.setInterval(() => showSlide(active + 1), 6000);
    }

    prev?.addEventListener("click", () => {
        showSlide(active - 1);
        restartTimer();
    });

    next?.addEventListener("click", () => {
        showSlide(active + 1);
        restartTimer();
    });

    showSlide(0);
    restartTimer();
}

function initContactForm() {
    const form = document.querySelector("#contactForm");
    const note = document.querySelector("#contactNote");
    if (!form || !note) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = new FormData(form);
        const name = data.get("name") || "";
        const email = data.get("email") || "";
        const phone = data.get("phone") || "";
        const service = data.get("service") || "Website enquiry";
        const message = data.get("message") || "";
        const subject = `DVK Global enquiry - ${service}`;
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Service: ${service}`,
            "",
            "Message:",
            message
        ].join("\n");

        note.textContent = "Thank you. Your email draft is opening now.";
        document.querySelector("#thanks")?.scrollIntoView({ behavior: "smooth", block: "start" });

        window.setTimeout(() => {
            window.location.href = `mailto:office@dvkgisla.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }, 450);
    });
}

function initTestimonials() {
    const grid = document.querySelector("#testimonialGrid");
    const form = document.querySelector("#testimonialForm");
    const note = document.querySelector("#testimonialNote");
    if (!grid || !form || !note) return;

    const storageKey = "dvk-global-testimonials";

    function loadItems() {
        try {
            return JSON.parse(window.localStorage.getItem(storageKey)) || [];
        } catch {
            return [];
        }
    }

    function saveItems(items) {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(items));
        } catch {
            note.textContent = "Preview saved for this session.";
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function render(items) {
        if (!items.length) return;

        grid.innerHTML = items.map((item) => `
            <article class="testimonial-card">
                <span>Client feedback</span>
                <p>“${escapeHtml(item.message)}”</p>
                <strong>${escapeHtml(item.name)}</strong>
                <small>${escapeHtml(item.role)}</small>
            </article>
        `).join("");
    }

    render(loadItems());

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = new FormData(form);
        const item = {
            name: data.get("name") || "",
            role: data.get("role") || "",
            message: data.get("message") || ""
        };
        const items = [item, ...loadItems()].slice(0, 9);

        saveItems(items);
        render(items);
        form.reset();
        note.textContent = "Thank you. The testimonial preview has been added.";
    });
}
