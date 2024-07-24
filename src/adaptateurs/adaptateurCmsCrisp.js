const axios = require('axios');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./fabriqueAdaptateurGestionErreur');
const { ErreurArticleCrispIntrouvable } = require('../erreurs');

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

const recupereArticleBlog = async (slug) => {
  try {
    const params = new URLSearchParams({
      filter_category_id: '8424d4d8-aa79-46fc-bef9-afd0287df0aa',
    });

    const reponse = await axios.get(
      `${urlBase}helpdesk/locale/fr/articles/0?${params}`,
      enteteCrisp
    );

    const article = reponse.data.data.find((a) => {
      const regex = /\/article\/(.*)-[a-zA-Z0-9]{1,10}\//gm;
      const slugArticle = regex.exec(a.url)[1];
      return slugArticle === slug;
    });

    if (!article) {
      throw new ErreurArticleCrispIntrouvable();
    }

    return await recupereArticle(article.article_id);
  } catch (e) {
    if (e instanceof ErreurArticleCrispIntrouvable) {
      throw e;
    }
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

module.exports = {
  recupereArticle,
  recupereArticleBlog,
  recupereNouveautes,
  recupereDevenirAmbassadeur,
  recupereFaireConnaitreMSS,
};
