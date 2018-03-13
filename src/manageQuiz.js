
const manageQuiz = (function() {

  let database;
  let quiz;
  let currentQuestion;
  let currQuest;
  let currRef;

  // Change current question
  function nextQuestion() {
    //console.log("BEGIN " + currentQuestion + ' +1 ');
    currRef.set(currentQuestion + 1);
    //console.log("END " + currentQuestion + ' +1 ');
  }

  function previousQuestion() {
    //console.log("BEGIN " + currentQuestion + ' -1 ');
    currRef.set(currentQuestion - 1);
    //console.log("END " + currentQuestion + ' -1 ');
  }
  
  function selectQuestion() {
    const div = document.querySelector('.manager');
    while (div.firstChild) {
      div.removeChild(div.firstChild)
    }
    const prevButton = document.createElement('button');
    prevButton.addEventListener('click', () => {
      console.log('NO REALLY IT IS');
      database.ref(`quizzes/${quiz}/currentQuestion`).set(9);
    });
    prevButton.appendChild(document.createTextNode('Fyrri spurning'));
    div.appendChild(prevButton);
    currQuest = document.createElement('span');
    div.appendChild(currQuest);
    const nextButton = document.createElement('button');
    nextButton.addEventListener('click', () => {
      console.log('THIS IS HAPPENING');
      database.ref(`quizzes/${quiz}/currentQuestion`).set(4);
    });
    nextButton.appendChild(document.createTextNode('Næsta spurning'));
    div.appendChild(nextButton);
  }

  function init(db, q) {
    database = db;
    quiz = q;
    selectQuestion();
    currRef = database.ref(`quizzes/${quiz}/currentQuestion`);
    currRef.on('value', (snapshot) => {
      console.log("NEW VAL BEGIN " + snapshot.val());
      currentQuestion = snapshot.val();
      console.log("NEW VAL END " + snapshot.val());
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