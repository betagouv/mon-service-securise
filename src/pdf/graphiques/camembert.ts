const ANGLE_MINIMUM = 30;

const detailAngle = (debut, fin) => ({
  debut,
  milieu: (fin - debut) / 2 + debut,
  fin,
});

const recalculPourFin360 = (angles) => {
  const { fait, enCours, nonFait, aLancer, aRemplir } = angles;

  const depassement = fait.fin - 360;
  let nbAnglesAModifier = Object.values(angles)
    .map(({ debut, fin }) => fin - debut === ANGLE_MINIMUM || fin === debut)
    .filter((estAngleMinimum) => estAngleMinimum === false).length;
  let angleASoustraire = depassement / nbAnglesAModifier;
  Object.values(angles).forEach((detail) => {
    const angle = detail.fin - detail.debut;
    if (angle > ANGLE_MINIMUM && angle - angleASoustraire < ANGLE_MINIMUM) {
      detail.nePeutEtreModifie = true;
      nbAnglesAModifier -= 1;
      angleASoustraire = depassement / nbAnglesAModifier;
    }
  });

  const valeurRevisee = (angle) => {
    if (angle.nePeutEtreModifie) return angle.fin - angle.debut;
    if (angle.fin - angle.debut === 0) return 0;
    return angle.fin - angle.debut === ANGLE_MINIMUM
      ? ANGLE_MINIMUM
      : angle.fin - angle.debut - angleASoustraire;
  };

  const valeurRevisees = {
    enCours: valeurRevisee(enCours),
    nonFait: valeurRevisee(nonFait),
    aLancer: valeurRevisee(aLancer),
    aRemplir: valeurRevisee(aRemplir),
    fait: valeurRevisee(fait),
  };

  const enCoursRevise = detailAngle(0, valeurRevisees.enCours);
  const nonFaitRevise = detailAngle(
    enCoursRevise.fin,
    enCoursRevise.fin + valeurRevisees.nonFait
  );
  const aLancerRevise = detailAngle(
    nonFaitRevise.fin,
    nonFaitRevise.fin + valeurRevisees.aLancer
  );
  const aRemplirRevise = detailAngle(
    aLancerRevise.fin,
    aLancerRevise.fin + valeurRevisees.aRemplir
  );
  const faitRevise = detailAngle(
    aRemplirRevise.fin,
    aRemplirRevise.fin + valeurRevisees.fait
  );

  return {
    enCours: enCoursRevise,
    nonFait: nonFaitRevise,
    aLancer: aLancerRevise,
    aRemplir: aRemplirRevise,
    fait: faitRevise,
  };
};

const genereGradientConique = (statistiques) => {
  const avecAngleMinimum = (uneStatistique) => {
    const total =
      statistiques.enCours +
      statistiques.nonFait +
      statistiques.aLancer +
      statistiques.aRemplir +
      statistiques.fait;

    const valeurBrute = (uneStatistique / total) * 360;
    return valeurBrute === 0 ? 0 : Math.max(valeurBrute, ANGLE_MINIMUM);
  };

  const enCours = avecAngleMinimum(statistiques.enCours);
  const nonFait = avecAngleMinimum(statistiques.nonFait);
  const aLancer = avecAngleMinimum(statistiques.aLancer);
  const aRemplir = avecAngleMinimum(statistiques.aRemplir);
  const fait = avecAngleMinimum(statistiques.fait);

  const anglesInitiaux = {
    enCours: detailAngle(0, enCours),
    nonFait: detailAngle(enCours, enCours + nonFait),
    aLancer: detailAngle(enCours + nonFait, enCours + nonFait + aLancer),
    aRemplir: detailAngle(
      enCours + nonFait + aLancer,
      enCours + nonFait + aLancer + aRemplir
    ),
    fait: detailAngle(
      enCours + nonFait + aLancer + aRemplir,
      enCours + nonFait + aLancer + aRemplir + fait
    ),
  };

  const anglesFinaux =
    anglesInitiaux.fait.fin <= 360
      ? anglesInitiaux
      : recalculPourFin360(anglesInitiaux);

  const seulementStatistiquesConcernes = {
    enCours: statistiques.enCours,
    nonFait: statistiques.nonFait,
    aLancer: statistiques.aLancer,
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
