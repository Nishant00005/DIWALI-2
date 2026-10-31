
// ========================================
// ROYAL DIWALI 2026 - COMPLETE JAVASCRIPT
// ========================================

const $ = id => document.getElementById(id);

// TOAST MESSAGE
function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// MOBILE NAVIGATION
$("menuBtn").addEventListener("click", () => {
    $("navLinks").classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        $("navLinks").classList.remove("open");
    });
});

// DIWALI WISHES
const wishes = [
    "May this Diwali bring happiness, prosperity and endless success into your life!",
    "May the light of Diwali fill your home with peace, love and joy!",
    "Wishing you a sparkling Diwali full of beautiful memories!",
    "May every diya bring new hope and every celebration bring happiness!",
    "May your dreams shine as brightly as the lights of Diwali!"
];

$("newWishBtn").addEventListener("click", () => {
    const random = Math.floor(Math.random() * wishes.length);
    $("wishText").textContent = wishes[random];
});

$("copyWishBtn").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText($("wishText").textContent);
        showToast("Diwali wish copied!");
    } catch {
        showToast("Clipboard unavailable in this browser.");
    }
});

$("shareWishBtn").addEventListener("click", () => {
    const message = encodeURIComponent($("wishText").textContent);
    window.open(`https://wa.me/?text=${message}`, "_blank");
});

// DIYAS
const diyas = document.querySelectorAll(".diya");

diyas.forEach(diya => {
    diya.addEventListener("click", () => {
        diya.classList.toggle("active");
    });
});

$("lightAllBtn").addEventListener("click", () => {
    diyas.forEach(diya => diya.classList.add("active"));
    showToast("All diyas are glowing!");
});

$("turnOffBtn").addEventListener("click", () => {
    diyas.forEach(diya => diya.classList.remove("active"));
    showToast("All diyas switched off.");
});

// YOUTUBE MUSIC
// Music is played using the YouTube iframe player in index.html.
// Visitors can use YouTube's own Play, Pause and Volume controls.

// GREETING CARD
const greetingCanvas = $("greetingCanvas");
const greetingCtx = greetingCanvas.getContext("2d");

function drawGreetingCard() {
    const ctx = greetingCtx;
    const width = greetingCanvas.width;
    const height = greetingCanvas.height;

    const sender = $("senderName").value.trim() || "Your Friend";
    const receiver = $("receiverName").value.trim() || "Dear Friend";
    const message = $("personalMessage").value.trim() ||
        "May your life shine with happiness, love and prosperity!";

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#160d27");
    gradient.addColorStop(1, "#602a22");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = "#ffca69";
    ctx.lineWidth = 7;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    ctx.strokeStyle = "#ffe2a6";
    ctx.lineWidth = 2;
    ctx.strokeRect(27, 27, width - 54, height - 54);

    // Decorative stars
    for (let i = 0; i < 90; i++) {
        ctx.fillStyle = `rgba(255,220,140,${Math.random() * 0.8 + 0.2})`;

        ctx.beginPath();
        ctx.arc(
            Math.random() * width,
            Math.random() * height,
            2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Card heading
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffcc68";
    ctx.font = "bold 24px Georgia";
    ctx.fillText("ROYAL DIWALI 2026", width / 2, 85);

    ctx.font = "bold 54px Georgia";
    ctx.fillStyle = "#ffe4a6";
    ctx.fillText("HAPPY DIWALI", width / 2, 165);

    // Receiver name
    ctx.font = "bold 25px Georgia";
    ctx.fillStyle = "#ffbd45";
    ctx.fillText(receiver, width / 2, 220);

    // Message wrapping
    ctx.font = "19px Arial";
    ctx.fillStyle = "#fff8eb";

    const words = message.split(/\s+/);
    const lines = [];
    let line = "";

    words.forEach(word => {
        const test = line ? line + " " + word : word;

        if (ctx.measureText(test).width > width - 100 && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    });

    if (line) lines.push(line);

    lines.slice(0, 4).forEach((text, index) => {
        ctx.fillText(text, width / 2, 270 + index * 27);
    });

    // Sender name
    ctx.font = "italic 19px Georgia";
    ctx.fillStyle = "#ffcc68";
    ctx.fillText("With best wishes,", width / 2, 390);

    ctx.font = "bold 21px Georgia";
    ctx.fillText(sender, width / 2, 420);
}

// Generate greeting card
$("greetingForm").addEventListener("submit", event => {
    event.preventDefault();
    drawGreetingCard();
    showToast("Greeting card generated!");
});

// Download greeting card
$("downloadCardBtn").addEventListener("click", () => {
    drawGreetingCard();

    const link = document.createElement("a");
    link.download = "Royal-Diwali-Greeting.png";
    link.href = greetingCanvas.toDataURL("image/png");
    link.click();

    showToast("Greeting card downloaded!");
});

// Initial greeting card
drawGreetingCard();

// RANGOLI DESIGNER
const rangoliCanvas = $("rangoliCanvas");
const rangoliCtx = rangoliCanvas.getContext("2d");

let drawing = false;
let previousPoint = null;

function getCanvasPoint(event) {
    const rect = rangoliCanvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) *
            rangoliCanvas.width / rect.width,

        y: (event.clientY - rect.top) *
            rangoliCanvas.height / rect.height
    };
}

function drawRangoliPoint(point) {
    const center = rangoliCanvas.width / 2;
    const symmetry = $("symmetryToggle").checked;
    const color = $("rangoliColor").value;
    const brush = Number($("brushSize").value);

    const dx = point.x - center;
    const dy = point.y - center;

    rangoliCtx.strokeStyle = color;
    rangoliCtx.lineWidth = brush;
    rangoliCtx.lineCap = "round";
    rangoliCtx.lineJoin = "round";

    const count = symmetry ? 8 : 1;

    for (let i = 0; i < count; i++) {
        const angle = 2 * Math.PI * i / count;

        const x = center +
            dx * Math.cos(angle) -
            dy * Math.sin(angle);

        const y = center +
            dx * Math.sin(angle) +
            dy * Math.cos(angle);

        rangoliCtx.beginPath();

        if (previousPoint) {
            const oldDx = previousPoint.x - center;
            const oldDy = previousPoint.y - center;

            const oldX = center +
                oldDx * Math.cos(angle) -
                oldDy * Math.sin(angle);

            const oldY = center +
                oldDx * Math.sin(angle) +
                oldDy * Math.cos(angle);

            rangoliCtx.moveTo(oldX, oldY);
        } else {
            rangoliCtx.moveTo(x, y);
        }

        rangoliCtx.lineTo(x, y);
        rangoliCtx.stroke();
    }
}

// Start drawing
rangoliCanvas.addEventListener("pointerdown", event => {
    drawing = true;
    previousPoint = null;

    rangoliCanvas.setPointerCapture(event.pointerId);

    const point = getCanvasPoint(event);
    drawRangoliPoint(point);

    previousPoint = point;
});

// Continue drawing
rangoliCanvas.addEventListener("pointermove", event => {
    if (!drawing) return;

    const point = getCanvasPoint(event);

    drawRangoliPoint(point);
    previousPoint = point;
});

function stopDrawing() {
    drawing = false;
    previousPoint = null;
}

rangoliCanvas.addEventListener("pointerup", stopDrawing);
rangoliCanvas.addEventListener("pointercancel", stopDrawing);
rangoliCanvas.addEventListener("lostpointercapture", stopDrawing);

// Clear rangoli
$("clearRangoliBtn").addEventListener("click", () => {
    rangoliCtx.clearRect(
        0,
        0,
        rangoliCanvas.width,
        rangoliCanvas.height
    );

    showToast("Rangoli cleared!");
});

// Download rangoli
$("downloadRangoliBtn").addEventListener("click", () => {
    const link = document.createElement("a");

    link.download = "My-Diwali-Rangoli.png";
    link.href = rangoliCanvas.toDataURL("image/png");

    link.click();

    showToast("Rangoli downloaded!");
});

// COUNTDOWN
// Target: 8 November 2026, 6:00 PM IST
const diwaliDate = new Date("2026-11-08T18:00:00+05:30");

function updateCountdown() {
    const difference = diwaliDate.getTime() - Date.now();

    if (difference <= 0) {
        ["days", "hours", "minutes", "seconds"].forEach(id => {
            $(id).textContent = "00";
        });

        $("countdownMessage").textContent = "Happy Diwali 2026! 🪔";
        return;
    }

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor(difference / 3600000) % 24;
    const minutes = Math.floor(difference / 60000) % 60;
    const seconds = Math.floor(difference / 1000) % 60;

    $("days").textContent = String(days).padStart(2, "0");
    $("hours").textContent = String(hours).padStart(2, "0");
    $("minutes").textContent = String(minutes).padStart(2, "0");
    $("seconds").textContent = String(seconds).padStart(2, "0");

    $("countdownMessage").textContent =
        "Get ready for the festival of lights!";
}

updateCountdown();
setInterval(updateCountdown, 1000);

// FIREWORKS ANIMATION
const fireworkCanvas = $("fireworks");
const fireworkCtx = fireworkCanvas.getContext("2d");

let particles = [];

function resizeFireworks() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    fireworkCanvas.width = window.innerWidth * ratio;
    fireworkCanvas.height = window.innerHeight * ratio;

    fireworkCanvas.style.width = window.innerWidth + "px";
    fireworkCanvas.style.height = window.innerHeight + "px";

    fireworkCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener("resize", resizeFireworks);
resizeFireworks();

function createFirework() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.55;

    const colors = [
        "#ffbd45",
        "#ff5577",
        "#66e5ff",
        "#fff0a8",
        "#d78cff"
    ];

    for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 60,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function animateFireworks() {
    fireworkCtx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    if (Math.random() < 0.025 && particles.length < 400) {
        createFirework();
    }

    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.025;
        particle.life--;

        fireworkCtx.globalAlpha = Math.max(0, particle.life / 60);
        fireworkCtx.fillStyle = particle.color;

        fireworkCtx.beginPath();
        fireworkCtx.arc(
            particle.x,
            particle.y,
            2,
            0,
            Math.PI * 2
        );

        fireworkCtx.fill();
    });

    fireworkCtx.globalAlpha = 1;

    particles = particles.filter(particle => particle.life > 0);

    requestAnimationFrame(animateFireworks);
}

animateFireworks();
