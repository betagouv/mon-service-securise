const { departements } = require('./donneesReferentielDepartements');

const recommandationPoursuiteRenforcement =
  "L'ANSSI recommande la poursuite du renforcement de la sécurité du service numérique.";

const expiration = (duree) =>
  `${duree.charAt(0).toUpperCase()}${duree.slice(
    1
  )} après signature de la présente homologation`;

module.exports = {
  indiceCyber: {
    coefficientIndispensables: 0.6,
    coefficientRecommandees: 0.4,
    noteMax: 5,
  },

  nouvellesFonctionnalites: [
    {
      id: 'tableauDeBord',
      fichierPug: 'tableauDeBord.pug',
      dateDeDeploiement: '2023-06-20',
    },
    {
      id: 'menuNavigation',
      fichierPug: 'menuNavigation.pug',
      dateDeDeploiement: '2023-08-30',
    },
  ],

  nombreOrganisationsUtilisatrices: [
    { label: 'Mon organisation uniquement', borneBasse: 1, borneHaute: 1 },
    { label: '2', borneBasse: 2, borneHaute: 2 },
    { label: '3', borneBasse: 3, borneHaute: 3 },
    { label: '4', borneBasse: 4, borneHaute: 4 },
    { label: 'entre 5 et 10', borneBasse: 5, borneHaute: 10 },
    { label: 'entre 11 et 50', borneBasse: 11, borneHaute: 50 },
    { label: 'entre 51 et 100', borneBasse: 51, borneHaute: 100 },
    { label: 'entre 101 et 500', borneBasse: 101, borneHaute: 500 },
    { label: 'entre 501 et 1 000', borneBasse: 501, borneHaute: 1000 },
    { label: 'entre 1 001 et 5 000', borneBasse: 1001, borneHaute: 5000 },
    { label: 'plus de 5 000', borneBasse: 5001, borneHaute: 5001 },
  ],

  tranchesIndicesCybers: [
    {
      borneInferieure: 0,
      borneSuperieure: 1,
      recommandationANSSI:
        "L'homologation du service est déconseillée ou devrait être limitée à <b>6 mois</b>.",
      recommandationANSSIComplement:
        "L'ANSSI recommande de renforcer la sécurité du service numérique avant de procéder à son homologation.",
      deconseillee: true,
      dureeHomologationConseillee: '6 mois',
      conseilHomologation: 'Homologation déconseillée',
      description: "Très insuffisant lorsqu'il est < 1",
    },
    {
      borneInferieure: 1,
      borneSuperieure: 2,
      recommandationANSSI:
        "L'homologation du service est déconseillée ou devrait être limitée à <b>6 mois</b>.",
      recommandationANSSIComplement:
        "L'ANSSI recommande de renforcer la sécurité du service numérique avant de procéder à son homologation.",
      deconseillee: true,
      dureeHomologationConseillee: '6 mois',
      conseilHomologation: 'Homologation déconseillée',
      description: "Insuffisant lorsqu'il est < 2",
    },
    {
      borneInferieure: 2,
      borneSuperieure: 3,
      recommandationANSSI:
        "La durée d'homologation du service devrait être limitée à <b>1 an</b>.",
      recommandationANSSIComplement: recommandationPoursuiteRenforcement,
      dureeHomologationConseillee: '1 an',
      conseilHomologation: 'Continuer à renforcer la sécurité du service',
      description: "Modéré lorsqu'il est < 3",
    },
    {
      borneInferieure: 3,
      borneSuperieure: 4,
      recommandationANSSI:
        "La durée d'homologation du service peut aller jusqu'à <b>2 ans</b>.",
      recommandationANSSIComplement: recommandationPoursuiteRenforcement,
      dureeHomologationConseillee: '2 ans',
      conseilHomologation: 'Continuer à renforcer la sécurité du service',
      description: "Bon lorsqu'il est < 4",
    },
    {
      borneInferieure: 4,
      borneSuperieure: 5,
      borneSuperieureIncluse: true,
      recommandationANSSI:
        "La durée d'homologation du service peut aller jusqu'à <b>3 ans</b>.",
      recommandationANSSIComplement: recommandationPoursuiteRenforcement,
      dureeHomologationConseillee: '3 ans',
      description: 'Très bon entre 4 et 5',
    },
  ],

  statutsAvisDossierHomologation: {
    favorable: { description: 'Favorable' },
    favorableAvecReserve: { description: 'Favorable avec réserve' },
    defavorable: { description: 'Défavorable' },
  },

  statutsHomologation: {
    expiree: { libelle: 'Expirée', ordre: 0 },
    bientotExpiree: { libelle: 'Bientôt expirée', ordre: 1 },
    nonRealisee: { libelle: 'Non réalisée', ordre: 3 },
    bientotActivee: { libelle: 'Bientôt activée', ordre: 4 },
    activee: { libelle: 'Active', ordre: 5 },
  },

  typesService: {
    siteInternet: { description: 'Site Internet' },
    applicationMobile: { description: 'Application Mobile' },
    api: { description: "API mise à disposition par l'organisation" },
  },

  provenancesService: {
    developpement: {
      description: "Développé pour les besoins de l'organisation",
      exemple:
        "application mobile ou site développé de A à Z par une agence web ou à partir de briques existantes adaptées aux besoins de l'organisation",
    },
    outilExistant: {
      description: "Déployé à partir d'un outil existant",
      exemple:
        "outil métier proposé à l'achat par un éditeur ou gratuit et déployé au profit de l'organisation",
    },
    achat: {
      description: 'Proposé en ligne par un fournisseur',
      exemple:
        'service standard disponible en ligne (SaaS), gratuitement ou via souscription, développé et déployé mis à disposition par un fournisseur',
    },
  },

  statutsDeploiement: {
    enProjet: {
      description: 'En projet',
    },
    enCours: {
      description: 'En cours de développement ou de déploiement',
    },
    enLigne: {
      description: 'En ligne et accessible aux usagers et/ou agents',
    },
  },

  fonctionnalites: {
    newsletter: {
      description: 'Inscription à une newsletter',
    },
    questionnaire: {
      description: 'Questionnaires, sondages',
    },
    reseauSocial: {
      description: 'Réseau social, forum, commentaires',
    },
    visionconference: {
      description: 'Audio, visioconférence',
    },
    paiement: {
      description: 'Paiement en ligne',
    },
    signatureElectronique: {
      description: 'Dispositif de signature électronique',
    },
    compte: {
      description: 'Création de compte (utilisateurs avec comptes)',
    },
    messagerie: {
      description: 'Messagerie instantanée',
    },
    emails: {
      description: "Envoi et réception d'emails",
    },
    documents: {
      description: 'Stockage de documents',
    },
    formulaire: {
      description: 'Formulaire administratif ou démarche en ligne',
    },
    edition: {
      description:
        'Édition collaborative (documents, murs collaboratifs, etc.)',
    },
    reservation: {
      description: 'Outils de réservation (livres, places, salles, etc.)',
    },
  },

  donneesCaracterePersonnel: {
    contact: {
      description: 'Données de contact',
      exemple: 'mail, numéro de téléphone, adresse postale.',
    },
    identite: {
      description: "Données d'identité",
      exemple: 'nom/prénom, pseudonyme, date de naissance.',
    },
    document: {
      description: "Documents d'identité et autres documents officiels",
      exemple: 'photo de passeport, titre de séjour.',
    },
    situation: {
      description:
        'Données relatives à la situation familiale, économique et financière',
      exemple: 'revenus, état civil.',
    },
    localisation: {
      description: 'Données de localisation',
      exemple: 'adresse IP, identifiant de connexion, cookies.',
    },
    banque: {
      description: 'Données de paiement',
      exemple: 'nº de carte bancaire.',
    },
    mineurs: {
      description: 'Données concernant des personnes mineures',
    },
    sensibiliteParticuliere: {
      description: 'Données de santé',
    },
  },

  delaisAvantImpactCritique: {
    moinsUneHeure: {
      description: "Moins d'une heure",
    },
    uneJournee: {
      description: 'Une journée',
    },
    plusUneJournee: {
      description: "Plus d'une journée",
    },
  },

  niveauxGravite: {
    nonConcerne: {
      position: 0,
      couleur: 'blanc',
      description: 'Non concerné',
      descriptionLongue: '',
      important: false,
      nonConcerne: true,
    },
    minime: {
      position: 1,
      couleur: 'vert',
      description: 'Minime',
      descriptionLongue: `
        Aucun impact opérationnel ni sur les performances de l'activité ni sur
        la sécurité des personnes et des biens. L'organisation surmontera la
        situation sans trop de difficultés (consommation des marges)
      `,
      important: false,
    },
    significatif: {
      position: 2,
      couleur: 'jaune',
      description: 'Significatif',
      descriptionLongue: `
        Dégradation des performances de l'activité sans impact sur la sécurité
        des personnes et des biens. L'organisation surmontera la situation
        malgré quelques difficultés (fonctionnement en mode dégradé)
      `,
      important: true,
    },
    grave: {
      position: 3,
      couleur: 'orange',
      description: 'Grave',
      descriptionLongue: `
        Forte dégradation des performances de l'activité, avec d'éventuels
        impacts significatifs sur la sécurité des personnes et des biens.
        L'organisation surmontera la situation avec de sérieuses difficultés
        (fonctionnement en mode très dégradé), sans impacts sectoriel ou
        étatique
      `,
      important: true,
    },
    critique: {
      position: 4,
      couleur: 'rouge',
      description: 'Critique',
      descriptionLongue: `
        Incapacité pour l'organisation d'assurer la totalité ou une partie de
        son activité, avec d'éventuels impacts graves sur la sécurité des
        personnes et des biens. L'organisation ne surmontera vraisemblablement
        pas la situation (sa survie est menacée), les secteurs d'activité ou
        étatiques dans lesquels elle opère seront susceptibles d'être
        légèrement impactés, sans conséquences durables
      `,
      important: true,
    },
  },

  risques: {
    indisponibiliteService: {
      description:
        'Indisponibilité partielle ou totale du service numérique pendant plusieurs heures à quelques jours',
      descriptionLongue: `
        L'indisponibilité du service numérique signifie que certaines fonctionnalités ou que la totalité du service
        n'est plus accessible aux usagers et/ou aux agents publics.<br>Par exemple :<li>Un service numérique connaît
        une panne suite à une attaque de type « déni de service » : un message d'erreur est susceptible de s'afficher en
        lieu et place de la page d'accueil pour un site web.</li><li>Un service numérique devient inaccessible, suite à
        une attaque de type rançongiciel, contre la fausse-promesse de leur restitution en cas de paiement d'une rançon.
        Cette attaque est l'une des plus courantes et a déjà frappé de nombreuses collectivités et entités publiques.</li>
      `,
      definition:
        "L'indisponibilité du service numérique signifie que certaines fonctionnalités ou que la totalité du service n'est plus accessible aux usagers et/ou aux agents publics.",
    },
    donneesModifiees: {
      description:
        "Suppression ou modification d'informations concernant des usagers ou des agents publics",
      descriptionLongue:
        "Ce risque signifie que des informations appartenant à des usagers ou à des agents publics sont supprimées en partie ou en totalité par un attaquant ou sont modifiées en leur avantage ou en leur défaveur.<br>Par exemple : <li>Des documents téléversés par des usagers dans le cadre d'une démarche en ligne sont supprimés en partie ou en totalité.</li><li>Un élève modifie ses notes sur un espace numérique de travail (ENT) après avoir dérobé ou deviné l'identifiant et le mot de passe d'un enseignant.</li>",
      definition:
        'Ce risque signifie que des informations appartenant à des usagers ou à des agents publics sont supprimées en partie ou en totalité par un attaquant ou sont modifiées en leur avantage ou en leur défaveur.',
    },
    divulgationDonnees: {
      description:
        "Divulgation publique d'informations dérobées concernant des usagers ou des agents publics",
      descriptionLongue:
        "Ce risque signifie que des informations concernant des usagers ou des agents publics, traitées dans le cadre du service numérique, sont dérobées par un attaquant puis rendues publiques pour porter préjudice aux personnes concernées et/ou nuire à la réputation de l'entité. <br>Par exemple :<li>La liste de bénéficiaires d'une aide publique et de leurs coordonnées est divulguée sur internet.</li> <li>L'adresse mail des personnes ayant signalé des incivilités sur la voirie via une application dédiée est divulguée sur internet.</li><li>La divulgation des votes des habitants d'une commune s'étant exprimés dans le cadre d'une consultation publique en ligne.</li>",
      definition:
        "Ce risque signifie que des informations concernant des usagers ou des agents publics, traitées dans le cadre du service numérique, sont dérobées par un attaquant puis rendues publiques pour porter préjudice aux personnes concernées et/ou nuire à la réputation de l'entité.",
    },
    defigurationSiteWeb: {
      description: "Défiguration visible de l'apparence du service numérique",
      descriptionLongue:
        "La défiguration d'un service numérique signifie que son apparence est modifiée de manière visible par l'ajout de messages ou d'images, le plus souvent à caractère idéologique, ou à des fins de simples détérioration en vue de nuire à la réputation de l'entité publique.<br>Par exemple :<li>Une image satirique apparaît sur la page d'accueil d'un service numérique.</li><li>Des messages de protestation contre la politique d'une collectivité sont insérés sur plusieurs pages du service numérique.</li>",
      definition:
        "La défiguration d'un service numérique signifie que son apparence est modifiée de manière visible par l'ajout de messages ou d'images, le plus souvent à caractère idéologique, ou à des fins de simples détérioration en vue de nuire à la réputation de l'entité publique.",
    },
    arnaques: {
      description:
        "Vol d'informations concernant des usagers ou des agents publics à des fins d'escroquerie",
      descriptionLongue: `
        Ce risque signifie que des informations traitées dans le cadre du service numérique sont dérobées par un attaquant,
        le plus souvent à des fins d'usurpation d'identité ou de gain financier.<br>Par exemple :
        <li>Des moyens de paiement stockés sur le service numérique (ex. numéro de carte bancaire) sont volés en vue de les
        revendre sur internet ou de procéder à des achats illicites.</li><li>Les coordonnées d'usagers ou d'agents publics
        (ex.email, adresse, numéro de téléphone) sont volées en vue de mener des campagnes de
        <a href="https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/spam-electronique">spam</a> ou de
        <a href="https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/hameconnage-phishing">hameçonnage</a>.</li>
        <li>Des documents officiels d'identité sont volés à des fins d'usurpation d'identité.</li>
      `,
      definition: `
        Ce risque signifie que des informations traitées dans le cadre du service numérique sont dérobées par un attaquant,
        le plus souvent à des fins d'usurpation d'identité ou de gain financier.
      `,
    },
    logicielsMalveillants: {
      description:
        "Détournement de l'usage du service numérique en vue de conduire des activités non prévues pour ce dernier",
      descriptionLongue:
        "Ce risque signifie que le service numérique est utilisé de manière discrète et illicite afin de conduire des activités ne correspondant pas à sa finalité, la plupart du temps à des fins de gain financier.<br>Par exemple :<li>La puissance d'un service numérique est utilisée dans le but de mener une activité de minage de cryptomonnaie.</li><li>Un logiciel malveillant est introduit sur la page d'accueil d'un service numérique afin d'infecter les équipements informatiques des usagers et/ou des agents publics en vue d'accéder à leurs données ou de mener une autre attaque (ex.rançongiciel).</li>",
      definition:
        'Ce risque signifie que le service numérique est utilisé de manière discrète et illicite afin de conduire des activités ne correspondant pas à sa finalité, la plupart du temps à des fins de gain financier.',
    },
    surveillance: {
      description:
        "Vol de données ou interception d'échanges à des fins de renseignement",
      descriptionLongue:
        "Ce risque signifie que des échanges entre agents publics ou avec des usagers sont interceptés ou que des documents sont dérobés, le plus souvent à des fins de renseignement économique ou politique.<br> Par exemple :<li>Des documents concernant des candidatures à un marché public avant la date finale de dépôt des dossiers sont dérobés par des concurrents afin d'en tirer un avantage concurrentiel.</li><li>Des échanges entre agents publics et entreprises technologiques sont interceptés via la messagerie d'une plateforme permettant l'attribution d'aides publiques, à des fins d'intelligence économique.</li>",
      definition:
        'Ce risque signifie que des échanges entre agents publics ou avec des usagers sont interceptés ou que des documents sont dérobés, le plus souvent à des fins de renseignement économique ou politique.',
    },
  },

  categoriesMesures: {
    gouvernance: 'Gouvernance',
    protection: 'Protection',
    defense: 'Défense',
    resilience: 'Résilience',
  },

  statutsMesures: {
    fait: 'Faite',
    enCours: 'Partielle',
    nonFait: 'Non prise en compte',
  },

  articlesDefinisReferentielsMesure: {
    ANSSI: "l'",
    CNIL: 'la ',
  },

  mesures: {
    analyseRisques: {
      description:
        'Réaliser une analyse de risque de la sécurité du service numérique',
      categorie: 'gouvernance',
      descriptionLongue:
      "<p>Conduire ou se faire accompagner dans la réalisation d'une analyse des risques pour la sécurité du service. L'ANSSI recommande de s'appuyer pour cela sur la méthode EBIOS Risk manager.</p>" + 
      "<p>Pour évaluer l'impact des risques les plus courants, utilisez l'outil proposé par MonServiceSécurisé.</p>" +
      "<p>Cette mesure permet de mettre en place de mesures de sécurité adaptées permettant de diminuer la probabilité de survenue des risques que l'organisation choisira d'adresser.</p>",
      referentiel: 'ANSSI',
    },
    audit: {
      description: 'Réaliser un audit de la sécurité du service',
      categorie: 'gouvernance',
      descriptionLongue:
        "<p>Faire réaliser un audit de la sécurité du service. Les audits réalisés par des prestataires qualifiés par l'ANSSI (PASSI) incluent un audit d'architecture, de code, de configuration et un test d'intrusion.</pr>" +
        "<p>Cette mesure permet d'identifier les vulnérabilités du service et les mesures de sécurité spécifiques à mettre en œuvre en vue de les corriger et ainsi renforcer significativement sa sécurité.</p>",
      referentiel: 'ANSSI',
    },
    auditsSecurite: {
      description:
        "Planifier l'organisation de contrôles et d'audits de sécurité réguliers",
      categorie: 'gouvernance',
      descriptionLongue:
        "<p>Organiser des contrôles de sécurité et d'audits à intervalle régulier, par exemple, avant arrivée à échéance de la dernière homologation de sécurité.</p>" +
        "<p>Cette mesure permet d'assurer un suivi de la sécurité du service dans la durée et à permettre de corriger, le cas échéant, de nouvelles vulnérabilités identifiées.</p>",
      referentiel: 'ANSSI',
    },
    consignesSecurite: {
      description:
        "Sensibiliser les administrateurs aux consignes de sécurité liées à l'utilisation du service",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>Diffuser les mesures de sécurité du service devant être suivies par les administrateurs technique et métier (ex. agents publics chargés de mettre à jour le contenu du service ou accédant aux données de ce dernier).</p>" +
        "<p>Fixer, de besoin, des consignes spécifiques additionnelles relatives à leur utilisation du service. Sensibiliser régulièrement les administrateurs aux bonnes pratiques de sécurité informatique.</p>"+
        "<p>Cette mesure vise à impliquer les agents dans la mise en œuvre des mesures prévues pour sécuriser le service et à accroître leur vigilance et leurs réflexes en cas de situation à risque.</p>",
      referentiel: 'ANSSI',
    },
    contactSecurite: {
      description:
        'Rendre public une procédure permettant de signaler un problème de sécurité',
      categorie: 'gouvernance',
      descriptionLongue:
        "<p>Fournir publiquement une procédure permettant à une personne ou à une entité de signaler un problème de sécurité concernant le service numérique. <br>Cette procédure doit préciser les conditions dans lesquelles un problème de sécurité peut être identifié et signalé et fournir un moyen non nominatif de contacter l'équipe en charge du service ou de sa sécurité (ex. email, formulaire de contact).</p>" +
        "<p>Cette mesure facilite l'identification et le traitement de problèmes de sécurité concernant le service.</p>",
      referentiel: 'ANSSI',
    },
    exigencesSecurite: {
      description:
        'Fixer et/ou identifier les exigences de sécurité incombant aux prestataires',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>En cas de recours à des prestataires, fixer, dès les clauses contractuelles, les exigences de sécurité à respecter. Dans le cas où ces exigences ne peuvent pas être fixées a priori (ex. produit obtenu sur étagère), identifier l'ensemble des exigences de sécurité que s'engagent à respecter les prestataires.</p>" +
        "<p>Cette mesure permet d'éclairer la sélection des prestataires en fonction des garanties de sécurité que ces derniers s'engagent à respecter.</p>",
      referentiel: 'ANSSI',
    },
    hebergementUE: {
      description:
        "Héberger le service numérique et les données au sein de l'Union européenne",
      categorie: 'gouvernance',
      descriptionLongue:
        "<p>Privilégier le recours à un hébergeur proposant la localisation au sein de l'Union européenne du service numérique et des données.</p>" +
        "<p>Cette mesure vise à renforcer la protection des données grâce aux garanties offertes par la réglementation européenne et à faciliter les actions de remédiation et d'investigation en cas d'incident de sécurité.</p>",
      referentiel: 'ANSSI',
    },
    identificationDonneesSensibles: {
      description: 'Identifier les données importantes à protéger',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>Lister l'ensemble des données à protéger en priorité (ex. données sensibles) et identifier leur localisation (technique et géographique).</p>" +
        "<p>Cette mesure permet de connaître les données les plus sensibles à protéger, d'évaluer l'impact de leur compromission et d'identifier, de besoin, des mesures de sécurité spécifiques à mettre en œuvre en vue de les protéger.</p>",
      referentiel: 'ANSSI',
    },
    limitationInterconnexions: {
      description:
        "Limiter et connaître les interconnexions entre le service numérique et d'autres systèmes d'information",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>Configurer le service en vue de limiter, au strict nécessaire, ses interconnexions avec d'autres systèmes d'information et tenir une cartographie à jour de l'ensemble de ces interconnexions.</p>" +
        "<p>Cette mesure permet de réduire le risque de propagation d'une cyberattaque de ces systèmes vers le service et inversement.</p>",
      referentiel: 'ANSSI',
    },
    listeComptesPrivilegies: {
      description:
        "Disposer d'une liste à jour des comptes disposant d'un accès privilégié au service",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>Disposer et tenir à jour une liste des comptes disposant d'un accès administrateur au service, les personnes associées et la nature de leur(s) accès.</p>" +
        "<p>Sont concernés par cette mesure les administrateurs techniques (ex. accès à la configuration de l'hébergement du service) et les administrateurs métiers (ex. agent public ayant un droit de modification des informations affichées sur le service).</p>" +
        "<p>Cette mesure permet de gérer la liste des comptes disposant d'un accès privilégié en vue d'en limiter le nombre au strict nécessaire et ainsi réduire le risque que des comptes non nécessaires soient détournés par un acteur malveillant.</p>",
      referentiel: 'ANSSI',
    },
    listeEquipements: {
      description:
        "Disposer d'une liste à jour des équipements et des applicatifs contribuant au fonctionnement du service numérique",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>Créer et tenir à jour un registre des équipements et des applicatifs (ex. serveurs de base de données, annuaires, pare-feu, systèmes de gestion de contenu) participant au fonctionnement du service numérique.</p>" +
        "<p>Cette mesure est nécessaire afin d'assurer la gestion des mises à jour fonctionnelles et de sécurité du service, indispensables au maintien de la sécurité du service.</p>",
      referentiel: 'ANSSI',
    },
    secNumCloud: {
      description:
        "Recourir à un prestataire d'informatique en nuage qualifié SecNumCloud",
      categorie: 'gouvernance',
      descriptionLongue:
        "<p>Privilégier le recours à un prestataire de service en nuage (Cloud) qualifié SecNumCloud par l'ANSSI.</p>" +
        "<p>Cette mesure permet d'apporter des garanties élevées en matière de confiance et de sécurité de l'hébergement du service et de ses données.</p>",
      referentiel: 'ANSSI',
    },
    testIntrusion: {
      description:
        "Réaliser un test d'intrusion ou une campagne de recherche de bug",
      categorie: 'gouvernance',
      descriptionLongue:
        "<p>Faire réaliser un test d'intrusion et/ou une campagne de recherche de bug (bug bounty) du service, par un prestataire ou par un service compétent.</p>" +
        "<p>Cette mesure permet d'identifier des vulnérabilités du service en vue de les corriger et ainsi renforcer sa sécurité.</p>",
      referentiel: 'ANSSI',
    },
    verificationAutomatique: {
      description:
        'Procéder à des vérifications techniques automatiques de la sécurité du service',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>Lors du développement du service et, autant que possible, dans le cas de l'achat d'un service sur étagère, procéder à des tests techniques automatiques de la sécurité du service.</p>" +
        "<p>Cette mesure permet de vérifier rapidement l'existence de vulnérabilités non corrigées parmi les vulnérabilités les plus connues.</p>",
      referentiel: 'ANSSI',
    },
    registreTraitements: {
      description: 'Remplir le registre des traitements et le tenir à jour',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        'Rapprochez-vous de votre DPD ou de l’équipe juridique pour compléter le registre avec les 6 informations suivantes :' +
        '<ul>' +
        '<li>les parties prenantes (responsable de traitement, sous-traitants, catégories de destinataires) qui interviennent dans le traitement des données,</li>' +
        '<li>les catégories de données traitées et de personnes concernées,</li>' +
        '<li>le but poursuivi (ce que vous faites des données),</li>' +
        '<li>qui a accès aux données et à qui elles sont communiquées,</li>' +
        '<li>combien de temps vous les conservez,</li>' +
        '<li>comment elles sont sécurisées.</li>' +
        '</ul>' +
        'Plus d’information <a href="https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement" target="_blank">ici</a>.' +
        '<p>' +
        'Le registre est prévu par l’article 30 du RGPD, c’est un outil global avec votre organisme il participe à la documentation de la conformité. Document de recensement et d’analyse, il doit refléter la réalité de vos traitements de données personnelles.</p>',
      referentiel: 'CNIL',
    },
    minimisationCollecteDonnees: {
      description:
        'Minimiser la collecte des données à caractère personnel au strict nécessaire',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "<p>Evaluer le but de chaque collecte de données. Ne collecter que les données strictement nécessaires pour atteindre votre objectif. Il ne faut pas collecter des données inutiles pour votre traitement en se disant qu’elles pourraient servir plus tard. <br>Lorsque trop de données sont collectées, il faut immédiatement supprimer les données non-nécessaires.</p>" +
        "<p>Cette mesure limite la collecte des données personnelles uniquement aux informations essentielles pour réaliser un objectif spécifique. Cela réduit les risques liés à la gestion des données et renforce la protection de la vie privée des personnes.</p>",
      referentiel: 'CNIL',
    },
    dureeLimiteeConservationDonnees: {
      description:
        'Déterminer une durée limitée de traitement et de conservation des données à caractère personnel au strict nécessaire',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        '<p>Ne conserver les données en « base active » (ou environnement de production) que le temps strictement nécessaire à la réalisation de l’objectif poursuivi. <br>Il faut ensuite détruire ou anonymiser les données ou les archiver dans le respect des obligations légales applicables en matière de conservation des archives publiques. Vous pouvez consulter le <a href="https://www.cnil.fr/sites/cnil/files/atoms/files/guide_durees_de_conservation.pdf" target="_blank">guide pratique prévu à cet effet</a>.</p>'+
        "<p>Cette mesure vise à limiter le temps pendant lequel les données personnelles sont conservées et traitées, réduisant ainsi les risques de mauvaise utilisation, d'accès non autorisé, de fuite de données ou de réutilisation non-anticipée.</p>",
      referentiel: 'CNIL',
    },
    utilisationDonneesCaracterePersonnel: {
      description:
        'Fournir des informations aux personnes concernées sur l’utilisation de leurs données à caractère personnel',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        'Informer clairement les personnes lors de la collecte de leurs données de manière à ce qu’elles puissent :' +
        '<ul>' +
        '<li>connaître la raison de la collecte des différentes données les concernant ;</li>' +
        '<li>comprendre le traitement qui sera fait de leurs données ;</li>' +
        '<li>être assurées de la maîtrise de leurs données, notamment via l’exercice de leurs droits. La liste complète des informations à fournir <a href="https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13" target="_blank">est disponible ici</a> .</li>' +
        '</ul><br>' +
        'Les personnes doivent conserver la maîtrise des données qui les concernent. Cela suppose qu’elles soient clairement informées de l’utilisation qui sera faite de leurs données. Les personnes doivent également être informées de leurs droits et des modalités d’exercice de ces droits. Plus d’information <a href="https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence" target="_blank">ici</a>.',
      referentiel: 'CNIL',
    },
    modalitesExerciceDroits: {
      description:
        'Fournir des informations aux personnes concernées sur les modalités d’exercice des droits',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        "Permettre aux personnes d’exercer leurs droits d’accès aux données qui les concernent, de rectification ou de suppression, voire d’opposition (sauf si le traitement répond à une obligation légale). Une réponse à une demande de droit d’accès doit contenir une copie des données ainsi que : l’objectif du traitement des données, si possible sa durée, l'identité des destinataires, dans le cas d’un traitement automatisé sa logique et ses conséquences. Ces droits doivent pouvoir s’exercer par voie électronique à partir d’une adresse dédiée. Plus d’informations sont disponibles <a href='https://www.cnil.fr/fr/les-droits-des-personnes-sur-leurs-donnees' target='_blank'>ici</a>." +
        '<br>' +
        "Les personnes ont le droit d'accéder aux données à caractère personnel qui ont été collectées à leur sujet. Elles doivent pouvoir exercer ce droit facilement et à des intervalles raisonnables, afin de prendre connaissance du traitement et d'en vérifier la licéité.",
      referentiel: 'CNIL',
    },
    analyseProtectionDonnees: {
      description:
        'Vérifier si une analyse sur la protection des données à caractère personnel doit être réalisée',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue:
        '<p>Consulter <a href="https://www.cnil.fr/sites/cnil/files/atoms/files/liste-traitements-aipd-non-requise.pdf" target="_blank">la liste des exemptions</a>. Si votre traitement n’y figure pas, regarder s’il fait partie des traitements pour lesquels <a href="https://www.cnil.fr/fr/analyse-dimpact-relative-la-protection-des-donnees-publication-dune-liste-des-traitements-pour" target="_blank">une AIPD est obligatoire</a>. Si une AIPD est nécessaire, vous pouvez la réaliser à l’aide du <a href="https://www.cnil.fr/fr/outil-pia-telechargez-et-installez-le-logiciel-de-la-cnil" target="_blank">logiciel PIA</a>.</p>' +
        "<p>Cette analyse, aussi appelée Analyse d'Impact sur la Protection des Données (AIPD), vise à évaluer et à atténuer les risques liés au traitement des données personnelles, surtout dans le cas de traitements susceptibles de présenter des risques élevés pour les droits et libertés des individus.</p>",
      referentiel: 'CNIL',
    },
    anonymisationDonnees: {
      description:
        "Anonymiser autant que possible les données conservées concernant l'activité des utilisateurs",
      categorie: 'protection',
      descriptionLongue:
        "<p>Configurer le service en vue d'anonymiser autant que possible les données à caractère personnel des utilisateurs conservées pour le bon fonctionnement ou la sécurité du service (ex. log de tentatives d'accès au service) ou à des fins d'analyse (ex. statistiques).</p>" +
        "<p>Cette mesure vise à protéger les utilisateurs contre la traçabilité nominative de leurs actions dans le cadre de l'utilisation du service tout en permettant d'assurer la sécurité de ce dernier au travers du suivi et de l'imputabilité des actions.</p>",
      referentiel: 'ANSSI',
    },
    certificatChiffrement: {
      description:
        'Chiffrer le trafic des données avec un certificat de sécurité conforme à la réglementation',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Dans le cadre de la configuration du service, installer un certificat de sécurité serveur conforme au référentiel général de sécurité (RGS) défini par l'ANSSI, délivré par un prestataire de service de confiance qualifié.</p>" +
        "<p>Cette mesure permet de chiffrer les flux de données transitant par le service numérique avec des mécanismes de chiffrement robustes ainsi que de prouver l'identité de l'organisation détentrice du certificat.</p>",
      referentiel: 'ANSSI',
    },
    certificatSignature: {
      description:
        'Installer un certificat de signature électronique conforme à la réglementation',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Dans le cadre de la configuration du service, installer un certificat de signature électronique qualifié au sens du règlement n° 910/2014 eIDAS, délivré par un prestataire qualifié, ou recourir à un service conforme.</p>" +
        "<p>Cette mesure permet la réalisation d'une signature électronique robuste sur le plan de la sécurité, conforme à la réglementation française et européenne.</p>",
      referentiel: 'ANSSI',
    },
    chiffrementFlux: {
      description: 'Désactiver tout flux non chiffré',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Configurer le service en vue de désactiver tout flux de données qui n'est pas chiffré.</p>" +
        "<p>Cette mesure permet de protéger la confidentialité des données, dans le cas où des flux de données seraient interceptés.</p>",
      referentiel: 'ANSSI',
    },
    chiffrementMachineVirtuelle: {
      description: 'Chiffrer la machine virtuelle',
      categorie: 'protection',
      descriptionLongue:
        "<p>Lors de la configuration de la machine virtuelle, activez le chiffrement de cette dernière.</p>" +
        "<p>Cette mesure vise à renforcer la confidentialité des données contenues dans la machine virtuelle.</p>",
      referentiel: 'ANSSI',
    },
    coffreFort: {
      description:
        'Encourager les administrateurs à utiliser un coffre fort de mots de passe',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Recommander ou proposer aux administrateurs le recours à une ou plusieurs solutions de gestion de mots de passe sécurisés, permettant de générer des mots de passe aléatoires et robustes et de les enregistrer.</p>" +
        "<p>Cette mesure permet de faciliter la création de mots de passe différents, longs et complexes, distincts pour chaque compte d'accès, sans effort de mémorisation.</p>",
      referentiel: 'ANSSI',
    },
    compartimenter: {
      description: "Dissocier les rôles d'administration entre eux",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Créer des comptes d'accès d'administration différents dotés de privilèges distincts, pour les personnes devant assurer plusieurs rôles d'administration, que ceux-ci soit techniques (ex. développement, hébergement) et/ou métiers (ex. création de contenus).</p>" +
        "<p>Cette mesure permet de limiter la capacité d'action d'acteurs malveillants qui parviendraient à usurper un compte d'administration.</p>",
      referentiel: 'ANSSI',
    },
    configurationMinimaliste: {
      description:
        'Installer uniquement les fonctionnalités nécessaires aux finalités du service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Lors du développement du service ou de l'installation des applicatifs contribuant à son fonctionnement, installer uniquement les fonctionnalités nécessaires et désactiver toutes les fonctionnalités inutiles proposées par défaut. <br>Cette mesure correspond à la règle de la « configuration minimaliste ».</p>" +
        "<p>Cette mesure permet d'éviter d'installer des fonctionnalités non nécessaires qui pourraient comporter des vulnérabilités non corrigées et servir de vecteurs à une attaque. Cette approche permet de réduire la « surface d'attaque » à savoir l'ensemble des éléments constitutifs d'un service qui pourraient être ciblés par un attaquant.</p>",
      referentiel: 'ANSSI',
    },
    contraintesMotDePasse: {
      description:
        'Fixer des contraintes de longueur et de complexité des mots de passe',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Fixer des règles de longueur et de complexité des mots de passe lors de la création d'un mot de passe ou de son renouvellement par un utilisateur ou un administrateur. Lorsque cela est possible, configurer le service pour interdire les mots de passe faibles.</p>" +
        "<p>Cette mesure permet de diminuer le risque de découverte et l'usurpation de mots de passe par des acteurs malveillants, par exemple en testant plusieurs mots de passe sur la base de mots du dictionnaire.</p>",
      referentiel: 'ANSSI',
    },
    deconnexionAutomatique: {
      description:
        "Mettre en place la déconnexion automatique des sessions d'accès après une durée déterminée",
      categorie: 'protection',
      descriptionLongue:
        "<p>Configurer le service afin d'activer la déconnexion automatique des sessions des administrateurs et des utilisateurs inactifs après une durée déterminée.</p>" +
        "<p>Cette mesure vise à limiter le risque d'utilisation, par une personne malveillante, du compte d'un utilisateur, qui aurait laissé son équipement non verrouillé sans surveillance et ne se serait pas déconnecté du service.</p>",
      referentiel: 'ANSSI',
    },
    differentiationFiltrage: {
      description:
        'Différencier le filtrage des accès utilisateurs et administrateurs',
      categorie: 'protection',
      descriptionLongue:
        "<p>Configurer le service en vue de différencier le filtrage des accès utilisateurs et administrateurs, c'est-à-dire déterminer une zone délimitée (plage d'adresses IP) accessible uniquement aux personnes disposant de privilèges élevés (administrateurs).</p>" +
        "<p>Cette mesure vise à cloisonner les différents types d'accès afin d'éviter qu'un accès utilisateur puisse être détourné par un attaquant pour accéder à une zone du service réservée aux personnes chargées de l'administrer.</p>",
      referentiel: 'ANSSI',
    },
    dissocierComptesAdmin: {
      description:
        "Dissocier les rôles d'administration et des rôles d'utilisation du service",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Créer des comptes d'accès distincts aux personnes à la fois administratrices et utilisatrices du service.</p>" +
        "<p>Cette mesure permet de réduire le risque d'accès illicite à un compte utilisateur qui permettrait d'accéder également à un compte d'administration aux privilèges élevés.</p>",
      referentiel: 'ANSSI',
    },
    doubleAuthentAdmins: {
      description:
        "Activer l'authentification multifacteur pour l'accès des administrateurs au service",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Activer l'authentification multifacteur et la rendre obligatoire pour l'accès des administrateurs au service. Proscrire, autant que possible, le recours à un service numérique qui ne prévoirait pas l'authentification multifacteur pour son administration.</p>" +
        "<p>Cette mesure permet de réduire le risque d'accès illicite aux fonctions d'administration du service par des acteurs malveillants et diminue, d'autant, le risque d'atteinte grave au service.</p>",
      referentiel: 'ANSSI',
    },
    environnementSecurise: {
      description:
        'Administrer techniquement le service dans des environnements dédiés et sécurisés',
      categorie: 'protection',
      descriptionLongue:
        "<p>Demander aux administrateurs techniques du service de n'administrer ce dernier que depuis un environnement informatique dédié et sécurisé. Le recours à des équipements personnels doit notamment être proscrit.</p>" +
        "<p>Cette mesure vise à diminuer le risque de compromission des droits d'administration service via des moyens informatiques insuffisamment sécurisés.</p>",
      referentiel: 'ANSSI',
    },
    gestionComptesAcces: {
      description:
        'Mettre en œuvre une procédure de suppression des comptes inactifs',
      categorie: 'protection',
      descriptionLongue:
        "<p>Configurer le service en vue de prévoir la suppression régulière des comptes d'accès inactifs, en priorisant la suppression des comptes d'administration. <br>Informer les personnes concernées avant toute suppression de compte.</p>" +
        "<p>Cette mesure permet d'éviter en priorité que des comptes demeurent actifs sans raison valable, afin de réduire le nombre de comptes susceptibles d'être usurpés par un acteur malveillant.</p>",
      referentiel: 'ANSSI',
    },
    hebergementMachineVirtuelle: {
      description: 'Héberger le service dans une machine virtuelle',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Lors du choix de la solution d'hébergement du service et de ses données, optez pour son hébergement dans une ou plusieurs machines virtuelles.</p>" +
        "<p>Cette mesure vise à renforcer la sécurité du service et des données. Elle permet de filtrer plus facilement les accès, de limiter le risque d'attaques par déni de service et les chemins d'attaques par parallélisation.<p>",
      referentiel: 'ANSSI',
    },
    limitationAccesAdmin: {
      description:
        "Limiter au strict nécessaire le nombre de personnes disposant d'un accès administrateur au service numérique",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Créer des comptes d'administration technique et/ou métier, aux seules personnes ayant besoin de disposer de ces accès.</p>" +
        "<p>Cette mesure permet de limiter le nombre de comptes disposant de privilèges susceptibles d'être usurpés à des fins malveillantes. Cette mesure réduit la « surface d'attaque » du service.<p>",
      referentiel: 'ANSSI',
    },
    limitationCreationComptes: {
      description:
        "Autoriser uniquement la création de comptes d'accès nominatifs associés chacun à une personne",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Demander un nom et un prénom pour toute création de compte administrateur et utilisateur et informer chaque personne ne peut pas être partagé</p>" +
        "<p>Cette mesure permet de réduire le risque de diffusion d'identifiants et de mots de passe à des personnes qui n'auraient pas le droit d'accéder au service ou à certaines de ses fonctions. <br>Cette mesure également à la bonne gestion des comptes d'accès au service.</p>",
      referentiel: 'ANSSI',
    },
    limitationDroitsAdmin: {
      description:
        'Limiter les droits de chaque administrateur au strict nécessaire',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Lors de la création ou de la modification des privilèges associés à un compte d'administration, limiter ces derniers aux seuls privilèges nécessaires au rôle d'administration visé (ex. limiter aux seules fonctions d'administration de la base de données).</p>" +
        "<p>Cette mesure permet de réduire la capacité d'action d'un acteur malveillant qui parviendrait à usurper un compte administrateur et ainsi de limiter sa capacité de nuisance.</p>",
      referentiel: 'ANSSI',
    },
    misesAJour: {
      description:
        "Disposer d'une politique d'application des mises à jour fonctionnelles et de sécurité du service numérique",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Identifier, tester et installer, sans délai, les mises à jour fonctionnelles et de sécurité des applicatifs et/ou équipement contribuant au fonctionnement et à l'administration du service.</p>" +
        "<p>Cette mesure vise à renforcer la sécurité du service en permettant de corriger rapidement les failles de sécurité susceptibles de l'affecter.</p>",
      referentiel: 'ANSSI',
    },
    moindrePrivilege: {
      description:
        'Limiter au strict nécessaire les privilèges des applicatifs contribuant au fonctionnement du service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Lors de l'installation d'un applicatif contribuant au fonctionnement du service, restreindre au strict nécessaire ses privilèges - à savoir les droits l'autorisant de mener certaines actions de manière autonome - et ne conserver que les privilèges nécessaires à sa finalité.</p>" +
        "<p>Cette mesure permet d'éviter que des privilèges non nécessaires accordés à un applicatif ne soient exploités à des fins malveillantes par un attaquant.</p>",
      referentiel: 'ANSSI',
    },
    nomsDomaineFrUe: {
      description: "Privilégier l'achat d'un nom de domaine en .fr ou .eu",
      categorie: 'protection',
      descriptionLongue:
        "<p>Lors de l'achat du nom de domaine du service, acheter de préférence un nom de domaine en .fr ou .eu.</p>" +
        "<p>Cette mesure permet de renforcer la confiance des utilisateurs dans le service et la protection du service au titre des règlementations européennes associées à la localisation européenne du nom de domaine.</p>",
      referentiel: 'ANSSI',
    },
    nomsDomaineSimilaires: {
      description:
        'Acheter un ou plusieurs noms de domaine proches du nom de domaine du service',
      categorie: 'protection',
      descriptionLongue:
        "<p>Lors du choix du nom de domaine du service numérique, procédez à l'achat d'un ou plusieurs noms de domaines proches du nom de domaine du service numérique, par exemple en changeant des lettres ou en achetant des noms de domaine avec d'autres extensions (ex. .com ou .net).</p>" +
        "<p>Cette mesure permet de limiter le risque de typosquatting (ex. utilisation de noms de domaines proches contenant des modifications typographiques discrètes), permettant de rediriger les utilisateurs vers un site malveillant.</p>",
      referentiel: 'ANSSI',
    },
    portsOuverts: {
      description: 'Fermer tous les ports non strictement nécessaires',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Configurer le service en vue de fermer tous les ports réseau non strictement nécessaires à l'administration et au fonctionnement du service et fermer tous les autres ports.</p>" +
        "<p>Cette mesure permet de réduire le risque d'accès illégitime au service de la part d'acteurs malveillants.</p>",
      referentiel: 'ANSSI',
    },
    protectionDeniService: {
      description:
        'Recourir à un service de protection contre les attaques de déni de service',
      categorie: 'protection',
      descriptionLongue:
        "<p>Recourir à un service permettant de protéger le service contre les attaques de type «déni de service» (ex. attaques par déni de service distribué dites « DDOS »).</p>" +
        "<p>Cette mesure vise à réduire le risque d'indisponibilité partielle ou totale du service.</p>",
      referentiel: 'ANSSI',
    },
    protectionMotsDePasse: {
      description: 'Protéger les mots de passe stockés sur le service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Dans le cadre de la configuration du service au niveau du serveur d'hébergement, veiller à ne pas stocker les mots de passe « en clair ». Seule une « empreinte » des mots de passe doit être stockée.</p>" +
        "<p>L'objectif de cette mesure est de limiter la capacité d'un attaquant à accéder aux mots de passe en cas de compromission de la base de données des mots de passe.</p>",
      referentiel: 'ANSSI',
    },
    renouvellementMotsDePasse: {
      description:
        'Planifier le renouvellement régulier des mots de passe des administrateurs',
      categorie: 'protection',
      descriptionLongue:
        "<p>Configurer ou recommander à intervalle régulier le renouvellement des mots de passe des comptes d'administration.</p>" +
        "<p>Cette mesure permet d'éviter qu'un mot de passe ancien ou proche d'un mot de passe déjà utilisé toujours utilisé ne soit découvert et utilisé par un acteur malveillant.</p>",
      referentiel: 'ANSSI',
    },
    securisationCode: {
      description:
        'Mettre en œuvre des bonnes pratiques de développement sécurisé du service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Lors du développement du service, respecter les bonnes pratiques de développement sécurisé (ex. les normes de développement sécurisé associé à un langage de programmation, procéder à des revues régulières de code par les pairs, etc.).</p>" +
        "<p>Cette mesure vise à renforcer la sécurité du service numérique dès sa conception.</p>",
      referentiel: 'ANSSI',
    },
    telechargementsOfficiels: {
      description:
        "Utiliser uniquement les magasins officiels d'applications mobiles pour permettre le téléchargement de l'application",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Publier l'application mobile permettant l'accès au service sur une ou plusieurs bibliothèques officielles (ex. AppStore, Google Play, etc.) et informer les utilisateurs que le service n'est téléchargeable que par ce moyen.</p>" +
        "<p>Cette mesure permet de faciliter les mises à jour de l'application par les utilisateurs et réduit le risque que des acteurs malveillants proposent au téléchargement une version de l'application susceptible de contenir un applicatif malveillant.</p>",
      referentiel: 'ANSSI',
    },
    versionRecente: {
      description:
        'Utiliser des applicatifs récents et maintenus à jour par leurs éditeurs',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue:
        "<p>Lors du développement ou de l'achat du service, toujours utiliser une version récente et maintenue à jour par les éditeurs, des applicatifs contribuant au fonctionnement du service (ex. une version récente et à jour d'un système de gestion de contenu (CMS), des dépendances d'une l'application).</p>" +
        "<p>Cette mesure vise à éviter d'utiliser des versions anciennes, susceptibles de comporter des vulnérabilités connues mais non corrigées ou qui ne seraient plus appelées à faire l'objet de mises à jour de sécurité à l'avenir par l'éditeur.</p>",
      referentiel: 'ANSSI',
    },

    gestionIncidents: {
      description: 'Définir une procédure de gestion des incidents de sécurité',
      categorie: 'defense',
      descriptionLongue:
        "<p>Formaliser une procédure à suivre en cas d'incident de sécurité sur le service, pouvant inclure des éléments relatifs à la gestion technique de l'incident, la coordination des personnes concernées au sein de l'organisation, la communication aux utilisateurs et aux autres entités potentiellement impactées. </p>" +
        "<p>Sauvegarder ce document dans un environnement sécurisé, déconnecté du service.</p>" +
        "<p>Cette mesure permet de préparer l'organisation à réagir de manière rapide et efficace en cas d'incident de sécurité affectant le service et à remédier à la situation.</p>",
      referentiel: 'ANSSI',
    },
    journalAcces: {
      description:
        "Conserver l'historique des accès des administrateurs au service",
      categorie: 'defense',
      descriptionLongue:
        "<p>Lors de la configuration du service, activer la journalisation et la centralisation des accès des administrateurs, des utilisateurs et des applicatifs concourant au fonctionnement du service.</p>" +
        "<p>Cette mesure permet de faciliter la détection d'actions inhabituelles susceptibles d'être malveillantes et d'investiguer a posteriori les causes d'un incident de sécurité, en vue de faciliter sa remédiation.</p>",
      referentiel: 'ANSSI',
    },
    journalEvenementSecu: {
      description:
        "Conserver l'historique de l'ensemble des événements de sécurité sur le service",
      categorie: 'defense',
      descriptionLongue:
        "<p>Lors de la configuration du service, activer, si cela est possible, la journalisation et la centralisation des événements de sécurité. <br>A défaut, créer et maintenir à jour un document recensant l'ensemble des événements de sécurité ayant affecté le service et des mesures mises en œuvre pour y remédier.</p>" +
        "<p>Cette mesure permet de faciliter la détection d'évènements de sécurité connus et la résolution des incidents qui en découleraient.</p>",
      referentiel: 'ANSSI',
    },
    notificationConnexionsSuspectes: {
      description:
        'Envoyer une notification aux administrateurs et aux utilisateurs à chaque connexion',
      categorie: 'defense',
      descriptionLongue:
        "<p>Configurer le service afin de proposer l'envoi d'une notification (ex. par email) aux utilisateurs et aux administrateurs, à chaque fois que ceux-ci se connectent. Signaler, si possible, toute tentative de connexion suspecte, par exemple, lorsque la connexion est effectuée depuis un nouvel appareil ou depuis une localisation inhabituelle. Dans le cas de l'achat d'une solution sur étagère, privilégier un service proposant l'envoi de notifications.</p>" +
        "<p>Cette mesure permet aux utilisateurs et administrateurs d'identifier des tentatives de connexion suspectes et d'empêcher de futures nouvelles tentatives de connexion illégitimes, par exemple, en changeant leur mot de passe.</p>",
      referentiel: 'ANSSI',
    },
    supervision: {
      description: 'Recourir à un service de supervision de la sécurité',
      categorie: 'defense',
      descriptionLongue:
        "<p>Faire appel à un service de supervision à distance de la sécurité du service ou de plusieurs services, auprès d'un prestataire ou d'un service compétent au sein d'une organisation publique (ex. Security operation center », équipe de réponse à incident, etc.).</p>" +
        "<p>Cette mesure permet de renforcer significativement la capacité de veille, de détection et de réponse en cas d'incident de sécurité.</p>",
      referentiel: 'ANSSI',
    },
    testsProcedures: {
      description:
        'Tester régulièrement la procédure de gestion des incidents de sécurité',
      categorie: 'defense',
      descriptionLongue:
        "<p>Réaliser à intervalle régulier (ex. une fois par an) un test de la procédure de gestion des incidents de sécurité du service ou de plusieurs services, en impliquant les personnes concernées (ex. vérifier que les coordonnées sont exactes, vérifier la disponibilité des personnes).</p>" +
        "<p>Cette mesure vise à vérifier que la procédure de gestion des incidents en place fonctionne bien dans la pratique.</p>",
      referentiel: 'ANSSI',
    },
    veilleSecurite: {
      description:
        'Réaliser une veille régulière des vulnérabilités et des campagnes de compromission',
      categorie: 'defense',
      descriptionLongue:
        "<p>Consulter plusieurs sources d'informations sur les vulnérabilités concernant les applicatifs participant au fonctionnement du service ainsi que sur les campagnes de compromission connues (ou campagnes d'attaques informatiques), notamment les alertes de sécurité du CERT-FR.</p>" +
        "<p>Cette mesure permet d'identifier des vulnérabilités ou risques nouveaux pour le service et de mettre en œuvre les mesures de sécurité permettant d'y faire face, par exemple des mises à jour de sécurité.</p>",
      referentiel: 'ANSSI',
    },

    exerciceGestionCrise: {
      description: 'Organiser un exercice de gestion de crise',
      categorie: 'resilience',
      descriptionLongue:
        "<p>Organiser un exercice simulant une crise consécutive à un ou plusieurs incidents de sécurité aux conséquences particulièrement graves pour l'organisation..</p>" +
        "<p>Cette mesure permet d'entraîner les équipes, d'identifier freins à la gestion efficace d'une crise et de les corriger en vue de se préparer à la survenue d'une crise réelle.</p>",
      referentiel: 'ANSSI',
    },
    garantieHauteDisponibilite: {
      description:
        'Recourir à une ou plusieurs solutions garantissant un haut niveau de disponibilité du service',
      categorie: 'resilience',
      descriptionLongue:
        "<p>Recourir à une ou plusieurs solutions garantissant un haut niveau de disponibilité, en particulier dans le cadre de l'hébergement du service (ex. obligation de redondance de la machine virtuelle et des données).</p>" +
        "<p>Cette mesure permet d'éviter une interruption du service dépassant quelques minutes.</p>",
      referentiel: 'ANSSI',
    },
    sauvegardeDonnees: {
      description:
        'Mettre en place une sauvegarde régulière des données dans un environnement non connecté au service numérique',
      categorie: 'resilience',
      descriptionLongue:
        "<p>Sauvegarder les données traitées par le service, au moins une fois par semaine, dans un environnement sécurisé, déconnecté de ce dernier (ex. dans une autre machine virtuelle chiffrée, sur un ordinateur ou un serveur local déconnecté d'internet).</p>" +
        "<p>Cette mesure permet une restauration rapide des données, à partir de la dernière sauvegarde des données effectuée, en cas d'incident de sécurité qui conduirait à leur suppression ou les rendrait inaccessibles, par exemple, en cas d'attaque par rançongiciel.</p>",
      referentiel: 'ANSSI',
    },
    sauvegardeMachineVirtuelle: {
      description:
        'Mettre en place une sauvegarde en continu de la machine virtuelle sur laquelle est déployé le service numérique.',
      categorie: 'resilience',
      indispensable: true,
      descriptionLongue:
        "<p>Sauvegarder en continu la machine virtuelle sur laquelle est déployée le service.</p>" +
        "<p>Cette mesure permet la restauration rapide du service, à partir de la dernière sauvegarde de la machine virtuelle effectuée, en cas d'incident de sécurité qui conduirait à leur suppression et ou les rendrait inaccessible.</p>",
      referentiel: 'ANSSI',
    },
    testsSauvegardes: {
      description: 'Vérifier régulièrement les sauvegardes',
      categorie: 'resilience',
      indispensable: true,
      descriptionLongue:
        "<p>Réaliser des tests réguliers des sauvegardes (ex. tous les trois mois) afin de vérifier que celles-ci sont bien réalisées, accessibles et fonctionnelles.</p>" +
        "<p>Cette mesure permet de vérifier que les sauvegardes effectuées peuvent être utilisées pour restaurer le service et/ou ses données en cas d'incident de sécurité.</p>",
      referentiel: 'ANSSI',
    },
  },

  localisationsDonnees: {
    france: { description: 'France' },
    unionEuropeenne: { description: 'Union européenne' },
    autre: { description: 'Hors Union européenne' },
  },

  echeancesRenouvellement: {
    sixMois: {
      nbMoisDecalage: 6,
      description: '6 mois',
      expiration: expiration('six mois'),
      nbMoisBientotExpire: 2,
    },
    unAn: {
      nbMoisDecalage: 12,
      description: '1 an',
      expiration: expiration('un an'),
      nbMoisBientotExpire: 2,
    },
    deuxAns: {
      nbMoisDecalage: 24,
      description: '2 ans',
      expiration: expiration('deux ans'),
      nbMoisBientotExpire: 4,
    },
    troisAns: {
      nbMoisDecalage: 36,
      description: '3 ans',
      expiration: expiration('trois ans'),
      nbMoisBientotExpire: 6,
    },
  },

  etapesParcoursHomologation: [
    { numero: 1, libelle: 'Autorité', id: 'autorite' },
    { numero: 2, libelle: 'Avis', id: 'avis' },
    { numero: 3, libelle: 'Documents', id: 'documents' },
    { numero: 4, libelle: 'Décision', id: 'dateTelechargement' },
    {
      numero: 5,
      libelle: 'Date',
      id: 'decision',
      reserveePeutHomologuer: true,
    },
    {
      numero: 6,
      libelle: 'Récapitulatif',
      id: 'recapitulatif',
      reserveePeutHomologuer: true,
    },
  ],

  etapeNecessairePourDossierDecision: 'dateTelechargement',

  reglesPersonnalisation: {
    clefsDescriptionServiceAConsiderer: [
      'typeService',
      'fonctionnalites',
      'provenanceService',
      'donneesCaracterePersonnel',
      'delaiAvantImpactCritique',
      'risqueJuridiqueFinancierReputationnel',
    ],
    profils: {
      applicationMobile: {
        regles: [
          {
            presence: ['applicationMobile'],
          },
        ],
        mesuresAAjouter: ['telechargementsOfficiels'],
      },
      applicationAchettee: {
        regles: [
          {
            presence: ['achat'],
          },
        ],
        mesuresARetirer: [
          'analyseRisques',
          'audit',
          'auditsSecurite',
          'certificatChiffrement',
          'chiffrementFlux',
          'portsOuverts',
          'differentiationFiltrage',
          'protectionMotsDePasse',
          'securisationCode',
          'hebergementMachineVirtuelle',
          'chiffrementMachineVirtuelle',
          'nomsDomaineFrUe',
          'nomsDomaineSimilaires',
          'anonymisationDonnees',
          'protectionDeniService',
          'supervision',
          'sauvegardeMachineVirtuelle',
        ],
      },
      creationComptes: {
        regles: [
          {
            presence: ['compte'],
          },
        ],
        mesuresAAjouter: [
          'analyseRisques',
          'audit',
          'auditsSecurite',
          'deconnexionAutomatique',
        ],
        mesuresARendreIndispensables: ['testIntrusion'],
      },
      mssPlus: {
        regles: [
          { presence: ['reseauSocial'] },
          { presence: ['visionconference'] },
          { presence: ['messagerie'] },
          { presence: ['edition'] },
          { presence: ['paiement'] },
          { presence: ['identite'] },
          { presence: ['situation'] },
          { presence: ['mineurs'] },
        ],
        mesuresAAjouter: [
          'analyseRisques',
          'audit',
          'auditsSecurite',
          'supervision',
          'garantieHauteDisponibilite',
          'exerciceGestionCrise',
        ],
        mesuresARendreIndispensables: [
          'testIntrusion',
          'gestionIncidents',
          'testsProcedures',
          'journalEvenementSecu',
          'sauvegardeDonnees',
        ],
      },
      mssPlusPlus: {
        regles: [
          { presence: ['signatureElectronique'] },
          { presence: ['moinsUneHeure'] },
          { presence: ['sensibiliteParticuliere'] },
          { presence: ['risqueJuridiqueFinancierReputationnel'] },
        ],
        mesuresAAjouter: [
          'secNumCloud',
          'analyseRisques',
          'audit',
          'auditsSecurite',
          'supervision',
          'garantieHauteDisponibilite',
          'exerciceGestionCrise',
        ],
        mesuresARetirer: ['testIntrusion'],
        mesuresARendreIndispensables: [
          'analyseRisques',
          'audit',
          'auditsSecurite',
          'environnementSecurise',
          'gestionIncidents',
          'testsProcedures',
          'journalEvenementSecu',
          'veilleSecurite',
          'supervision',
          'sauvegardeDonnees',
        ],
      },
      avecSignatureElectronique: {
        regles: [{ presence: ['signatureElectronique'] }],
        mesuresAAjouter: ['certificatSignature'],
      },
      impactIndisponibiliteRapidementCritique: {
        regles: [{ presence: ['moinsUneHeure'] }],
        mesuresARendreIndispensables: ['garantieHauteDisponibilite'],
      },
      avecDonneesCaracterePersonnel: {
        regles: [
          { presence: ['contact'] },
          { presence: ['identite'] },
          { presence: ['document'] },
          { presence: ['situation'] },
          { presence: ['localisation'] },
          { presence: ['banque'] },
          { presence: ['mineurs'] },
          { presence: ['sensibiliteParticuliere'] },
        ],
        mesuresAAjouter: [
          'registreTraitements',
          'minimisationCollecteDonnees',
          'dureeLimiteeConservationDonnees',
          'utilisationDonneesCaracterePersonnel',
          'modalitesExerciceDroits',
          'analyseProtectionDonnees',
        ],
      },
    },
    mesuresBase: [
      'exigencesSecurite',
      'identificationDonneesSensibles',
      'listeEquipements',
      'limitationInterconnexions',
      'listeComptesPrivilegies',
      'hebergementUE',
      'testIntrusion',
      'verificationAutomatique',
      'consignesSecurite',
      'contactSecurite',
      'certificatChiffrement',
      'chiffrementFlux',
      'portsOuverts',
      'limitationAccesAdmin',
      'limitationDroitsAdmin',
      'compartimenter',
      'dissocierComptesAdmin',
      'differentiationFiltrage',
      'limitationCreationComptes',
      'gestionComptesAcces',
      'contraintesMotDePasse',
      'doubleAuthentAdmins',
      'coffreFort',
      'renouvellementMotsDePasse',
      'protectionMotsDePasse',
      'environnementSecurise',
      'versionRecente',
      'misesAJour',
      'securisationCode',
      'hebergementMachineVirtuelle',
      'chiffrementMachineVirtuelle',
      'configurationMinimaliste',
      'moindrePrivilege',
      'nomsDomaineFrUe',
      'nomsDomaineSimilaires',
      'anonymisationDonnees',
      'protectionDeniService',
      'gestionIncidents',
      'testsProcedures',
      'notificationConnexionsSuspectes',
      'journalAcces',
      'journalEvenementSecu',
      'veilleSecurite',
      'sauvegardeMachineVirtuelle',
      'sauvegardeDonnees',
      'testsSauvegardes',
    ],
  },
  retoursUtilisateurMesure: {
    mesureUtile: 'Cette mesure est utile',
    mesurePasClaire: "Cette mesure n'est pas claire",
    mesurePasPertinente:
      "Cette mesure n'est pas pertinente compte tenu des caractéristiques du service",
    mesureTropExigeante: 'Cette mesure est trop exigeante',
    mesurePasAssezExigeante: "Cette mesure n'est pas assez exigeante",
    autre: 'Autre',
  },
  departements,
};
