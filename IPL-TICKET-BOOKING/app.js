let toastTimer;

function showToast(message) {
    let toast = document.getElementById("booking-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "booking-toast";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 3000);
}

const matchSelect = document.getElementById("match");
const standSelect = document.getElementById("stand");
const quantityInput = document.getElementById("quantity");
const bookingForm = document.getElementById("booking-form");
const bookingSection = document.getElementById("book-ticket");
const summaryMatch = document.getElementById("summary-match");
const summaryStand = document.getElementById("summary-stand");
const summaryPrice = document.getElementById("summary-price");
const summaryQuantity = document.getElementById("summary-quantity");
const summaryTotal = document.getElementById("summary-total");
const teamFilter = document.getElementById("team-filter");
const matchList = document.getElementById("match-list");
const gridViewButton = document.getElementById("grid-view");
const listViewButton = document.getElementById("list-view");
const navToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.getElementById("primary-navigation");

const ticketPrices = {
    "match-01": { general: 1500, premium: 3500, vip: 7500 },
    "match-02": { general: 1200, premium: 3000, vip: 6500 },
    "match-03": { general: 1000, premium: 2500, vip: 5500 }
};

if (!matchSelect || !standSelect || !quantityInput || !bookingForm || !bookingSection ||
    !summaryMatch || !summaryStand || !summaryPrice || !summaryQuantity || !summaryTotal ||
    !teamFilter || !matchList || !gridViewButton || !listViewButton || !navToggle || !primaryNavigation) {
    console.error("Required booking or responsive layout elements are missing.");
} else {
    function updateBookingSummary(notify = false) {
        const selectedMatch = matchSelect.selectedOptions[0];
        const selectedStand = standSelect.selectedOptions[0];
        const matchPrices = ticketPrices[matchSelect.value] || {};
        const ticketPrice = matchPrices[standSelect.value] || 0;
        const quantity = Number(quantityInput.value);
        const validQuantity = Number.isInteger(quantity) && quantity >= 1 && quantity <= 10;

        summaryMatch.textContent = matchSelect.value ? selectedMatch.textContent.trim() : "Not selected";
        summaryStand.textContent = selectedStand.textContent.trim();
        summaryPrice.textContent = String(ticketPrice);
        summaryQuantity.textContent = quantityInput.value || "0";
        summaryTotal.textContent = String(validQuantity ? ticketPrice * quantity : 0);

        if (notify) {
            showToast("Booking summary updated.");
        }
    }

    matchSelect.addEventListener("change", () => updateBookingSummary(true));
    standSelect.addEventListener("change", () => updateBookingSummary(true));
    quantityInput.addEventListener("input", () => updateBookingSummary());
    quantityInput.addEventListener("change", () => updateBookingSummary(true));
    updateBookingSummary();

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        showToast("Booking form submitted successfully!");
    });

    function filterMatches() {
        const selectedTeam = teamFilter.value;

        matchList.querySelectorAll(".match-card").forEach((card) => {
            const teams = card.dataset.teams.split(/\s+/);
            card.hidden = selectedTeam !== "all" && !teams.includes(selectedTeam);
        });
    }

    function setMatchView(isGrid) {
        matchList.classList.toggle("matches-grid", isGrid);
        matchList.classList.toggle("matches-list", !isGrid);
        gridViewButton.setAttribute("aria-pressed", String(isGrid));
        listViewButton.setAttribute("aria-pressed", String(!isGrid));
    }

    teamFilter.addEventListener("change", filterMatches);
    gridViewButton.addEventListener("click", () => setMatchView(true));
    listViewButton.addEventListener("click", () => setMatchView(false));
    setMatchView(true);

    navToggle.addEventListener("click", () => {
        const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isExpanded));
        primaryNavigation.classList.toggle("is-open", !isExpanded);
    });

    primaryNavigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navToggle.setAttribute("aria-expanded", "false");
            primaryNavigation.classList.remove("is-open");
        });
    });

    document.querySelectorAll(".book-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const matchId = button.dataset.match;
            const selectedOption = Array.from(matchSelect.options)
                .find((option) => option.value === matchId);

            if (!selectedOption) {
                console.error(`No booking option found for match "${matchId}".`);
                showToast("This match cannot be selected right now.");
                return;
            }

            matchSelect.value = matchId;
            updateBookingSummary();
            bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            showToast(`${selectedOption.textContent.trim()} selected. Booking summary updated.`);
        });
    });
}
