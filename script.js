document.addEventListener("DOMContentLoaded", function () {

    // HELPER FUNCTIONS

    function getStoredPackages() {
        try {
            const packages = JSON.parse(
                sessionStorage.getItem("selectedPackages") || "[]"
            );

            return Array.isArray(packages) ? packages : [];

        } catch (error) {
            return [];
        }
    }

    function getSavedBooking() {
        try {
            return JSON.parse(
                sessionStorage.getItem("bookingRequest") || "null"
            );

        } catch (error) {
            return null;
        }
    }

    function formatPrice(amount) {
        return Number(amount || 0).toLocaleString("en-ZA");
    }

    function calculateBookingTotals(packages) {

        const subtotal = packages.reduce(function (sum, item) {
            return sum + (
                Number(item.price) * Number(item.quantity)
            );
        }, 0);

        const totalQuantity = packages.reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0);
        let discountRate =0;

        if (totalQuantity === 2) {
            discountRate= 0.05;
        }else if (totalQuantity === 3){
            discountRate = 0.10;
        }else if (totalQuantity > 3) {
            discountRate = 0.15;
        }

        const discountAmount = subtotal * discountRate;
        const total = subtotal - discountAmount;

        return {
            subtotal: subtotal,
            totalQuantity: totalQuantity,
            discountRate: discountRate,
            discountAmount: discountAmount,
            total: total
        };
    }
        // RESPONSIVE NAVIGATION DROPDOWN

    const menuToggle = document.querySelector("#menu-toggle");
    const navigation = document.querySelector("header nav");

    if (menuToggle && navigation) {

        menuToggle.addEventListener("click", function () {

            const isOpen = navigation.classList.toggle("show");

            menuToggle.setAttribute("aria-expanded", isOpen);

        });

        navigation.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navigation.classList.remove("show");
                menuToggle.setAttribute("aria-expanded", "false");

            });

        });

    }
    // FAQ TOGGLE
    document.querySelectorAll(".faq-question").forEach(function (question) {
      question.addEventListener("click", function () {
        const answer = question.nextElementSibling;
        const toggle = question.querySelector(".faq-toggle");

        if (!answer || !toggle) return;

        const isOpen = answer.hidden;

        answer.hidden = !isOpen;
        answer.classList.toggle("show", isOpen);
        toggle.textContent = isOpen ? "−" : "+";
        question.setAttribute("aria-expanded", isOpen);
    });
});


    // HOME PAGE BUTTONS

    const activityButton = document.querySelector("#activity-button");
    const quoteButton = document.querySelector("#quote-button");

    if (activityButton) {
        activityButton.addEventListener("click", function () {
            window.location.href = "packages.html";
        });
    }

    if (quoteButton) {
        quoteButton.addEventListener("click", function () {
            window.location.href = "contact-us.html";
        });
    }
    
    //Terms and Conditions
    const contactUsButton = document.querySelector("#contact-us-terms-button");
    
    if (contactUsButton) {
        contactUsButton.addEventListener("click", function () {
            window.location.href="contact-us.html";
        })
    }

    // SELECTED PACKAGES

    let selectedPackages = getStoredPackages();


    // PACKAGE SELECTION ON PACKAGES PAGE

    document.querySelectorAll(".package-card .btn").forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            const card = button.closest(".package-card");

            if (!card) return;

            const nameElement = card.querySelector(".package-name");
            const priceElement = card.querySelector(".package-price");

            if (!nameElement || !priceElement) return;

            const name = nameElement.textContent.trim();

            const price = Number(
                priceElement.textContent.replace(/[^\d]/g, "")
            );

            const existingPackage = selectedPackages.find(function (item) {
                return item.name === name;
            });

            if (existingPackage) {

                existingPackage.quantity++;

            } else {

                selectedPackages.push({
                    name: name,
                    price: price,
                    quantity: 1
                });

            }

            sessionStorage.setItem(
                "selectedPackages",
                JSON.stringify(selectedPackages)
            );

            button.textContent = "Selected";

        });

    });


    // FEES PAGE

    const subtitleContainer = document.querySelector("#subtitle-container");
    const feesDetailsSection = document.querySelector("#details-section");

    if (subtitleContainer && feesDetailsSection) {

        const detailsFields = feesDetailsSection.querySelectorAll(
            "input, select, textarea, button"
        );

        function updateFeesDetails(disabled) {

            detailsFields.forEach(function (field) {
                field.disabled = disabled;
            });

        }


        // DISPLAY SELECTED EXPERIENCES AND TOTALS

        function displayPackages() {

            selectedPackages = getStoredPackages();

            if (selectedPackages.length === 0) {

                subtitleContainer.innerHTML = `
                    <p class="empty-selection">
                        You have not selected any experiences yet.
                        Please explore our packages to get started.
                    </p>
                `;

                updateFeesDetails(true);

                return;
            }

            updateFeesDetails(false);

            let experienceHTML = "";

            selectedPackages.forEach(function (item, index) {

                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                const itemTotal = price * quantity;

                experienceHTML += `

                    <div class="adventure-experience">
                        <p>${item.name}</p>

                        <p>R${formatPrice(price)}</p>

                        <div>
                            <button type="button"
                                data-index="${index}"
                                data-action="decrease"
                                aria-label="Decrease ${item.name} quantity">
                                -
                            </button>

                            <span>${quantity}</span>

                            <button type="button"
                                data-index="${index}"
                                data-action="increase"
                                aria-label="Increase ${item.name} quantity">
                                +
                            </button>
                        </div>

                        <p>R${formatPrice(itemTotal)}</p>
                    </div>

                `;

            });

            const totals = calculateBookingTotals(selectedPackages);

            subtitleContainer.innerHTML = `

                <div id="selection-subtitle">
                    <strong>Experience</strong>
                    <strong>Price</strong>
                    <strong>Quantity</strong>
                    <strong>Total</strong>
                </div>

                ${experienceHTML}

                <div class="orderSummary-title">
                    <h3>Order Summary</h3>
                </div>

                <div class="order-amount">

                    <p>
                        Subtotal:
                        <span>R${formatPrice(totals.subtotal)}</span>
                    </p>

                    <p>
                        Discount:
                        <span>${totals.discountRate * 100}%</span>
                    </p>

                    <p class="discount">
                        Discount Amount:
                        <span>-R${formatPrice(totals.discountAmount)}</span>
                    </p>

                </div>

                <div class="total-amount">
                    <p>
                        Total:
                        <span>R${formatPrice(totals.total)}</span>
                    </p>
                </div>

            `;

        }


        // INCREASE AND DECREASE EXPERIENCE QUANTITIES

        subtitleContainer.addEventListener("click", function (event) {

            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const index = Number(button.dataset.index);
            const action = button.dataset.action;

            if (!Number.isInteger(index) || !selectedPackages[index]) return;

            if (action === "increase") {

                selectedPackages[index].quantity++;

            } else if (action === "decrease") {

                selectedPackages[index].quantity--;

                if (selectedPackages[index].quantity <= 0) {
                    selectedPackages.splice(index, 1);
                }

            }

            sessionStorage.setItem(
                "selectedPackages",
                JSON.stringify(selectedPackages)
            );

            displayPackages();

        });


        // SUBMIT FEES PAGE DETAILS AND CONTINUE TO BOOK PAGE

        const feesBookingForm = feesDetailsSection.querySelector("form");

        if (feesBookingForm) {

            feesBookingForm.addEventListener("submit", function (event) {

                event.preventDefault();

                selectedPackages = getStoredPackages();

                if (selectedPackages.length === 0) {

                    alert("Please select at least one experience before continuing.");

                    return;
                }

                if (!feesBookingForm.reportValidity()) return;

                const totals = calculateBookingTotals(selectedPackages);

                const formDetails = Object.fromEntries(
                    new FormData(feesBookingForm).entries()
                );

                const existingBooking = getSavedBooking() || {};

                const bookingRequest = {

                    ...existingBooking,

                    reference: existingBooking.reference ||
                        "AES-" + Date.now().toString().slice(-8),

                    customer: formDetails,
                    experiences: selectedPackages,
                    subtotal: totals.subtotal,
                    discountRate: totals.discountRate,
                    discountAmount: totals.discountAmount,
                    total: totals.total,
                    status: "Pending Confirmation",
                    submittedAt: new Date().toISOString()

                };

                sessionStorage.setItem(
                    "bookingRequest",
                    JSON.stringify(bookingRequest)
                );

                window.location.href = "book.html";

            });

        }

        displayPackages();

    }


    // BOOKING PAGE SUMMARY

    const bookingsSection = document.querySelector(".bookings");

    const bookingSummaryContent = document.querySelector(
        "#booking-summary-content"
    );

    if (bookingsSection && bookingSummaryContent) {

        // ONLY USE CURRENTLY SELECTED EXPERIENCES

        const savedBooking = getSavedBooking();

        const experiencesToDisplay = getStoredPackages();


        if (experiencesToDisplay.length === 0) {
            bookingsSection.style.display = "none";
            bookingSummaryContent.innerHTML = "";

        } else {

            bookingsSection.style.display = "block";

            let experiencesHTML = "";

            experiencesToDisplay.forEach(function (item) {

                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                const itemTotal = price * quantity;

                experiencesHTML += `

                    <div class="adventure-experience">
                        <p>${item.name}</p>
                        <p>R${formatPrice(price)}</p>
                        <p>${quantity}</p>
                        <p>R${formatPrice(itemTotal)}</p>
                    </div>

                `;

            });


            const calculatedTotals = calculateBookingTotals(
                experiencesToDisplay
            );

            const subtotal = calculatedTotals.subtotal;
            const discountRate = calculatedTotals.discountRate;
            const discountAmount = calculatedTotals.discountAmount;
            const total = calculatedTotals.total;


            bookingSummaryContent.innerHTML = `

                <div id="selection-subtitle">
                    <strong>Experience</strong>
                    <strong>Price</strong>
                    <strong>Quantity</strong>
                    <strong>Total</strong>
                </div>

                ${experiencesHTML}

                <div class="orderSummary-title">
                    <h3>Order Summary</h3>
                </div>

                <div class="order-amount">

                    <p>
                        Subtotal:
                        <span>R${formatPrice(subtotal)}</span>
                    </p>

                    <p>
                        Discount:
                        <span>${discountRate * 100}%</span>
                    </p>

                    <p class="discount">
                        Discount Amount:
                        <span>-R${formatPrice(discountAmount)}</span>
                    </p>

                </div>

                <div class="total-amount">
                    <p>
                        Total:
                        <span>R${formatPrice(total)}</span>
                    </p>
                </div>

            `;

        }

    }


    // BOOK PAGE DETAILS AND SUBMISSION

    const bookDetailsForm = document.querySelector(
        "#booking-details-form"
    );

    if (bookDetailsForm) {

        const participantDisplay = document.querySelector("#participants");

        const participantInput = document.querySelector("#participant-count");

        const decreaseParticipantsButton = document.querySelector(
            "#decrease-participants"
        );

        const increaseParticipantsButton = document.querySelector(
            "#increase-participants"
        );

        const dateInput = document.querySelector("#preferred-date");

        const termsCheckbox = document.querySelector("#agree-terms");

        let participantCount = 1;


        // DO NOT ALLOW A DATE IN THE PAST

        if (dateInput) {

            const today = new Date();

            const localToday = new Date(
                today.getTime() - today.getTimezoneOffset() * 60000
            ).toISOString().split("T")[0];

            dateInput.min = localToday;

        }


        // UPDATE PARTICIPANT DISPLAY AND FORM VALUE

        function updateParticipantCount() {

            if (participantDisplay) {
                participantDisplay.textContent = participantCount;
            }

            if (participantInput) {
                participantInput.value = participantCount;
            }

        }


        // INCREASE PARTICIPANTS

        if (increaseParticipantsButton) {

            increaseParticipantsButton.addEventListener("click", function () {

                participantCount++;

                updateParticipantCount();

            });

        }


        // DECREASE PARTICIPANTS

        if (decreaseParticipantsButton) {

            decreaseParticipantsButton.addEventListener("click", function () {

                if (participantCount > 1) {

                    participantCount--;

                    updateParticipantCount();

                }

            });

        }

        updateParticipantCount();


        // VALIDATE, SAVE AND SUBMIT THE FINAL BOOKING

        bookDetailsForm.addEventListener("submit", function (event) {

            event.preventDefault();

            if (!bookDetailsForm.reportValidity()) return;


            // GET CURRENTLY SELECTED EXPERIENCES

            const existingBooking = getSavedBooking() || {};

            const experiences = getStoredPackages();


            // CHECK SELECTED EXPERIENCES

            if (experiences.length === 0) {

                alert("Please select at least one experience before submitting your booking request.");

                window.location.href = "fees.html";

                return;

            }


            // CHECK TERMS AND CONDITIONS

            if (!termsCheckbox || !termsCheckbox.checked) {

                alert("Please agree to the Terms and Conditions before submitting.");

                if (termsCheckbox) {
                    termsCheckbox.focus();
                }

                return;

            }


            // COLLECT BOOKING DETAILS

            const preferredDate = bookDetailsForm.elements.preferredDate.value;

            const preferredTime = bookDetailsForm.elements.preferredTime.value;

            const specialRequests = bookDetailsForm.elements.specialRequests.value.trim();


            // CALCULATE TOTALS

            const totals = calculateBookingTotals(experiences);

            const bookingDetails = {

                preferredDate: preferredDate,
                participants: participantCount,
                preferredTime: preferredTime,
                specialRequests: specialRequests,
                agreeTerms: termsCheckbox.checked

            };


            // SAVE COMPLETE BOOKING

            const completedBooking = {

                ...existingBooking,

                reference: existingBooking.reference ||
                    "AES-" + Date.now().toString().slice(-8),

                experiences: experiences,

                subtotal: totals.subtotal,
                discountRate: totals.discountRate,
                discountAmount: totals.discountAmount,
                total: totals.total,

                customerBookingDetails: bookingDetails,

                preferredDate: preferredDate,
                participants: participantCount,
                preferredTime: preferredTime,
                specialRequests: specialRequests,
                agreeTerms: true,

                status: "Pending Confirmation",

                submittedAt: new Date().toISOString()

            };


            sessionStorage.setItem(
                "bookingRequest",
                JSON.stringify(completedBooking)
            );


            // REDIRECT TO CONFIRMATION PAGE

            window.location.href = "confirmation.html";

        });

    }

});