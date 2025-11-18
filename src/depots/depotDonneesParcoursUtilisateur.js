import ParcoursUtilisateur from '../modeles/parcoursUtilisateur.js';
import EvenementNouvelleConnexionUtilisateur from '../bus/evenementNouvelleConnexionUtilisateur.js';

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, referentiel, busEvenements } = config;

  const lisParcoursUtilisateur = async (idUtilisateur) => {
    const parcoursConnu =
      await adaptateurPersistance.lisParcoursUtilisateur(idUtilisateur);
    const versionsService =
      await adaptateurPersistance.versionsServiceUtiliseesParUtilisateur(
        idUtilisateur
      );
    return parcoursConnu
      ? new ParcoursUtilisateur(
          { ...parcoursConnu, versionsService },
          referentiel
        )
      : ParcoursUtilisateur.pourUtilisateur(
          idUtilisateur,
          referentiel,
          versionsService
        );
  };

  const sauvegardeParcoursUtilisateur = async (parcoursUtilisateur) => {
    await adaptateurPersistance.sauvegardeParcoursUtilisateur(
      parcoursUtilisateur.idUtilisateur,
      parcoursUtilisateur.donneesSerialisees()
    );
  };

  const enregistreNouvelleConnexionUtilisateur = async (
    idUtilisateur,
    source
  ) => {
    const parcoursUtilisateur = await lisParcoursUtilisateur(idUtilisateur);

    parcoursUtilisateur.enregistreDerniereConnexionMaintenant();
    await sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    await busEvenements.publie(
      new EvenementNouvelleConnexionUtilisateur({
        idUtilisateur,
        dateDerniereConnexion: parcoursUtilisateur.dateDerniereConnexion,
        source,
      })
    );
  };

  return {
    lisParcoursUtilisateur,
    sauvegardeParcoursUtilisateur,
    enregistreNouvelleConnexionUtilisateur,
  };
};

export { creeDepot };
