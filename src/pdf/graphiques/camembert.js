const genereGradientConique = (statistiques) => {
  const ANGLE_MINIMUM = 20;

  const fixeDebutFin = (debut, fin) => {
    const avecValeur = debut !== fin;
    const finVisible = avecValeur ? Math.max(fin, debut + ANGLE_MINIMUM) : fin;
    return { debut, milieu: (finVisible - debut) / 2 + debut, fin: finVisible };
  };

  const total = statistiques.enCours + statistiques.nonFait
    + statistiques.restant + statistiques.fait;
  const enCours = (statistiques.enCours / total) * 360;
  const nonFait = (statistiques.nonFait / total) * 360;
  const restant = (statistiques.restant / total) * 360;
  const fait = (statistiques.fait / total) * 360;

  return {
    angles: {
      enCours: fixeDebutFin(0, enCours),
      nonFait: fixeDebutFin(enCours, enCours + nonFait),
      restant: fixeDebutFin(enCours + nonFait, enCours + nonFait + restant),
      fait: fixeDebutFin(enCours + nonFait + restant, enCours + nonFait + restant + fait),
    },
  };
};

module.exports = { genereGradientConique };
