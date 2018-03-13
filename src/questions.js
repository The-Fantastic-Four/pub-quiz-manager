
const questions = (function () {
  
  let database;
  let quiz;

  // Create list of questions
  function updateQuestionList(questions) {
    const ul = document.getElementById('quiz');
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    Object.keys(questions).forEach((questionName) => {
      const questionRef = database.ref(`questions/${questionName}/question`);
      questionRef.on('value', (snapshot) => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(snapshot.val()));
        ul.appendChild(li);
      });
    });
  }

  function init(db, q) {
    database = db;
    quiz = q;
    const quizRef = database.ref(`quizzes/${quiz}/questions`);
    quizRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        updateQuestionList(snapshot.val());
      } else {
        console.error('No questions defined for quiz.');
      }
    });
  }

  return {
    init: init
  }
})();

module.exports = questions;