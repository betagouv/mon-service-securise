const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const CONFIGURATION_AUTHENTIFICATION = {
  headers: {
    Authorization: `Bearer ${process.env.PROFIL_ANSSI_JETON_API}`,
  },
};

const metsAJour = async ({ nom, prenom, email, entite, telephone, postes }) => {
  const urlProfil = `${process.env.PROFIL_ANSSI_URL_BASE}/profil/${email}`;
  await axios.put(
    urlProfil,
    {
      nom,
      prenom,
      organisation: entite,
      telephone,
      domainesSpecialite: postes,
    },
    CONFIGURATION_AUTHENTIFICATION
  );
};

const recupere = async (email) => {
  const urlProfil = `${process.env.PROFIL_ANSSI_URL_BASE}/profil/${email}`;
  try {
    const reponse = await axios.get(urlProfil, CONFIGURATION_AUTHENTIFICATION);
    return reponse.data;
  } catch (e) {
    if (e.response?.status !== 404) {
      fabriqueAdaptateurGestionErreur().logueErreur(e, {
        'Erreur renvoyée par API MonProfilAnssi': e.response?.data,
        'Statut renvoyé par API MonProfilAnssi': e.response?.status,
      });
    }
    return undefined;
  }
};

module.exports = {
  recupere,
  metsAJour,
};
