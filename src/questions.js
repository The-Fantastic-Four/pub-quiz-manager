/**
 * Shows the questions in the quiz
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * @author Eiður Örn Gunnarsson eog26@hi.is
 * 4. April 2018
 */
const questions = (function () {
  const firebase = require('firebase');

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
    header.setAttribute('class', 'heading heading--two');
    header.appendChild(document.createTextNode('Spurningar'));
    section.appendChild(header);
    ul.setAttribute('class', 'quiz');
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
      const questionRef = database.ref(`questions/${questionName}`);
      questionRef.on('value', (snapshot) => {
        const question = snapshot.val();

        const li = document.createElement('li');

        if (question['type'] === 'blank') {
          li.appendChild(document.createTextNode('Spyrill les spurningu upp '));
        } else if (question['type'] === 'text') {
          li.appendChild(document.createTextNode(question['question']+' '));
        }

        const deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', () => {
          deleteQuestionFromQuiz(questionName);
        });
        deleteButton.appendChild(document.createTextNode('Eyða'));
        li.appendChild(deleteButton);

        ul.appendChild(li);
      });
    });
  }

  // Creates the GUI elements for creating a new question
  // return the GUI elements for creating a new question
  function addQuestionGUI() {
    const section = document.querySelector('.section__quiz');
    const div = document.createElement('div');
    div.setAttribute('class', 'questions__add');
    section.appendChild(div);
    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'input__question');
    nameLabel.appendChild(document.createTextNode('Búa til nýja spurningu: '));
    div.appendChild(nameLabel);

    const questionNameInput = document.createElement('input');
    questionNameInput.id = 'input__question';
    div.appendChild(questionNameInput);

    const cbLabel = document.createElement('label');
    cbLabel.setAttribute('for', 'input__privacy'); 
    cbLabel.appendChild(document.createTextNode('Sýnilegt fyrir aðra: '));
    div.appendChild(cbLabel);

    const cb = document.createElement('input');
    cb.id = 'input__privacy';
    cb.type = 'checkbox';
    div.appendChild(cb);

    const addQuestionButton = document.createElement('button');
    addQuestionButton.addEventListener('click', () => {
      addQuestion();
    });

    const typeLabel = document.createElement('label');
    typeLabel.setAttribute('for', 'input__questionType'); 
    typeLabel.appendChild(document.createTextNode('Tegund spurningar: '));
    div.appendChild(typeLabel);

    // Create and append select list
    const selectList = document.createElement('select');
    selectList.id = 'input__questionType';
    div.appendChild(selectList);

    database.ref('/questionTypes').once('value').then(
      function(snapshot) {
        // Create and append the options to the select list
        for (let type in snapshot.val()) {
          const option = document.createElement('option');
          option.value = type;
          option.text = type;
          if(type === 'text') option.selected = true;
          selectList.appendChild(option);
        }
      }
    );

    addQuestionButton.appendChild(document.createTextNode('Bæta við spurningu'));
    div.appendChild(addQuestionButton);
  }

  // Adds the question to the quiz and question list
  function addQuestion() {
    // Generate unique ID
    const newPostKey = database.ref().child('questions/').push().key;

    // Create the question data
    const questionData = {
      isPrivate : !document.getElementById('input__privacy').checked,
      question : sanitize(document.getElementById('input__question').value),
      author : firebase.auth().currentUser.uid,
      type : document.getElementById('input__questionType').value
    };

    // Insert the data into the database on succesful promise
    database.ref(`/quizzes/${quiz}/questions/`).once('value').then(
      function(snapshot) {
        const updates = {};
        // Create the question and add it to the quiz with appropriate order number.
        updates[`/questions/${newPostKey}`] = questionData;
        updates[`/quizzes/${quiz}/questions/${newPostKey}`] = snapshot.numChildren()+1;

        database.ref().update(updates);
      }
    );   
  }

  // Creates the GUI elements for adding a predefined question
  // return the GUI elements for adding a predefined question
  function addPredefinedQuestionGUI(){
    const section = document.querySelector('.section__quiz');
    const div = document.createElement('div');
    div.setAttribute('class', 'questions__predefined');
    section.appendChild(div);
    const preDefinedquestionLabel = document.createElement('label');
    preDefinedquestionLabel.setAttribute('for', 'input__predefinedQuestion'); 
    preDefinedquestionLabel.appendChild(document.createTextNode('Bæta við spurningu úr gagnabanka: '));
    div.appendChild(preDefinedquestionLabel);

    // Create and append select list
    const selectList = document.createElement('select');
    selectList.id = 'input__predefinedQuestion';
    div.appendChild(selectList);

    database.ref('/questions/').once('value').then(
      function(snapshot) {
        // Create and append the options
        for (let key in snapshot.val()) {
          if(!snapshot.val()[key].isPrivate || (snapshot.val()[key].author == firebase.auth().currentUser.uid && 
              snapshot.val()[key].question != "")){
            const option = document.createElement('option');
            option.value = key;
            option.text = snapshot.val()[key].question;
            selectList.appendChild(option);
          }
        }
      }
    );

    const addPreDefinedQuestionButton = document.createElement('button');
    addPreDefinedQuestionButton.addEventListener('click', () => {
      addPredefinedQuestion();
    });
    addPreDefinedQuestionButton.appendChild(document.createTextNode('Bæta við spurningu'));
    div.appendChild(addPreDefinedQuestionButton);
  }

  // Adds the predefined question to the quiz
  //
  // return The addition of the predefined question to the quiz question list.
  function addPredefinedQuestion() {
    // Insert the data into the database on succesful promise
    database.ref(`/quizzes/${quiz}/questions/`).once('value').then(
      function(snapshot) {
        const updates = {};
        if(!snapshot.hasChild(document.getElementById('input__predefinedQuestion').value)){
          updates[`/quizzes/${quiz}/questions/${document.getElementById('input__predefinedQuestion').value}`] = snapshot.numChildren()+1;
          database.ref().update(updates);
        } else {
          alert('Spurning er nú þegar í þessu quizzi.')
        }
      }
    );
  }

  // Deletes a question from quiz
  // questionId is the id of the question that is to be removed.
  // return The removal of questionId from question list.
  function deleteQuestionFromQuiz(questionId){
    database.ref(`/quizzes/${quiz}/questions/`).once('value').then(
      function(snapshot) {
        let questionsByOrder = [];
        const deletedQuestionNumber = snapshot.val()[questionId];

        // Generate a list of all questions below the deleted question in the quiz.
        for(let key in snapshot.val()) {
          if(key != questionId) {
            if(snapshot.val()[key] > deletedQuestionNumber) {
              questionsByOrder.push([key, (snapshot.val()[key])]);
            }
          }
        }
        
        if(questionsByOrder.length > 0) {
          // Order the array by value (number of the question within the quiz).
          questionsByOrder.sort(function(a,b) {
            return a[1] - b[1];
          });

          // Decrement the question number of the questions within the quiz 
          // that are below the deleted question to fix the order after
          // removal of a question.
          questionsByOrder = questionsByOrder.map(function(val) {
            val[1]--;
            return val;
          });

          // Create all of the update commands with updated values so it can all happen
          // in order (it's atomic).
          let updates = {};
          for(let i = 0; i < questionsByOrder.length; i++) {
            updates[`/quizzes/${quiz}/questions/${questionsByOrder[i][0]}`] = questionsByOrder[i][1];
          }

          // The updates are ran (atomic operation).
          database.ref().update(updates);
        }

        // The removal of the question from the quiz.
        database.ref(`/quizzes/${quiz}/questions/${questionId}`).remove();
      }
    );   
  }

  // Initializes questions
  function init(db, q) {
    database = db;
    quiz = q;

    // Remove all questions (if there are any)
    updateQuestionList([]);

    const quizRef = database.ref(`quizzes/${quiz}/questions`);
    quizRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        updateQuestionList(snapshot.val());
      } else {
        console.error('No questions defined for quiz.');
      }
      addQuestionGUI();
      addPredefinedQuestionGUI();
    });
  }

  // Simple sanitizer
  //
  // s is the string to be sanitized.
  // return the string s sanitized.
  function sanitize(s) {
    const filterElement = document.createElement('div');
    filterElement.appendChild(document.createTextNode(s));
    return filterElement.innerHTML;
  }

  return {
    init: init
  }
})();

module.exports = questions;
