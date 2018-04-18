/**
 * Shows the questions in the quiz
 *
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * @author Eiður Örn Gunnarsson eog26@hi.is
 * 4. April 2018
 */
const questions = (function () {
  const firebase = require('firebase');
  const cloudinary = require('cloudinary');

  let database;
  let quiz;
  let questionsAdd;
  let questionsPredefined;

  // Create list of questions
  function updateQuestionList(questions) {
    const section = document.querySelector('.section__quiz');
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    const header = document.createElement('h2');
    const ul = document.createElement('ol');
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
        } else if (question['type'] === 'text' || question['type'] === 'picture') {
          const questionText = document.createElement('span');
          questionText.appendChild(document.createTextNode(question['question']+' '));
          li.appendChild(questionText);

          const editButton = document.createElement('button');
          editButton.addEventListener('click', () => {
            // Enable editing of element containing question.
            if (!questionText.isContentEditable){
              questionText.contentEditable = 'true';
              editButton.innerHTML = 'Vista';
            } else {
              const result = `${questionText.innerHTML}`.replace(/&nbsp;/g,'').trim();
              if(result != null){
                const content = sanitize(result);
                editButton.innerHTML = 'Breyta';
                if(question['isPrivate']){
                  modifyPrivateQuestion(questionName, content);
                  // Clears the list of the old element and re-displays it with the
                  // questions in correct order.
                  database.ref(`/quizzes/${quiz}/questions/`).once('value').then(
                    function(snapshot) {
                      updateQuestionList(snapshot.val());
                      addTextQuestionGUI();
                      addPredefinedQuestionGUI();
                    }
                  );  
                } else {
                  modifyANonePrivateQuestion(questionName, content, question['type']);
                }
              } else {
                alert('Vinsamlegast settu inn viðeigandi texta, upphaflega spurning var: "'+question['question']+'"');
              }
            }
          });
          editButton.appendChild(document.createTextNode('Breyta'));
          li.appendChild(editButton);
        }

        const deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', () => {
          deleteQuestionFromQuiz(questionName);
        });
        deleteButton.appendChild(document.createTextNode('Eyða'));
        li.appendChild(deleteButton);

        const ans = document.createElement('p');
        if (question['answer'] != null) {
          const t = document.createTextNode(' Svar: '+ question['answer']);
          ans.appendChild(t);
          var br = document.createElement("br");
          li.appendChild(br);
          li.appendChild(ans);
        }
        ul.appendChild(li);
      });
    });

    questionsAdd = document.createElement('div');
    questionsAdd.setAttribute('class', 'questions__add');
    section.appendChild(questionsAdd);

    questionsPredefined = document.createElement('div');
    questionsPredefined.setAttribute('class', 'questions__predefined');
    section.appendChild(questionsPredefined);
  }

  function addQuestionButton() {
    while(questionsAdd.firstChild) {
      questionsAdd.removeChild(questionsAdd.firstChild);
    }
    const questionsAddButton = document.createElement('button');
    questionsAddButton.appendChild(document.createTextNode('Ný textaspurning'));
    questionsAddButton.addEventListener('click', addTextQuestionGUI);
    questionsAdd.appendChild(questionsAddButton);

    const questionsPicButton = document.createElement('button');
    questionsPicButton.appendChild(document.createTextNode('Ný myndaspurning'));
    questionsPicButton.addEventListener('click', addPicQuestionGUI);
    questionsAdd.appendChild(questionsPicButton);

    const questionsBlankButton = document.createElement('button');
    questionsBlankButton.appendChild(document.createTextNode('Ný tóm spurning'));
    questionsBlankButton.addEventListener('click', addBlankQuestion);
    questionsAdd.appendChild(questionsBlankButton);
  }

  // Creates the GUI elements for creating a new question
  // return the GUI elements for creating a new question
  function addTextQuestionGUI() {
    while(questionsAdd.firstChild) {
      questionsAdd.removeChild(questionsAdd.firstChild);
    }
    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'input__question');
    nameLabel.appendChild(document.createTextNode('Búa til nýja spurningu: '));
    questionsAdd.appendChild(nameLabel);

    const questionNameInput = document.createElement('input');
    questionNameInput.id = 'input__question';
    questionsAdd.appendChild(questionNameInput);

    const answerLabel = document.createElement('label');
    const br = document.createElement('br');
    answerLabel.setAttribute('for', 'input_answer');
    answerLabel.appendChild(document.createTextNode('Svar við spurningu: '));
    questionsAdd.appendChild(br);
    questionsAdd.appendChild(answerLabel);

    const questionAnswerInput = document.createElement('input');
    questionAnswerInput.id = 'input__answer';
    questionsAdd.appendChild(questionAnswerInput);

    const cbLabel = document.createElement('label');
    const bre = document.createElement('br');
    cbLabel.setAttribute('for', 'input__privacy');
    cbLabel.appendChild(document.createTextNode('Sýnilegt fyrir aðra: '));
    questionsAdd.appendChild(bre);
    questionsAdd.appendChild(cbLabel);

    const cb = document.createElement('input');
    cb.id = 'input__privacy';
    cb.type = 'checkbox';
    questionsAdd.appendChild(cb);

    const addQuestionButton = document.createElement('button');
    addQuestionButton.addEventListener('click', () => {
      addTextQuestion();
    });

    addQuestionButton.appendChild(document.createTextNode('Bæta við spurningu'));
    questionsAdd.appendChild(addQuestionButton);
  }

  function addPicQuestionGUI() {
    cloudinary.openUploadWidget({
      cloud_name: 'somethingcool',
      upload_preset: 'carqytm4',
      cropping: 'server',
      folder: 'user_photos'
    }, function(error, result) {
      if (result.length === 1) {
        const res = result[0];
        addQuestion(
          res.url,
          null,
          'picture',
          null
        );
      }
    });
  }

  function addBlankQuestion() {
    addQuestion(
      null,
      null,
      'blank',
      null
    );
  }

  // Adds the question to the quiz and question list
  function addTextQuestion() {
    addQuestion(
      sanitize(document.getElementById('input__question').value),
      document.getElementById('input__answer').value,
      'text',
      !document.getElementById('input__privacy').checked
    );
  }

  function addQuestion(question, answer, type, isPrivate) {
    // Generate unique ID
    const newPostKey = database.ref().child('questions/').push().key;

    // Create the question data
    const questionData = {
      isPrivate: isPrivate,
      question: question,
      answer: answer,
      author: firebase.auth().currentUser.uid,
      type: type,
    };

    // Insert the data into the database on succesful promise
    database.ref(`/quizzes/${quiz}/questions/`).once('value').then(
      function (snapshot) {
        const updates = {};
        // Create the question and add it to the quiz with appropriate order number.
        updates[`/questions/${newPostKey}`] = questionData;
        updates[`/quizzes/${quiz}/questions/${newPostKey}`] = snapshot.numChildren() + 1;

        database.ref().update(updates);
        addQuestionButton();
      }
    );
  }

  function addPredefinedQuestionButton() {
    while(questionsPredefined.firstChild) {
      questionsPredefined.removeChild(questionsPredefined.firstChild);
    }
    const questionsPredefinedButton = document.createElement('button');
    questionsPredefinedButton.appendChild(document.createTextNode('Spurning úr gagnabanka'));
    questionsPredefinedButton.addEventListener('click', addPredefinedQuestionGUI);
    questionsPredefined.appendChild(questionsPredefinedButton);
  }

  // Creates the GUI elements for adding a predefined question
  // return the GUI elements for adding a predefined question
  function addPredefinedQuestionGUI(){
    while(questionsPredefined.firstChild) {
      questionsPredefined.removeChild(questionsPredefined.firstChild);
    }
    const preDefinedquestionLabel = document.createElement('label');
    preDefinedquestionLabel.setAttribute('for', 'input__predefinedQuestion');
    preDefinedquestionLabel.appendChild(document.createTextNode('Bæta við spurningu úr gagnabanka: '));
    questionsPredefined.appendChild(preDefinedquestionLabel);

    // Create and append select list
    const selectList = document.createElement('select');
    selectList.id = 'input__predefinedQuestion';
    questionsPredefined.appendChild(selectList);

    database.ref('/questions/').once('value').then(
      function(snapshot) {
        // Create and append the options
        for (let key in snapshot.val()) {
          if(!snapshot.val()[key].isPrivate || (snapshot.val()[key].author == firebase.auth().currentUser.uid && 
              snapshot.val()[key].question != '')){
            let questionText = snapshot.val()[key].question;
            if (questionText.length > 60) {
              questionText = questionText.substr(0, 60) + '...';
            }

            const option = document.createElement('option');
            option.value = key;
            option.text = questionText;
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
    questionsPredefined.appendChild(addPreDefinedQuestionButton);
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
          addPredefinedQuestionButton();
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

  // Modifies a question that is private with the new given content
  // questionId is the id of the question that is to be modified.
  // content is the new modified question.
  // return Updated the question text.
  function modifyPrivateQuestion(questionId, content){
    database.ref(`/questions/${questionId}`).update({question: content});
  }

  // Creates a new question with the same properties besides the question itself
  // quesitonId is the id of the question that is to be recreated.
  // content is the new modified question.
  // type is the ype of the question.
  // return Replacing of the old question with new modified question within the quiz.
  function modifyANonePrivateQuestion(questionId, content, type) {
    // Generate unique ID
    const newPostKey = database.ref().child('questions/').push().key;

    // Create the question data
    const questionData = {
      isPrivate : true,
      question : content,
      author : firebase.auth().currentUser.uid,
      type : type
    };

    // Insert the data into the database on succesful promise
    database.ref(`/quizzes/${quiz}/questions/`).once('value').then(
      function(snapshot) {
        const updates = {};
        // Create the question and add it to the quiz with appropriate order number.
        // Also removes the question that it's replacing from the quiz.
        // This is an atomic operation.
        updates[`/questions/${newPostKey}`] = questionData;
        updates[`/quizzes/${quiz}/questions/${questionId}`] = null;
        updates[`/quizzes/${quiz}/questions/${newPostKey}`] = snapshot.val()[questionId];
        
        database.ref().update(updates);
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
      addQuestionButton();
      addPredefinedQuestionButton();
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
