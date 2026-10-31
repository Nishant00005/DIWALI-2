
/* =====================================
   ROYAL DIWALI 2026
   COMPLETE JAVASCRIPT
===================================== */

const $ = (id) => document.getElementById(id);

// =====================================
// 1. TOAST NOTIFICATION
// =====================================

let toastTimer;

function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// =====================================
// 2. FOUR THEME SWITCHER
// =====================================

const themeSelect = $("themeSelect");

const availableThemes = [
    "royal",
    "dark",
    "traditional",
    "colorful"
];

function applyTheme(theme, notify = false) {

    if (!availableThemes.includes(theme)) {
        theme = "royal";
    }

    document.body.classList.remove(
        ...availableThemes.map(name => "theme-" + name)
    );

    document.body.classList.add("theme-" + theme);

    themeSelect.value = theme;

    try {
        localStorage.setItem("diwaliTheme", theme);
    } catch (error) {
        console.warn("Theme preference could not be saved.");
    }

    if (notify) {
        const names = {
            royal: "Luxury Royal Diwali 👑",
            dark: "Premium Dark & Gold 🌙",
            traditional: "Traditional Indian Festive 🪔",
            colorful: "Modern Colorful 3D 🌈"
        };

        showToast(names[theme] + " activated!");
    }
}

let savedTheme = "royal";

try {
    savedTheme = localStorage.getItem("diwaliTheme") || "royal";
} catch (error) {
    console.warn("Using default theme.");
}

applyTheme(savedTheme);

themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value, true);
});


// =====================================
// 3. DIWALI WISH GENERATOR
// =====================================

const wishes = [
    "May this Diwali bring endless joy, success and prosperity into your life!",
    "May the light of diyas guide you towards happiness and success!",
    "Wishing you a Diwali filled with love, laughter and beautiful memories!",
    "May Goddess Lakshmi bless your home with wealth and prosperity!",
    "May your life sparkle with happiness just like the Diwali lights!",
    "Sending you warm wishes for a bright and beautiful Diwali!",
    "May every diya bring new hope and every sparkle bring new happiness!",
    "May your home be filled with peace, love and positive energy!",
    "May this festival bring new beginnings and wonderful opportunities!"
];

let currentWish = 0;

$("newWishBtn").addEventListener("click", () => {

    let nextWish;

    do {
        nextWish = Math.floor(Math.random() * wishes.length);
    } while (nextWish === currentWish);

    currentWish = nextWish;

    $("wishText").textContent = wishes[currentWish];

    showToast("A new Diwali wish for you! ✨");
});


// =====================================
// 4. COPY WISH
// =====================================

$("copyWishBtn").addEventListener("click", async () => {

    const message =
        $("wishText").textContent + "\n\nHappy Diwali 2026! 🪔";

    try {

        await navigator.clipboard.writeText(message);

        showToast("Wish copied successfully! 📋");

    } catch (error) {

        const area = document.createElement("textarea");

        area.value = message;

        document.body.appendChild(area);

        area.select();

        try {
            document.execCommand("copy");
            showToast("Wish copied! 📋");
        } catch (copyError) {
            showToast("Please copy the wish manually.");
        }

        area.remove();
    }
});


// =====================================
// 5. WHATSAPP SHARE
// =====================================

$("whatsappBtn").addEventListener("click", () => {

    const message =
        "🪔 " + $("wishText").textContent +
        "\n\n✨ Happy Diwali 2026! ✨";

    const whatsappURL =
        "https://wa.me/?text=" + encodeURIComponent(message);

    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );
});


// =====================================
// 6. INTERACTIVE DIYAS
// =====================================

const diyas = document.querySelectorAll(".little-diya");

function updateDiyas() {

    const litCount =
        document.querySelectorAll(".little-diya.lit").length;

    if (litCount === 4) {
        $("diyaStatus").textContent =
            "✨ All four diyas are shining brightly!";
    }

    else if (litCount === 0) {
        $("diyaStatus").textContent =
            "Your diyas are waiting to shine!";
    }

    else {
        $("diyaStatus").textContent =
            litCount + " of 4 diyas are glowing!";
    }
}

diyas.forEach((diya) => {

    diya.addEventListener("click", () => {

        diya.classList.toggle("lit");

        updateDiyas();

    });

});

$("allDiyasBtn").addEventListener("click", () => {

    diyas.forEach(diya => diya.classList.add("lit"));

    updateDiyas();

    showToast("All diyas are glowing! 🪔");
});

$("offDiyasBtn").addEventListener("click", () => {

    diyas.forEach(diya => diya.classList.remove("lit"));

    updateDiyas();

    showToast("All diyas switched off.");
});


// =====================================
// 7. BACKGROUND MUSIC
// Original synthesized festive melody
// No external MP3 file required.
// =====================================

let audioContext = null;
let masterGain = null;
let musicPlaying = false;
let musicTimer = null;
let noteIndex = 0;

const melody = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.00, 698.46,
    523.25, 659.25, 783.99, 1046.50,
    880.00, 783.99, 659.25, 523.25
];

function playNote(frequency) {

    if (!audioContext || !masterGain) return;

    const oscillator = audioContext.createOscillator();

    const noteGain = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.value = frequency;

    const now = audioContext.currentTime;

    noteGain.gain.setValueAtTime(0.0001, now);

    noteGain.gain.exponentialRampToValueAtTime(
        0.09, now + 0.04
    );

    noteGain.gain.exponentialRampToValueAtTime(
        0.0001, now + 0.65
    );

    oscillator.connect(noteGain);

    noteGain.connect(masterGain);

    oscillator.start(now);

    oscillator.stop(now + 0.7);
}

async function startMusic() {

    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        showToast("Audio is not supported by this browser.");
        return;
    }

    try {

        if (!audioContext) {

            audioContext = new AudioContextClass();

            masterGain = audioContext.createGain();

            masterGain.gain.value = 0.5;

            masterGain.connect(audioContext.destination);
        }

        await audioContext.resume();

        musicPlaying = true;

        $("musicBtn").textContent = "♫ Music ON";

        playNote(melody[noteIndex]);

        noteIndex = (noteIndex + 1) % melody.length;

        musicTimer = setInterval(() => {

            playNote(melody[noteIndex]);

            noteIndex = (noteIndex + 1) % melody.length;

        }, 650);

        showToast("Festive music started! 🎵");

    } catch (error) {

        musicPlaying = false;

        showToast("Could not start music. Try again.");

    }
}

async function stopMusic() {

    musicPlaying = false;

    clearInterval(musicTimer);

    if (audioContext && audioContext.state !== "closed") {
        await audioContext.suspend();
    }

    $("musicBtn").textContent = "♫ Music OFF";

    showToast("Music paused.");
}

$("musicBtn").addEventListener("click", () => {

    if (musicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }

});


// =====================================
// 8. FIREWORKS ANIMATION
// =====================================

const canvas = $("fireworks");

const ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {

    const ratio = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width = window.innerWidth * ratio;

    canvas.height = window.innerHeight * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

class Particle {

    constructor(x, y, color, speed, angle) {

        this.x = x;
        this.y = y;

        this.color = color;
        this.speed = speed;
        this.angle = angle;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.alpha = 1;

        this.size = Math.random() * 2.5 + 1;

        this.gravity = 0.045;
    }

    update() {

        this.x += this.vx;
        this.y += this.vy;

        this.vy += this.gravity;

        this.vx *= 0.985;
        this.vy *= 0.985;

        this.alpha -= 0.012;
    }

    draw() {

        ctx.save();

        ctx.globalAlpha = Math.max(0, this.alpha);

        ctx.fillStyle = this.color;

        ctx.shadowBlur = 12;

        ctx.shadowColor = this.color;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}

function launchFirework(x, y) {

    const colors = [
        "#ffcc66",
        "#ff6b35",
        "#ffffff",
        "#ff4d88",
        "#8cf5ff",
        "#e8bd65",
        "#a78bfa"
    ];

    const color = colors[
        Math.floor(Math.random() * colors.length)
    ];

    const count = 65;

    for (let i = 0; i < count; i++) {

        const angle =
            (Math.PI * 2 * i) / count;

        const speed =
            Math.random() * 3.5 + 1.5;

        particles.push(
            new Particle(x, y, color, speed, angle)
        );
    }

    // Prevent excessive particle accumulation
    if (particles.length > 1200) {
        particles.splice(0, particles.length - 1200);
    }
}

function animateFireworks() {

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    for (let i = particles.length - 1; i >= 0; i--) {

        const particle = particles[i];

        particle.update();

        particle.draw();

        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animateFireworks);
}

animateFireworks();

function randomFireworks() {

    const x = Math.random() * window.innerWidth;

    const y =
        Math.random() * window.innerHeight * 0.55 + 40;

    launchFirework(x, y);
}

function celebrate() {

    randomFireworks();

    setTimeout(randomFireworks, 350);

    setTimeout(randomFireworks, 700);

    setTimeout(randomFireworks, 1050);

    setTimeout(randomFireworks, 1400);

    showToast("Happy Diwali! Let the celebration begin! 🎆");
}


// CELEBRATE BUTTONS

$("celebrateBtn").addEventListener("click", celebrate);

$("finalCelebrate").addEventListener("click", celebrate);


// CLICK BACKGROUND TO CREATE FIREWORKS

document.addEventListener("click", (event) => {

    if (
        event.target.closest(
            "button, a, select, .gallery-card, nav"
        ) ||
        event.target === canvas
    ) {
        return;
    }

    launchFirework(event.clientX, event.clientY);

});


// =====================================
// 9. WELCOME MESSAGE
// =====================================

window.addEventListener("load", () => {

    console.log("Royal Diwali Website Loaded Successfully!");

    console.log("Happy Diwali 2026!");

    setTimeout(() => {

        showToast("Welcome to Royal Diwali 2026! 🪔");

    }, 1000);

});
