const echeance = (duree) => `Dans ${duree}`;
const expiration = (duree) => `${duree.charAt(0).toUpperCase()}${duree.slice(1)} après signature de la présente homologation`;

module.exports = {
  naturesService: {
    siteInternet: { description: 'Site Internet' },
    applicationMobile: { description: 'Application Mobile' },
    api: { description: 'API' },
  },

  provenancesService: {
    developpement: {
      description: 'Il a été développé pour votre organisation, en interne ou par un prestataire',
      exemple: 'site internet de la commune',
    },
    achat: {
      description: "Le service a été acheté sur étagère auprès d'un fournisseur",
      exemple: 'service de visioconférence',
    },
  },

  fonctionnalites: {
    newsletter: { description: 'Inscription à une newsletter' },
    compte: { description: 'Création de compte (utilisateurs avec comptes)' },
    formulaire: { description: 'Formulaire administratif ou démarche en ligne' },
    questionnaire: { description: 'Questionnaires, sondages' },
    reservation: { description: 'Outils de réservation (livres, places, salles, etc.)' },
    paiement: { description: 'Paiement en ligne, conservation de données bancaires' },
    reseauSocial: { description: 'Réseau social, forum, commentaires' },
    visionconference: { description: 'Audio, visioconférence' },
    messagerie: { description: 'Messagerie instantanée' },
    emails: { description: "Envoi et réception d'emails" },
    documents: { description: 'Stockage de documents' },
    edition: { description: 'Édition collaborative (documents, murs collaboratifs, etc.)' },
    autre: { description: 'Autres fonctionnalités permettant des échanges de données (préciser)' },
  },

  donneesCaracterePersonnel: {
    contact: {
      description: 'Données de contact',
      exemple: 'mail, numéro de téléphone, adresse postale',
    },
    identite: {
      description: "Données d'identité",
      exemple: "nom/prénom, pseudonyme, date de maissance, numéros de pièce d'identité, de sécurité sociale, etc.",
    },
    situation: {
      description: 'Données relatives à la situation familiale, économique et financière',
      exemple: 'enfants',
    },
    localisation: {
      description: 'Données de localisation',
      exemple: 'adresse IP, identifiant de connexion, cookies',
    },
    banque: {
      description: 'Données bancaires',
      exemple: 'nº de carte bancaire, établissement bancaire, etc.',
    },
    mineurs: {
      description: 'Données concernant des personnes mineures',
    },
    sensibiliteParticuliere: {
      description: 'Données particulièrement sensibles (santé, opinions, etc.)',
      exemple: 'données de santé, orientation sexuelle, origine raciale ou ethnique, opinions politiques ou religieuses',
    },
  },

  delaisAvantImpactCritique: {
    uneHeure: { description: 'Une heure' },
    uneJournee: { description: 'Une journée' },
    uneSemaine: { description: 'Une semaine' },
    unMois: { description: 'Un mois ou plus' },
  },

  risques: {
    indisponibiliteService: {
      description: "L'indisponibilité du service",
      descriptionLongue: "Ce risque peut notamment découler d'une attaque par déni de service. Elle peut consister à exploiter, par exemple, une vulnérabilité logicielle ou matérielle ou à saturer la bande passante du réseau. Une telle attaque peut rendre inaccessible tout ou partie du service, empêchant son utilisation  pendant une durée de quelques heures à plusieurs jours. L'indisponibilité peut être aussi consécutive d'un problème technique chez l'hébergeur n'ayant pas pris des dispositions nécessaires pour assurer sa résilience.",
    },
    divulgationDonnees: {
      description: "La divulgation de données d'utilisateurs",
      descriptionLongue: "Le vol de données peut être recherché à des fins d'usurpation d'identité. La diffusion de données afin de discréditer des personnes, organisations ou bien l'entité propriétaire du service elle-même. Cette menace peut être permise par un contrôle d'accès insuffisant ou le piratage de comptes d'utilisateurs (vol d'identifiant / mot de passe) ou plus grave d'administrateurs permettant la prise de contrôle du service. Ou encore par la surveillance d'un trafic non chiffré. Les impacts pour le propriétaire du service peuvent être graves en termes de responsabilité juridique et d'image.",
    },
    surveillance: {
      description: 'La surveillance',
      descriptionLongue: "La menace d'accès illégitime à un échange, à des données à des fins d'information, de renseignement peut viser les services permettant les échanges entre personnes, des données sensibles stockées susceptibles d'intéresser des concurrents ou entités malveillantes souhaitant exploiter ses données à des fins de renseignement. Cette menace peut être permise par un contrôle d'accès insuffisant ou le piratage de comptes d'utilisateurs (vol d'identifiant / mot de passe) ou plus grave d'administrateurs permettant la prise de contrôle du service et l'accès à de nombreuses données. Ou encore par la surveillance d'un trafic non chiffré.",
    },
    defigurationSiteWeb: {
      description: "La défiguration d'un site web",
      descriptionLongue: "Une défiguration est une attaque par laquelle une personne malveillante modifie le site pour remplacer le contenu légitime par un contenu qu'il choisit, par exemple pour relayer un message revendicatif, pour dénigrer le propriétaire du site ou simplement. L'attaque peut avoir des conséquences négatives en termes d'image pour le propriétaire du service.",
    },
    logicielsMalveillants: {
      description: 'Logiciels malveillants',
      descriptionLongue: "Votre service peut être attaqué en vue de devenir un véhicule pour la diffusion de logiciels malveillants aux utilisateurs de votre service. Cela est rendu possible par l'exploitation de vulnérabilités techniques de votre service, par exemple, si votre service n'a pas été développé avec précaution, si votre service repose sur des logiciels ou équipements n'ayant pas fait l'objet de correctifs de sécurité de vulnérabilités connues. Une telle attaque peut n'avoir aucun impact visible pour le propriétaire du site mais susciter des impacts forts pour les utilisateurs. L'usurpation d'accès d'administrateurs peut également permettre l'envoi de messages malveillants paraissant légitimes aux utilisateurs du service.",
    },
    arnaques: {
      description: 'Arnaques',
      descriptionLongue: "Votre service peut être utilisé à des fins d'arnaques, par exemple, par la création d'un service imitant le vôtre ou envoyant des mails ou SMS ayant l'apparence de messages légitimes, en vue de subtiliser des données, extorquer de l'argent. L'inclusion de code malveillant dans un service numérique peut permettre d'afficher du contenu illicite comme des arnaques au faux support technique.",
    },
  },

  mesures: {
    identificationInterconnexions: {
      description: "Identifier les interconnexions avec d'autres systèmes essentiels",
    },
  },

  localisationsDonnees: {
    france: { description: 'France' },
    unionEuropeenne: { description: 'Union Européenne' },
    autre: { description: 'Autre' },
  },

  echeancesRenouvellement: {
    sixMois: { description: echeance('six mois'), expiration: expiration('six mois') },
    unAn: { description: echeance('un an'), expiration: expiration('un an') },
    deuxAns: { description: echeance('deux ans'), expiration: expiration('deux ans') },
  },
};
