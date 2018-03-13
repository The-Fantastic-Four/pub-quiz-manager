
const quizOverview = (function () {

  let database;
  let quiz;
  
  // Updates list of teams
  function updateTeams(teams) {
    const ul = document.getElementById('teams');
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
  }

  return {
    init: init
  }
})();

module.exports = quizOverview;