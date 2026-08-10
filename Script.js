/* =========================================
   LIFE COMPILER
   STEP 7 — REAL SESSION SYSTEM
========================================= */

let selectedCategory = 0;
let selectedPriority = 0;

let currentPlan = null;
let currentPhaseIndex = 0;

let phaseTimer = null;
let phaseRemaining = 0;
let phaseStartedSeconds = 0;
let sessionPaused = false;


/* =========================================
   STORAGE
========================================= */

function getHistory() {
    return JSON.parse(
        localStorage.getItem("lifeCompilerHistory") || "[]"
    );
}

function saveHistory(history) {
    localStorage.setItem(
        "lifeCompilerHistory",
        JSON.stringify(history)
    );
}


/* =========================================
   DATA
========================================= */

const categories = {
    1: "Study",
    2: "Coding",
    3: "Assignment",
    4: "Time Management",
    5: "Other"
};

const priorities = {
    1: "LOW",
    2: "MEDIUM",
    3: "HIGH"
};

const actionPlans = {
    1: [
        "Learn the main topic.",
        "Practice important questions.",
        "Take a short test.",
        "Identify your mistakes.",
        "Revise weak areas."
    ],

    2: [
        "Understand the programming concept.",
        "Write code yourself.",
        "Compile and test the program.",
        "Find and fix errors.",
        "Try the program without help."
    ],

    3: [
        "Understand the assignment.",
        "Divide it into smaller tasks.",
        "Complete important tasks first.",
        "Review your work.",
        "Finish the final version."
    ],

    4: [
        "List all your tasks.",
        "Identify the most important task.",
        "Work according to the time allocation.",
        "Avoid distractions.",
        "Review remaining tasks."
    ],

    5: [
        "Clearly define your goal.",
        "Break it into small steps.",
        "Start with the most important step.",
        "Check your progress.",
        "Review the final result."
    ]
};


/* =========================================
   SCREEN SYSTEM
========================================= */

function hideAllScreens() {

    document.querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.add("hidden");
        });
}

function showScreen(id) {

    hideAllScreens();

    document.getElementById(id)
        .classList.remove("hidden");

    window.scrollTo(0, 0);
}


/* =========================================
   NAVIGATION
========================================= */

function goHome() {

    stopTimer();

    showScreen("homeScreen");
}

function openSetup() {

    stopTimer();

    showScreen("setupScreen");
}

function openPlan() {

    if (!currentPlan) return;

    stopTimer();

    showScreen("planScreen");
}

function openPerformance() {

    renderPerformance();

    showScreen("performanceScreen");
}

function openHistory() {

    renderHistory();

    showScreen("historyScreen");
}


/* =========================================
   CATEGORY
========================================= */

function selectCategory(category, button) {

    selectedCategory = category;

    document.querySelectorAll(".option")
        .forEach(item => {
            item.classList.remove("selected");
        });

    button.classList.add("selected");
}


/* =========================================
   PRIORITY
========================================= */

function selectPriority(priority, button) {

    selectedPriority = priority;

    document.querySelectorAll(
        ".priority-options button"
    ).forEach(item => {
        item.classList.remove("selected");
    });

    button.classList.add("selected");
}


/* =========================================
   SMART PLAN CALCULATION
========================================= */

function calculatePlan(
    time,
    priority,
    average,
    sessions
) {

    let learning;
    let practice;
    let breakTime;
    let test;
    let revision;


    /* HIGH PRIORITY */

    if (priority === 3) {

        if (time >= 60) {

            learning = Math.floor(time * 0.20);
            practice = Math.floor(time * 0.40);
            breakTime = Math.floor(time * 0.10);
            test = Math.floor(time * 0.20);
            revision = Math.floor(time * 0.10);

        } else {

            learning = Math.floor(time * 0.20);
            practice = Math.floor(time * 0.50);
            breakTime = Math.floor(time * 0.10);
            test = Math.floor(time * 0.20);
            revision = 0;
        }
    }


    /* MEDIUM PRIORITY */

    else if (priority === 2) {

        learning = Math.floor(time * 0.30);
        practice = Math.floor(time * 0.35);
        breakTime = Math.floor(time * 0.10);
        test = Math.floor(time * 0.10);
        revision = Math.floor(time * 0.15);
    }


    /* LOW PRIORITY */

    else {

        learning = Math.floor(time * 0.40);
        practice = Math.floor(time * 0.25);
        breakTime = Math.floor(time * 0.10);
        test = Math.floor(time * 0.05);
        revision = Math.floor(time * 0.20);
    }


    /* ADAPTIVE SYSTEM */

    if (sessions > 0) {

        if (average < 40) {

            practice += 10;

            if (learning >= 10) {
                learning -= 10;
            }
        }

        else if (average >= 90) {

            test += 10;

            if (learning >= 10) {
                learning -= 10;
            }
        }
    }


    return {
        learning,
        practice,
        breakTime,
        test,
        revision
    };
}


/* =========================================
   CREATE PLAN
========================================= */

function createPlan() {

    const error =
        document.getElementById("setupError");

    error.textContent = "";


    const name =
        document.getElementById("userName")
            .value
            .trim();


    const time =
        Number(
            document.getElementById("availableTime")
                .value
        );


    if (!name) {

        error.textContent =
            "Please enter your name.";

        return;
    }


    if (selectedCategory === 0) {

        error.textContent =
            "Please select a category.";

        return;
    }


    if (!time || time <= 0) {

        error.textContent =
            "Please enter valid time.";

        return;
    }


    if (selectedPriority === 0) {

        error.textContent =
            "Please select priority.";

        return;
    }


    const history = getHistory();

    const sessions = history.length;

    const total = history.reduce(
        (sum, item) => sum + item.score,
        0
    );

    const average =
        sessions > 0
            ? Math.floor(total / sessions)
            : 0;


    const allocation =
        calculatePlan(
            time,
            selectedPriority,
            average,
            sessions
        );


    currentPlan = {

        name,
        category: selectedCategory,
        time,
        priority: selectedPriority,
        sessions,
        average,
        allocation,
        actions: actionPlans[selectedCategory]

    };


    renderPlan();

    showScreen("planScreen");
}


/* =========================================
   RENDER PLAN
========================================= */

function renderPlan() {

    const plan = currentPlan;


    document.getElementById("planTitle")
        .textContent =
        plan.name + "'s Plan";


    document.getElementById("planSubtitle")
        .textContent =
        categories[plan.category] +
        " • Personalized session";


    document.getElementById("planTime")
        .textContent =
        plan.time + " min";


    document.getElementById("planPriority")
        .textContent =
        priorities[plan.priority];


    document.getElementById("planAverage")
        .textContent =
        plan.sessions > 0
            ? plan.average + "%"
            : "New";


    const message =
        document.getElementById(
            "adaptiveMessage"
        );


    if (plan.sessions === 0) {

        message.innerHTML =
            "🆕 <b>First session.</b><br>" +
            "A balanced starting plan has been created.";

    }

    else if (plan.average < 40) {

        message.innerHTML =
            "📈 <b>Performance is LOW.</b><br>" +
            "Practice time has been increased.";

    }

    else if (plan.average < 70) {

        message.innerHTML =
            "⚖️ <b>Performance is AVERAGE.</b><br>" +
            "Your plan is balanced.";

    }

    else if (plan.average < 90) {

        message.innerHTML =
            "🚀 <b>Performance is GOOD.</b><br>" +
            "The challenge is slightly increased.";

    }

    else {

        message.innerHTML =
            "🏆 <b>Excellent performance.</b><br>" +
            "Your plan is increasing the challenge.";

    }


    document.getElementById("learningTime")
        .textContent =
        plan.allocation.learning + " min";


    document.getElementById("practiceTime")
        .textContent =
        plan.allocation.practice + " min";


    document.getElementById("breakTime")
        .textContent =
        plan.allocation.breakTime + " min";


    document.getElementById("testTime")
        .textContent =
        plan.allocation.test + " min";


    document.getElementById("revisionTime")
        .textContent =
        plan.allocation.revision + " min";


    const container =
        document.getElementById("actionPlan");

    container.innerHTML = "";


    plan.actions.forEach(
        (action, index) => {

            const item =
                document.createElement("div");

            item.className =
                "action-item";

            item.innerHTML = `

                <div class="action-number">
                    ${index + 1}
                </div>

                <div>
                    ${action}
                </div>

            `;

            container.appendChild(item);
        }
    );
}


/* =========================================
   BUILD PHASES
========================================= */

function buildPhases() {

    const a =
        currentPlan.allocation;


    return [

        {
            name: "Learning",
            icon: "📖",
            time: a.learning,
            instruction:
                "Learn and understand the main topic."
        },

        {
            name: "Practice",
            icon: "💪",
            time: a.practice,
            instruction:
                "Practice questions or work on your task."
        },

        {
            name: "Break",
            icon: "☕",
            time: a.breakTime,
            instruction:
                "Take a short break and prepare for the next phase."
        },

        {
            name: "Test",
            icon: "📝",
            time: a.test,
            instruction:
                "Test yourself without looking at the answer."
        },

        {
            name: "Revision",
            icon: "🔄",
            time: a.revision,
            instruction:
                "Review mistakes and revise weak areas."
        }

    ].filter(
        phase => phase.time > 0
    );
}


/* =========================================
   START SESSION
========================================= */

function startSession() {

    if (!currentPlan) return;


    currentPlan.phases =
        buildPhases();


    currentPhaseIndex = 0;

    sessionPaused = false;

    showScreen("sessionScreen");

    loadPhase();
}


/* =========================================
   LOAD PHASE
========================================= */

function loadPhase() {

    stopTimer();

    sessionPaused = false;


    const phase =
        currentPlan.phases[
            currentPhaseIndex
        ];


    if (!phase) {

        finishSession();

        return;
    }


    phaseRemaining =
        phase.time * 60;


    phaseStartedSeconds =
        phaseRemaining;


    document.getElementById("phaseName")
        .textContent =
        phase.name;


    document.getElementById("currentPhase")
        .textContent =
        phase.name;


    document.getElementById("phaseIcon")
        .textContent =
        phase.icon;


    document.getElementById(
        "currentInstruction"
    ).textContent =
        phase.instruction;


    document.getElementById("phaseNumber")
        .textContent =
        `${currentPhaseIndex + 1} / ${
            currentPlan.phases.length
        }`;


    document.getElementById(
        "sessionTotalTime"
    ).textContent =
        currentPlan.time + " min";


    updateTimerDisplay();

    updateProgress();

    updateSessionButton();


    phaseTimer =
        setInterval(
            tick,
            1000
        );
}


/* =========================================
   TIMER
========================================= */

function tick() {

    if (sessionPaused) return;


    phaseRemaining--;

    updateTimerDisplay();


    updateProgress();


    if (phaseRemaining <= 0) {

        stopTimer();

        nextPhase();
    }
}


/* =========================================
   DISPLAY TIMER
========================================= */

function updateTimerDisplay() {

    const minutes =
        Math.floor(
            phaseRemaining / 60
        );


    const seconds =
        phaseRemaining % 60;


    document.getElementById("phaseTime")
        .textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


/* =========================================
   PROGRESS
========================================= */

function updateProgress() {

    const phase =
        currentPlan.phases[
            currentPhaseIndex
        ];


    if (!phase) return;


    const completedPhases =
        currentPhaseIndex;


    const phaseProgress =
        1 -
        (
            phaseRemaining /
            phaseStartedSeconds
        );


    const total =
        currentPlan.phases.length;


    const progress =
        (
            completedPhases +
            phaseProgress
        ) /
        total *
        100;


    document.getElementById(
        "progressFill"
    ).style.width =
        Math.min(
            progress,
            100
        ) + "%";
}


/* =========================================
   PAUSE / RESUME
========================================= */

function togglePause() {

    sessionPaused =
        !sessionPaused;


    updateSessionButton();
}


function updateSessionButton() {

    const button =
        document.getElementById(
            "sessionButton"
        );


    if (!button) return;


    if (sessionPaused) {

        button.textContent =
            "▶ Resume Session";

    }

    else {

        button.textContent =
            "⏸ Pause Session";

    }
}


/* =========================================
   NEXT PHASE
========================================= */

function nextPhase() {

    currentPhaseIndex++;


    if (
        currentPhaseIndex >=
        currentPlan.phases.length
    ) {

        finishSession();

        return;
    }


    loadPhase();
}


/* =========================================
   COMPLETE CURRENT PHASE MANUALLY
========================================= */

function completePhase() {

    stopTimer();

    nextPhase();
}


/* =========================================
   FINISH SESSION
========================================= */

function finishSession() {

    stopTimer();

    showScoreScreen();
}


/* =========================================
   EARLY FINISH
========================================= */

function finishSessionEarly() {

    stopTimer();

    showScoreScreen();
}


/* =========================================
   STOP TIMER
========================================= */

function stopTimer() {

    if (phaseTimer !== null) {

        clearInterval(phaseTimer);

        phaseTimer = null;
    }
}


/* =========================================
   RESULT
========================================= */

function showScoreScreen() {

    stopTimer();

    showScreen("resultScreen");


    document.getElementById("scoreNumber")
        .textContent =
        "—";


    document.getElementById("resultUser")
        .textContent =
        "How well did you complete your plan?";


    document.getElementById("resultSessions")
        .textContent =
        "—";


    document.getElementById("resultAverage")
        .textContent =
        "—";


    document.getElementById("resultChange")
        .textContent =
        "—";


    document.getElementById(
        "feedbackCard"
    ).innerHTML = `

        <h3>Session Complete 🎯</h3>

        <p style="margin-top:10px">
            Enter your performance score.
            This score will help Life Compiler
            adapt your next session.
        </p>

        <input
            id="performanceInput"
            type="number"
            min="0"
            max="100"
            placeholder="Performance 0 - 100"
            style="
                margin-top:15px;
                width:100%;
                padding:15px;
                border-radius:13px;
                border:1px solid #273148;
                background:#101624;
                color:white;
                font-size:16px;
            "
        >

        <button
            class="primary-btn"
            onclick="savePerformance()">

            Save Performance

        </button>

        <p id="scoreError"
           class="error"></p>
    `;
}


/* =========================================
   SAVE PERFORMANCE
========================================= */

function savePerformance() {

    const input =
        document.getElementById(
            "performanceInput"
        );


    const error =
        document.getElementById(
            "scoreError"
        );


    const score =
        Number(input.value);


    if (
        input.value === "" ||
        score < 0 ||
        score > 100
    ) {

        error.textContent =
            "Enter a score between 0 and 100.";

        return;
    }


    const history =
        getHistory();


    const previousAverage =
        history.length > 0

            ? Math.floor(
                history.reduce(
                    (sum, item) =>
                        sum + item.score,
                    0
                ) / history.length
            )

            : score;


    history.push({

        score,

        name:
            currentPlan.name,

        category:
            categories[
                currentPlan.category
            ],

        priority:
            priorities[
                currentPlan.priority
            ],

        time:
            currentPlan.time,

        date:
            new Date().toLocaleString()

    });


    saveHistory(history);


    const average =
        Math.floor(
            history.reduce(
                (sum, item) =>
                    sum + item.score,
                0
            ) / history.length
        );


    const change =
        score - previousAverage;


    document.getElementById(
        "scoreNumber"
    ).textContent =
        score + "%";


    document.getElementById(
        "resultUser"
    ).textContent =
        "Great work, " +
        currentPlan.name +
        "!";


    document.getElementById(
        "resultSessions"
    ).textContent =
        history.length;


    document.getElementById(
        "resultAverage"
    ).textContent =
        average + "%";


    document.getElementById(
        "resultChange"
    ).textContent =
        (change >= 0 ? "+" : "") +
        change +
        "%";


    showFeedback(score);
}


/* =========================================
   FEEDBACK
========================================= */

function showFeedback(score) {

    const card =
        document.getElementById(
            "feedbackCard"
        );


    if (score < 40) {

        card.innerHTML = `

            <h3>📉 Performance: LOW</h3>

            <p style="margin-top:8px">
                Your next plan will increase
                practice and focus on fundamentals.
            </p>
        `;

    }

    else if (score < 70) {

        card.innerHTML = `

            <h3>⚖️ Performance: AVERAGE</h3>

            <p style="margin-top:8px">
                Good start. Improve consistency
                in your next session.
            </p>
        `;

    }

    else if (score < 90) {

        card.innerHTML = `

            <h3>🚀 Performance: GOOD</h3>

            <p style="margin-top:8px">
                You're progressing well.
                Keep increasing your challenge.
            </p>
        `;

    }

    else {

        card.innerHTML = `

            <h3>🏆 Performance: EXCELLENT</h3>

            <p style="margin-top:8px">
                You're ready for a bigger challenge!
            </p>
        `;
    }
}


/* =========================================
   PERFORMANCE
========================================= */

function renderPerformance() {

    const history = getHistory();

    const averageScore =
        document.getElementById("averageScore");

    const totalSessions =
        document.getElementById("totalSessions");

    const bestScore =
        document.getElementById("bestScore");

    const lastScore =
        document.getElementById("lastScore");

    const message =
        document.getElementById("performanceMessage");

    const bar =
        document.getElementById("performanceBar");

    const level =
        document.getElementById("performanceLevel");

    const recent =
        document.getElementById("recentPerformance");

    const insight =
        document.getElementById("smartInsight");


    /* =========================
       NO DATA
    ========================= */

    if (history.length === 0) {

        averageScore.textContent = "0%";

        totalSessions.textContent = "0";

        bestScore.textContent = "0%";

        lastScore.textContent = "0%";

        bar.style.width = "0%";

        level.textContent =
            "Complete your first session to begin.";

        message.innerHTML = `
            🆕 <b>No performance data yet.</b>

            <br><br>

            Complete your first Life Compiler
            session and your performance will
            appear here.
        `;

        recent.innerHTML =
            "No sessions yet.";

        insight.textContent =
            "Your first session will give Life Compiler data to understand your performance.";

        return;
    }


    /* =========================
       CALCULATIONS
    ========================= */

    const scores =
        history.map(item => Number(item.score));


    const total =
        scores.reduce(
            (sum, score) => sum + score,
            0
        );


    const average =
        Math.floor(
            total / scores.length
        );


    const best =
        Math.max(...scores);


    const last =
        scores[scores.length - 1];


    /* =========================
       BASIC STATS
    ========================= */

    averageScore.textContent =
        average + "%";


    totalSessions.textContent =
        history.length;


    bestScore.textContent =
        best + "%";


    lastScore.textContent =
        last + "%";


    /* =========================
       PROGRESS BAR
    ========================= */

    bar.style.width =
        average + "%";


    /* =========================
       PERFORMANCE LEVEL
    ========================= */

    if (average < 40) {

        level.textContent =
            "🔴 Needs Improvement — Focus on fundamentals.";

        message.innerHTML = `
            📉 <b>Performance needs improvement.</b>

            <br><br>

            Life Compiler will give your next
            plan more practice and revision time.
        `;

        insight.textContent =
            "Your current performance suggests that more practice and smaller focused sessions may help.";

    }

    else if (average < 70) {

        level.textContent =
            "🟡 Average — Keep building consistency.";

        message.innerHTML = `
            ⚖️ <b>You're making progress.</b>

            <br><br>

            Focus on consistency and gradually
            increase your performance.
        `;

        insight.textContent =
            "You're building a foundation. Try to improve your score a little in every session.";

    }

    else if (average < 90) {

        level.textContent =
            "🟢 Good — You're progressing well.";

        message.innerHTML = `
            🚀 <b>Good performance!</b>

            <br><br>

            You're ready for slightly harder
            goals and more challenging sessions.
        `;

        insight.textContent =
            "Your performance is strong. Life Compiler can gradually increase the challenge.";

    }

    else {

        level.textContent =
            "🏆 Excellent — You're performing at a high level.";

        message.innerHTML = `
            🏆 <b>Excellent performance!</b>

            <br><br>

            You're ready for bigger challenges.
        `;

        insight.textContent =
            "Your performance is excellent. Focus on advanced tasks and maintaining consistency.";
    }


    /* =========================
       RECENT SESSIONS
    ========================= */

    recent.innerHTML = "";


    const recentSessions =
        history
            .slice(-5)
            .reverse();


    recentSessions.forEach(
        (item, index) => {

            const row =
                document.createElement("div");


            row.style.cssText = `
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:12px 0;
                border-bottom:1px solid #273148;
            `;


            row.innerHTML = `

                <div>

                    <strong>
                        ${item.category}
                    </strong>

                    <br>

                    <small>
                        ${item.date}
                    </small>

                </div>

                <strong>
                    ${item.score}%
                </strong>

            `;


            recent.appendChild(row);
        }
    );
}


    

function getPerformanceMessage(score) {

    if (score < 40) {

        return "📉 Performance is low. Focus on practice and consistency.";

    }

    if (score < 70) {

        return "⚖️ Performance is average. Keep improving.";

    }

    if (score < 90) {

        return "🚀 Good performance. Continue challenging yourself.";

    }

    return "🏆 Excellent performance. You're ready for bigger challenges!";
}


/* =========================================
   HISTORY
========================================= */

function renderHistory() {

    const history =
        getHistory();


    const list =
        document.getElementById(
            "historyList"
        );


    list.innerHTML = "";


    if (history.length === 0) {

        list.innerHTML = `

            <div class="adaptive-card">

                📜 No sessions yet.

                <br><br>

                Complete your first session
                to see your history.

            </div>
        `;

        return;
    }


    history
        .slice()
        .reverse()
        .forEach(
            (item, index) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "history-item";


                div.innerHTML = `

                    <div>

                        <strong>
                            Session ${
                                history.length -
                                index
                            }
                        </strong>

                        <br>

                        <small>
                            ${item.category}
                            • ${item.date}
                        </small>

                    </div>

                    <div class="history-score">
                        ${item.score}%
                    </div>
                `;


                list.appendChild(div);
            }
        );
}


/* =========================================
   RESET HISTORY
========================================= */

function resetHistory() {

    const list =
        document.getElementById(
            "historyList"
        );


    list.innerHTML = `

        <div class="adaptive-card">

            <h3>Reset Performance?</h3>

            <p style="margin-top:10px">
                All saved sessions will be removed.
            </p>

            <button
                class="danger-btn"
                onclick="confirmReset()">

                Yes, Reset

            </button>

            <button
                class="secondary-btn"
                onclick="renderHistory()">

                Cancel

            </button>

        </div>
    `;
}


function confirmReset() {

    localStorage.removeItem(
        "lifeCompilerHistory"
    );

    renderHistory();
}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded", 
    () => {

        showScreen("homeScreen");

    }
);