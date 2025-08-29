import {
  ErreurHashDeSelInvalide,
  ErreurSelManquant,
  ErreurVersionSelInvalide,
  ErreurValeurSelIncoherente,
} from '../erreurs.js';

const verifieQueChaqueSelEstCoherent = async (
  tousLesSelsDeLaConfig,
  tousLesSelsAppliques,
  adaptateurChiffrement
) => {
  for (let i = 0; i < tousLesSelsDeLaConfig.length; i += 1) {
    const { version: versionDeLaConfig, sel: valeurSelEnClair } =
      tousLesSelsDeLaConfig[i];
    const leSelAppliqueCorrespondant = tousLesSelsAppliques.find(
      ({ version: versionEnBase }) => versionEnBase === versionDeLaConfig
    );

    if (!leSelAppliqueCorrespondant) {
      throw new ErreurSelManquant(
        `La version ${versionDeLaConfig} du sel noté dans la config est manquante dans la persistance.`
      );
    }
    // Comme expliqué dans la documentation, si un `loop` doit `break`, on peut utiliser `await`
    // https://eslint.org/docs/latest/rules/no-await-in-loop#when-not-to-use-it
    // eslint-disable-next-line no-await-in-loop
    const estValide = await adaptateurChiffrement.compareBCrypt(
      valeurSelEnClair,
      leSelAppliqueCorrespondant.empreinte
    );

    if (!estValide) {
      throw new ErreurHashDeSelInvalide(
        `La version ${versionDeLaConfig} du sel de la config a une valeur différente de celle déjà appliquée.`
      );
    }
  }

  for (let i = 0; i < tousLesSelsAppliques.length; i += 1) {
    const { version: versionAppliquee } = tousLesSelsAppliques[i];
    if (
      !tousLesSelsDeLaConfig.some(
        ({ version: versionDansLaConfig }) =>
          versionAppliquee === versionDansLaConfig
      )
    ) {
      throw new ErreurSelManquant(
        `La version ${versionAppliquee} du sel déjà appliquée est manquante dans la config.`
      );
    }
  }
};

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance,
    adaptateurEnvironnement,
    adaptateurChiffrement,
  } = config;

  const verifieLaCoherenceDesSels = async () => {
    const tousLesSelsDeLaConfig = adaptateurEnvironnement
      .chiffrement()
      .tousLesSelsDeHachage();

    if (tousLesSelsDeLaConfig.length === 0) {
      throw new ErreurSelManquant('Aucun sel de hachage dans la config.');
    }

    const tousLesSelsAppliques =
      await adaptateurPersistance.tousLesSelsDeHachage();

    await verifieQueChaqueSelEstCoherent(
      tousLesSelsDeLaConfig,
      tousLesSelsAppliques,
      adaptateurChiffrement
    );
  };

  const verifieLaCoherenceDesSelsAvantMigration = async (
    versionAMigrer,
    valeurSelAMigrer
  ) => {
    const tousLesSelsDeLaConfig = adaptateurEnvironnement
      .chiffrement()
      .tousLesSelsDeHachage();

    const tousLesSelsAppliques =
      await adaptateurPersistance.tousLesSelsDeHachage();

    if (tousLesSelsDeLaConfig.length === tousLesSelsAppliques.length)
      throw new ErreurSelManquant(
        'Aucun nouveau sel présent dans la configuration. La migration ne peut pas être effectuée.'
      );

    if (tousLesSelsDeLaConfig.length !== tousLesSelsAppliques.length + 1)
      throw new ErreurSelManquant("Plus d'un sel à migrer.");

    const leDernierSelDeLaConfig =
      tousLesSelsDeLaConfig[tousLesSelsDeLaConfig.length - 1];

    if (versionAMigrer !== leDernierSelDeLaConfig.version)
      throw new ErreurVersionSelInvalide(
        `La version v${versionAMigrer} est incompatible avec la configuration actuelle.`
      );

    if (valeurSelAMigrer !== leDernierSelDeLaConfig.sel)
      throw new ErreurValeurSelIncoherente(
        'La valeur du sel est incohérente avec la configuration actuelle.'
      );

    await verifieQueChaqueSelEstCoherent(
      tousLesSelsDeLaConfig.slice(0, tousLesSelsDeLaConfig.length - 1),
      tousLesSelsAppliques,
      adaptateurChiffrement
    );
  };

  return {
    verifieLaCoherenceDesSels,
    verifieLaCoherenceDesSelsAvantMigration,
  };
};
export { creeDepot };
