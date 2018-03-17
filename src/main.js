/**
 * Initializes the quiz
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * @author Eiður Örn Gunnarsson eog26@hi.is
 * 17. march 2018
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

// Handles what to do when a user is signed in or not.
firebase.auth().onAuthStateChanged(function(user){
  // When signed in.
  if(user){
    var el = document.querySelector('#loggedIn');

    const welcomeUser = document.createElement('p');
    if(user.displayName != null) welcomeUser.appendChild(document.createTextNode("Velkomin(n): "+user.displayName));
    else welcomeUser.appendChild(document.createTextNode("Skráður inn notandi er: "+user.email))
    el.appendChild(welcomeUser);

    const logoutButton = document.createElement('button');
    logoutButton.addEventListener('click', () => {
      logout();
    });
    logoutButton.appendChild(document.createTextNode("Útskráning"));
    el.appendChild(logoutButton);

    console.log(user.displayName+" is signed in.");

    getQuizzes(user.uid);
  }
  // When not signed in.
  else{
    console.log("No user signed in.");
    window.location.replace("forbidden.html");
  }
});

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
    var user = firebase.auth().currentUser;
    newQuiz.init(database, initializeQuiz, user.uid);
  });
  button.appendChild(document.createTextNode('Nýtt quiz'));
  navbar.appendChild(button);
}

// Updates teams and quizzes
function getQuizzes(username){
  // Get a reference to the database service
  const quizzesRef = database.ref(`/hosts/${username}/quizzes`);
  quizzesRef.on('value', (snapshot) => {
    listenToWhichQuiz(snapshot.val());
  });
};

function logout(){
  firebase.auth().signOut().then(function() {
    window.location.replace("./");
  }).catch(function(error) {
    console.log("Sign out failed");
  });
}