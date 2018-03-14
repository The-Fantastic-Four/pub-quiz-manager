const newQuiz = (function () {

  let database;
  let quiz;
  let initializeQuiz;
  let quizNameInput;
  let questionInput;
  let username;
  let section;

  function createQuiz() {
    quiz = quizNameInput.value;
    const question = questionInput.value;
    const questionIds = {};
    const questionsRef = database.ref('questions');
    for(let i = 0; i < question; i++) {
      const newQuestion = questionsRef.push();
      newQuestion.set({
        isPrivate: true,
        type: 'blank',
      });
      questionIds[newQuestion.key] = i + 1;
    }
    database.ref(`quizzes/${quiz}`).set({
      currentQuestion: 0,
      questions: questionIds,
      teams: {},
    });
    database.ref(`hosts/${username}/quizzes/${quiz}`).set(true);
    initializeQuiz(quiz);
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
  }

  // Create list of questions
  function createForm() {
    section = document.querySelector('.section__newQuiz');
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    const header = document.createElement('h2');
    header.setAttribute('class', 'heading--two');
    header.appendChild(document.createTextNode('Nýtt pöbbquiz'));
    section.appendChild(header);
    quizNameInput = document.createElement('input');
    questionInput = document.createElement('input');
    quizNameInput.setAttribute('id', 'input__name');
    questionInput.setAttribute('id', 'input__question');
    section.appendChild(quizNameInput);
    section.appendChild(questionInput);
    const button = document.createElement('button');
    button.appendChild(document.createTextNode('Skrá'));
    section.appendChild(button);
    button.addEventListener('click', () => {
      createQuiz();
    })
  }

  function init(db, initQuiz, un) {
    database = db;
    initializeQuiz = initQuiz;
    username = un;
    createForm();
  }

  return {
    init: init
  }
})();

module.exports = newQuiz;