let Questions = [];
const ques = document.getElementById("ques");
const opt = document.getElementById("opt");
const scoreElem = document.getElementById("score");
const timerElem = document.getElementById("timer");
const startPanel = document.getElementById("start-panel");
const quizPanel = document.getElementById("quiz-panel");
let currQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let questionCount = 10; // Default number of questions

// Function to start the quiz with the selected number of questions
function startQuiz(count) {
    questionCount = count;
    startPanel.style.display = "none";
    quizPanel.style.display = "flex";
    fetchQuestions();
}

// Function to fetch quiz questions from the API
async function fetchQuestions() {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=${questionCount}`);
        if (!response.ok) throw new Error("Unable to fetch data");
        const data = await response.json();
        Questions = data.results;
        loadQuestion();
    } catch (error) {
        ques.innerHTML = `<h5 style="color: red">${error.message}</h5>`;
    }
}

// Function to load a question and its options
function loadQuestion() {
    if (!Questions.length) {
        ques.innerHTML = "<h5>Please wait, loading questions...</h5>";
        return;
    }

    const currentQ = Questions[currQuestion];
    ques.innerText = decodeHtml(currentQ.question);
    const options = [currentQ.correct_answer, ...currentQ.incorrect_answers]
        .sort(() => Math.random() - 0.5);
    opt.innerHTML = options
        .map(option => `
            <div>
                <input type="radio" name="answer" value="${option}">
                <label>${decodeHtml(option)}</label>
            </div>
        `)
        .join('');

    resetTimer();
}

// Function to decode HTML entities in question/option text
function decodeHtml(html) {
    const text = document.createElement("textarea");
    text.innerHTML = html;
    return text.value;
}

// Function to check the selected answer
function checkAnswer() {
    const selectedAns = document.querySelector('input[name="answer"]:checked');
    if (!selectedAns) return;

    if (selectedAns.value === Questions[currQuestion].correct_answer) {
        score++;
    }

    nextQuestion();
}

// Function to load the next question or display the final score
function nextQuestion() {
    clearInterval(timer);

    if (currQuestion < Questions.length - 1) {
        currQuestion++;
        loadQuestion();
    } else {
        showScore();
    }
}

// Function to display the user's final score and answers
function showScore() {
    ques.innerHTML = '';
    opt.innerHTML = '';

    const btn = document.getElementById("btn");
    if (btn) btn.remove();

    timerElem.style.display = "none";

    scoreElem.innerHTML = `You scored ${score} out of ${Questions.length}`;
    scoreElem.innerHTML += `<h3>Correct Answers:</h3>`;
    Questions.forEach((question, index) => {
        scoreElem.innerHTML += `<p>${index + 1}. ${decodeHtml(question.correct_answer)}</p>`;
    });
}

// Timer functions
function resetTimer() {
    timeLeft = 30;
    timerElem.innerText = `Time Left: ${timeLeft} seconds`;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerElem.innerText = `Time Left: ${timeLeft} seconds`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

// Add fullscreen functionality
const fullscreenButton = document.getElementById('fullscreen');
fullscreenButton.addEventListener('click', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting fullscreen: ${err.message}`);
        });
    }
});

// Detect fullscreen exit and submit the quiz
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        showScore();
    }
});