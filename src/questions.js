/**
 * Shows the questions in the quiz
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * 14. march 2018
 */
const questions = (function () {
  
  let database;
  let quiz;

  // Create list of questions
  function updateQuestionList(questions) {
    const section = document.querySelector('.section__quiz');
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    const header = document.createElement('h2');
    const ul = document.createElement('ul');
    header.setAttribute('class', 'heading--two');
    header.appendChild(document.createTextNode('Spurningar'));
    section.appendChild(header);
    ul.setAttribute('id', 'quiz');
    section.appendChild(ul);
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    Object.keys(questions).sort((a, b) => {
      if (questions[a] < questions[b]) {
        return -1;
      } else if (questions[a] > questions[b]) {
        return 1;
      }
      return 0;
    }).forEach((questionName) => {
      const questionRef = database.ref(`questions/${questionName}/question`);
      questionRef.on('value', (snapshot) => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(snapshot.val()));
        ul.appendChild(li);
      });
    });
  }
  function addQuestion() {
    
  }

  // Initializes questions
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