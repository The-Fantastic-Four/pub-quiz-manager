
const quizOverview = (function () {

  let database;
  let quiz;
  
  // Updates list of teams
  function updateTeams(teams) {
    const section = document.querySelector('.section__teams');
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    const header = document.createElement('h2');
    const ul = document.createElement('ul');
    header.setAttribute('class', 'heading--two');
    header.appendChild(document.createTextNode('Liðin'));
    section.appendChild(header);
    ul.setAttribute('id', 'teams');
    section.appendChild(ul);
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    Object.keys(teams).forEach((team) => {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(team));
      ul.appendChild(li);
    });
  }

  function init(db, q) {
    database = db;
    quiz = q;
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