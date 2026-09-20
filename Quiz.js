const questions = [
  {
    question: "Which island group is Chocolate Hills located in?",
    destinationId: "chocolate-hills",
    choices: ["Luzon", "Visayas", "Mindanao", "Palawan"],
    answer: 1
  },
  {
    question: "Where can you find the Banaue Rice Terraces?",
    destinationId: "banaue-rice-terraces",
    choices: ["Ifugao", "Cebu", "Palawan", "Davao"],
    answer: 0
  },
  {
    question: "Which famous beach destination is located in Aklan?",
    destinationId: "boracay",
    choices: ["Boracay", "Vigan", "Baguio", "Tagaytay"],
    answer: 0
  },
  {
    question: "Which tourist attraction in Palawan is famous for its underground river?",
    destinationId: "puerto-princesa-underground-river",
    choices: ["Puerto Princesa Underground River", "Chocolate Hills", "Mayon Volcano", "Calle Crisologo"],
    answer: 0
  },
  {
    question: "Which volcano is famous for its nearly perfect cone shape?",
    destinationId: "mayon-volcano",
    choices: ["Taal Volcano", "Mount Apo", "Mayon Volcano", "Mount Pinatubo"],
    answer: 2
  },
  {
    question: "Which city is famous for the historic Calle Crisologo?",
    destinationId: "vigan",
    choices: ["Vigan City", "Quezon City", "Davao City", "Cagayan de Oro"],
    answer: 0
  },
  {
    question: "Which destination is known as a popular surfing spot in the Philippines?",
    destinationId: "siargao",
    choices: ["Siargao", "Baguio", "Vigan", "Tagaytay"],
    answer: 0
  },
  {
    question: "Where is the Hundred Islands National Park located?",
    destinationId: "hundred-islands-national-park",
    choices: ["Pangasinan", "Batangas", "Leyte", "Negros Occidental"],
    answer: 0
  },
  {
    question: "Which Palawan destination is famous for limestone cliffs, lagoons, and island hopping?",
    image: "home.jpg",
    choices: ["El Nido", "Baguio", "Vigan", "Tagaytay"],
    answer: 0
  },
  {
    question: "What is the highest mountain in the Philippines?",
    destinationId: "mount-apo",
    choices: ["Mount Pulag", "Mount Apo", "Mount Pinatubo", "Mount Arayat"],
    answer: 1
  }
];

let attemptCompleted = false;
let resultSaved = false;
let attemptId = "";
let currentQuestion = 0;
let selectedAnswers = Array(questions.length).fill(null);
let fullName = "";

const homeScreen = document.getElementById("homeScreen");
const usernameScreen = document.getElementById("usernameScreen");
const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");

const usernameInput = document.getElementById("username");
const nameError = document.getElementById("nameError");
const playerName = document.getElementById("playerName");

const questionText = document.getElementById("questionText");
const questionImage = document.getElementById("questionImage");
const answers = document.getElementById("answers");
const questionCount = document.getElementById("questionCount");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const scorePanel = document.getElementById("scorePanel");
const resultsModal = document.getElementById("resultsModal");

function createAttemptId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const values = crypto.getRandomValues(new Uint32Array(4));
  return Array.from(values, value => value.toString(16).padStart(8, "0")).join("");
}

function showScreen(screen) {
  [homeScreen, usernameScreen, startScreen, quizScreen].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function openQuizIntro() {
  showScreen(usernameScreen);
  usernameInput.focus();
}

document.getElementById("homeQuizBtn").addEventListener("click", openQuizIntro);

document.getElementById("continueBtn").addEventListener("click", () => {
  const name = usernameInput.value.trim();

  if (!name) {
    nameError.textContent = "Please enter your full name.";
    usernameInput.focus();
    return;
  }

  fullName = name;
  playerName.textContent = fullName;
  nameError.textContent = "";
  showScreen(startScreen);
});

usernameInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    document.getElementById("continueBtn").click();
  }
});

document.getElementById("startQuizBtn").addEventListener("click", () => {
  attemptCompleted = false;
  resultSaved = false;
  attemptId = createAttemptId();
  nextBtn.disabled = false;
  currentQuestion = 0;
  selectedAnswers = Array(questions.length).fill(null);
  scorePanel.classList.add("hidden");
  showScreen(quizScreen);
  renderQuestion();
});

function renderQuestion() {
  const q = questions[currentQuestion];
  const destination = q.destinationId
    ? destinations.find(item => item.id === q.destinationId)
    : null;

  questionCount.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  questionText.textContent = q.question;
  questionImage.src = destination?.quizImage || q.image;
  questionImage.alt = q.question;

  answers.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = attemptCompleted;
    button.className = "answer";
    button.textContent = choice;

    if (selectedAnswers[currentQuestion] === index) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (attemptCompleted) return;
      selectedAnswers[currentQuestion] = index;
      renderQuestion();
    });

    answers.appendChild(button);
  });

  previousBtn.disabled = attemptCompleted || currentQuestion === 0;
  previousBtn.style.opacity = currentQuestion === 0 ? ".5" : "1";

  nextBtn.textContent =
    currentQuestion === questions.length - 1
      ? "Finish Quiz ✓"
      : "Next Question ›";
}

previousBtn.addEventListener("click", () => {
  if (!attemptCompleted && currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (selectedAnswers[currentQuestion] === null) {
    alert("Please choose an answer first.");
    return;
  }

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  if (attemptCompleted || selectedAnswers.some(answer => answer === null)) return;
  attemptCompleted = true;
  nextBtn.disabled = true;
  let correct = 0;

  selectedAnswers.forEach((answer, index) => {
    if (answer === questions[index].answer) {
      correct++;
    }
  });

  const incorrect = questions.length - correct;
  const percentage = Math.round(correct / questions.length * 100);

  document.getElementById("finalFullName").textContent = fullName;
  document.getElementById("finalScore").textContent = `${correct} / ${questions.length}`;
  document.getElementById("finalPercentage").textContent = `${percentage}%`;
  document.getElementById("correctAnswers").textContent = correct;
  document.getElementById("incorrectAnswers").textContent = incorrect;
  document.getElementById("answeredQuestions").textContent =
    `${selectedAnswers.filter(a => a !== null).length} / ${questions.length}`;

  let message = "Keep learning about the Philippines!";
  if (correct === questions.length) message = "Perfect score! You know your Philippine tourist spots!";
  else if (correct >= 8) message = "Great job! You know a lot about the Philippines!";
  else if (correct >= 5) message = "Good effort! Try again and beat your score!";

  document.getElementById("scoreMessage").textContent = message;

  renderQuestion();
  scorePanel.classList.remove("hidden");
  scorePanel.focus({ preventScroll: true });
  scorePanel.scrollIntoView({ behavior: "smooth", block: "center" });

  const result = {
    fullName,
    score: correct,
    totalQuestions: questions.length,
    correctAnswers: correct,
    incorrectAnswers: incorrect,
    percentage,
    answers: questions.map((question, index) => ({
      question: question.question,
      selectedAnswer: question.choices[selectedAnswers[index]],
      correctAnswer: question.choices[question.answer],
      isCorrect: selectedAnswers[index] === question.answer
    }))
  };

  if (!resultSaved) {
    resultSaved = true;
    const saveStatus = document.getElementById("saveStatus");
    saveStatus.textContent = "Saving result...";
    void window.saveQuizResult(result, attemptId).then(() => {
      saveStatus.textContent = "Result saved to Firestore.";
    }).catch(error => {
      console.error("Quiz result could not be saved:", error);
      saveStatus.textContent = "Your score is shown, but the result could not be saved. Check your connection and try again later.";
    });
  }
}

document.getElementById("retakeBtn").addEventListener("click", () => {
  attemptCompleted = false;
  resultSaved = false;
  attemptId = "";
  nextBtn.disabled = false;
  currentQuestion = 0;
  selectedAnswers = Array(questions.length).fill(null);
  fullName = "";
  usernameInput.value = "";
  playerName.textContent = "";
  nameError.textContent = "";
  document.getElementById("finalFullName").textContent = "";
  document.getElementById("finalScore").textContent = `0 / ${questions.length}`;
  document.getElementById("finalPercentage").textContent = "0%";
  document.getElementById("correctAnswers").textContent = "0";
  document.getElementById("incorrectAnswers").textContent = "0";
  document.getElementById("answeredQuestions").textContent = `0 / ${questions.length}`;
  document.getElementById("saveStatus").textContent = "";
  scorePanel.classList.add("hidden");
  renderQuestion();
  showScreen(usernameScreen);
  usernameInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

document.querySelectorAll("[data-close-dialog]").forEach(button => {
  button.addEventListener("click", () => closeDialog(document.getElementById(button.dataset.closeDialog)));
});

resultsModal.addEventListener("click", event => {
  if (event.target === resultsModal) closeDialog(resultsModal);
});

function formatCompletedAt(completedAt) {
  if (!completedAt) return "Pending timestamp";
  const date = typeof completedAt.toDate === "function" ? completedAt.toDate() : new Date(completedAt);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  }).format(date);
}

let savedQuizResults = [];

function getSearchableDates(completedAt) {
  if (!completedAt) return [];
  const date = typeof completedAt.toDate === "function" ? completedAt.toDate() : new Date(completedAt);
  if (Number.isNaN(date.getTime())) return [];
  return [
    formatCompletedAt(completedAt),
    date.toLocaleDateString(),
    date.toISOString().slice(0, 10)
  ].map(value => value.toLowerCase());
}

function renderSavedResults(results) {
  const rows = document.getElementById("resultsRows");
  rows.replaceChildren();
  for (const result of results) {
    const row = document.createElement("tr");
    const values = [
      result.fullName || result.username || "Name unavailable",
      `${Number(result.score) || 0} / ${Number(result.totalQuestions) || questions.length}`,
      `${Number(result.percentage) || 0}%`,
      formatCompletedAt(result.completedAt)
    ];
    ["Full Name", "Score", "Percentage", "Date Completed"].forEach((label, index) => {
      const cell = document.createElement("td");
      cell.dataset.label = label;
      if (index === 3) {
        const time = document.createElement("time");
        time.textContent = values[index];
        cell.append(time);
      } else {
        cell.textContent = values[index];
      }
      row.append(cell);
    });
    rows.append(row);
  }
}

function filterSavedResults() {
  const search = document.getElementById("resultsSearch");
  const status = document.getElementById("resultsStatus");
  const tableWrap = document.getElementById("resultsTableWrap");
  const count = document.getElementById("resultsSearchCount");
  const query = search.value.trim().toLowerCase();
  let results = savedQuizResults;

  if (query) {
    const scoreQuery = /^\d+(?:\.\d+)?$/.test(query);
    const percentageQuery = /^\d+(?:\.\d+)?%$/.test(query);
    const numericQuery = Number(query.replace("%", ""));

    results = savedQuizResults.filter(result => {
      if (percentageQuery) return Number(result.percentage) === numericQuery;
      if (scoreQuery) return Number(result.score) === numericQuery;
      const name = String(result.fullName || result.username || "").toLowerCase();
      return name.includes(query) || getSearchableDates(result.completedAt).some(value => value.includes(query));
    });
  }

  count.textContent = `${results.length} ${results.length === 1 ? "result" : "results"}`;
  if (!results.length) {
    document.getElementById("resultsRows").replaceChildren();
    tableWrap.hidden = true;
    status.hidden = false;
    status.textContent = "No quiz results match your search.";
    return;
  }

  renderSavedResults(results);
  status.hidden = true;
  tableWrap.hidden = false;
}

async function showSavedResults() {
  const status = document.getElementById("resultsStatus");
  const tableWrap = document.getElementById("resultsTableWrap");
  const searchWrap = document.getElementById("resultsSearchWrap");
  const search = document.getElementById("resultsSearch");
  status.hidden = false;
  status.textContent = "Loading results...";
  tableWrap.hidden = true;
  searchWrap.hidden = true;
  search.value = "";
  savedQuizResults = [];
  resultsModal.showModal();
  try {
    const results = await window.loadQuizResults();
    if (!results.length) {
      status.textContent = "No quiz results yet.";
      return;
    }
    savedQuizResults = results;
    searchWrap.hidden = false;
    filterSavedResults();
  } catch (error) {
    console.error("Quiz results could not be loaded:", error);
    status.textContent = "Unable to load quiz results. Please check your connection and try again.";
  }
}

document.getElementById("resultsSearch").addEventListener("input", filterSavedResults);
document.getElementById("homeSeeResultsBtn").addEventListener("click", showSavedResults);
document.getElementById("seeResultsBtn").addEventListener("click", showSavedResults);

// A refresh always starts a clean browser quiz session. Firestore data is untouched.
usernameInput.value = "";
scorePanel.classList.add("hidden");
showScreen(homeScreen);
