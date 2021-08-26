import parametres from './parametres.js';

const fermeModale = () => {
  $('.rideau').css('display', '');
  $('body').css('overflow', '');
};

const afficheModale = (fragmentHtml) => {
  $('.diagnostic-documents-complementaires').html(fragmentHtml);
  $('body').css('overflow', 'hidden');
  $('.rideau').css('display', 'flex');
};

const initialiseComportementModale = (url, selecteurFormulaire) => {
  $('.fermeture-modale').click((eFermeture) => {
    eFermeture.stopPropagation();
    fermeModale();
  });

  $('a#annulation').click(fermeModale);

  $('.bouton#envoi').click(() => {
    const params = parametres(selecteurFormulaire);
    Object.assign(url, { data: params });

    axios(url)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
};

const soumetsHomologation = (selecteurFormulaire) => {
  const params = parametres(selecteurFormulaire);

  axios.get('/api/documentsComplementaires', { params })
    .then((reponse) => afficheModale(reponse.data));
};

export { initialiseComportementModale, soumetsHomologation };
