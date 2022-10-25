const { departements } = require('./donneesReferentielDepartements');

const echeance = (duree) => `Dans ${duree}`;
const expiration = (duree) => `${duree.charAt(0).toUpperCase()}${duree.slice(1)} après signature de la présente homologation`;

module.exports = {
  indiceCyber: {
    coefficientIndispensables: 0.6,
    coefficientRecommandees: 0.4,
    noteMax: 5,
  },

  actionsSaisie: {
    v1: {
      descriptionService: { position: 0, description: 'Description du service' },
      rolesResponsabilites: { position: 1, description: 'Rôles et responsabilités' },
      risques: { position: 2, description: 'Risques de sécurité' },
      mesures: { position: 3, description: 'Mesures de sécurité' },
      avisExpertCyber: { position: 4, description: 'Avis sur le dossier' },
    },
    v2: {
      descriptionService: {
        position: 0,
        description: 'Décrire',
        sousTitre: 'Présentez les caractéristiques de votre service.',
      },
      mesures: {
        position: 1,
        description: 'Sécuriser',
        sousTitre: 'Mettez en œuvre les mesures de sécurité adaptées à votre service.',
      },
      homologations: {
        position: 2,
        indisponible: true,
        description: 'Homologuer',
        sousTitre: 'Complétez et téléchargez les documents pour homologuer le service.',
      },
    },
  },

  seuilsCriticites: ['critique', 'eleve', 'moyen', 'faible'],

  typesService: {
    siteInternet: { description: 'Site Internet' },
    applicationMobile: { description: 'Application Mobile' },
    api: { description: "API mise à disposition par l'organisation" },
  },

  provenancesService: {
    developpement: {
      description: 'Développé en interne ou par un prestataire au profit de votre organisation',
    },
    achat: {
      description: "Acheté sur étagère auprès d'un fournisseur ou obtenu à titre gratuit",
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
      seuilCriticite: 'faible',
    },
    questionnaire: {
      description: 'Questionnaires, sondages',
      seuilCriticite: 'faible',
    },
    reseauSocial: {
      description: 'Réseau social, forum, commentaires',
      seuilCriticite: 'moyen',
    },
    visionconference: {
      description: 'Audio, visioconférence',
      seuilCriticite: 'moyen',
    },
    paiement: {
      description: 'Paiement en ligne',
      seuilCriticite: 'eleve',
    },
    signatureElectronique: {
      description: 'Dispositif de signature électronique',
      seuilCriticite: 'critique',
    },
    compte: {
      description: 'Création de compte (utilisateurs avec comptes)',
      seuilCriticite: 'faible',
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
    formulaire: {
      description: 'Formulaire administratif ou démarche en ligne',
      seuilCriticite: 'faible',
    },
    edition: {
      description: 'Édition collaborative (documents, murs collaboratifs, etc.)',
      seuilCriticite: 'moyen',
    },
    reservation: {
      description: 'Outils de réservation (livres, places, salles, etc.)',
      seuilCriticite: 'faible',
    },
  },

  donneesCaracterePersonnel: {
    contact: {
      description: 'Données de contact',
      exemple: 'mail, numéro de téléphone, adresse postale.',
      seuilCriticite: 'faible',
    },
    identite: {
      description: "Données d'identité",
      exemple: 'nom/prénom, pseudonyme, date de naissance, numéro de sécurité sociale.',
      seuilCriticite: 'faible',
    },
    document: {
      description: "Documents d'identité et autres documents officiels",
      exemple: 'photo de passeport, titre de séjour.',
      seuilCriticite: 'faible',
    },
    situation: {
      description: 'Données relatives à la situation familiale, économique et financière',
      exemple: 'revenus, état civil.',
      seuilCriticite: 'moyen',
    },
    localisation: {
      description: 'Données de localisation',
      exemple: 'adresse IP, identifiant de connexion, cookies.',
      seuilCriticite: 'faible',
    },
    banque: {
      description: 'Données de paiement',
      exemple: 'nº de carte bancaire.',
      seuilCriticite: 'critique',
    },
    mineurs: {
      description: 'Données concernant des personnes mineures',
      seuilCriticite: 'eleve',
    },
    sensibiliteParticuliere: {
      description: 'Données de santé et autres données particulièrement sensibles',
      exemple: 'orientation sexuelle, origine, orientations politiques, religieuses.',
      seuilCriticite: 'critique',
    },
    diffusionRestreinte: {
      description: 'Données de niveau « Diffusion Restreinte »',
      seuilCriticite: 'critique',
    },
  },

  delaisAvantImpactCritique: {
    moinsUneHeure: {
      description: "Moins d'une heure",
      seuilCriticite: 'critique',
    },
    uneJournee: {
      description: 'Une journée',
      seuilCriticite: 'moyen',
    },
    plusUneJournee: {
      description: "Plus d'une journée",
      seuilCriticite: 'faible',
    },
  },

  niveauxGravite: {
    nonConcerne: {
      position: 0,
      couleur: 'blanc',
      description: 'Non concerné',
      descriptionLongue: '',
      important: false,
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
      description: 'Indisponibilité partielle ou totale du service numérique pendant plusieurs heures à quelques jours',
      descriptionLongue: `
        L'indisponibilité du service numérique signifie que certaines fonctionnalités ou que la totalité du service
        n'est plus accessible aux usagers et/ou aux agents publics.<br>Par exemple :<li>Un service numérique connaît
        une panne suite à une attaque de type « déni de service » : un message d'erreur est susceptible de s'afficher en
        lieu et place de la page d'accueil pour un site web.</li><li>Un service numérique devient inaccessible, suite à
        une attaque de type rançongiciel, contre la fausse-promesse de leur restitution en cas de paiement d'une rançon.
        Cette attaque est l'une des plus courantes et a déjà frappé de nombreuses collectivités et entités publiques.</li>
      `,
    },
    donneesModifiees: {
      description: "Suppression ou modification d'informations concernant des usagers ou des agents publics",
      descriptionLongue: "Ce risque signifie que des informations appartenant à des usagers ou à des agents publics sont supprimées en partie ou en totalité par un attaquant ou sont modifiées en leur avantage ou en leur défaveur.<br>Par exemple : <li>Des documents téléversés par des usagers dans le cadre d'une démarche en ligne sont supprimés en partie ou en totalité.</li><li>Un élève modifie ses notes sur un espace numérique de travail (ENT) après avoir dérobé ou deviné l'identifiant et le mot de passe d'un enseignant.</li>",
    },
    divulgationDonnees: {
      description: "Divulgation publique d'informations dérobées concernant des usagers ou des agents publics",
      descriptionLongue: "Ce risque signifie que des informations concernant des usagers ou des agents publics, traitées dans le cadre du service numérique, sont dérobées par un attaquant puis rendues publiques pour porter préjudice aux personnes concernées et/ou nuire à la réputation de l'entité. <br>Par exemple :<li>La liste de bénéficiaires d'une aide publique et de leurs coordonnées est divulguée sur internet.</li> <li>L'adresse mail des personnes ayant signalé des incivilités sur la voirie via une application dédiée est divulguée sur internet.</li><li>La divulgation des votes des habitants d'une commune s'étant exprimés dans le cadre d'une consultation publique en ligne.</li>",
    },
    defigurationSiteWeb: {
      description: "Défiguration visible de l'apparence du service numérique",
      descriptionLongue: "La défiguration d'un service numérique signifie que son apparence est modifiée de manière visible par l'ajout de messages ou d'images, le plus souvent à caractère idéologique, ou à des fins de simples détérioration en vue de nuire à la réputation de l'entité publique.<br>Par exemple :<li>Une image satirique apparaît sur la page d'accueil d'un service numérique.</li><li>Des messages de protestation contre la politique d'une collectivité sont insérés sur plusieurs pages du service numérique.</li>",
    },
    arnaques: {
      description: "Vol d'informations concernant des usagers ou des agents publics à des fins d'escroquerie",
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
    },
    logicielsMalveillants: {
      description: "Détournement de l'usage du service numérique en vue de conduire des activités non prévues pour ce dernier",
      descriptionLongue: "Ce risque signifie que le service numérique est utilisé de manière discrète et illicite afin de conduire des activités ne correspondant pas à sa finalité, la plupart du temps à des fins de gain financier.<br>Par exemple :<li>La puissance d'un service numérique est utilisée dans le but de mener une activité de minage de cryptomonnaie.</li><li>Un logiciel malveillant est introduit sur la page d'accueil d'un service numérique afin d'infecter les équipements informatiques des usagers et/ou des agents publics en vue d'accéder à leurs données ou de mener une autre attaque (ex.rançongiciel).</li>",
    },
    surveillance: {
      description: "Vol de données ou interception d'échanges à des fins de renseignement",
      descriptionLongue: "Ce risque signifie que des échanges entre agents publics ou avec des usagers sont interceptés ou que des documents sont dérobés, le plus souvent à des fins de renseignement économique ou politique.<br> Par exemple :<li>Des documents concernant des candidatures à un marché public avant la date finale de dépôt des dossiers sont dérobés par des concurrents afin d'en tirer un avantage concurrentiel.</li><li>Des échanges entre agents publics et entreprises technologiques sont interceptés via la messagerie d'une plateforme permettant l'attribution d'aides publiques, à des fins d'intelligence économique.</li>",
    },
  },

  categoriesMesures: {
    gouvernance: 'Gouvernance',
    protection: 'Protection',
    defense: 'Défense',
    resilience: 'Résilience',
  },

  statutsMesures: {
    fait: 'Fait',
    enCours: 'En cours',
    nonFait: 'Non fait',
    nonRetenu: 'Non concerné',
  },

  mesures: {
    analyseRisques: {
      description: "Organiser au moins un atelier d'analyse des risques du service numérique",
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure vise à étoffer, par l'organisation d'un atelier d'analyse de risques avec l'ensemble des acteurs de l'homologation, à améliorer la connaissance des risques pour le service numérique et permettre l'ajout de mesures de sécurité spécifiques. Ces informations doivent être renseignées dans les rubriques « risques » et « mesures » de sécurité de MonServiceSécurisé.",
    },
    audit: {
      description: 'Réaliser un audit de la sécurité du service',
      categorie: 'gouvernance',
      descriptionLongue: "Faire réaliser un audit de la sécurité du service. Les audits réalisés par des prestataires qualifiés par l'ANSSI (PASSI) incluent un audit d'architecture, de code, de configuration et un test d'intrusion.<br>Cette mesure permet d'identifier les vulnérabilités du service et les mesures de sécurité spécifiques à mettre en œuvre en vue de les corriger et ainsi renforcer significativement sa sécurité.",
    },
    auditsSecurite: {
      description: 'Organiser des contrôles et audits de sécurité périodiques',
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure vise à assurer un suivi de la sécurité du service. Les contrôles doivent porter sur l'architecture, la configuration, le code source, la réalisation de tests d'intrusion",
    },
    consignesSecurite: {
      description: "Fixer et sensibiliser les agents aux consignes de sécurité liées à l'utilisation du service",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de former les agents aux bonnes pratiques dans l'usage d'un service numérique et aux actions à proscrire.",
    },
    contactSecurite: {
      description: 'Rendre public un contact pour signaler un problème de sécurité',
      categorie: 'gouvernance',
      descriptionLongue: 'Cette mesure facilite le signalement de problèmes de sécurité et leur correction.',
    },
    exigencesSecurite: {
      description: 'Connaître les exigences de sécurité incombant aux sous-traitants du service numérique',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: 'Cette mesure permet de vérifier le respect des exigences de sécurité par les sous-traitants (hébergeur, prestataires, etc.) idéalement fixées sur le plan contractuel.',
    },
    hebergementUE: {
      description: "Héberger le service numérique et les données au sein de l'Union européenne",
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure renforce le niveau de confiance dans la protection des données à caractère personnel des utilisateurs du service et facilite l'ensemble des actions qui pourraient découler de la survenue d'un incident de sécurité (rémédiation, enquête, etc.).",
    },
    identificationDonneesSensibles: {
      description: 'Identifier les données les plus sensibles à protéger',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de concentrer l'effort de sécurisation (notamment les sauvegardes) sur ce qui a le plus de valeur et de diminuer le risque d'atteinte à ces données.",
    },
    limitationInterconnexions: {
      description: "Limiter et connaître les interconnexions du service avec d'autres systèmes",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de limiter le risque de contagion d'un incident de sécurité d'un système d'information vers un autre. Il peut s'agir d'autres systèmes essentiels de l'organisation ou de systèmes externes de partenaires ou de sous-traitants (hébergeur, prestataire d'infogérance, prestataire de service de sécurité, etc.).",
    },
    listeComptesPrivilegies: {
      description: "Disposer d'une liste à jour des comptes disposant d'un d'accès privilégié au service",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de connaître toutes les personnes en interne ou en externe (sous-traitant, etc.) disposant d'un accès au service. Cette mesure est indispensable en vue de limiter le nombre de comptes d'accès privilégiés, de supprimer les comptes obsolètes, etc.",
    },
    listeEquipements: {
      description: "Disposer d'une liste à jour des équipements et des logiciels contribuant au fonctionnement du service numérique",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: 'Cette mesure contribue au maintien du service en sécurité, en permettant leur mise à jour régulière et la correction des failles de sécurité connues des équipements et logiciels qui permettent le fonctionnement du service.',
    },
    secNumCloud: {
      description: "Héberger le service numérique et les données au sein d'un Cloud qualifié SecNumCloud",
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure apporte des garanties techniques et juridiques supplémentaires pour la sécurité du service et des données, en recourant à une solution d'hébergement disposant d'un visa de sécurité de l'ANSSI.",
    },
    testIntrusion: {
      description: "Effectuer un test d'intrusion et/ou réaliser un bug bounty",
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure vise à vérifier, avant le lancement du service, la présence de vulnérabilités dans le service, par la réalisation d'un test d'intrusion ou d'un bug bounty, mobilisant des chercheurs de vulnérabilités.",
    },
    verificationAutomatique: {
      description: 'Procéder à des vérifications techniques automatiques de la sécurité du service',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à vérifier, avant le lancement du service, la présence de défauts de configuration ou de vulnérabilités connues, grâce à des outils de tests disponibles la plupart du temps gratuitement en ligne ou à installer en local comme <a href=\"https://testssl.sh/\" target=\"_blank\" rel=\"noopener\">testSSL</a> permettant d'évaluer le niveau de confiance du certificat SSL ; <a href=\"https://observatory.mozilla.org/\" target=\"_blank\" rel=\"noopener\">MozzilaObservatory</a> permettant d'évaluer le respect des bonnes pratiques de configuration HTTP ; dependabot, codeQL, Nmap permettant d'identifier la présence de vulnérabilités.",
    },

    anonymisationDonnees: {
      description: "Anonymiser autant que possible les données conservées concernant l'activité des utilisateurs",
      categorie: 'protection',
      descriptionLongue: "Configurer le service en vue d'anonymiser autant que possible les données à caractère personnel des utilisateurs conservées pour le bon fonctionnement ou la sécurité du service (ex. log de tentatives d'accès au service) ou à des fins d'analyse (ex. statistiques).<br>Cette mesure vise à protéger les utilisateurs contre la traçabilité nominative de leurs actions dans le cadre de l'utilisation du service tout en permettant d'assurer la sécurité de ce dernier au travers du suivi et de l'imputabilité des actions.",
    },
    certificatChiffrement: {
      description: "Chiffrer le trafic avec l'utilisation d'un certificat conforme au référentiel général de sécurité",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à renforcer la sécurité du trafic. Il s'agit d'une mesure de filtrage.",
    },
    certificatSignature: {
      description: 'Installer un certificat de signature électronique conforme à la réglementation',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Dans le cadre de la configuration du service, installer un certificat de signature électronique qualifié au sens du règlement n° 910/2014 eIDAS, délivré par un prestataire qualifié, ou recourir à un service conforme.<br>Cette mesure permet la réalisation d'une signature électronique robuste sur le plan de la sécurité, conforme à la réglementation française et européenne.",
    },
    chiffrementFlux: {
      description: 'Désactiver tout flux non chiffré',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: 'Cette mesure vise à empêcher que des flux de données non chiffrés ne soient interceptés par des acteurs malveillants.',
    },
    chiffrementMachineVirtuelle: {
      description: 'Chiffrer la machine virtuelle',
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à renforcer la sécurité des données grâce au chiffrement de leur contenant, à savoir la machine virtuelle.',
    },
    coffreFort: {
      description: 'Encourager les administrateurs à utiliser un coffre-fort de mots de passe',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Recommander ou proposer aux administrateurs le recours à une ou plusieurs solutions de gestion de mots de passe sécurisés, permettant de générer des mots de passe aléatoires et robustes et de les enregistrer.<br>Cette mesure permet de faciliter la création de mots de passe différents, longs et complexes, distincts pour chaque compte d'accès, sans effort de mémorisation.",
    },
    compartimenter: {
      description: "Compartimenter les rôles d'administration métier et d'administration technique",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de limiter la portée d'une compromission d'un compte d'administrateur et le risque de pouvoir accéder à des services/fonctions non nécessaires à ce rôle. Elle consiste à compartimenter les rôles d'administration métier/fonctionnel (rôle de publication, gestion des utilisateurs du sites, etc.) des rôles techniques (administration des bases de données, le serveur web, l'infrastructure d'accueil, l'admin de la ou des VM participant à l'offre de service).",
    },
    configurationMinimaliste: {
      description: 'Configurer le service selon la règle de la configuration minimaliste',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à éviter d'installer des fonctionnalités non nécessaires qu'il sera nécessaire de maintenir à jour et qui pourraient être autant de moyens d'accès additionnels possibles pour un attaquant. L'approche minimaliste « réduit la surface d'attaque ». Cela comprend aussi la désactivation des services préinstallés par contrainte et non utilisés.",
    },
    contraintesMotDePasse: {
      description: 'Fixer des contraintes de longueur et de complexité des mots de passe',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Fixer des règles de longueur et de complexité des mots de passe lors de la création d'un mot de passe ou de son renouvellement par un utilisateur ou un administrateur. Lorsque cela est possible, configurer le service pour interdire les mots de passe faibles.<br>Cette mesure permet de diminuer le risque de découverte et l'usurpation de mots de passe par des acteurs malveillants, par exemple en testant plusieurs mots de passe sur la base de mots du dictionnaire.",
    },
    deconnexionAutomatique: {
      description: "Mettre en place la déconnexion automatique des sessions d'accès après une certaine durée",
      categorie: 'protection',
      descriptionLongue: "Cette mesure vise à diminuer le risque d'usurpation d'un accès au service, dans le cas où l'équipement serait laissé sans surveillance par l'utilisateur.",
    },
    differentiationFiltrage: {
      description: 'Différencier le filtrage des accès utilisateurs et administrateurs (métiers et technique)',
      categorie: 'protection',
      descriptionLongue: "Cette mesure vise à cloisonner les différents types d'accès afin d'éviter qu'un accès utilisateur puisse être détourné par un attaquant pour gagner un accès administrateur au service.",
    },
    dissocierComptesAdmin: {
      description: 'Dissocier les accès, les comptes et les privilèges des agents à la fois utilisateurs et administrateurs',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet d'éviter qu'un administrateur n'utilise le service en tant qu'utilisateur avec son compte administrateur. Cela permet de diminuer le risque d'usurpation du compte administrateur. Il est recommandé de dissocier également les équipements permettant l'accès utilisateur et administrateur. Cela contribue à réduire le risque d'utilisation illégitime et malveillant d'un accès administrateur.",
    },
    doubleAuthentAdmins: {
      description: "Prévoir l'authentification multifacteur pour les administrateurs techniques et métiers du service",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à réduire le risque d'usurpation d'accès au service avec un compte administrateur, donnant des droits supérieurs à ceux d'un utilisateur, susceptibles d'être utilisés à des fins malveillantes (ex. supprimer des données, faire cesser le service, etc.). Pour plus de détails, consultez les recommandations de l'ANSSI relatives à l'authentification multifacteur et aux mots de passe.",
    },
    environnementSecurise: {
      description: 'Administrer techniquement le service dans des environnements dédiés et sécurisés',
      categorie: 'protection',
      descriptionLongue: "Demander aux administrateurs techniques du service de n'administrer ce dernier que depuis un environnement informatique dédié et sécurisé. Le recours à des équipements personnels doit notamment être proscrit.<br>Cette mesure vise à diminuer le risque de compromission des droits d'administration service via des moyens informatiques insuffisamment sécurisés.",
    },
    gestionComptesAcces: {
      description: "Mettre en œuvre une procédure de gestion des comptes d'accès",
      categorie: 'protection',
      descriptionLongue: "Cette mesure permet de maintenir une liste à jour des utilisateurs ayant le droit d'accéder au service et d'éviter que des comptes d'utilisateurs ou d'administrateurs inactifs, notamment de ceux ayant quitté l'organisation, soient utilisés à des fins malveillantes. Les comptes inactifs et ou de personnes parties doivent être désactivés, puis supprimés au bout d'une période à définir.",
    },
    hebergementMachineVirtuelle: {
      description: 'Héberger le service et les données dans une machine virtuelle',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à renforcer la sécurité de l'hébergement du service et faciliter la limitation des accès à ce dernier.",
    },
    limitationAccesAdmin: {
      description: "Limiter au strict nécessaire le nombre d'administrateurs du service",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de limiter le nombre de personnes (agents, personnes externes) capables d'administrer le service, susceptibles de voir leur compte usurpé à des fins malveillantes. Cette mesure réduit la surface d'attaque.",
    },
    limitationCreationComptes: {
      description: "Limiter la création de comptes d'accès à des comptes nominatifs",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet d'éviter de disposer de comptes partagés par plusieurs personnes, beaucoup plus difficiles à suivre et plus simples à usurper, en particulier les comptes d'accès administrateurs. Cette mesure participe à l'imputabilité des actions.",
    },
    limitationDroitsAdmin: {
      description: "Limiter les droits d'administration au seul rôle ciblé",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de réduire le pouvoir d'administration aux seuls services utiles à ce rôle. Par exemple, l'admin de base de donnée n'a de droits que sur la BDD, ou sur le serveur de bases de données, etc.",
    },
    misesAJour: {
      description: "Disposer d'une politique d'application des mises à jour fonctionnelles et de sécurité du service numérique",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à limiter la vulnérabilité du service à des failles de sécurité disposant d'un correctif de sécurité qui n'auraient pas été prises en compte. Cette mesure permet également de disposer d'une version toujours récente du service, réduisant ainsi l'exploitation possible de vulnérabilités connues.",
    },
    moindrePrivilege: {
      description: 'Configurer les applicatifs selon la règle du moindre privilège',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à limiter les droits (privilèges) accordés aux différents éléments applicatifs du service afin d'éviter que ceux-ci ne puissent être détournés à des fins malveillantes.",
    },
    nomsDomaineFrUe: {
      description: "Privilégier l'achat de noms de domaines en .fr ou .eu",
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à permettre une réaction rapide en cas de typosquatting (consistant à utiliser des noms de domaines proches contenant des erreurs typographiques discrètes ou courantes permettant de rediriger les utilisateurs vers un site malveillant) et renforcer la confiance dans les utilisateurs du service',
    },
    nomsDomaineSimilaires: {
      description: 'Acheter plusieurs noms de domaine proches du nom de domaine du service',
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à permettre une réaction rapide en cas de typosquatting (consistant à utiliser des noms de domaines proches contenant des erreurs typographiques discrètes ou courantes permettant de rediriger les utilisateurs vers un site malveillant) et renforcer la confiance dans les utilisateurs du service',
    },
    portsOuverts: {
      description: 'Fermer tous les ports non strictement nécessaires',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Configurer le service en vue de fermer tous les ports réseau non strictement nécessaires à l'administration et au fonctionnement du service et fermer tous les autres ports.<br>Cette mesure permet de réduire le risque d'accès illégitime au service de la part d'acteurs malveillants.",
    },
    protectionDeniService: {
      description: 'Souscrire à un service de protection contre les attaques de déni de service',
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à protéger le service contre les attaques de type « déni de service » pouvant rendre le service temporairement innaccessible.',
    },
    protectionMotsDePasse: {
      description: 'Protéger les mots de passe stockés sur le service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Dans le cadre de la configuration du service au niveau du serveur d'hébergement, veiller à ne pas stocker les mots de passe « en clair ». Seule une « empreinte » des mots de passe doit être stockée.<br>L'objectif de cette mesure est de limiter la capacité d'un attaquant à accéder aux mots de passe en cas de compromission de la base de données des mots de passe.",
    },
    renouvellementMotsDePasse: {
      description: 'Planifier le renouvellement régulier des mots de passe des administrateurs',
      categorie: 'protection',
      descriptionLongue: "Configurer ou recommander à intervalle régulier le renouvellement des mots de passe des comptes d'administration.<br>Cette mesure permet d'éviter qu'un mot de passe ancien ou proche d'un mot de passe déjà utilisé toujours utilisé ne soit découvert et utilisé par un acteur malveillant.",
    },
    securisationCode: {
      description: 'Mettre en œuvre des bonnes pratiques de sécurisation du code',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à renforcer la sécurité du service dès son développement (« security by design ») afin de limiter les vulnérabilités techniques du service susceptibles d'être exploitées par des attaquants. Par exemple, cette mesure permet de réduire le risque de défiguration du service ou son utilisation en « point d'eau » visant à infecter, depuis le service, les équipements des utilisateurs du service. Le respect des bonnes pratiques proposé par l'OWASP est recommandé.",
    },
    telechargementsOfficiels: {
      description: "Permettre exclusivement le téléchargement d'une application mobile depuis les magasins officiels",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à éviter le téléchargement, par les utilisateurs, depuis internet, d'une version de l'application qui aurait été compromise par un acteur malveillant.",
    },
    versionRecente: {
      description: 'Utiliser une version récente et maintenue des éléments applicatifs composant le service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à éviter d'utiliser une version ancienne d'éléments applicatifs sous-jacents au service (ex. un CMS) qui comporterait des vulnérabilités connues ou qui ne ferait plus l'objet de mises à jour de sécurité par l'éditeur.",
    },

    gestionIncidents: {
      description: 'Définir une procédure de gestion des incidents de sécurité',
      categorie: 'defense',
      descriptionLongue: "Cette mesure vise à fixer les rôles et responsabilités des différentes parties prenantes de l'organisation en cas d'incident de sécurité ainsi que les bons réflexes à avoir dans la gestion de l'incident, sur le plan opérationnel mais aussi vis-à-vis des agents publics et des utilisateurs.",
    },
    journalAcces: {
      description: 'Mettre en œuvre la journalisation et la centralisation des accès',
      categorie: 'defense',
      descriptionLongue: "Cette mesure permet de conserver une trace des accès des utilisateurs, des administrateurs et des applicatifs. Elle vise à faciliter la détection d'actions inhabituelles susceptibles d'être malveillantes mais aussi à investiguer les causes d'un incident de sécurité une fois que celui-ci est intervenu, en vue de faciliter sa rémédiation. Le journal des logs est permis lors de la configuration du service.",
    },
    journalEvenementSecu: {
      description: 'Mettre en œuvre la journalisation et la centralisation des évènements de sécurité',
      categorie: 'defense',
      descriptionLongue: "Cette mesure permet de conserver une trace des évènements de sécurité passés, des mesures mises en place en vue d'y rémédier et de détecter plus aisément de nouveaux évènements de sécurité, par corrélation.",
    },
    notificationConnexionsSuspectes: {
      description: 'Envoyer aux administrateurs et aux utilisateurs une notification en cas de connexion suspecte',
      categorie: 'defense',
      descriptionLongue: "Cette mesure vise à signaler les connexions inhabituelles aux utilisateurs et aux administrateurs. Elle permet de stopper ou de détecter une tentative d'accès illégitime potentiellement malveillant.",
    },
    supervision: {
      description: 'Recourir à un service de supervision de la sécurité',
      categorie: 'defense',
      descriptionLongue: "Cette mesure vise à renforcer la capacité de détection et de réponse à incident en souscrivant aux services d'une entité experte (security operation center, équipe de réponse à incident, etc.)",
    },
    testsProcedures: {
      description: "Tester régulièrement les procédures de gestion d'incident",
      categorie: 'defense',
      descriptionLongue: 'Cette mesure vise à vérifier que les procédures de détection et de gestion des incidents en place sont bien fonctionnelles.',
    },
    veilleSecurite: {
      description: "Disposer d'éléments de veille relatifs aux vulnérabilités et aux campagnes de compromission sur Internet",
      categorie: 'defense',
      descriptionLongue: "Cette mesure peut se décliner par le suivi des alertes fournies par le CERT-FR, un abonnement à des solutions de veille permettant de s'informer sur l'actualité des vulnérabilités découvertes et publiées, ainsi que sur les campagnes de piratages.",
    },

    exerciceGestionCrise: {
      description: 'Planifier un exercice de gestion de crise, notamment face au risque de rançongiciel',
      categorie: 'resilience',
      descriptionLongue: "Cette mesure vise à préparer l'organisation à la gestion de crises de sécurité, afin de permettre un retour le plus rapide possible à un mode de fonctionnement normal du service et de l'organisation. Cette mesure permet d'identifier et de qualifier la capacité de réaction de l'ensemble de la chaîne hiérarchique (phase de réaction), dont les équipes techniques et de vérifier la résilience en validant la capacité à remettre en service opérationnel le service web.",
    },
    garantieHauteDisponibilite: {
      description: 'Recourir à une ou plusieurs solutions garantissant un haut niveau de disponibilité du service',
      categorie: 'resilience',
      descriptionLongue: "Recourir à une ou plusieurs solutions garantissant un haut niveau de disponibilité, en particulier dans le cadre de l'hébergement du service (ex. obligation de redondance de la machine virtuelle et des données).<br>Cette mesure permet d'éviter une interruption du service dépassant quelques minutes.",
    },
    sauvegardeDonnees: {
      description: 'Mettre en place une sauvegarde régulière des données dans un environnement non connecté au service numérique',
      categorie: 'resilience',
      descriptionLongue: "Cette mesure vise à permettre de protéger l'ensemble des données contenues dans le service et permettre à nouveau leur accès dans le cas où le service serait compromis, par exemple, par un rançongiciel qui aurait « chiffré » et donc rendu inaccessibles ces données. Il est recommandé de procéder à cette sauvegarde au minimum, une fois par semaine.",
    },
    sauvegardeMachineVirtuelle: {
      description: 'Mettre en place une sauvegarde en continu de la machine virtuelle sur laquelle est déployé le service numérique.',
      categorie: 'resilience',
      indispensable: true,
      descriptionLongue: 'Cette mesure vise à permettre de réinstaller le service dans sa configuration la plus récente, dans le cas où celui-ci aurait été compromis, par exemple, par un rançongiciel, par une défiguration, etc.',
    },
    testsSauvegardes: {
      description: 'Tester régulièrement les sauvegardes',
      categorie: 'resilience',
      indispensable: true,
      descriptionLongue: 'Cette mesure vise à vérifier que les sauvegardes réalisées sont fonctionnelles et pourront être utilisées en cas de problème.',
    },
  },

  localisationsDonnees: {
    france: { description: 'France' },
    unionEuropeenne: { description: 'Union européenne' },
    autre: { description: 'Hors Union européenne' },
  },

  echeancesRenouvellement: {
    sixMois: { description: echeance('six mois'), expiration: expiration('six mois') },
    unAn: { description: echeance('un an'), expiration: expiration('un an') },
    deuxAns: { description: echeance('deux ans'), expiration: expiration('deux ans') },
  },

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
        regles: [{
          presence: ['applicationMobile'],
        }],
        mesuresAAjouter: ['telechargementsOfficiels'],
      },
      applicationAchettee: {
        regles: [{
          presence: ['achat'],
          absence: ['developpement'],
        }],
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
        regles: [{
          presence: ['compte'],
        }],
        mesuresAAjouter: [
          'analyseRisques',
          'audit',
          'auditsSecurite',
          'deconnexionAutomatique',
        ],
        mesuresARendreIndispensables: [
          'testIntrusion',
        ],
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
        mesuresARetirer: [
          'testIntrusion',
        ],
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
        regles: [
          { presence: ['signatureElectronique'] },
        ],
        mesuresAAjouter: [
          'certificatSignature',
        ],
      },
      impactIndisponibiliteRapidementCritique: {
        regles: [
          { presence: ['moinsUneHeure'] },
        ],
        mesuresARendreIndispensables: [
          'garantieHauteDisponibilite',
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
  departements,
};
