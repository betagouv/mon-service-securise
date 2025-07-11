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

  return { ajouteModeleMesureSpecifique };
};
module.exports = { creeDepot };
