const $ = (sel) => document.querySelector(sel);

const amountEl = $("#amount");
const typeEl = $("#type");
const difficultyEl = $("#difficulty");
const startBtn = $("#startBtn");
const statusEl = $("#status");

const gameEl = $("#game");
const qTextEl = $("#qText");
const choicesEl = $("#choices");
const progressEl = $("#progress");
const nextBtn = $("#nextBtn");
const scoreBox = $("#scoreBox");
const scoreText = $("#scoreText");
const restartBtn = $("#restartBtn");

let questions = [];
let idx = 0;
let score = 0;
let answered = false;
let isLoading = false;

function b64(s) {
    try {
        return decodeURIComponent(escape(atob(s)));
    } catch {
        return s;
    }
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function fetchQuestions() {
    const params = new URLSearchParams();
    const amount = parseInt(amountEl.value) || 5;
    params.set("amount", String(Math.min(Math.max(amount, 1), 50)));
    params.set("encode", "base64");

    if (typeEl.value) params.set("type", typeEl.value);
    if (difficultyEl.value) params.set("difficulty", difficultyEl.value);

    statusEl.textContent = "Loading questions...";

    try {
        const res = await fetch(`https://opentdb.com/api.php?${params.toString()}`);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        statusEl.textContent = "";

        if (data.response_code === 5) {
            throw new Error("Rate limit exceeded. Please wait a few seconds and try again.");
        }
        if (data.response_code === 1) {
            throw new Error("Not enough questions available for your criteria. Try different settings.");
        }
        if (data.response_code !== 0) {
            throw new Error(`API error (code ${data.response_code}). Please try again.`);
        }

        return data.results || [];
    } catch (error) {
        statusEl.textContent = "";
        throw error;
    }
}

function renderQuestion() {
    const q = questions[idx];
    if (!q) return;

    const qText = b64(q.question);
    const correct = b64(q.correct_answer);
    const incorrect = (q.incorrect_answers || []).map(b64);

    qTextEl.textContent = qText;

    const options = shuffle([correct, ...incorrect]);

    choicesEl.innerHTML = "";
    options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "choice";
        btn.textContent = opt;
        btn.addEventListener("click", () => onChoose(btn, opt === correct));
        choicesEl.appendChild(btn);
    });

    progressEl.textContent = `Question ${idx + 1} of ${questions.length}`;
    nextBtn.disabled = true;
    answered = false;
}

function onChoose(btn, isCorrect) {
    if (answered) return;
    answered = true;

    // Disable all choices
    const choices = choicesEl.querySelectorAll('.choice');
    choices.forEach(choice => {
        choice.disabled = true;
        choice.style.cursor = 'not-allowed';
    });

    if (isCorrect) {
        btn.classList.add("correct");
        score++;
    } else {
        btn.classList.add("wrong");
        // Show correct answer
        const correctText = b64(questions[idx].correct_answer);
        choices.forEach(choice => {
            if (choice.textContent === correctText) {
                choice.classList.add("correct");
            }
        });
    }

    nextBtn.disabled = false;
}

function showScore() {
    scoreText.textContent = `${score} / ${questions.length}`;
    scoreBox.classList.remove("hidden");
}

function resetGame() {
    scoreBox.classList.add("hidden");
    gameEl.classList.add("hidden");
    statusEl.textContent = "";
    score = 0;
    idx = 0;
    answered = false;
    questions = [];
}

startBtn.addEventListener("click", async () => {
    if (isLoading) return;

    isLoading = true;
    startBtn.disabled = true;
    startBtn.textContent = "Loading...";

    try {
        resetGame();
        gameEl.classList.remove("hidden");

        questions = await fetchQuestions();

        if (!questions.length) {
            statusEl.textContent = "No questions found. Try different settings.";
            gameEl.classList.add("hidden");
            return;
        }

        renderQuestion();
    } catch (error) {
        console.error("Error fetching questions:", error);
        statusEl.textContent = error.message || "Failed to load questions. Please try again.";
        gameEl.classList.add("hidden");
    } finally {
        isLoading = false;
        startBtn.disabled = false;
        startBtn.textContent = "Start Game";
    }
});

nextBtn.addEventListener("click", () => {
    if (idx < questions.length - 1) {
        idx++;
        renderQuestion();
    } else {
        showScore();
    }
});

restartBtn.addEventListener("click", () => {
    resetGame();
    statusEl.textContent = "Configure your quiz settings and click 'Start Game' to begin.";
});

// Initialize
statusEl.textContent = "Configure your quiz settings and click 'Start Game' to begin.";
