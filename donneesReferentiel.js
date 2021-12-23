const echeance = (duree) => `Dans ${duree}`;
const expiration = (duree) => `${duree.charAt(0).toUpperCase()}${duree.slice(1)} après signature de la présente homologation`;

module.exports = {
  seuilsCriticites: ['critique', 'eleve', 'moyen', 'faible'],

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
    newsletter: {
      description: 'Inscription à une newsletter',
      seuilCriticite: 'faible',
    },
    compte: {
      description: 'Création de compte (utilisateurs avec comptes)',
      seuilCriticite: 'faible',
    },
    formulaire: {
      description: 'Formulaire administratif ou démarche en ligne',
      seuilCriticite: 'faible',
    },
    questionnaire: {
      description: 'Questionnaires, sondages',
      seuilCriticite: 'faible',
    },
    reservation: {
      description: 'Outils de réservation (livres, places, salles, etc.)',
      seuilCriticite: 'faible',
    },
    paiement: {
      description: 'Paiement en ligne, conservation de données bancaires',
      seuilCriticite: 'eleve',
    },
    reseauSocial: {
      description: 'Réseau social, forum, commentaires',
      seuilCriticite: 'moyen',
    },
    visionconference: {
      description: 'Audio, visioconférence',
      seuilCriticite: 'moyen',
    },
    messagerie: {
      description: 'Messagerie instantanée',
      seuilCriticite: 'moyen',
    },
    emails: {
      description: "Envoi et réception d'emails",
      seuilCriticite: 'moyen',
    },
    documents: {
      description: 'Stockage de documents',
      seuilCriticite: 'moyen',
    },
    edition: {
      description: 'Édition collaborative (documents, murs collaboratifs, etc.)',
      seuilCriticite: 'moyen',
    },
    autre: {
      description: 'Autres fonctionnalités permettant des échanges de données',
      seuilCriticite: 'faible',
    },
  },

  donneesCaracterePersonnel: {
    contact: {
      description: 'Données de contact',
      exemple: 'mail, numéro de téléphone, adresse postale',
      seuilCriticite: 'faible',
    },
    identite: {
      description: "Données d'identité",
      exemple: "nom/prénom, pseudonyme, date de maissance, numéros de pièce d'identité, de sécurité sociale, etc.",
      seuilCriticite: 'faible',
    },
    situation: {
      description: 'Données relatives à la situation familiale, économique et financière',
      exemple: 'enfants',
      seuilCriticite: 'moyen',
    },
    localisation: {
      description: 'Données de localisation',
      exemple: 'adresse IP, identifiant de connexion, cookies',
      seuilCriticite: 'faible',
    },
    banque: {
      description: 'Données bancaires',
      exemple: 'nº de carte bancaire, établissement bancaire, etc.',
      seuilCriticite: 'eleve',
    },
    mineurs: {
      description: 'Données concernant des personnes mineures',
      seuilCriticite: 'eleve',
    },
    sensibiliteParticuliere: {
      description: 'Données particulièrement sensibles (santé, opinions, etc.)',
      exemple: 'données de santé, orientation sexuelle, origine raciale ou ethnique, opinions politiques ou religieuses',
      seuilCriticite: 'critique',
    },
  },

  delaisAvantImpactCritique: {
    immediat: {
      description: 'Immédiatement',
      seuilCriticite: 'critique',
    },
    uneHeure: {
      description: 'Une heure',
      seuilCriticite: 'eleve',
    },
    uneJournee: {
      description: 'Une journée',
      seuilCriticite: 'moyen',
    },
    uneSemaine: {
      description: 'Une semaine',
      seuilCriticite: 'faible',
    },
    unMois: {
      description: 'Un mois ou plus',
      seuilCriticite: 'faible',
    },
  },

  risques: {
    indisponibiliteService: {
      description: "Le service numérique et ses données sont tout ou en partie inaccessibles",
      descriptionLongue: "Votre service numérique est susceptible d’être concerné par ce risque si son indisponibilité peut avoir des conséquences graves sur le fonctionnement de l’organisation, de telle sorte qu’un attaquant pourrait chercher à en tirer un avantage financier – via une demande de rançon – ou à nuire au fonctionnement de votre organisation ou à sa réputation. Par exemple, <a href='les données d’un hôpital public ont déjà été rendues inaccessibles par un rançongiciel'>https://www.lemonde.fr/pixels/article/2021/02/15/apres-celui-de-dax-l-hopital-de-villefranche-paralyse-par-un-rancongiciel_6070049_4408996.html</a>, qui constitue l’une des attaques les plus répandues aujourd’hui.",
    },
    donneesModifiees: {
      description: "Des informations concernant des utilisateurs sont modifiées ou supprimées",
      descriptionLongue: "Votre service numérique est susceptible d’être concerné par ce risque si celui-ci inclut des données dont la modification pourrait bénéficier à une ou plusieurs personnes ou à l’inverse leur porter préjudice, ou nuire à la réputation ou au fonctionnement de votre organisation. Par exemple, <a href='un attaquant a modifié les notes et le relevé d’assiduité d’élèves en leur faveur depuis l’espace numérique d’un établissement scolaire.'>https://www.europe1.fr/faits-divers/Un-collegien-pirate-son-proviseur-pour-modifier-ses-notes-en-ligne-781242</a>",
    },
    divulgationDonnees: {
      description: "Des informations sont divulguées publiquement",
      descriptionLongue: "Votre service numérique est susceptible d’être concerné par ce risque si celui-ci inclut des informations dont la divulgation publique pourrait porter préjudice aux personnes concernées et à la réputation de votre organisation. Par exemple, <a href='un attaquant a déjà diffusé publiquement des données à caractère personnel concernant plusieurs agents d’une collectivité.'>https://www.lagazettedescommunes.com/746159/les-donnees-personnelles-dagents-du-grand-annecy-diffusees-cinq-mois-apres-la-cyberattaque/?abo=1</a>",
    },
    defigurationSiteWeb: {
      description: 'Le service numérique est défiguré',
      descriptionLongue: "Votre service numérique est susceptible d’être concerné par ce risque si sa visibilité est à même d’être exploitée par des attaquants cherchant à diffuser des messages à des fins idéologiques, de revanche ou de simple dégradation. Ce risque est accru si des vulnérabilités facilement identifiables peuvent être exploitées. Par exemple, <a href='des messages ou des images à caractère terroriste ont déjà été affichés sur des sites internet français ainsi défigurés'>https://www.europe1.fr/technologies/plusieurs-sites-internet-francais-ont-ete-victimes-de-cyberattaques-4001200</a>. Votre service numérique peut aussi être concerné par ce risque si la modification discrète des informations affichées peut nuire à des utilisateurs ou à la réputation de votre organisation.",
    },
    arnaques: {
      description: 'Des informations dérobées sont utilisées à des fins d’escroquerie',
      descriptionLongue: "Votre service numérique est susceptible d’être concerné par ce risque si celui-ci inclut des informations pouvant être réutilisées à des fins malveillantes, la plupart du temps motivées par le gain financier. Par exemple par leur <a href='revente'>https://www.hashtagg.fr/2021/03/07/le-business-des-donnees-revendues-sur-le-dark-web/</a> sur le dark web, à des fins <a href='d’arnaque'>https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/violation-donnees-ap-hp-formulaire-lettre-plainte-electronique</a>, de spam, d’usurpation d’identité ou pour mener d’autres attaques telles que des campagnes de <a href='hameçonnage'>https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/hameconnage-assurance-maladie-ameli</a>.",},
    },
    logicielsMalveillants: {
      description: 'Le service numérique est détourné de son usage initial',
      descriptionLongue: "Votre service numérique est susceptible d’être concerné par ce risque si ses capacités techniques ou encore ses utilisateurs sont susceptibles d’intéresser un attaquant souhaitant mener d’autres actions malveillantes la plupart du temps à des fins de gain financier. Ce risque est accru si des vulnérabilités facilement identifiables peuvent être exploitées. Par exemple, le détournement de la puissance de votre service peut permettre de miner des crypto-monnaies ou <a href='l’introduction d’un logiciel malveillant visant à infecter des utilisateurs du service'>https://business.lesechos.fr/directions-numeriques/technologie/cybersecurite/0602985980097-de-nombreux-hackers-utilisent-le-covid-19-a-des-fins-malveillantes-336176.php</a> peut permettre de dérober des informations.",
    },
    surveillance: {
      description: 'Le contenu d’échanges est intercepté',
      descriptionLongue: "Votre service numérique est susceptible d’être concerné par ce risque si l’interception du contenu d’échanges entre agents publics ou avec des usagers peut intéresser des acteurs malveillants à des fins de renseignement, d’espionnage économique. Par exemple, les échanges entre de jeunes entreprises technologiques et une administration soutenant ces dernières pourraient donner accès à des informations privilégiées à de potentiels concurrents sur les « pépites » françaises.",
  },

  categoriesMesures: {
    gouvernance: 'Gouvernance',
    protection: 'Protection',
    defense: 'Défense',
    resilience: 'Résilience',
  },

  statutsMesures: {
    fait: 'Fait',
    planifie: 'Planifié',
    nonFait: 'Non fait',
    nonRetenu: 'Non concerné',
  },

  mesures: {
    limitationInterconnexions: {
      description: "Identifier et limiter les interconnexions du service avec d'autres systèmes",
      categorie: 'gouvernance',
    },
    listeEquipements: {
      description: "Disposer d'une liste à jour des équipements et logiciels contribuant au fonctionnement du service",
      categorie: 'gouvernance',
    },
    identificationDonneesSensibles: {
      description: 'Identifier les données les plus sensibles à protéger',
      categorie: 'gouvernance',
      indispensable: true,
    },
    contactSecurite: {
      description: 'Rendre public un contact pour signaler un problème de sécurité',
      categorie: 'gouvernance',
    },
    exigencesSecurite: {
      description: 'Connaître les exigences de sécurité incombant aux sous-traitants du service',
      categorie: 'gouvernance',
    },
    modalitesSuivi: {
      description: 'Fixer les modalités du suivi de la sécurité du service entre les parties prenantes',
      categorie: 'gouvernance',
    },
    hebergementUE: {
      description: "Héberger le service au sein de l'Union européenne",
      categorie: 'gouvernance',
      indispensable: true,
    },
    secNumCloud: {
      description: "Héberger le service au sein d'un Cloud qualifié SecNumCloud",
      categorie: 'gouvernance',
    },
    interdictionParageVente: {
      description: 'Proscrire le partage ou la vente de données des utilisateurs du service à des tierces parties à des fins commerciales',
      categorie: 'gouvernance',
      indispensable: true,
    },
    sensibilisationRisques: {
      description: 'Réaliser des actions régulières de sensibilisation des agents aux risques numériques',
      categorie: 'gouvernance',
    },
    consignesSecurite: {
      description: "Fixer et sensibiliser les agents aux consignes de sécurité liées à l'utilisation du service",
      categorie: 'gouvernance',
      indispensable: true,
    },

    deconnexionAutomatique: {
      description: 'Mettre en place la déconnexion automatique des sessions utilisateurs après une certaine durée',
      categorie: 'protection',
      indispensable: true,
    },
    accesSecurise: {
      description: 'Prévoir un accès sécurisé des utilisateurs à leur compte',
      categorie: 'protection',
      indispensable: true,
    },
    franceConnect: {
      description: 'Permettre la connexion des utilisateurs via FranceConnect',
      categorie: 'protection',
    },
    listeComptesPrivilegies: {
      description: "Disposer d'une liste à jour des comptes disposant d'un d'accès privilégié au service",
      categorie: 'protection',
      indispensable: true,
    },
    gestionComptesAcces: {
      description: "Mettre en oeuvre une procédure de gestion des comptes d'accès",
      categorie: 'protection',
    },
    dissocierComptesAdmin: {
      description: 'Dissocier les accès, les comptes et les privilèges des agents à la fois utilisateurs et administrateurs',
      categorie: 'protection',
      indispensable: true,
    },
    limitationCreationComptes: {
      description: "Limiter la création de compte d'accès aux seuls comptes nominatifs",
      categorie: 'protection',
      indispensable: true,
    },
    doubleAuthentAdmins: {
      description: 'Prévoir la double authentification des administrateurs au service',
      categorie: 'protection',
      indispensable: true,
    },
    limitationAccesAdmin: {
      description: 'Limiter au strict nécessaire les accès administrateurs et tenir la liste à jour',
      categorie: 'protection',
      indispensable: true,
    },
    certificatChiffrement: {
      description: "Chiffrer le trafic avec l'utilisation d'un certificat conforme au référentiel général de sécurité",
      categorie: 'protection',
      indispensable: true,
    },
    differentiationFiltrage: {
      description: 'Différencier le filtrage des accès utilisateurs, agents et administrateurs',
      categorie: 'protection',
    },
    nomsDomaineSimilaires: {
      description: 'Acheter plusieurs noms de domaine proches du nom de domaine du service',
      categorie: 'protection',
    },
    securisationCode: {
      description: "Mettre en oeuvre des bonnes pratiques de sécurisation du code, comme celles de l'OWASP",
      categorie: 'protection',
      indispensable: true,
    },
    auditsSecurite: {
      description: "Prévoir l'organisation de contrôles et d'audits de sécurité réguliers",
      categorie: 'protection',
    },
    parefeu: {
      description: 'Installer un parefeu',
      categorie: 'protection',
      indispensable: true,
    },
    chiffrementFlux: {
      description: 'Désactiver tout flux non chiffré.',
      categorie: 'protection',
      indispensable: true,
    },
    protectionDeniService: {
      description: 'Souscrire à un service de protection contre les attaques de déni de service',
      categorie: 'protection',
    },
    hebergementMachineVirtuelle: {
      description: 'Héberger le service dans une machine virtuelle',
      categorie: 'protection',
      indispensable: true,
    },
    chiffrementMachineVirtuelle: {
      description: 'Chiffrer la machine virtuelle',
      categorie: 'protection',
    },
    misesAJour: {
      description: "Disposer d'une politique d'application des mises à jour fonctionnelles et de sécurité du service",
      categorie: 'protection',
      indispensable: true,
    },
    versionRecente: {
      description: "Utiliser une version récente des éléments applicatifs composant le service toujours maintenus par l'éditeur",
      categorie: 'protection',
      indispensable: true,
    },
    moindrePrivilege: {
      description: 'Configurer les applicatifs selon la règle du moindre privilège',
      categorie: 'protection',
      indispensable: true,
    },
    configurationMinimaliste: {
      description: 'Configurer le service selon la règle de la configuration minimaliste',
      categorie: 'protection',
      indispensable: true,
    },
    telechargementsOfficiels: {
      description: "Permettre exclusivement le téléchargement d'une application mobile depuis les magasins officiels",
      categorie: 'protection',
      indispensable: true,
    },

    gestionIncidents: {
      description: 'Définir une procédure de gestion des incidents de sécurité',
      categorie: 'defense',
      indispensable: true,
    },
    journalAcces: {
      description: "Disposer d'un journal de tous les accès",
      categorie: 'defense',
      indispensable: true,
    },
    notificationConnexionsSuspectes: {
      description: 'Envoyer aux administrateurs et utilisateurs une notification en cas de connexion suspecte',
      categorie: 'defense',
    },
    supervision: {
      description: 'Recourir à un service de supervision de la sécurité',
      categorie: 'defense',
    },
    testsProcedures: {
      description: "Tester régulièrement les procédures de gestion d'incident",
      categorie: 'defense',
    },
    affichageDerniereConnexion: {
      description: "Afficher aux utilisateurs l'heure et la date de leur dernière connexion",
      categorie: 'defense',
    },

    exerciceGestionCrise: {
      description: 'Planifier un exercice de gestion de crise, notamment face au risque de rançongiciel',
      categorie: 'resilience',
    },
    politiqueInformation: {
      description: "Disposer d'une politique d'information des utilisateurs en cas d'incident",
      categorie: 'resilience',
    },
    sauvegardeDonnees: {
      description: 'Mettre en place une sauvegarde régulière des données dans un environnement non connecté au service',
      categorie: 'resilience',
      indispensable: true,
    },
    sauvegardeMachineVirtuelle: {
      description: 'Mettre en place une sauvegarde en continu de la machine virtuelle sur lequel est déployé le service.',
      categorie: 'resilience',
    },
    testsSauvegardes: {
      description: 'Tester régulièrement les sauvegardes',
      categorie: 'resilience',
      indispensable: true,
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
