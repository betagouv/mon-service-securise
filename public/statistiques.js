import donnees from './modules/statistiques/donnees.mjs';
import construis from './modules/statistiques/construis.mjs';

const COULEURS_GRAPHES = ['#0f7ac7', '#ff6584'];

const TEMPS_EN_MOIS = {
  type: 'time',
  time: { unit: 'month', tooltipFormat: 'DD MMMM YYYY' },
};

const construisEvolution = (
  identifiantCanevas,
  titresDonnees,
  clefsDonnees,
  optionsSupplementaires = {}
) => {
  const couleur = (index) => COULEURS_GRAPHES[index % COULEURS_GRAPHES.length];

  const datasets = clefsDonnees.map((clef, index) => ({
    label: titresDonnees[index],
    backgroundColor: couleur(index),
    borderColor: couleur(index),
    data: construis(clef, donnees),
  }));

  const options = {
    elements: {
      point: { radius: 0 },
    },
    scales: {
      x: TEMPS_EN_MOIS,
    },
    ...optionsSupplementaires,
  };

  const config = { type: 'line', data: { datasets }, options };

  /* eslint-disable no-new */
  new Chart(document.getElementById(identifiantCanevas), config);
  /* eslint-enable no-new */
};

$(() => {
  moment.locale('fr');

  construisEvolution('utilisateursEtDossiers', ['Utilisateurs inscrits', 'Dossiers créés'], ['utilisateurs', 'dossiers']);
  construisEvolution(
    'pourcentageUtilisateursEnPlus',
    ['Nouveaux utilisateurs (en %)'],
    ['pourcentageUtilisateursEnPlus'],
    {
      scales: {
        x: TEMPS_EN_MOIS,
        y: { ticks: { callback: (value) => `${value} %` } },
      },
    },
  );
});
