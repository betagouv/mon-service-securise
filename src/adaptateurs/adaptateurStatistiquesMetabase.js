const axios = require('axios');

const enteteJSON = {
  headers: {
    'x-api-key': process.env.METABASE_API_KEY,
    accept: 'application/json',
    'content-type': 'application/json',
  },
};
const urlBase = process.env.STATISTIQUES_DOMAINE_METABASE_MSS;

const recupereResultat = async (idQuestion) => {
  const resultat = await axios.post(
    `${urlBase}/api/card/${idQuestion}/query`,
    {},
    enteteJSON
  );
  return {
    nombre: parseInt(resultat.data.data.insights[0]['last-value'], 10),
    progression: (
      parseFloat(resultat.data.data.insights[0]['last-change']) * 100.0
    ).toFixed(1),
  };
};

const recupereStatistiques = async () => {
  const idNbUtilisateurs = process.env.METABASE_ID_QUESTION_NB_UTILISATEURS;
  const idNbServices = process.env.METABASE_ID_QUESTION_NB_SERVICES;
  const idVulnerabilite = process.env.METABASE_ID_QUESTION_NB_VULNERABILITES;

  const [utilisateurs, services, vulnerabilites] = await Promise.all(
    [idNbUtilisateurs, idNbServices, idVulnerabilite].map((id) =>
      recupereResultat(id)
    )
  );

  return {
    utilisateurs,
    services,
    vulnerabilites,
    indiceCyber: { nombre: '+63%', progression: '+60%' },
  };
};

module.exports = {
  recupereStatistiques,
};
