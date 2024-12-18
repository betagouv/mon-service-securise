const axios = require('axios');

const inscris = async ({ nom, prenom, email, entite, telephone, postes }) => {
  const jeton = process.env.PROFIL_ANSSI_JETON_API;
  const urlInscription = `${process.env.PROFIL_ANSSI_URL_BASE}/inscription`;
  await axios.post(
    urlInscription,
    {
      nom,
      prenom,
      email,
      organisation: entite,
      telephone,
      domainesSpecialite: postes,
    },
    {
      headers: {
        Authorization: `Bearer ${jeton}`,
      },
    }
  );
};

const metsAJour = async (_utilisateur) => {};

module.exports = {
  inscris,
  metsAJour,
};
