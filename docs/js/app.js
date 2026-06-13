"use strict";

// default example login
const USERS = [
    {
        id: "student-demo",
        firstName: "John",
        lastName: "Smith",
        email: "student@examregistration.test",
        password: "Student123",
        role: "student"
    },
    {
        id: "faculty-demo",
        firstName: "Jane",
        lastName: "Smithertonson",
        email: "faculty@examregistration.test",
        password: "Faculty123",
        role: "faculty"
    }
];

// used for the local saved data
const CURRENT_USER_KEY = "currentUser";
const REGISTRATIONS_KEY = "examsRegistered";

function loadData(key, fallbackValue) {
    try {
        const savedData = localStorage.getItem(key);

        if (!savedData) {
            return fallbackValue;
        }

        return JSON.parse(savedData);
    } catch (error) {
        console.error(`Could not read ${key}.`, error);
        return fallbackValue;
    }
}

function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Could not save ${key}.`, error);
        return false;
    }
}

let currentUser = loadData(CURRENT_USER_KEY, null);
let examsRegistered = loadData(REGISTRATIONS_KEY, []);

if (!Array.isArray(examsRegistered)) {
    examsRegistered = [];
}

function getCurrentPage() {
    const path = globalThis.location.pathname;
    return path.substring(path.lastIndexOf("/") + 1) || "index.html";
}

function isFaculty() {
    return currentUser && currentUser.role === "faculty";
}

function checkPageAccess() {
    const page = document.body.dataset.page;

    if (page === "login") {
        if (currentUser) {
            const destination = isFaculty()
                ? "faculty-report.html"
                : "index.html";
            globalThis.location.replace(destination);
            return false;
        }

        return true;
    }

    if (!currentUser) {
        const returnTo = `${getCurrentPage()}${globalThis.location.search}`;
        globalThis.location.replace(
            `login.html?returnTo=${encodeURIComponent(returnTo)}`
        );
        return false;
    }

    const studentPages = ["exams", "exam-details", "dashboard"];

    if (isFaculty() && studentPages.includes(page)) {
        globalThis.location.replace("faculty-report.html");
        return false;
    }

    if (page === "faculty-report" && !isFaculty()) {
        globalThis.location.replace("index.html");
        return false;
    }

    return true;
}

function createNavigationLink(label, href, activePages = []) {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = href;
    link.textContent = label;

    if (activePages.includes(getCurrentPage())) {
        link.setAttribute("aria-current", "page");
    }

    listItem.appendChild(link);
    return listItem;
}

function createLogoutButton() {
    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.classList.add("nav-button");
    button.textContent = "Log Out";

    button.addEventListener("click", () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        globalThis.location.href = "login.html";
    });

    listItem.appendChild(button);
    return listItem;
}

function updateNavigation() {
    const navigation = document.querySelector("#primary-menu");

    if (!navigation) {
        return;
    }

    navigation.textContent = "";
    navigation.appendChild(
        createNavigationLink("Home", "index.html", ["index.html"])
    );

    if (isFaculty()) {
        navigation.appendChild(
            createNavigationLink(
                "Faculty Reports",
                "faculty-report.html",
                ["faculty-report.html"]
            )
        );
    } else {
        navigation.appendChild(
            createNavigationLink(
                "Schedule an Exam",
                "exams.html",
                ["exams.html", "exam-details.html"]
            )
        );
        navigation.appendChild(
            createNavigationLink(
                "View My Exams",
                "dashboard.html",
                ["dashboard.html"]
            )
        );
    }

    navigation.appendChild(createLogoutButton());
}

function setupMobileMenu() {
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#primary-menu");

    if (!menuButton || !navigation) {
        return;
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });
}

function formatDate(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function formatTime(timeValue) {
    const [hours, minutes] = timeValue.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function getExamById(examId) {
    return exams.find((exam) => exam.id === examId);
}

function getCurrentUserRegistrations() {
    return examsRegistered.filter((registration) => {
        return registration.studentId === currentUser.id;
    });
}

function getExamRegistrationCount(examId) {
    return examsRegistered.filter((registration) => {
        return registration.examId === examId;
    }).length;
}

function sortRegistrations(registrations) {
    return [...registrations].sort((firstRegistration, secondRegistration) => {
        const firstDate =
            `${firstRegistration.scheduledDate}T${firstRegistration.scheduledTime}`;
        const secondDate =
            `${secondRegistration.scheduledDate}T${secondRegistration.scheduledTime}`;

        return firstDate.localeCompare(secondDate);
    });
}

function setupLoginPage() {
    const loginForm = document.querySelector("#login-form");
    const loginMessage = document.querySelector("#login-message");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim().toLowerCase();
        const password = document.querySelector("#password").value;
        const user = USERS.find((savedUser) => {
            return savedUser.email === email && savedUser.password === password;
        });

        if (!user) {
            loginMessage.textContent = "The email or password is incorrect.";
            return;
        }

        // Passwords are only used for the mock login check and are not saved.
        currentUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };

        if (!saveData(CURRENT_USER_KEY, currentUser)) {
            loginMessage.textContent =
                "The login could not be saved in this browser.";
            return;
        }

        const parameters = new URLSearchParams(globalThis.location.search);
        const returnTo = parameters.get("returnTo");

        if (isFaculty()) {
            globalThis.location.href = "faculty-report.html";
        } else if (
            returnTo &&
            !returnTo.includes("://") &&
            !returnTo.startsWith("//")
        ) {
            globalThis.location.href = returnTo;
        } else {
            globalThis.location.href = "index.html";
        }
    });
}

function setupHomePage() {
    if (!isFaculty()) {
        return;
    }

    const actions = document.querySelector(".primary-actions");

    actions.textContent = "";
    actions.appendChild(
        createNavigationLink("View Faculty Reports", "faculty-report.html")
    );
}

function addOption(selectElement, value) {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
}

function renderExams(examCollection) {
    const examList = document.querySelector("#exam-list");
    const resultsCount = document.querySelector("#results-count");
    const noExamsMessage = document.querySelector("#no-exams-message");

    examList.textContent = "";
    resultsCount.textContent = `${examCollection.length} exams found.`;
    noExamsMessage.hidden = examCollection.length > 0;

    for (const exam of examCollection) {
        const card = document.createElement("a");
        const title = document.createElement("h3");
        const type = document.createElement("p");
        const instructor = document.createElement("p");
        const location = document.createElement("p");
        const seats = document.createElement("p");
        const registeredCount = getExamRegistrationCount(exam.id);
        const availableSeats =
            exam.examCapacity - exam.examCount - registeredCount;

        card.classList.add("exam-card");
        card.href = `exam-details.html?id=${exam.id}`;
        title.textContent = exam.examName;
        type.textContent = `Type: ${exam.examType}`;
        instructor.textContent =
            `Instructor: ${exam.faculty.firstName} ${exam.faculty.lastName}`;
        location.textContent =
            `Location: ${exam.location.campus} ${exam.location.roomNumber}`;
        seats.textContent = `Available Seats: ${Math.max(availableSeats, 0)}`;

        card.append(title, type, instructor, location, seats);
        examList.appendChild(card);
    }
}

function setupExamsPage() {
    const locationFilter = document.querySelector("#location-filter");
    const instructorFilter = document.querySelector("#instructor-filter");
    const typeFilter = document.querySelector("#type-filter");
    const searchInput = document.querySelector("#exam-search");
    const filterForm = document.querySelector("#exam-filters");
    const locations = new Set();
    const instructors = new Set();
    const types = new Set();

    for (const exam of exams) {
        locations.add(exam.location.campus);
        instructors.add(
            `${exam.faculty.firstName} ${exam.faculty.lastName}`
        );
        types.add(exam.examType);
    }

    locations.forEach((location) => addOption(locationFilter, location));
    instructors.forEach((instructor) => {
        addOption(instructorFilter, instructor);
    });
    types.forEach((type) => addOption(typeFilter, type));

    function filterExams() {
        const location = locationFilter.value;
        const instructor = instructorFilter.value;
        const type = typeFilter.value;
        const search = searchInput.value.trim().toLowerCase();

        const filteredExams = exams.filter((exam) => {
            const instructorName =
                `${exam.faculty.firstName} ${exam.faculty.lastName}`;

            return (
                (!location || exam.location.campus === location) &&
                (!instructor || instructorName === instructor) &&
                (!type || exam.examType === type) &&
                (!search || exam.examName.toLowerCase().includes(search))
            );
        });

        renderExams(filteredExams);
    }

    locationFilter.addEventListener("change", filterExams);
    instructorFilter.addEventListener("change", filterExams);
    typeFilter.addEventListener("change", filterExams);
    searchInput.addEventListener("input", filterExams);
    filterForm.addEventListener("reset", () => {
        globalThis.setTimeout(() => renderExams(exams), 0);
    });

    renderExams(exams);
}

function setupExamDetailsPage() {
    const parameters = new URLSearchParams(globalThis.location.search);
    const exam = getExamById(parameters.get("id"));
    const registrationForm = document.querySelector("#registration-form");
    const registrationMessage = document.querySelector("#registration-message");

    if (!exam) {
        document.querySelector("#exam-name").textContent = "Exam Not Found";
        document.querySelector(".exam-details-list").hidden = true;
        registrationForm.hidden = true;
        return;
    }

    document.querySelector("#exam-name").textContent = exam.examName;
    document.querySelector("#exam-instructor").textContent =
        `${exam.faculty.firstName} ${exam.faculty.lastName}`;
    document.querySelector("#exam-location").textContent = exam.location.campus;
    document.querySelector("#exam-room").textContent = exam.location.roomNumber;
    document.querySelector("#exam-type").textContent = exam.examType;

    const registeredCount = getExamRegistrationCount(exam.id);
    document.querySelector("#exam-capacity").textContent =
        `${exam.examCount + registeredCount} / ${exam.examCapacity}`;

    const selectedDate = document.querySelector("#selected-date");
    const selectedTime = document.querySelector("#selected-time");

    selectedDate.value = exam.examDate;
    selectedDate.min = exam.examDate;
    selectedDate.max = exam.examDate;

    for (const examTime of exam.examTimes) {
        const option = document.createElement("option");

        option.value = examTime;
        option.textContent = formatTime(examTime);
        selectedTime.appendChild(option);
    }

    registrationForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const userRegistrations = getCurrentUserRegistrations();
        const alreadyRegistered = userRegistrations.some((registration) => {
            return registration.examId === exam.id;
        });
        const examIsFull =
            exam.examCount + getExamRegistrationCount(exam.id) >=
            exam.examCapacity;

        if (userRegistrations.length >= 3) {
            registrationMessage.textContent =
                "You can only register for up to 3 exams.";
            return;
        }

        if (alreadyRegistered) {
            registrationMessage.textContent =
                "You are already registered for this exam.";
            return;
        }

        if (examIsFull) {
            registrationMessage.textContent =
                "This exam is at full capacity.";
            return;
        }

        if (!selectedDate.value || !selectedTime.value) {
            registrationMessage.textContent =
                "Select an exam date and time before registering.";
            return;
        }

        const registration = {
            id: `registration-${Date.now()}`,
            studentId: currentUser.id,
            studentName: `${currentUser.firstName} ${currentUser.lastName}`,
            studentEmail: currentUser.email,
            examId: exam.id,
            scheduledDate: selectedDate.value,
            scheduledTime: selectedTime.value
        };

        examsRegistered.push(registration);

        if (!saveData(REGISTRATIONS_KEY, examsRegistered)) {
            // Undo the change when browser storage is unavailable.
            examsRegistered.pop();
            registrationMessage.textContent =
                "The registration could not be saved in this browser.";
            return;
        }

        globalThis.location.href = "dashboard.html";
    });
}

function addTableCells(row, values) {
    for (const value of values) {
        const cell = document.createElement("td");

        cell.textContent = value;
        row.appendChild(cell);
    }
}

function setupDashboardPage() {
    const registrationList = document.querySelector("#registration-list");
    const emptyMessage = document.querySelector("#empty-dashboard");
    const tableWrapper = document.querySelector("#registration-table-wrapper");
    const dashboardMessage = document.querySelector("#dashboard-message");

    function renderRegistrations() {
        const registrations = sortRegistrations(
            getCurrentUserRegistrations()
        ).filter((registration) => getExamById(registration.examId));

        registrationList.textContent = "";
        emptyMessage.hidden = registrations.length > 0;
        tableWrapper.hidden = registrations.length === 0;

        for (const registration of registrations) {
            const exam = getExamById(registration.examId);
            const row = document.createElement("tr");

            addTableCells(row, [
                exam.examName,
                exam.examType,
                formatDate(registration.scheduledDate),
                formatTime(registration.scheduledTime),
                `${exam.location.campus} ${exam.location.roomNumber}`,
                `${exam.faculty.firstName} ${exam.faculty.lastName}`
            ]);

            const actionCell = document.createElement("td");
            const cancelButton = document.createElement("button");

            actionCell.classList.add("action-cell");
            cancelButton.type = "button";
            cancelButton.classList.add("btn");
            cancelButton.textContent = "Cancel";
            cancelButton.setAttribute(
                "aria-label",
                `Cancel ${exam.examName} registration`
            );

            cancelButton.addEventListener("click", () => {
                if (!globalThis.confirm(`Cancel ${exam.examName}?`)) {
                    return;
                }

                const registrationIndex = examsRegistered.findIndex(
                    (savedRegistration) => {
                        return savedRegistration.id === registration.id;
                    }
                );

                if (registrationIndex === -1) {
                    dashboardMessage.textContent =
                        "This registration could not be found.";
                    return;
                }

                const removedRegistration =
                    examsRegistered.splice(registrationIndex, 1)[0];

                if (!saveData(REGISTRATIONS_KEY, examsRegistered)) {
                    // Put the registration back if the updated list cannot save.
                    examsRegistered.splice(
                        registrationIndex,
                        0,
                        removedRegistration
                    );
                    dashboardMessage.textContent =
                        "The exam could not be removed.";
                    return;
                }

                dashboardMessage.textContent =
                    `${exam.examName} was removed from your exam list.`;
                renderRegistrations();
            });

            actionCell.appendChild(cancelButton);
            row.appendChild(actionCell);
            registrationList.appendChild(row);
        }
    }

    renderRegistrations();
}

function setupFacultyReportPage() {
    const reportForm = document.querySelector("#report-filters");
    const startDate = document.querySelector("#start-date");
    const endDate = document.querySelector("#end-date");
    const examType = document.querySelector("#report-exam-type");
    const reportSummary = document.querySelector("#report-summary");
    const reportList = document.querySelector("#report-list");
    const printButton = document.querySelector("#print-report");
    const printGenerated = document.querySelector("#print-generated");

    function getFilteredRegistrations() {
        return sortRegistrations(examsRegistered).filter((registration) => {
            const exam = getExamById(registration.examId);

            if (!exam) {
                return false;
            }

            return (
                (!startDate.value ||
                    registration.scheduledDate >= startDate.value) &&
                (!endDate.value ||
                    registration.scheduledDate <= endDate.value) &&
                (!examType.value ||
                    exam.examType.toLowerCase() === examType.value)
            );
        });
    }

    function renderReport(registrations = getFilteredRegistrations()) {
        reportList.textContent = "";
        reportSummary.textContent =
            `${registrations.length} exam registrations found.`;

        if (registrations.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = "No exam reports found.";
            row.appendChild(cell);
            reportList.appendChild(row);
            return;
        }

        for (const registration of registrations) {
            const exam = getExamById(registration.examId);
            const row = document.createElement("tr");

            addTableCells(row, [
                registration.studentName,
                exam.examName,
                exam.examType,
                formatDate(registration.scheduledDate),
                formatTime(registration.scheduledTime),
                `${exam.location.campus} ${exam.location.roomNumber}`,
                `${exam.faculty.firstName} ${exam.faculty.lastName}`
            ]);

            reportList.appendChild(row);
        }
    }

    startDate.addEventListener("change", () => renderReport());
    endDate.addEventListener("change", () => renderReport());
    examType.addEventListener("change", () => renderReport());
    reportForm.addEventListener("reset", () => {
        globalThis.setTimeout(renderReport, 0);
    });

    printButton.addEventListener("click", () => {
        // Printed reports always include all registrations, not active filters.
        const registrations = sortRegistrations(examsRegistered).filter(
            (registration) => getExamById(registration.examId)
        );

        renderReport(registrations);
        printGenerated.textContent =
            `Generated ${new Date().toLocaleString("en-US")}`;
        globalThis.print();
    });

    globalThis.addEventListener("afterprint", () => {
        printGenerated.textContent = "";
        renderReport();
    });

    renderReport();
}

const currentPage = document.body.dataset.page;

if (checkPageAccess()) {
    if (currentPage === "login") {
        setupLoginPage();
    } else {
        updateNavigation();
        setupMobileMenu();

        if (currentPage === "home") {
            setupHomePage();
        } else if (currentPage === "exams") {
            setupExamsPage();
        } else if (currentPage === "exam-details") {
            setupExamDetailsPage();
        } else if (currentPage === "dashboard") {
            setupDashboardPage();
        } else if (currentPage === "faculty-report") {
            setupFacultyReportPage();
        }
    }
}
