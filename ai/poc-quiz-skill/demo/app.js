const els = {
  title: document.getElementById("quiz-title"),
  progressBar: document.getElementById("progress-bar"),
  progressLabel: document.getElementById("progress-label"),
  questionView: document.getElementById("question-view"),
  questionText: document.getElementById("question-text"),
  alternatives: document.getElementById("alternatives"),
  feedback: document.getElementById("feedback"),
  submitBtn: document.getElementById("submit-btn"),
  nextBtn: document.getElementById("next-btn"),
  resultView: document.getElementById("result-view"),
  resultScore: document.getElementById("result-score"),
  resultMessage: document.getElementById("result-message"),
  retryBtn: document.getElementById("retry-btn"),
};

const state = {
  questions: [],
  current: 0,
  score: 0,
  selectedIndex: null,
  answered: false,
};

async function loadQuestions() {
  const res = await fetch("questions.json");
  if (!res.ok) throw new Error(`Failed to load questions: ${res.status}`);
  const data = await res.json();
  els.title.textContent = data.title || "Quiz";
  state.questions = data.questions || [];
}

function startQuiz() {
  state.current = 0;
  state.score = 0;
  els.resultView.hidden = true;
  els.questionView.hidden = false;
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.current];
  state.selectedIndex = null;
  state.answered = false;

  updateProgress();

  els.questionText.textContent = q.question;
  els.alternatives.innerHTML = "";
  els.feedback.hidden = true;
  els.feedback.className = "feedback";

  q.alternatives.forEach((text, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "alternative";
    btn.textContent = text;
    btn.addEventListener("click", () => selectAlternative(i));
    li.appendChild(btn);
    els.alternatives.appendChild(li);
  });

  els.submitBtn.hidden = false;
  els.submitBtn.disabled = true;
  els.nextBtn.hidden = true;
  els.nextBtn.textContent =
    state.current === state.questions.length - 1 ? "See results" : "Next";
}

function updateProgress() {
  const total = state.questions.length;
  const pct = (state.current / total) * 100;
  els.progressBar.style.width = `${pct}%`;
  els.progressLabel.textContent = `Question ${state.current + 1} of ${total}`;
}

function selectAlternative(index) {
  if (state.answered) return;
  state.selectedIndex = index;

  [...els.alternatives.querySelectorAll(".alternative")].forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });

  els.submitBtn.disabled = false;
}

function submitAnswer() {
  if (state.selectedIndex === null || state.answered) return;
  state.answered = true;

  const q = state.questions[state.current];
  const correct = q.correctIndex;
  const isRight = state.selectedIndex === correct;
  if (isRight) state.score++;

  const buttons = [...els.alternatives.querySelectorAll(".alternative")];
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.remove("selected");
    if (i === correct) btn.classList.add("correct");
    else if (i === state.selectedIndex) btn.classList.add("wrong");
  });

  els.feedback.hidden = false;
  els.feedback.classList.add(isRight ? "correct" : "wrong");
  els.feedback.innerHTML = `
    <div class="feedback__title">${isRight ? "Correct!" : "Incorrect"}</div>
    <div>${q.comment || ""}</div>
  `;

  els.submitBtn.hidden = true;
  els.nextBtn.hidden = false;
}

function nextQuestion() {
  state.current++;
  if (state.current >= state.questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  els.questionView.hidden = true;
  els.resultView.hidden = false;
  els.progressBar.style.width = "100%";
  els.progressLabel.textContent = "Completed";

  const total = state.questions.length;
  const pct = Math.round((state.score / total) * 100);
  els.resultScore.textContent = `${state.score} / ${total}`;

  let msg;
  if (pct === 100) msg = "Perfect score! 🎉";
  else if (pct >= 70) msg = "Great job! 👏";
  else if (pct >= 40) msg = "Not bad — keep practicing.";
  else msg = "Give it another try!";
  els.resultMessage.textContent = `${pct}% correct. ${msg}`;
}

els.submitBtn.addEventListener("click", submitAnswer);
els.nextBtn.addEventListener("click", nextQuestion);
els.retryBtn.addEventListener("click", startQuiz);

loadQuestions()
  .then(startQuiz)
  .catch((err) => {
    els.questionText.textContent = "Error loading quiz.";
    console.error(err);
  });
