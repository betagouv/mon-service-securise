/* eslint new-cap: ['error', { properties: false }] */

const couleurs = {
  blanc: '#fff',
  noir: '#000',
  camaieuMoyen: '#75a1e8',
  camaieuClair: '#e4efff',
  camaieuFonce: '#0a4c8c',
  fondTransparent: '#ffffff00',
  bleuMiseEnAvant: '#0f7ac7',
};

const proprietesMesures = {
  enCours: {
    clef: 'en-cours',
    couleurCamembert: couleurs.camaieuMoyen,
    couleurTexteCamembert: couleurs.blanc,
    misesEnOeuvre: false,
    decalage: 0,
  },
  nonFaites: {
    clef: 'non-faites',
    couleurCamembert: couleurs.camaieuClair,
    couleurTexteCamembert: couleurs.noir,
    misesEnOeuvre: false,
    decalage: 0,
  },
  aRemplir: {
    clef: 'a-remplir',
    couleurCamembert: couleurs.blanc,
    couleurTexteCamembert: couleurs.noir,
    misesEnOeuvre: false,
    decalage: 0,
  },
  faites: {
    clef: 'faites',
    couleurCamembert: couleurs.camaieuFonce,
    couleurTexteCamembert: couleurs.blanc,
    misesEnOeuvre: true,
    decalage: 10,
  },
};
const listeProprietesMesures = (clefPropriete) => Object.keys(proprietesMesures)
  .map((clef) => proprietesMesures[clef][clefPropriete]);

/* eslint-disable no-undef */
Chart.register(ChartDataLabels);
/* eslint-enable no-undef */

const camembertCouleurs = listeProprietesMesures('couleurCamembert');
const texteCamembertCouleurs = listeProprietesMesures('couleurTexteCamembert');
const anneauCouleurs = () => listeProprietesMesures('misesEnOeuvre')
  .map((misesEnOeuvre) => (misesEnOeuvre ? couleurs.fondTransparent : couleurs.bleuMiseEnAvant));

const data = (donnees) => ({
  datasets: [
    {
      data: donnees,
      backgroundColor: anneauCouleurs(),
      cutout: '90%',
      datalabels: {
        display: false,
      },
    },
    {
      data: donnees,
      backgroundColor: camembertCouleurs,
      offset: listeProprietesMesures('decalage'),
      radius: '198%',
      hoverOffset: 4,
      datalabels: {
        color: texteCamembertCouleurs,
      },
    },
  ],
});

const formateur = (donnee) => (donnee.valeur || '');

const config = (donnees) => ({
  /* eslint-disable no-undef */
  plugins: [ChartDataLabels],
  /* eslint-enable no-undef */
  type: 'pie',
  data: data(donnees),
  options: {
    borderWidth: 0,
    responsive: true,
    parsing: {
      key: 'valeurAffichage',
    },
    plugins: {
      tooltip: false,
      datalabels: {
        font: {
          weight: 'bold',
        },
        formatter: formateur,
      },
    },
  },
});

const ajusteDonnees = (donnees) => {
  const total = donnees.reduce((accumulateur, valeur) => (accumulateur + valeur), 0);
  const TAILLE_MIN = 8;
  const SEUIL_MIN_CRITIQUE = 1 / 15;
  return donnees.map((valeur) => {
    if (valeur === 0) return { valeurAffichage: 0, valeur };
    return (valeur / total) < (SEUIL_MIN_CRITIQUE)
      ? ({ valeurAffichage: TAILLE_MIN, valeur })
      : ({ valeurAffichage: ((valeur * 100) / total), valeur });
  });
};

const nombreMesures = (selecteurType, identifiantStatut) => (
  $(selecteurType).data(identifiantStatut)
);

const clefsMesures = listeProprietesMesures('clef');
const donneesMesures = (selecteurTypeDeMesures) => (
  clefsMesures.map((identifiantStatut) => nombreMesures(selecteurTypeDeMesures, identifiantStatut))
);

const graphiqueCamembert = (identifiantGraphique, selecteurTypeDeMesures) => {
  /* eslint-disable no-new */
  new Chart(
    document.getElementById(identifiantGraphique),
    config(ajusteDonnees(donneesMesures(selecteurTypeDeMesures)))
  );
  /* eslint-enable no-new */
};

export default graphiqueCamembert;
