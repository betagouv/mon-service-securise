const { ErreurHashDeSelInvalide, ErreurSelManquant } = require('../erreurs');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance,
    adaptateurEnvironnement,
    adaptateurChiffrement,
  } = config;

  const verifieLaCoherenceDesSels = async () => {
    const tousLesSelsDeHachageDeLaConfig = adaptateurEnvironnement
      .chiffrement()
      .tousLesSelsDeHachage();
    const selsAppliques = await adaptateurPersistance.tousLesSelsDeHachage();

    for (let i = 0; i < tousLesSelsDeHachageDeLaConfig.length; i += 1) {
      const { version, sel } = tousLesSelsDeHachageDeLaConfig[i];
      const leSelAppliqueCorrespondant = selsAppliques.find(
        ({ version: versionEnBase }) => versionEnBase === version
      );

      if (!leSelAppliqueCorrespondant) {
        if (i !== tousLesSelsDeHachageDeLaConfig.length - 1)
          throw new ErreurSelManquant(
            `La version ${version} du sel est manquante.`
          );
        return { version };
      }
      // Comme expliqué dans la documentation, si un `loop` doit `break`, on peut utiliser `await`
      // https://eslint.org/docs/latest/rules/no-await-in-loop#when-not-to-use-it
      // eslint-disable-next-line no-await-in-loop
      const estValide = await adaptateurChiffrement.compareBCrypt(
        sel,
        leSelAppliqueCorrespondant.empreinte
      );

      if (!estValide) {
        throw new ErreurHashDeSelInvalide(
          `La version ${tousLesSelsDeHachageDeLaConfig[i].version} du sel est invalide.`
        );
      }
    }

    return undefined;
  };

  return {
    verifieLaCoherenceDesSels,
  };
};
module.exports = { creeDepot };
