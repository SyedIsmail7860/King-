/* =========================================
   ISMAIL | DEVELOPER PORTFOLIO
   src/app.js
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================
       HELPERS
       ========================================= */

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));

    const safeStorage = {
        get(key, fallback = null) {
            try {
                const value = localStorage.getItem(key);
                return value ?? fallback;
            } catch {
                return fallback;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch {
                /* Storage may be unavailable */
            }
        }
    };

    /* =========================================
       ELEMENTS
       ========================================= */

    const body = document.body;

    const navbar = $(".navbar");
    const menuButton = $("#menuButton");
    const navLinks = $(".nav-links");

    const themeToggle = $("#themeToggle");

    const scrollProgress = $("#scrollProgress");
    const backToTop = $("#backToTop");

    const typingText = $("#typingText");

    const toast = $("#toast");
    const toastMessage = $("#toastMessage");

    /* =========================================
       TOAST
       ========================================= */

    let toastTimer;

    function showToast(message) {
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    /* =========================================
       THEME
       ========================================= */

    function applyTheme(theme) {
        const isLight = theme === "light";

        body.classList.toggle("light-mode", isLight);

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                isLight ? "Switch to dark mode" : "Switch to light mode"
            );

            themeToggle.textContent = isLight ? "🌙" : "☀️";
        }

        safeStorage.set("portfolio-theme", isLight ? "light" : "dark");
    }

    const savedTheme = safeStorage.get("portfolio-theme", "dark");

    applyTheme(savedTheme === "light" ? "light" : "dark");

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isLight = body.classList.contains("light-mode");

            applyTheme(isLight ? "dark" : "light");

            showToast(isLight ? "Dark mode enabled" : "Light mode enabled");
        });
    }

    /* =========================================
       MOBILE MENU
       ========================================= */

    function closeMenu() {
        if (!navLinks) return;

        navLinks.classList.remove("open");

        if (menuButton) {
            menuButton.setAttribute("aria-expanded", "false");
        }
    }

    if (menuButton && navLinks) {
        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );
        });

        $$(".nav-links a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", (event) => {
            if (
                navLinks.classList.contains("open") &&
                !navLinks.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                closeMenu();
            }
        });
    }

    /* =========================================
       SMOOTH NAVIGATION
       ========================================= */

    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    /* =========================================
       NAVBAR SCROLL EFFECT
       ========================================= */

    function updateNavbar() {
        if (!navbar) return;

        navbar.classList.toggle("scrolled", window.scrollY > 40);
    }

    /* =========================================
       SCROLL PROGRESS + BACK TO TOP
       ========================================= */

    function updateScrollUI() {
        const documentHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress =
            documentHeight > 0
                ? (window.scrollY / documentHeight) * 100
                : 0;

        if (scrollProgress) {
            scrollProgress.style.width = `${Math.min(
                100,
                Math.max(0, progress)
            )}%`;
        }

        if (backToTop) {
            backToTop.classList.toggle("show", window.scrollY > 500);
        }
    }

    function handleScroll() {
        updateNavbar();
        updateScrollUI();
        updateActiveNav();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    /* =========================================
       ACTIVE NAVIGATION
       ========================================= */

    const sections = $$("main section[id]");
    const navigationItems = $$(".nav-links a[href^='#']");

    function updateActiveNav() {
        if (!sections.length || !navigationItems.length) return;

        const scrollPosition = window.scrollY + 150;

        let currentSection = "";

        sections.forEach((section) => {
            if (scrollPosition >= section.offsetTop) {
                currentSection = section.id;
            }
        });

        navigationItems.forEach((link) => {
            const target = link.getAttribute("href");

            link.classList.toggle(
                "active",
                target === `#${currentSection}`
            );
        });
    }

    /* =========================================
       TYPING ANIMATION
       ========================================= */

    if (typingText) {
        const typingWords = [
            "CSE Student",
            "Python Developer",
            "SQL Learner",
            "Web Developer",
            "Software Developer"
        ];

        let wordIndex = 0;
        let characterIndex = 0;
        let deleting = false;

        const typingSpeed = 85;
        const deletingSpeed = 50;
        const pauseAfterWord = 1500;

        function typeLoop() {
            const currentWord = typingWords[wordIndex];

            if (!deleting) {
                characterIndex++;

                typingText.textContent =
                    currentWord.substring(0, characterIndex);

                if (characterIndex >= currentWord.length) {
                    deleting = true;

                    setTimeout(typeLoop, pauseAfterWord);
                    return;
                }
            } else {
                characterIndex--;

                typingText.textContent =
                    currentWord.substring(0, characterIndex);

                if (characterIndex <= 0) {
                    deleting = false;

                    wordIndex =
                        (wordIndex + 1) % typingWords.length;
                }
            }

            setTimeout(
                typeLoop,
                deleting ? deletingSpeed : typingSpeed
            );
        }

        typeLoop();
    }

    /* =========================================
       REVEAL ANIMATIONS
       ========================================= */

    const revealElements = $$(".reveal");

    if ("IntersectionObserver" in window && revealElements.length) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }

    /* =========================================
       SKILL ANIMATION
       ========================================= */

    const skillBars = $$(".skill-progress");

    if ("IntersectionObserver" in window && skillBars.length) {
        const skillObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const width =
                        entry.target.dataset.width ||
                        entry.target.style.getPropertyValue(
                            "--skill-width"
                        );

                    if (width) {
                        entry.target.style.setProperty(
                            "--skill-width",
                            width
                        );
                    }

                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.3
            }
        );

        skillBars.forEach((bar) => {
            skillObserver.observe(bar);
        });
    }

    /* =========================================
       PROFILE 3D EFFECT
       ========================================= */

    const profileCard = $(".profile-card");

    if (
        profileCard &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
        profileCard.addEventListener("mousemove", (event) => {
            const rect = profileCard.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) / rect.width - 0.5;

            const y =
                (event.clientY - rect.top) / rect.height - 0.5;

            const rotateX = y * -8;
            const rotateY = x * 8;

            profileCard.style.transform =
                `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        profileCard.addEventListener("mouseleave", () => {
            profileCard.style.transform =
                "perspective(900px) rotateX(0deg) rotateY(0deg)";
        });
    }

    /* =========================================
       GALLERY MODAL
       ========================================= */

    const imageModal = $("#imageModal");
    const modalClose = $("#modalClose");
    const modalImage = $("#modalImage");
    const modalCaption = $("#modalCaption");

    function openImageModal(image, caption = "") {
        if (!imageModal || !modalImage) return;

        const source =
            image.currentSrc ||
            image.src ||
            image.getAttribute("src");

        if (!source) return;

        modalImage.src = source;
        modalImage.alt = image.alt || "Gallery image";

        if (modalCaption) {
            modalCaption.textContent =
                caption || image.alt || "Ismail";
        }

        imageModal.classList.add("active");
        imageModal.setAttribute("aria-hidden", "false");

        body.classList.add("no-scroll");
    }

    function closeImageModal() {
        if (!imageModal) return;

        imageModal.classList.remove("active");
        imageModal.setAttribute("aria-hidden", "true");

        body.classList.remove("no-scroll");

        if (modalImage) {
            modalImage.src = "";
        }
    }

    $$(".gallery-item img").forEach((image) => {
        image.addEventListener("click", () => {
            const galleryItem = image.closest(".gallery-item");

            const caption =
                galleryItem?.dataset.caption ||
                galleryItem?.querySelector(".gallery-overlay")
                    ?.textContent
                    ?.trim() ||
                image.alt;

            openImageModal(image, caption);
        });
    });

    if (modalClose) {
        modalClose.addEventListener("click", closeImageModal);
    }

    if (imageModal) {
        imageModal.addEventListener("click", (event) => {
            if (event.target === imageModal) {
                closeImageModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeImageModal();
            closeMenu();
        }
    });

    /* =========================================
       MUSIC PLAYER
       ========================================= */

    const audio = $("#backgroundMusic");

    const musicPlayer = $("#musicPlayer");
    const musicButton = $("#musicButton");

    const musicPrev = $("#musicPrev");
    const musicPlay = $("#musicPlay");
    const musicNext = $("#musicNext");

    const musicProgress = $("#musicProgress");
    const musicCurrent = $("#musicCurrent");
    const musicDuration = $("#musicDuration");

    const musicVolume = $("#musicVolume");
    const musicStatus = $("#musicStatus");
    const musicEqualizer = $("#musicEqualizer");

    let musicVisible = false;

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function updateMusicButton() {
        if (!musicPlay || !audio) return;

        const isPlaying =
            !audio.paused &&
            !audio.ended;

        musicPlay.textContent = isPlaying ? "❚❚" : "▶";

        musicPlay.setAttribute(
            "aria-label",
            isPlaying ? "Pause music" : "Play music"
        );

        if (musicEqualizer) {
            musicEqualizer.classList.toggle(
                "paused",
                !isPlaying
            );
        }

        if (musicStatus) {
            musicStatus.textContent = isPlaying
                ? "Playing"
                : "Paused";
        }
    }

    function updateMusicProgress() {
        if (!audio) return;

        const duration = audio.duration;
        const current = audio.currentTime;

        if (musicProgress && Number.isFinite(duration) && duration > 0) {
            musicProgress.value =
                (current / duration) * 100;
        }

        if (musicCurrent) {
            musicCurrent.textContent =
                formatTime(current);
        }

        if (musicDuration) {
            musicDuration.textContent =
                formatTime(duration);
        }
    }

    function showMusicPlayer() {
        if (!musicPlayer) return;

        musicPlayer.classList.add("show");
        musicVisible = true;
    }

    async function toggleMusic() {
        if (!audio) {
            showToast("music.mp3 was not found");
            return;
        }

        showMusicPlayer();

        try {
            if (audio.paused) {
                await audio.play();
                showToast("Music playing");
            } else {
                audio.pause();
                showToast("Music paused");
            }
        } catch (error) {
            console.error("Music playback error:", error);

            showToast(
                "Tap Play and make sure music.mp3 is in the root folder"
            );
        }

        updateMusicButton();
    }

    if (audio) {
        audio.volume = musicVolume
            ? Number(musicVolume.value || 0.65)
            : 0.65;

        audio.addEventListener("loadedmetadata", () => {
            updateMusicProgress();
        });

        audio.addEventListener("timeupdate", () => {
            updateMusicProgress();
        });

        audio.addEventListener("play", () => {
            updateMusicButton();
        });

        audio.addEventListener("pause", () => {
            updateMusicButton();
        });

        audio.addEventListener("ended", () => {
            updateMusicButton();
            updateMusicProgress();
        });

        audio.addEventListener("error", () => {
            if (musicStatus) {
                musicStatus.textContent =
                    "music.mp3 not found";
            }

            console.error(
                "Could not load music.mp3. Keep music.mp3 beside index.html."
            );
        });
    }

    if (musicButton) {
        musicButton.addEventListener("click", toggleMusic);
    }

    if (musicPlay) {
        musicPlay.addEventListener("click", toggleMusic);
    }

    if (musicPrev) {
        musicPrev.addEventListener("click", () => {
            if (!audio) return;

            audio.currentTime = 0;
            showMusicPlayer();
            showToast("Restarted music");
        });
    }

    if (musicNext) {
        musicNext.addEventListener("click", () => {
            if (!audio) return;

            audio.currentTime = 0;

            if (audio.paused) {
                toggleMusic();
            } else {
                showToast("Restarted music");
            }
        });
    }

    if (musicProgress && audio) {
        musicProgress.addEventListener("input", () => {
            if (!Number.isFinite(audio.duration)) return;

            const percentage =
                Number(musicProgress.value) / 100;

            audio.currentTime =
                audio.duration * percentage;
        });
    }

    if (musicVolume && audio) {
        musicVolume.addEventListener("input", () => {
            const volume =
                Math.min(
                    1,
                    Math.max(0, Number(musicVolume.value))
                );

            audio.volume = volume;
        });
    }

    /* =========================================
       SHOW MUSIC PLAYER AFTER USER SCROLLS
       ========================================= */

    function checkMusicVisibility() {
        if (!musicPlayer || musicVisible) return;

        if (window.scrollY > 250) {
            showMusicPlayer();
        }
    }

    window.addEventListener(
        "scroll",
        checkMusicVisibility,
        { passive: true }
    );

    /* =========================================
       CONTACT FORM
       ========================================= */

    const contactForm = $("#contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name =
                contactForm.querySelector('[name="name"]')?.value.trim();

            const email =
                contactForm.querySelector('[name="email"]')?.value.trim();

            const message =
                contactForm.querySelector('[name="message"]')?.value.trim();

            if (!name || !email || !message) {
                showToast("Please fill all fields");
                return;
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPa
