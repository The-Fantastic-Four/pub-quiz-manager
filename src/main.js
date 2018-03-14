/**
 * Initializes the quiz
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * 14. march 2018
 */
const firebase = require('firebase');
const questions = require('./questions');
const manageQuiz = require('./manageQuiz');
const quizOverview = require('./quizOverview');
const newQuiz = require('./newQuiz');
const username = 'admin';

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyALJ6cVCitjh9VbVbBd2QBSE2HVn0vZz5o',
  authDomain: 'pub-quiz-f19f3.firebaseapp.com',
  databaseURL: 'https://pub-quiz-f19f3.firebaseio.com',
  storageBucket: 'pub-quiz-f19f3.appspot.com',
};
firebase.initializeApp(config);
const database = firebase.database();

// Fires up quizzes
function initializeQuiz(quizName) {
  questions.init(database, quizName);
  quizOverview.init(database, quizName);
  manageQuiz.init(database, quizName);
}

// Make buttons to select quiz
function listenToWhichQuiz(quizzes) {
  const navbar = document.querySelector('.navbar');
  while (navbar.firstChild) {
    navbar.removeChild(navbar.firstChild);
  }
  Object.keys(quizzes).forEach((quizName) => {
    const button = document.createElement('button');
    button.addEventListener('click', () => {
      initializeQuiz(quizName);
    });
    button.appendChild(document.createTextNode(quizName));
    navbar.appendChild(button);
  });
  const button = document.createElement('button');
  button.addEventListener('click', () => {
    newQuiz.init(database, initializeQuiz, username);
  });
  button.appendChild(document.createTextNode('Nýtt quiz'));
  navbar.appendChild(button);
}

// Updates teams and quizzes
document.addEventListener('DOMContentLoaded', () => {
  // Get a reference to the database service
  const quizzesRef = database.ref(`/hosts/${username}/quizzes`);
  quizzesRef.on('value', (snapshot) => {
    listenToWhichQuiz(snapshot.val());
  });
});
