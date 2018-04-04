/**
 * Shows status of participants while quiz is running
 * 
 * @author Ragnheiður Ásta Karlsdóttir rak4@hi.is
 * 14. march 2018
 */
const quizOverview = (function () {

  let database;
  let quiz;
  
  // Updates list of teams
  function updateTeams(teams) {
    if(teams != null){
      const section = document.querySelector('.section__teams');
      while (section.firstChild) {
        section.removeChild(section.firstChild);
      }
      const header = document.createElement('h2');
      const ul = document.createElement('ul');
      header.setAttribute('class', 'heading heading--two');
      header.appendChild(document.createTextNode('Liðin'));
      section.appendChild(header);
      ul.setAttribute('class', 'teams');
      section.appendChild(ul);
      while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
      }
      Object.keys(teams).forEach((team) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.setAttribute('class', 'team__name');
        span.appendChild(document.createTextNode(team));
        li.appendChild(span);
        ul.appendChild(li);
        const questionsRef = database.ref(`quizzes/${quiz}/questions`);
        const questionsDiv = document.createElement('div');
        questionsDiv.setAttribute('class', 'team__questions');
        li.appendChild(questionsDiv);
        questionsRef.on('value', (snapshot) => {
          while (questionsDiv.firstChild) {
            questionsDiv.removeChild(questionsDiv.firstChild);
          }
          const questions = snapshot.val();
          Object.keys(questions).sort((a, b) => {
            if (questions[a] < questions[b]) {
              return -1;
            } else if (questions[a] > questions[b]) {
              return 1;
            }
            return 0;
          }).forEach((question) => {
            const answerRef = database.ref(`answers/${quiz}/${question}/${team}`);
            const questionDiv = document.createElement('div');
            questionDiv.setAttribute('class', 'team__question team__question--unanswered');
            questionsDiv.appendChild(questionDiv);
            answerRef.on('value', (ansSnapshot) => {
              const answer = ansSnapshot.val();
              if(answer === null) {
                questionDiv.setAttribute('class', 'team__question team__question--unanswered');
              } else if(answer.isCorrect === true) {
                questionDiv.setAttribute('class', 'team__question team__question--answered team__question--correct');
              } else if (answer.isCorrect === false) {
                questionDiv.setAttribute('class', 'team__question team__question--answered team__question--incorrect');
              } else {
                questionDiv.setAttribute('class', 'team__question team__question--answered');
              }
            });
          });
        });
      });
    }
  }

  function init(db, q) {
    database = db;
    quiz = q;

    // Remove all teams (if there are any)
    updateTeams([]);

    const teamRef = database.ref(`quizzes/${quiz}/teams`);
    teamRef.on('value', (snapshot) => {
      updateTeams(snapshot.val());
    })
  }

  return {
    init: init
  }
})();

module.exports = quizOverview;
