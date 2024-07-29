const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');

const urlBase = `https://api.crisp.chat/v1/website/${process.env.CRISP_ID_SITE}/`;
const enteteCrisp = {
  headers: {
    Authorization: `Basic ${btoa(process.env.CRISP_CLE_API)}`,
    'X-Crisp-Tier': 'plugin',
  },
};

const recupereArticle = async (idArticle) => {
  try {
    const reponse = await axios.get(
      `${urlBase}helpdesk/locale/fr/article/${idArticle}`,
      enteteCrisp
    );

    return {
      contenuMarkdown: reponse.data.data.content,
      titre: reponse.data.data.title,
      description: reponse.data.data.description,
    };
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API Crisp': e?.response?.data,
    });
    throw e;
  }
};

const recupereNouveautes = () =>
  recupereArticle(process.env.CRISP_ID_ARTICLE_NOUVEAUTE);
const recupereDevenirAmbassadeur = () =>
  recupereArticle(process.env.CRISP_ID_ARTICLE_DEVENIR_AMBASSADEUR);
const recupereFaireConnaitreMSS = () =>
  recupereArticle(process.env.CRISP_ID_ARTICLE_FAIRE_CONNAITRE);

const recupereArticlesBlog = async () => {
  try {
    const params = new URLSearchParams({
      filter_category_id: process.env.CRISP_ID_CATEGORIE_BLOG,
    });

    const reponse = await axios.get(
      `${urlBase}helpdesk/locale/fr/articles/0?${params}`,
      enteteCrisp
    );

    return reponse.data.data.map((a) => ({
      id: a.article_id,
      url: a.url,
    }));
  } catch (e) {
    fabriqueAdaptateurGestionErreur().logueErreur(e, {
      'Erreur renvoyée par API Crisp': e?.response?.data,
    });
    throw e;
  }
};

module.exports = {
  recupereNouveautes,
  recupereDevenirAmbassadeur,
  recupereFaireConnaitreMSS,
  recupereArticle,
  recupereArticlesBlog,
};
