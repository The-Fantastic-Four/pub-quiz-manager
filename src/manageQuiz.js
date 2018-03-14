
const manageQuiz = (function() {

  let database;
  let quiz;
  let currentQuestion;
  let currQuest;
  let currRef;

  // Change current question
  function nextQuestion() {
    currRef.set(currentQuestion + 1);
  }

  function previousQuestion() {
    currRef.set(currentQuestion - 1);
  }
  
  function selectQuestion() {
    const section = document.querySelector('.section__manager');
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    const header = document.createElement('h2');
    header.setAttribute('class', 'heading--two');
    header.appendChild(document.createTextNode('Manage quiz'));
    section.appendChild(header);
    //while (section.firstChild) {
    //  section.removeChild(section.firstChild)
    //}
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
  }

  return {
    init: init
  }
})();

module.exports = manageQuiz;