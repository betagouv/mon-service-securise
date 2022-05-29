import donnees from './modules/statistiques/donnees.mjs';
import construis from './modules/statistiques/construis.mjs';

$(() => {
  moment.locale('fr');

  const data = {
    datasets: [{
      label: 'Utilisateurs inscrits',
      backgroundColor: '#0f7ac7',
      borderColor: '#0f7ac7',
      data: construis('utilisateurs', donnees),
    },
    {
      label: 'Dossiers créés',
      backgroundColor: '#ff6584',
      borderColor: '#ff6584',
      data: construis('dossiers', donnees),
    }],
  };

  const options = {
    elements: {
      point: { radius: 0 },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'month' },
      },
    },
  };

  const config = { type: 'line', data, options };

  /* eslint-disable no-new */
  new Chart(document.getElementById('utilisateursEtDossiers'), config);
  /* eslint-enable no-new */
});
