import parametres from './parametres.js';

const fermeModale = () => {
  $('.rideau').css('display', '');
  $('body').css('overflow', '');
};

const afficheModale = (fragmentHtml) => {
  $('.informations-complementaires').html(fragmentHtml);
  $('body').css('overflow', 'hidden');
  $('.rideau').css('display', 'flex');
};

const afficheModaleSeuilMoyen = () => afficheModale(`
<div>
  Compte tenu des risques auxquels votre service est susceptible de faire face,
  aux vues des fonctionnalités offertes et de la sensibilité des données
  traitées, il vous sera demandé, en plus des mesures de sécurité recommandées,
  de :
</div>
<ul>
  <li>
    réaliser un test technique de la sécurité du service (test de pénétration,
    bug bounty, etc.) ;
  </li>
  <li>
    réaliser un atelier d'analyse de risque en vue de compléter les risques et
    de préciser les mesures de sécurité.
  </li>
</ul>
`);

const afficheModaleSeuilEleve = () => afficheModale(`
<div>
  Compte tenu des risques auxquels votre service est susceptible de faire face,
  aux vues des fonctionnalités offertes et de la sensibilité des données
  traitées, l'ANSSI vous recommande de réaliser une démarche d'homologation
  approfondie en vous appuyant sur le « guide d’homologation en 9 étapes ».
</div>
<br>
<div>
  Celle-ci peut être effectuée en substitution ou en complément d'une démarche
  via Mon Service Sécurisé. Le cas échéant, toutes les pièces complémentaires
  au dossier d'homologation recommandées dans le guide en 9 étapes devront être
  jointes au dossier généré sur Mon Service Sécurisé.
</div>
<br>
<div>
  Cette recommandation sera rappelée dans le dossier d’homologation généré sur
  Mon Service Sécurisé.
</div>
`);

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

  axios.get('/api/seuilCriticite', { params })
    .then((reponse) => {
      switch (reponse.data.seuilCriticite) {
        case 'faible':
          $('.bouton#envoi').click();
          break;
        case 'moyen':
          afficheModaleSeuilMoyen();
          break;
        case 'eleve':
        case 'critique':
          afficheModaleSeuilEleve();
          break;
        default:
      }
    });
};

export { initialiseComportementModale, soumetsHomologation };
