'use strict';

/* eslint no-undef: "off" */

var quiz = 'quiz1';

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyALJ6cVCitjh9VbVbBd2QBSE2HVn0vZz5o',
  authDomain: 'pub-quiz-f19f3.firebaseapp.com',
  databaseURL: 'https://pub-quiz-f19f3.firebaseio.com',
  storageBucket: 'pub-quiz-f19f3.appspot.com'
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

// Change current question
function changeQuestion(questionNumber) {
  firebase.database().ref('quizzes/' + quiz + '/currentQuestion').set(questionNumber);
}

// Updates list of teams
function updateTeams(teams) {
  var ul = document.getElementById('teams');
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
  Object.keys(teams).forEach(function (team) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(team));
    ul.appendChild(li);
  });
}

// Create list of questions
function updateQuestionList(questions) {
  var ul = document.getElementById('quiz');
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
  Object.keys(questions).forEach(function (questionName) {
    var questionRef = database.ref('questions/' + questionName + '/question');
    questionRef.on('value', function (snapshot) {
      var li = document.createElement('li');
      var button = document.createElement('button');
      button.addEventListener('click', function () {
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
document.addEventListener('DOMContentLoaded', function () {
  var quizRef = database.ref('quizzes/' + quiz);
  quizRef.on('value', function (snapshot) {
    updateTeams(snapshot.val().teams);
    updateQuestionList(snapshot.val().questions);
  });
});
//# sourceMappingURL=script.js.map