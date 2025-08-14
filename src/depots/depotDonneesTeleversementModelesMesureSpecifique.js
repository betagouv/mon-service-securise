const TeleversementModelesMesureSpecifique = require('../modeles/televersement/televersementModelesMesureSpecifique');
const {
  ErreurUtilisateurInexistant,
  ErreurTeleversementInexistant,
  ErreurTeleversementInvalide,
} = require('../erreurs');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance: persistance,
    adaptateurChiffrement: chiffrement,
    referentiel,
    depotModelesMesureSpecifique,
  } = config;

  const nouveauTeleversementModelesMesureSpecifique = async (
    idUtilisateur,
    donneesTeleversement
  ) => {
    const donneesChiffrees = await chiffrement.chiffre(donneesTeleversement);
    await persistance.ajouteTeleversementModelesMesureSpecifique(
      idUtilisateur,
      donneesChiffrees
    );
  };

  const lisTeleversementModelesMesureSpecifique = async (idUtilisateur) => {
    const persistees =
      await persistance.lisTeleversementModelesMesureSpecifique(idUtilisateur);

    if (!persistees) return undefined;

    const enClair = await chiffrement.dechiffre(persistees);
    return new TeleversementModelesMesureSpecifique(enClair, referentiel);
  };

  const supprimeTeleversementModelesMesureSpecifique = async (idUtilisateur) =>
    persistance.supprimeTeleversementModelesMesureSpecifique(idUtilisateur);

  const confirmeTeleversementModelesMesureSpecifique = async (
    idUtilisateur
  ) => {
    const utilisateur = await persistance.utilisateur(idUtilisateur);
    if (!utilisateur) throw new ErreurUtilisateurInexistant();

    const televersement =
      await lisTeleversementModelesMesureSpecifique(idUtilisateur);
    if (!televersement) throw new ErreurTeleversementInexistant();

    const nbActuel =
      await depotModelesMesureSpecifique.nbModelesMesureSpecifiquePourUtilisateur(
        idUtilisateur
      );

    if (
      televersement.rapportDetaille({
        nbActuelModelesMesureSpecifique: nbActuel,
      }).statut === 'INVALIDE'
    ) {
      throw new ErreurTeleversementInvalide();
    }

    await depotModelesMesureSpecifique.ajouteModelesMesureSpecifique(
      idUtilisateur,
      televersement.donneesModelesMesureSpecifique()
    );

    await supprimeTeleversementModelesMesureSpecifique(idUtilisateur);
  };

  return {
    confirmeTeleversementModelesMesureSpecifique,
    lisTeleversementModelesMesureSpecifique,
    nouveauTeleversementModelesMesureSpecifique,
    supprimeTeleversementModelesMesureSpecifique,
  };
};
module.exports = { creeDepot };
