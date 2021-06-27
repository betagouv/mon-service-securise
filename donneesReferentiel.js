module.exports = {
  naturesService: {
    siteInternet: 'Site Internet',
    applicationMobile: 'Application Mobile',
    api: 'API',
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
    newsletter: 'Inscription à une newsletter',
    compte: 'Création de compte (utilisateurs avec comptes)',
    formulaire: 'Formulaire administratif ou démarche en ligne',
    questionnaire: 'Questionnaires, sondages',
    reservation: 'Outils de réservation (livres, places, salles, etc.)',
    paiement: 'Paiement en ligne, conservation de données bancaires',
    reseauSocial: 'Réseau social, forum, commentaires',
    visionconference: 'Audio, visioconférence',
    messagerie: 'Messagerie instantanée',
    emails: "Envoi et réception d'emails",
    documents: 'Stockage de documents',
    edition: 'Édition collaborative (documents, murs collaboratifs, etc.)',
    autre: 'Autres fonctionnalités permettant des échanges de données (préciser)',
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
};
