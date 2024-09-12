const ParcoursUtilisateur = require('../modeles/parcoursUtilisateur');
const EvenementNouvelleConnexionUtilisateur = require('../bus/evenementNouvelleConnexionUtilisateur');

const creeDepot = (config = {}) => {
  const { adaptateurPersistance, referentiel, busEvenements } = config;

  const lisParcoursUtilisateur = async (idUtilisateur) => {
    const parcoursConnu =
      await adaptateurPersistance.lisParcoursUtilisateur(idUtilisateur);
    return parcoursConnu
      ? new ParcoursUtilisateur(parcoursConnu, referentiel)
      : ParcoursUtilisateur.pourUtilisateur(idUtilisateur, referentiel);
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

module.exports = { creeDepot };
