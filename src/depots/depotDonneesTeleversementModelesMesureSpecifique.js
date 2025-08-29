import TeleversementModelesMesureSpecifique from '../modeles/televersement/televersementModelesMesureSpecifique.js';

import {
  ErreurUtilisateurInexistant,
  ErreurTeleversementInexistant,
  ErreurTeleversementInvalide,
} from '../erreurs.js';

import EvenementModelesMesureSpecifiqueImportes from '../bus/evenementModelesMesureSpecifiqueImportes.js';

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance: persistance,
    adaptateurChiffrement: chiffrement,
    referentiel,
    depotModelesMesureSpecifique,
    busEvenements,
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
    const nbMaximumLignesAutorisees =
      await depotModelesMesureSpecifique.nbRestantModelesMesureSpecifiquePourUtilisateur(
        idUtilisateur
      );

    return new TeleversementModelesMesureSpecifique(
      enClair,
      { nbMaximumLignesAutorisees },
      referentiel
    );
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

    if (televersement.rapportDetaille().statut === 'INVALIDE') {
      throw new ErreurTeleversementInvalide();
    }

    const donneesModelesImportes =
      televersement.donneesModelesMesureSpecifique();

    await depotModelesMesureSpecifique.ajoutePlusieursModelesMesureSpecifique(
      idUtilisateur,
      donneesModelesImportes
    );

    await busEvenements.publie(
      new EvenementModelesMesureSpecifiqueImportes({
        idUtilisateur,
        nbModelesMesureSpecifiqueImportes: donneesModelesImportes.length,
      })
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
export { creeDepot };
