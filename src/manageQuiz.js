/**
 * Manages quiz while running
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * 14. march 2018
 */
const manageQuiz = (function() {

  let database;
  let quiz;
  let currentQuestion;
  let currQuest;
  let currRef;
  let numQuestions;

  // Change current question to next question
  function nextQuestion() {
    if (numQuestions >= currentQuestion + 1) {
      currRef.set(currentQuestion + 1);
    }
  }

  // Change current question to previous question
  function previousQuestion() {
    if (currentQuestion - 1 >= 1) {
      currRef.set(currentQuestion - 1);
    }
  }
  
  // Selects which question is current
  function selectQuestion() {
    const section = document.querySelector('.section__manager');
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    const header = document.createElement('h2');
    header.setAttribute('class', 'heading heading--two');
    header.appendChild(document.createTextNode('Möndla með quiz'));
    section.appendChild(header);
    const prevButton = document.createElement('button');
    prevButton.addEventListener('click', () => {
      previousQuestion();
    });
    prevButton.appendChild(document.createTextNode('Fyrri spurning'));
    section.appendChild(prevButton);
    currQuest = document.createElement('span');
    section.appendChild(currQuest);
    const nextButton = document.createElement('button');
    nextButton.addEventListener('click', () => {
      nextQuestion();
    });
    nextButton.appendChild(document.createTextNode('Næsta spurning'));
    section.appendChild(nextButton);
  }

  // Initializes the quiz manager
  function init(db, q) {
    database = db;
    quiz = q;
    selectQuestion();
    currRef = database.ref(`quizzes/${quiz}/currentQuestion`);
    currRef.on('value', (snapshot) => {
      currentQuestion = snapshot.val();
      while (currQuest.firstChild) {
        currQuest.removeChild(currQuest.firstChild)
      }
      currQuest.appendChild(document.createTextNode(currentQuestion));
    });
    database.ref(`quizzes/${quiz}/questions`).on('value', (snapshot) => {
      numQuestions = snapshot.numChildren();
    });
  }

  return {
    init: init
  }
})();

module.exports = manageQuiz;