/**
 * Shows the questions in the quiz
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * @author Eiður Örn Gunnarsson eog26@hi.is
 * 2. April 2018
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
        li.appendChild(document.createTextNode(snapshot.val()+" "));

        const deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', () => {
          deleteQuestionFromQuiz(questionName);
        });
        deleteButton.appendChild(document.createTextNode("Eyða"));
        li.appendChild(deleteButton);

        ul.appendChild(li);
      });
    });
    addQuestionGUI();
  }

  // Creates the GUI elements for creating a new question
  //
  // return the GUI elements for creating a new question
  function addQuestionGUI() {
    const section = document.querySelector('.section__quiz');

    const header = document.createElement('p');
    header.appendChild(document.createTextNode("Búa til nýja spurningu: "));
    section.appendChild(header);

    const questionNameInput = document.createElement('input');
    questionNameInput.id = 'input__question';
    section.appendChild(questionNameInput);

    const cbLabel = document.createElement('label');
    cbLabel.setAttribute('for', 'input__privacy'); 
    cbLabel.appendChild(document.createTextNode("Sýnilegt fyrir aðra: "));
    section.appendChild(cbLabel);

    const cb = document.createElement('input');
    cb.id = 'input__privacy';
    cb.type = 'checkbox';
    section.appendChild(cb);

    const addQuestionButton = document.createElement('button');
    addQuestionButton.addEventListener('click', () => {
      addQuestion();
    });

    const typeLabel = document.createElement('label');
    typeLabel.setAttribute('for', 'input__questionType'); 
    typeLabel.appendChild(document.createTextNode("Tegund spurningar: "));
    section.appendChild(typeLabel);

    database.ref('/questionTypes').once('value').then(
      function(snapshot) {
        // Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "input__questionType";
        section.appendChild(selectList);

        // Create and append the options to the select list
        for (var type in snapshot.val()) {
            var option = document.createElement("option");
            option.value = type;
            option.text = type;
            if(type == "text") option.selected = true;
            selectList.appendChild(option);
        }

        addQuestionButton.appendChild(document.createTextNode("Bæta við spurningu"));
        section.appendChild(addQuestionButton);
      }
    );  
  }

  // Adds the question to the quiz and question list
  function addQuestion() {
    // Generate unique ID
    var newPostKey = database.ref().child('questions/').push().key;

    // Create the question data
    var questionData = {
      isPrivate : !document.getElementById("input__privacy").checked,
      question : sanitize(document.getElementById("input__question").value),
      type : document.getElementById("input__questionType").value
    };

    // Insert the data into the database on succesful promise
    database.ref('/quizzes/'+quiz+'/questions/').once('value').then(
      function(snapshot) {
        var updates = {};
        // If the question to be added is a "blank" question (empty question or chosen
        // "blank" in the type of the question). Only need to add the pre-existing blank
        // question and add an appropriate number to the question (to indicate order).
        if(questionData.type === "blank" || questionData.question === ""){
          updates['/quizzes/'+quiz+'/questions/-L8w3iKD9lo_KonT8e2F'] = snapshot.numChildren()+1;
        }
        // Create the question and add it to the quiz with appropriate order number.
        else{
          updates['/questions/'+newPostKey] = questionData;
          updates['/quizzes/'+quiz+'/questions/'+newPostKey] = snapshot.numChildren()+1;
        }
        
        database.ref().update(updates);
      }
    );   
  }

  // Deletes a question from quiz
  //
  // questionId is the id of the question that is to be removed.
  // return The removal of questionId from question list.
  function deleteQuestionFromQuiz(questionId){
    database.ref('/quizzes/'+quiz+'/questions/').once('value').then(
      function(snapshot) {
        var questionsByOrder = [];
        var deletedQuestionNumber = snapshot.val()[questionId];

        // Generate a list of all questions below the deleted question in the quiz.
        for(var key in snapshot.val()){
          if(key != questionId){
            if(snapshot.val()[key] > deletedQuestionNumber)
              questionsByOrder.push([key, (snapshot.val()[key])]);
          }
        }
        
        if(questionsByOrder.length > 0){
          // Order the array by value (number of the question within the quiz).
          questionsByOrder.sort(function(a,b){
            return a[1] - b[1];
          });

          // Decrement the question number of the questions within the quiz 
          // that are below the deleted question to fix the order after
          // removal of a question.
          questionsByOrder = questionsByOrder.map(function(val){
            val[1]--;
            return val;
          });

          // Create all of the update commands with updated values so it can all happen
          // in order (it's atomic).
          var updates = {};
          for(var i = 0; i < questionsByOrder.length; i++){
            updates['/quizzes/'+quiz+'/questions/'+questionsByOrder[i][0]] = questionsByOrder[i][1];
          }

          // The updates are ran (atomic operation).
          database.ref().update(updates);
        }

        // The removal of the question from the quiz.
        database.ref('/quizzes/'+quiz+'/questions/'+questionId).remove();
      }
    );   
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

  // Simple sanitizer
  //
  // s is the string to be sanitized.
  // return the string s sanitized.
  function sanitize(s) {
    return s.replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  return {
    init: init
  }
})();

module.exports = questions;