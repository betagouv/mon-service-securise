const ANGLE_MINIMUM = 20;

const detailAngle = (debut, fin) => ({
  debut,
  milieu: (fin - debut) / 2 + debut,
  fin,
});

const recalculPourFin360 = (angles) => {
  const { fait, enCours, nonFait, aRemplir } = angles;

  const depassement = fait.fin - 360;
  const nbAnglesAModifier = Object.values(angles)
    .map(({ debut, fin }) => fin - debut === ANGLE_MINIMUM)
    .filter((estAngleMinimum) => estAngleMinimum === false).length;
  const angleASoustraire = depassement / nbAnglesAModifier;

  const valeurRevisee = (angle) =>
    angle.fin - angle.debut === ANGLE_MINIMUM
      ? ANGLE_MINIMUM
      : angle.fin - angle.debut - angleASoustraire;

  const valeurRevisees = {
    enCours: valeurRevisee(enCours),
    nonFait: valeurRevisee(nonFait),
    aRemplir: valeurRevisee(aRemplir),
    fait: valeurRevisee(fait),
  };

  const enCoursRevise = detailAngle(0, valeurRevisees.enCours);
  const nonFaitRevise = detailAngle(
    enCoursRevise.fin,
    enCoursRevise.fin + valeurRevisees.nonFait
  );
  const aRemplirRevise = detailAngle(
    nonFaitRevise.fin,
    nonFaitRevise.fin + valeurRevisees.aRemplir
  );
  const faitRevise = detailAngle(
    aRemplirRevise.fin,
    aRemplirRevise.fin + valeurRevisees.fait
  );

  return {
    enCours: enCoursRevise,
    nonFait: nonFaitRevise,
    aRemplir: aRemplirRevise,
    fait: faitRevise,
  };
};

const genereGradientConique = (statistiques) => {
  const avecAngleMinimum = (uneStatistique) => {
    const total =
      statistiques.enCours +
      statistiques.nonFait +
      statistiques.aRemplir +
      statistiques.fait;

    const valeurBrute = (uneStatistique / total) * 360;
    return valeurBrute === 0 ? 0 : Math.max(valeurBrute, ANGLE_MINIMUM);
  };

  const enCours = avecAngleMinimum(statistiques.enCours);
  const nonFait = avecAngleMinimum(statistiques.nonFait);
  const aRemplir = avecAngleMinimum(statistiques.aRemplir);
  const fait = avecAngleMinimum(statistiques.fait);

  const anglesInitiaux = {
    enCours: detailAngle(0, enCours),
    nonFait: detailAngle(enCours, enCours + nonFait),
    aRemplir: detailAngle(enCours + nonFait, enCours + nonFait + aRemplir),
    fait: detailAngle(
      enCours + nonFait + aRemplir,
      enCours + nonFait + aRemplir + fait
    ),
  };

  const anglesFinaux =
    anglesInitiaux.fait.fin <= 360
      ? anglesInitiaux
      : recalculPourFin360(anglesInitiaux);

  const seulementStatistiquesConcernes = {
    enCours: statistiques.enCours,
    nonFait: statistiques.nonFait,
    aRemplir: statistiques.aRemplir,
    fait: statistiques.fait,
  };
  const contientUneValeurUnique =
    Object.values(seulementStatistiquesConcernes).filter((v) => v !== 0)
      .length === 1;
  const unique = contientUneValeurUnique
    ? Object.keys(seulementStatistiquesConcernes).find(
        (cle) => seulementStatistiquesConcernes[cle] !== 0
      )
    : null;

  return { angles: anglesFinaux, unique };
};

module.exports = { genereGradientConique };
