// MOBILE MENU
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });
}

// ACTIVE NAV LINK
const currentPage = location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
        link.classList.add("active");
    }
});

// CLOSE MOBILE MENU
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks?.classList.remove("open");
    });
});

// SCROLL REVEAL
const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    },
    { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(el => {
    observer.observe(el);
});

// BACK TO TOP
const backTop = document.getElementById("backTop");

window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
        backTop.style.display = "block";
    } else {
        backTop.style.display = "none";
    }
});

backTop?.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// TOAST
function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// DEMO FORMS
document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (this.id === "loginForm") {
            const username = document.getElementById("username")?.value;
            const password = document.getElementById("password")?.value;

            if (username === "admin" && password === "admin123") {
                showToast("Login successful — Demo Admin Panel");
            } else {
                showToast("Invalid username or password");
            }

            return;
        }

        showToast("Your form has been submitted successfully!");
        this.reset();
    });
});

// NOTICE DEMO
document.querySelectorAll(".notice-btn").forEach(button => {
    button.addEventListener("click", () => {
        showToast("Notice details will be available here.");
    });
});