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
  let currRef;
  let currStatus;
  let numQuestions;

  // Select status of the quiz
  function setStatus() {
    const section = document.querySelector('.section__manager');
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    const header = document.createElement('h2');
    header.setAttribute('class', 'heading heading--two');
    header.appendChild(document.createTextNode('Möndla með quiz'));
    section.appendChild(header);

    const statusGo = document.createElement('button');
    statusGo.addEventListener('click', () => {
      startQuiz();
    });
    statusGo.appendChild(document.createTextNode('Byrja leik'));
    section.appendChild(statusGo);

    const statusStop = document.createElement('button');
    statusStop.addEventListener('click', () => {
      stopQuiz();
    });
    statusStop.appendChild(document.createTextNode('Gera hlé á leik'));
    section.appendChild(statusStop);

    const statusReview = document.createElement('button');
    statusReview.addEventListener('click', () => {
      reviewQuiz();
    });
    statusReview.appendChild(document.createTextNode('Fara yfir'));
    section.appendChild(statusReview);

    const statusComplete = document.createElement('button');
    statusComplete.addEventListener('click', () => {
      completeQuiz();
    });
    statusComplete.appendChild(document.createTextNode('Ljúka leik'));
    statusComplete.setAttribute('title', 'Birtir notendum stigatöflu');
    section.appendChild(statusComplete);

    const div = document.createElement('div');
    div.setAttribute('class', 'question__div');
    section.appendChild(div);
  }

  function startQuiz() {
    currStatus.set('in progress');
    clearButtons();
    selectQuestion();
  }

  function stopQuiz() {
    currStatus.set('not started');
    if(currentQuestion != undefined) 
      document.querySelector('.quiz').childNodes[currentQuestion-1].setAttribute('class', '');
    clearButtons();
  }

  function reviewQuiz() {
    setReviewers();
    currStatus.set('review');
    clearButtons();
    currRef.set(1);
    selectQuestion();
  }

  function completeQuiz() {
    currStatus.set('finished');
    clearButtons();
  }

  // Clear question control buttons
  function clearButtons() {
    const div = document.querySelector('.question__div');
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
  }

  function setReviewers() {
    database.ref(`quizzes/${quiz}/teams`).once('value', (snapshot) => {
      const teams = Object.keys(snapshot.val());
      const reviewers = {};
      for (let i = 0; i < teams.length; i++) {
        reviewers[teams[i]] = teams[(i+1)%teams.length];
      }
      database.ref(`reviewers/${quiz}`).set(reviewers);
    });
  }

  // Change current question to next question
  function nextQuestion() {
    if (numQuestions >= currentQuestion + 1) {
      currRef.set(currentQuestion + 1);
      const ul = document.querySelector('.quiz');
      if(currentQuestion > 1) ul.childNodes[currentQuestion-2].setAttribute('class', '');
      ul.childNodes[currentQuestion-1].setAttribute('class', 'active');
    }
  }

  // Change current question to previous question
  function previousQuestion() {
    if (currentQuestion - 1 >= 1) {
      currRef.set(currentQuestion - 1);
      const ul = document.querySelector('.quiz');
      if(currentQuestion <= numQuestions) ul.childNodes[currentQuestion].setAttribute('class', '');
      ul.childNodes[currentQuestion-1].setAttribute('class', 'active');
    }
  }
  
  // Selects which question is current
  function selectQuestion() {
    const div = document.querySelector('.question__div');
    const prevButton = document.createElement('button');
    
    prevButton.addEventListener('click', () => {
      previousQuestion();
    });
    prevButton.appendChild(document.createTextNode('Fyrri spurning'));
    div.appendChild(prevButton);
    const currQuest = document.createElement('span');
    div.appendChild(currQuest);
    currRef.on('value', (snapshot) => {
      currentQuestion = snapshot.val();
      while (currQuest.firstChild) {
        currQuest.removeChild(currQuest.firstChild)
      }
      currQuest.appendChild(document.createTextNode(currentQuestion));
      document.querySelector('.quiz').childNodes[currentQuestion-1].setAttribute('class', 'active');
    });
    const nextButton = document.createElement('button');
    nextButton.addEventListener('click', () => {
      nextQuestion();
    });
    nextButton.appendChild(document.createTextNode('Næsta spurning'));
    div.appendChild(nextButton);
  }

  // Initializes the quiz manager
  function init(db, q) {
    database = db;
    quiz = q;
    setStatus();
    currRef = database.ref(`quizzes/${quiz}/currentQuestion`);
    database.ref(`quizzes/${quiz}/questions`).on('value', (snapshot) => {
      numQuestions = snapshot.numChildren();
    });
    currStatus = database.ref(`quizzes/${quiz}/status`);
  }

  return {
    init: init
  }
})();

module.exports = manageQuiz;
