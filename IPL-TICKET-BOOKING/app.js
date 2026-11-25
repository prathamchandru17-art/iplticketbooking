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
const bookingSection = document.getElementById("book-ticket");

if (!matchSelect || !bookingSection) {
    console.error("The match selector or booking section is missing.");
} else {
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
            bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            showToast(`${selectedOption.textContent.trim()} selected. Complete the form to book.`);
        });
    });
}
