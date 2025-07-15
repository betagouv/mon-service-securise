const {
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurServiceInexistant,
} = require('../erreurs');

const creeDepot = (config = {}) => {
  const { adaptateurChiffrement, adaptateurPersistance, adaptateurUUID } =
    config;

  const ajouteModeleMesureSpecifique = async (idUtilisateur, donnees) => {
    const idModele = adaptateurUUID.genereUUID();
    const donneesChiffrees = await adaptateurChiffrement.chiffre(donnees);

    await adaptateurPersistance.ajouteModeleMesureSpecifique(
      idModele,
      idUtilisateur,
      donneesChiffrees
    );
  };

  const associeModeleMesureSpecifiqueAuxServices = async (
    idModele,
    idsServices
  ) => {
    const modeleExiste =
      await adaptateurPersistance.verifieModeleMesureSpecifiqueExiste(idModele);
    if (!modeleExiste)
      throw new ErreurModeleDeMesureSpecifiqueIntrouvable(idModele);

    const promessesVerificationServices = idsServices.map((id) =>
      adaptateurPersistance.verifieServiceExiste(id)
    );
    const serviceInexistant = (
      await Promise.all(promessesVerificationServices)
    ).some((resultat) => resultat === false);

    if (serviceInexistant) throw new ErreurServiceInexistant();

    await adaptateurPersistance.associeModeleMesureSpecifiqueAuxServices(
      idModele,
      idsServices
    );
  };

  return {
    ajouteModeleMesureSpecifique,
    associeModeleMesureSpecifiqueAuxServices,
  };
};
module.exports = { creeDepot };
