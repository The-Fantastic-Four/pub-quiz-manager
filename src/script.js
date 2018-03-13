/* eslint no-undef: "off" */

const quiz = 'quiz1';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyALJ6cVCitjh9VbVbBd2QBSE2HVn0vZz5o',
  authDomain: 'pub-quiz-f19f3.firebaseapp.com',
  databaseURL: 'https://pub-quiz-f19f3.firebaseio.com',
  storageBucket: 'pub-quiz-f19f3.appspot.com',
};
firebase.initializeApp(config);

// Get a reference to the database service
const database = firebase.database();

// Change current question
function changeQuestion(questionNumber) {
  firebase.database()
    .ref(`quizzes/${quiz}/currentQuestion`)
    .set(questionNumber);
}

// Updates list of teams
function updateTeams(teams) {
  const ul = document.getElementById('teams');
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
  Object.keys(teams).forEach((team) => {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(team));
    ul.appendChild(li);
  });
}

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
      const button = document.createElement('button');
      button.addEventListener('click', () => {
        changeQuestion(questions[questionName]);
      });
      button.setAttribute('name', questionName);
      button.appendChild(document.createTextNode('Velja spurningu'));
      li.appendChild(button);
      li.appendChild(document.createTextNode(snapshot.val()));
      ul.appendChild(li);
    });
  });
}

// Updates teams and quizzes
document.addEventListener('DOMContentLoaded', () => {
  const quizRef = database.ref(`quizzes/${quiz}`);
  quizRef.on('value', (snapshot) => {
    updateTeams(snapshot.val().teams);
    updateQuestionList(snapshot.val().questions);
  });
});

