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
};
