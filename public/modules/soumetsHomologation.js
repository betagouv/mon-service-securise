import parametres, { modifieParametresAvecItemsExtraits } from './parametres.js';

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
    réaliser un test technique de la sécurité du service (ex. test automatique
    en ligne, test d'intrusion, bug bounty, etc.).
  </li>
</ul>
`);

const afficheModaleSeuilEleve = () => afficheModale(`
<div>
  Compte tenu des risques auxquels votre service est susceptible de faire face,
  aux vues des fonctionnalités offertes et de la sensibilité des données
  traitées, il vous sera demandé, en plus des mesures de sécurité recommandées,
  de :
</div>
<ul>
  <li>
    réaliser un test technique de la sécurité du service (ex. test automatique
    en ligne, test d'intrusion, bug bounty, etc.) ;
  </li>
  <li>
    réaliser un atelier d'analyse de risques en vue de compléter les risques et
    de préciser les mesures de sécurité (vous pouvez vous aider du guide «
    Sécurité et Agilité numériques »).
  </li>
</ul>
`);

const afficheModaleSeuilCritique = () => afficheModale(`
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

const organiseParametresPointsAcces = (params) => (
  modifieParametresAvecItemsExtraits(params, 'pointsAcces', '^(description)-point-acces-')
);

const organiseParametresFonctionnalite = (params) => (
  modifieParametresAvecItemsExtraits(params, 'fonctionnalitesSpecifiques', '^(description)-fonctionnalite-')
);

const tousLesParametres = (selecteurFormulaire) => {
  const params = parametres(selecteurFormulaire);
  organiseParametresPointsAcces(params);
  organiseParametresFonctionnalite(params);
  return params;
};

const initialiseComportementModale = (url, parametresFormulaire) => {
  $('.fermeture-modale').click((eFermeture) => {
    eFermeture.stopPropagation();
    fermeModale();
  });

  $('a#annulation').click(fermeModale);

  $('.bouton#envoi').click(() => {
    const params = tousLesParametres(parametresFormulaire);
    Object.assign(url, { data: params });

    axios(url)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
};

const soumetsHomologation = (selecteurFormulaire) => {
  const params = tousLesParametres(selecteurFormulaire);

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
          afficheModaleSeuilEleve();
          break;
        case 'critique':
          afficheModaleSeuilCritique();
          break;
        default:
      }
    });
};

export { initialiseComportementModale, soumetsHomologation };
