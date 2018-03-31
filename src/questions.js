/**
 * Shows the questions in the quiz
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * @author Eiður Örn Gunnarsson eog26@hi.is
 * 31. march 2018
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
    addQuestionGUI();
  }

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

        // Create and append the options
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
        updates['/questions/' + newPostKey] = questionData;
        updates['/quizzes/'+quiz+'/questions/'+newPostKey] = snapshot.numChildren()+1;
        database.ref().update(updates);
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

  //Simple sanitizer
  function sanitize(s) {
    return s.replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  return {
    init: init
  }
})();

module.exports = questions;