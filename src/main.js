/**
 * Initializes the quiz
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * @author Eiður Örn Gunnarsson eog26@hi.is
 * 4. April 2018
 */
const firebase = require('firebase');
const questions = require('./questions');
const manageQuiz = require('./manageQuiz');
const quizOverview = require('./quizOverview');
const newQuiz = require('./newQuiz');

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyALJ6cVCitjh9VbVbBd2QBSE2HVn0vZz5o',
  authDomain: 'pub-quiz-f19f3.firebaseapp.com',
  databaseURL: 'https://pub-quiz-f19f3.firebaseio.com',
  storageBucket: 'pub-quiz-f19f3.appspot.com',
};
firebase.initializeApp(config);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
  // Handles what to do when a user is signed in or not.
  firebase.auth().onAuthStateChanged(function(user) {
    // When signed in.
    if(user) {
      const el = document.querySelector('.logged--in');

      const welcomeUser = document.createElement('span');
      if(user.displayName != null) {
        welcomeUser.appendChild(document.createTextNode(`Innskráður notandi: ${user.displayName}`));
      } else {
        welcomeUser.appendChild(document.createTextNode(`Innskráður notandi: ${user.email}`));
      }
      el.appendChild(welcomeUser);

      const logoutButton = document.createElement('button');
      logoutButton.addEventListener('click', () => {
        logout();
      });
      logoutButton.appendChild(document.createTextNode('Útskráning'));
      el.appendChild(logoutButton);

      getQuizzes(user.uid);
    } else {
      console.error('No user signed in.');
      window.location.replace('./');
    }
  });
});

// Fires up quizzes
function initializeQuiz(quizName) {
  questions.init(database, quizName);
  quizOverview.init(database, quizName);
  manageQuiz.init(database, quizName);
  updateDelete(quizName);
}

// Make buttons to select quiz
function listenToWhichQuiz(quizzes) {
  const navbar = document.querySelector('.navbar');
  while (navbar.firstChild) {
    navbar.removeChild(navbar.firstChild);
  }
  if(quizzes != null){
    Object.keys(quizzes).forEach((quizName) => {
      const button = document.createElement('button');
      button.addEventListener('click', () => {
        initializeQuiz(quizName);
      });
      button.appendChild(document.createTextNode(quizName));
      navbar.appendChild(button);
    });
  }
  
  const button = document.createElement('button');
  button.addEventListener('click', () => {
    const user = firebase.auth().currentUser;
    newQuiz.init(database, initializeQuiz, user.uid);
  });
  button.appendChild(document.createTextNode('Nýtt quiz'));
  navbar.appendChild(button);

  const deleteQuiz = document.createElement('button');
  deleteQuiz.setAttribute('id', 'button__deleteQuiz');
  deleteQuiz.style.display = "none";
  deleteQuiz.appendChild(document.createTextNode('Eyða quiz'));
  navbar.appendChild(deleteQuiz);
}

// Updates teams and quizzes
function getQuizzes(username) {
  // Get a reference to the database service
  const quizzesRef = database.ref(`/hosts/${username}/quizzes`);
  quizzesRef.on('value', (snapshot) => {
    listenToWhichQuiz(snapshot.val());
  });
}

function logout() {
  firebase.auth().signOut().then(function() {
    window.location.replace('./');
  }).catch(function() {
    console.error('Sign out failed');
  });
}

// Updates the delete button so that it deletes the correct question on click
// quizname is the name of the quiz to be deleted
// return replacement of previous delete button with new delete parameters
function updateDelete(quizName){
  const oldButton = document.getElementById("button__deleteQuiz");
  const replaceButton = oldButton.cloneNode(true);
  const user = firebase.auth().currentUser;
  replaceButton.style = "inline-block";
  replaceButton.addEventListener('click', () => {
    // Update is used instead of .remove() to make this into an atomic operation.
    let updates = {};
    updates[`/quizzes/${quizName}`] = null;
    updates[`/hosts/${user.uid}/quizzes/${quizName}`] = null;
    database.ref().update(updates);

    // Checks whether there are any quizzes left for given user.
    database.ref(`/hosts/${user.uid}/quizzes/`).once('value').then(
      function(snapshot) {
        // If there is a quiz, select the first quiz.
        if(snapshot.val() != null){
          initializeQuiz(Object.keys(snapshot.val())[0]);
        }
        // If there is no quiz, clear the screen of all quiz management items.
        else{
          clearSections();
        }
      }
    );
  });
  oldButton.parentNode.replaceChild(replaceButton, oldButton);
}

// Clears every section except for newQuiz
// return screen has been cleared of all section elements besides newQuiz
function clearSections(){
  let section = document.querySelector(".section__quiz");
  while (section.firstChild) {
    section.removeChild(section.firstChild);
  }
  section = document.querySelector(".section__manager");
  while (section.firstChild) {
    section.removeChild(section.firstChild);
  }
  section = document.querySelector(".section__teams");
  while (section.firstChild) {
    section.removeChild(section.firstChild);
  }
}
