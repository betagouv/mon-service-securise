const echeance = (duree) => `Dans ${duree}`;
const expiration = (duree) => `${duree.charAt(0).toUpperCase()}${duree.slice(1)} après signature de la présente homologation`;

module.exports = {
  actionsSaisie: {
    descriptionService: { position: 0, description: 'Description du service' },
    caracteristiquesComplementaires: { position: 1, description: 'Caractéristiques complémentaires' },
    partiesPrenantes: { position: 2, description: 'Parties prenantes' },
    risques: { position: 3, description: 'Risques de sécurité' },
    mesures: { position: 4, description: 'Mesures de sécurité' },
    avisExpertCyber: { position: 5, description: 'Avis sur le dossier' },
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
    accessible: {
      description: 'Le service est déjà accessible aux utilisateurs',
    },
    nonAccessible: {
      description: "Le service n'est pas accessible aux utilisateurs",
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
      exemple: 'nº de carte bancaire, etc.',
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
    autre: {
      description: 'Autre données sensibles',
      exemple: "documents sensibles internes à l'administration.",
      seuilCriticite: 'faible',
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
    nonConcerne: { position: 0, description: 'Non concerné', important: false },
    minime: { position: 1, description: 'Minime', important: false },
    significatif: { position: 2, description: 'Significatif', important: true },
    grave: { position: 3, description: 'Grave', important: true },
    critique: { position: 4, description: 'Critique', important: true },
  },

  risques: {
    indisponibiliteService: {
      description: 'Le service numérique et ses données sont tout ou en partie inaccessibles',
      descriptionLongue: "Votre service numérique est susceptible d'être concerné par ce risque si son indisponibilité peut avoir des conséquences graves sur le fonctionnement de l'organisation, de telle sorte qu'un attaquant pourrait chercher à en tirer un avantage financier – via une demande de rançon – ou à nuire au fonctionnement de votre organisation ou à sa réputation. Par exemple, <a href=\"https://www.lemonde.fr/pixels/article/2021/02/15/apres-celui-de-dax-l-hopital-de-villefranche-paralyse-par-un-rancongiciel_6070049_4408996.html\" target=\"_blank\" rel=\"noopener\">les données d'un hôpital public ont été rendues inaccessibles par un rançongiciel</a>, qui constitue l'une des attaques les plus répandues aujourd'hui.",
    },
    donneesModifiees: {
      description: 'Des informations concernant des utilisateurs sont modifiées ou supprimées',
      descriptionLongue: "Votre service numérique est susceptible d'être concerné par ce risque si celui-ci inclut des données dont la modification pourrait bénéficier à une ou plusieurs personnes ou à l'inverse leur porter préjudice, ou nuire à la réputation ou au fonctionnement de votre organisation. Par exemple, <a href=\"https://www.europe1.fr/faits-divers/Un-collegien-pirate-son-proviseur-pour-modifier-ses-notes-en-ligne-781242\" target=\"_blank\" rel=\"noopener\">un attaquant a modifié les notes et le relevé d'assiduité d'élèves en leur faveur depuis l'espace numérique d'un établissement scolaire</a>.",
    },
    divulgationDonnees: {
      description: 'Des informations sont divulguées publiquement',
      descriptionLongue: "Votre service numérique est susceptible d'être concerné par ce risque si celui-ci inclut des informations dont la divulgation publique pourrait porter préjudice aux personnes concernées et à la réputation de votre organisation. Par exemple, <a href=\"https://www.lagazettedescommunes.com/746159/les-donnees-personnelles-dagents-du-grand-annecy-diffusees-cinq-mois-apres-la-cyberattaque/?abo=1\" target=\"_blank\" rel=\"noopener\">un attaquant a déjà diffusé publiquement des données à caractère personnel concernant plusieurs agents d'une collectivité</a>.",
    },
    defigurationSiteWeb: {
      description: 'Le service numérique est défiguré',
      descriptionLongue: "Votre service numérique est susceptible d'être concerné par ce risque si sa visibilité est à même d'être exploitée par des attaquants cherchant à diffuser des messages à des fins idéologiques, de revanche ou de simple dégradation. Ce risque est accru si des vulnérabilités facilement identifiables peuvent être exploitées. Par exemple, <a href=\"https://www.europe1.fr/technologies/plusieurs-sites-internet-francais-ont-ete-victimes-de-cyberattaques-4001200\" target=\"_blank\" rel=\"noopener\">des messages ou des images à caractère terroriste ont déjà été affichés sur des sites internet français ainsi défigurés</a>. Votre service numérique peut aussi être concerné par ce risque si la modification discrète des informations affichées peut nuire à des utilisateurs ou à la réputation de votre organisation.",
    },
    arnaques: {
      description: "Des informations dérobées sont utilisées à des fins d'escroquerie",
      descriptionLongue: "Votre service numérique est susceptible d'être concerné par ce risque si celui-ci inclut des informations pouvant être réutilisées à des fins malveillantes, la plupart du temps motivées par le gain financier. Par exemple par leur <a href=\"https://www.hashtagg.fr/2021/03/07/le-business-des-donnees-revendues-sur-le-dark-web/\" target=\"_blank\" rel=\"noopener\">revente</a> sur le dark web, à des fins <a href=\"https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/violation-donnees-ap-hp-formulaire-lettre-plainte-electronique\" target=\"_blank\" rel=\"noopener\">d'arnaque</a>, de spam, d'usurpation d'identité ou pour mener d'autres attaques telles que des campagnes de <a href=\"https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/hameconnage-assurance-maladie-ameli\" target=\"_blank\" rel=\"noopener\">hameçonnage</a>.",
    },
    logicielsMalveillants: {
      description: 'Le service numérique est détourné de son usage initial',
      descriptionLongue: "Votre service numérique est susceptible d'être concerné par ce risque si ses capacités techniques ou encore ses utilisateurs sont susceptibles d'intéresser un attaquant souhaitant mener d'autres actions malveillantes la plupart du temps à des fins de gain financier. Ce risque est accru si des vulnérabilités facilement identifiables peuvent être exploitées. Par exemple, le détournement de la puissance de votre service peut permettre de miner des crypto-monnaies ou <a href=\"https://business.lesechos.fr/directions-numeriques/technologie/cybersecurite/0602985980097-de-nombreux-hackers-utilisent-le-covid-19-a-des-fins-malveillantes-336176.php\" target=\"_blank\" rel=\"noopener\">l'introduction d'un logiciel malveillant visant à infecter des utilisateurs du service</a> peut permettre de dérober des informations.",
    },
    surveillance: {
      description: "Le contenu d'échanges est intercepté",
      descriptionLongue: "Votre service numérique est susceptible d'être concerné par ce risque si l'interception du contenu d'échanges entre agents publics ou avec des usagers peut intéresser des acteurs malveillants à des fins de renseignement, d'espionnage économique. Par exemple, les échanges entre de jeunes entreprises technologiques et une administration soutenant ces dernières pourraient donner accès à des informations privilégiées à de potentiels concurrents sur les « pépites » françaises.",
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
    planifie: 'Planifié',
    nonFait: 'Non fait',
    nonRetenu: 'Non concerné',
  },

  mesures: {
    limitationInterconnexions: {
      description: "Limiter et connaître les interconnexions du service avec d'autres systèmes",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de limiter le risque de contagion d'un incident de sécurité d'un système d'information vers un autre. Il peut s'agir d'autres systèmes essentiels de l'organisation ou de systèmes externes de partenaires ou de sous-traitants (hébergeur, prestataire d'infogérance, prestataire de service de sécurité, etc.).",
    },
    listeEquipements: {
      description: "Disposer d'une liste à jour des équipements et des logiciels contribuant au fonctionnement du service numérique",
      categorie: 'gouvernance',
      descriptionLongue: 'Cette mesure contribue au maintien du service en sécurité, en permettant leur mise à jour régulière et la correction des failles de sécurité connues des équipements et logiciels qui permettent le fonctionnement du service.',
    },
    identificationDonneesSensibles: {
      description: 'Identifier les données les plus sensibles à protéger',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de concentrer l'effort de sécurisation (notamment les sauvegardes) sur ce qui a le plus de valeur et de diminuer le risque d'atteinte à ces données.",
    },
    contactSecurite: {
      description: 'Rendre public un contact pour signaler un problème de sécurité',
      categorie: 'gouvernance',
      descriptionLongue: 'Cette mesure facilite le signalement de problèmes de sécurité et leur correction.',
    },
    exigencesSecurite: {
      description: 'Connaître les exigences de sécurité incombant aux sous-traitants du service numérique',
      categorie: 'gouvernance',
      descriptionLongue: 'Cette mesure permet de vérifier le respect des exigences de sécurité par les sous-traitants (hébergeur, prestataires, etc.) idéalement fixées sur le plan contractuel.',
    },
    modalitesSuivi: {
      description: 'Fixer les modalités du suivi de la sécurité du service entre les parties prenantes',
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure garantit que le ou la spécialiste cybersécurité et l'ensemble des parties prenantes (internes, externes) échangent régulièrement sur le maintien en sécurité du service et décident des actions à mener en conséquence. Il est recommandé de réunir l'équipe au moins 2 fois par an.",
    },
    formaliserModalitesSecurite: {
      description: 'Formaliser les modalités de mise en œuvre des mécanismes de sécurité importants pour le service',
      categorie: 'gouvernance',
      descriptionLongue: 'Cette mesure permet à tous les administrateurs et exploitants du système de savoir quelles mesures mettre en œuvre pour assurer le niveau de sécurité du système tel que prévu par les équipes projets',
    },
    hebergementUE: {
      description: "Héberger le service numérique et les données au sein de l'Union européenne",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure renforce le niveau de confiance dans la protection des données à caractère personnel des utilisateurs du service et facilite l'ensemble des actions qui pourraient découler de la survenue d'un incident de sécurité (rémédiation, enquête, etc.).",
    },
    secNumCloud: {
      description: "Héberger le service numérique et les données au sein d'un Cloud qualifié SecNumCloud",
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure apporte des garanties techniques et juridiques supplémentaires pour la sécurité du service et des données, en recourant à une solution d'hébergement disposant d'un visa de sécurité de l'ANSSI.",
    },
    interdictionParageVente: {
      description: 'Proscrire le partage ou la vente de données des utilisateurs du service à des tierces parties à des fins commerciales',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure protège les utilisateurs contre toutes formes d'utilisation abusive de leurs données, par exemple, via l'installation d'outils d'analyse d'audience, dispositif publicitaires, etc. Cette mesure n'empêche pas l'ouverture des données publiques à des fins d'intérêt général.",
    },
    sensibilisationRisques: {
      description: 'Réaliser des actions régulières de sensibilisation des agents aux risques numériques',
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure contribue à accroître globalement la vigilance des agents face aux risques de sécurité et d'adopter les bons réflexes, comme éviter certaines actions imprudentes ou signaler un problème de sécurité.",
    },
    consignesSecurite: {
      description: "Fixer et sensibiliser les agents aux consignes de sécurité liées à l'utilisation du service",
      categorie: 'gouvernance',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de former les agents aux bonnes pratiques dans l'usage d'un service numérique et aux actions à proscrire.",
    },
    analyseRisques: {
      description: "Organiser au moins un atelier d'analyse des risques du service numérique",
      categorie: 'gouvernance',
      descriptionLongue: "Cette mesure vise à étoffer, par l'organisation d'un atelier d'analyse de risques avec l'ensemble des acteurs de l'homologation, à améliorer la connaissance des risques pour le service numérique et permettre l'ajout de mesures de sécurité spécifiques. Ces informations doivent être renseignées dans les rubriques « risques » et « mesures » de sécurité de MonServiceSécurisé.",
    },

    deconnexionAutomatique: {
      description: "Mettre en place la déconnexion automatique des sessions d'accès après une certaine durée",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à diminuer le risque d'usurpation d'un accès au service, dans le cas où l'équipement serait laissé sans surveillance par l'utilisateur.",
    },
    accesSecurise: {
      description: 'Mettre en place une politique de sécurité des mots de passe',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet d'éviter des mots de passe trop simples, trop courts ou anciens ne soient utilisés par un acteur malveillant pour accéder au service. Cette mesure peut être mise en œuvre en fixant des règles au moment de l'enregistrement d'un mot de passe (longueur, complexité, etc.) ; l'introduction d'un testeur de force de mot de passe ;  un délai d'expiration du mot de passe ; une politique de renouvellement automatique ; un accès sans mot de passe par la réception d'un code à usage unique à chaque connexion (hors SMS) ; l'impossibilité de réutiliser des mots de passe déjà employés par le passé ; la révocation immédiate de mots de passe  en cas de connexion suspecte, etc. Pour plus de détails, consultez le <a href=\"https://www.ssi.gouv.fr/administration/guide/recommandations-relatives-a-lauthentification-multifacteur-et-aux-mots-de-passe/\" target=\"_blank\" rel=\"noopener\">« Guide de l'ANSSI relatives à l'authentification multifacteur et aux mots de passe ».</a>",
    },
    franceConnect: {
      description: 'Permettre la connexion des utilisateurs via FranceConnect',
      categorie: 'protection',
      descriptionLongue: "Cette mesure vise à faciliter l'accès sécurisé des utilisateurs au service. FranceConnect permet également aux internautes de s'identifier sur un service en ligne par l'intermédiaire d'un compte existant",
    },
    listeComptesPrivilegies: {
      description: "Disposer d'une liste à jour des comptes disposant d'un d'accès privilégié au service",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de connaître toutes les personnes en interne ou en externe (sous-traitant, etc.) disposant d'un accès au service. Cette mesure est indispensable en vue de limiter le nombre de comptes d'accès privilégiés, de supprimer les comptes obsolètes, etc.",
    },
    gestionComptesAcces: {
      description: "Mettre en œuvre une procédure de gestion des comptes d'accès",
      categorie: 'protection',
      descriptionLongue: "Cette mesure permet de maintenir une liste à jour des utilisateurs ayant le droit d'accéder au service et d'éviter que des comptes d'utilisateurs ou d'administrateurs inactifs, notamment de ceux ayant quitté l'organisation, soient utilisés à des fins malveillantes. Les comptes inactifs et ou de personnes parties doivent être désactivés, puis supprimés au bout d'une période à définir.",
    },
    compartimenter: {
      description: "Compartimenter les rôles d'administration métier et d'administration technique",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de limiter la portée d'une compromission d'un compte d'administrateur et le risque de pouvoir accéder à des services/fonctions non nécessaires à ce rôle. Elle consiste à compartimenter les rôles d'administration métier/fonctionnel (rôle de publication, gestion des utilisateurs du sites, etc.) des rôles techniques (administration des bases de données, le serveur web, l'infrastructure d'accueil, l'admin de la ou des VM participant à l'offre de service).",
    },
    dissocierComptesAdmin: {
      description: 'Dissocier les accès, les comptes et les privilèges des agents à la fois utilisateurs et administrateurs',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet d'éviter qu'un administrateur n'utilise le service en tant qu'utilisateur avec son compte administrateur. Cela permet de diminuer le risque d'usurpation du compte administrateur. Il est recommandé de dissocier également les équipements permettant l'accès utilisateur et administrateur. Cela contribue à réduire le risque d'utilisation illégitime et malveillant d'un accès administrateur.",
    },
    limitationCreationComptes: {
      description: "Limiter la création de comptes d'accès à des comptes nominatifs",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet d'éviter de disposer de comptes partagés par plusieurs personnes, beaucoup plus difficiles à suivre et plus simples à usurper, en particulier les comptes d'accès administrateurs. Cette mesure participe à l'imputabilité des actions.",
    },
    doubleAuthentAdmins: {
      description: "Prévoir l'authentification multifacteur pour les administrateurs techniques et métiers du service",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à réduire le risque d'usurpation d'accès au service avec un compte administrateur, donnant des droits supérieurs à ceux d'un utilisateur, susceptibles d'être utilisés à des fins malveillantes (ex. supprimer des données, faire cesser le service, etc.). Pour plus de détails, consultez les recommandations de l'ANSSI relatives à l'authentification multifacteur et aux mots de passe.",
    },
    limitationAccesAdmin: {
      description: "Limiter au strict nécessaire le nombre d'administrateurs du service",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de limiter le nombre de personnes (agents, personnes externes) capables d'administrer le service, susceptibles de voir leur compte usurpé à des fins malveillantes. Cette mesure réduit la surface d'attaque.",
    },
    limitationDroitsAdmin: {
      description: "Limiter les droits d'administration au seul rôle ciblé",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de réduire le pouvoir d'administration aux seuls services utiles à ce rôle. Par exemple, l'admin de base de donnée n'a de droits que sur la BDD, ou sur le serveur de bases de données, etc.",
    },
    certificatChiffrement: {
      description: "Chiffrer le trafic avec l'utilisation d'un certificat conforme au référentiel général de sécurité",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à renforcer la sécurité du trafic. Il s'agit d'une mesure de filtrage.",
    },
    differentiationFiltrage: {
      description: 'Différencier le filtrage des accès utilisateurs et administrateurs (métiers et technique)',
      categorie: 'protection',
      descriptionLongue: "Cette mesure vise à cloisonner les différents types d'accès afin d'éviter qu'un accès utilisateur puisse être détourné par un attaquant pour gagner un accès administrateur au service.",
    },
    nomsDomaineFrUe: {
      description: "Privilégier l'achat de noms de domaines en .fr ou .ue",
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à permettre une réaction rapide en cas de typosquatting (consistant à utiliser des noms de domaines proches contenant des erreurs typographiques discrètes ou courantes permettant de rediriger les utilisateurs vers un site malveillant) et renforcer la confiance dans les utilisateurs du service',
    },
    nomsDomaineSimilaires: {
      description: 'Acheter plusieurs noms de domaine proches du nom de domaine du service',
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à permettre une réaction rapide en cas de typosquatting (consistant à utiliser des noms de domaines proches contenant des erreurs typographiques discrètes ou courantes permettant de rediriger les utilisateurs vers un site malveillant) et renforcer la confiance dans les utilisateurs du service',
    },
    securisationCode: {
      description: 'Mettre en œuvre des bonnes pratiques de sécurisation du code',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à renforcer la sécurité du service dès son développement (« security by design ») afin de limiter les vulnérabilités techniques du service susceptibles d'être exploitées par des attaquants. Par exemple, cette mesure permet de réduire le risque de défiguration du service ou son utilisation en « point d'eau » visant à infecter, depuis le service, les équipements des utilisateurs du service. Le respect des bonnes pratiques proposé par l'OWASP est recommandé.",
    },
    auditsSecurite: {
      description: 'Organiser des contrôles et audits de sécurité périodiques',
      categorie: 'protection',
      descriptionLongue: "Cette mesure vise à assurer un suivi de la sécurité du service. Les contrôles doivent porter sur l'architecture, la configuration, le code source, la réalisation de tests d'intrusion",
    },
    parefeu: {
      description: 'Installer un parefeu',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à filtrer les flux au niveau du réseau, afin d'éviter des accès illégitimes au service.",
    },
    chiffrementFlux: {
      description: 'Désactiver tout flux non chiffré',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: 'Cette mesure vise à empêcher que des flux de données non chiffrés ne soient interceptés par des acteurs malveillants.',
    },
    protectionDeniService: {
      description: 'Souscrire à un service de protection contre les attaques de déni de service',
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à protéger le service contre les attaques de type « déni de service » pouvant rendre le service temporairement innaccessible.',
    },
    hebergementMachineVirtuelle: {
      description: 'Héberger le service et les données dans une machine virtuelle',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à renforcer la sécurité de l'hébergement du service et faciliter la limitation des accès à ce dernier.",
    },
    chiffrementMachineVirtuelle: {
      description: 'Chiffrer la machine virtuelle',
      categorie: 'protection',
      descriptionLongue: 'Cette mesure vise à renforcer la sécurité des données grâce au chiffrement de leur contenant, à savoir la machine virtuelle.',
    },
    misesAJour: {
      description: "Disposer d'une politique d'application des mises à jour fonctionnelles et de sécurité du service numérique",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à limiter la vulnérabilité du service à des failles de sécurité disposant d'un correctif de sécurité qui n'auraient pas été prises en compte. Cette mesure permet également de disposer d'une version toujours récente du service, réduisant ainsi l'exploitation possible de vulnérabilités connues.",
    },
    versionRecente: {
      description: 'Utiliser une version récente et maintenue des éléments applicatifs composant le service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à éviter d'utiliser une version ancienne d'éléments applicatifs sous-jacents au service (ex. un CMS) qui comporterait des vulnérabilités connues ou qui ne ferait plus l'objet de mises à jour de sécurité par l'éditeur.",
    },
    moindrePrivilege: {
      description: 'Configurer les applicatifs selon la règle du moindre privilège',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à limiter les droits (privilèges) accordés aux différents éléments applicatifs du service afin d'éviter que ceux-ci ne puissent être détournés à des fins malveillantes.",
    },
    configurationMinimaliste: {
      description: 'Configurer le service selon la règle de la configuration minimaliste',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à éviter d'installer des fonctionnalités non nécessaires qu'il sera nécessaire de maintenir à jour et qui pourraient être autant de moyens d'accès additionnels possibles pour un attaquant. L'approche minimaliste « réduit la surface d'attaque ». Cela comprend aussi la désactivation des services préinstallés par contrainte et non utilisés.",
    },
    verificationAutomatique: {
      description: 'Procéder à des vérifications techniques automatiques de la sécurité du service',
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à vérifier, avant le lancement du service, la présence de défauts de configuration ou de vulnérabilités connues, grâce à des outils de tests disponibles la plupart du temps gratuitement en ligne ou à installer en local comme <a href=\"https://testssl.sh/\" target=\"_blank\" rel=\"noopener\">testSSL</a> permettant d'évaluer le niveau de confiance du certificat SSL ; <a href=\"https://observatory.mozilla.org/\" target=\"_blank\" rel=\"noopener\">MozzilaObservatory</a> permettant d'évaluer le respect des bonnes pratiques de configuration HTTP ; dependabot, codeQL, Nmap permettant d'identifier la présence de vulnérabilités.",
    },
    testIntrusion: {
      description: "Effectuer un test d'intrusion et/ou réaliser un bug bounty",
      categorie: 'protection',
      descriptionLongue: "Cette mesure vise à vérifier, avant le lancement du service, la présence de vulnérabilités dans le service, par la réalisation d'un test d'intrusion ou d'un bug bounty, mobilisant des chercheurs de vulnérabilités.",
    },
    telechargementsOfficiels: {
      description: "Permettre exclusivement le téléchargement d'une application mobile depuis les magasins officiels",
      categorie: 'protection',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à éviter le téléchargement, par les utilisateurs, depuis internet, d'une version de l'application qui aurait été compromise par un acteur malveillant.",
    },

    veilleSecurite: {
      description: "Disposer d'éléments de veille relatifs aux vulnérabilités et aux campagnes de compromission sur Internet",
      categorie: 'defense',
      indispensable: true,
      descriptionLongue: "Cette mesure peut se décliner par le suivi des alertes fournies par le CERT-FR, un abonnement à des solutions de veille permettant de s'informer sur l'actualité des vulnérabilités découvertes et publiées, ainsi que sur les campagnes de piratages.",
    },
    gestionIncidents: {
      description: 'Définir une procédure de gestion des incidents de sécurité',
      categorie: 'defense',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à fixer les rôles et responsabilités des différentes parties prenantes de l'organisation en cas d'incident de sécurité ainsi que les bons réflexes à avoir dans la gestion de l'incident, sur le plan opérationnel mais aussi vis-à-vis des agents publics et des utilisateurs.",
    },
    journalAcces: {
      description: 'Mettre en œuvre la journalisation et la centralisation des accès',
      categorie: 'defense',
      indispensable: true,
      descriptionLongue: "Cette mesure permet de conserver une trace des accès des utilisateurs, des administrateurs et des applicatifs. Elle vise à faciliter la détection d'actions inhabituelles susceptibles d'être malveillantes mais aussi à investiguer les causes d'un incident de sécurité une fois que celui-ci est intervenu, en vue de faciliter sa rémédiation. Le journal des logs est permis lors de la configuration du service.",
    },
    journalEvenementSecu: {
      description: 'Mettre en œuvre la journalisation et la centralisation des évènements de sécurité',
      categorie: 'defense',
      indispensable: true,
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
    scanIP: {
      description: "Souscrire ou mettre en œuvre un outil de scan Internet des plages d'adresses IP du service numérique",
      categorie: 'defense',
      descriptionLongue: "Cette mesure vise à mesurer le niveau d'exposition du service numérique aux menaces et déterminer si seuls les services numériques utiles sont exposés à Internet. Cette mesure peut également viser à consolider les éléments de cartographie du système d'information.",
    },
    affichageDerniereConnexion: {
      description: "Afficher aux utilisateurs l'heure et la date de leur dernière connexion",
      categorie: 'defense',
      descriptionLongue: 'Cette mesure contribue à aider les utilisateurs à détecter eux-mêmes une utilisation à leur insu du service par une autre personne.',
    },

    exerciceGestionCrise: {
      description: 'Planifier un exercice de gestion de crise, notamment face au risque de rançongiciel',
      categorie: 'resilience',
      descriptionLongue: "Cette mesure vise à préparer l'organisation à la gestion de crises de sécurité, afin de permettre un retour le plus rapide possible à un mode de fonctionnement normal du service et de l'organisation. Cette mesure permet d'identifier et de qualifier la capacité de réaction de l'ensemble de la chaîne hiérarchique (phase de réaction), dont les équipes techniques et de vérifier la résilience en validant la capacité à remettre en service opérationnel le service web.",
    },
    politiqueInformation: {
      description: "Disposer d'une politique d'information des administrateurs métiers et des utilisateurs en cas d'incident",
      categorie: 'resilience',
      descriptionLongue: "Cette mesure vise à préparer l'organisation à communiquer vers les utilisateurs de son service au bon moment, notamment dans le cas où des données seraient compromises. Le réglement général sur la protection des données à caractère personnel prévoit notamment une obligation d'information des personnes concernées en cas de fuite de données à caractère personnel.",
    },
    sauvegardeDonnees: {
      description: 'Mettre en place une sauvegarde régulière des données dans un environnement non connecté au service numérique',
      categorie: 'resilience',
      indispensable: true,
      descriptionLongue: "Cette mesure vise à permettre de protéger l'ensemble des données contenues dans le service et permettre à nouveau leur accès dans le cas où le service serait compromis, par exemple, par un rançongiciel qui aurait « chiffré » et donc rendu inaccessibles ces données. Il est recommandé de procéder à cette sauvegarde au minimum, une fois par semaine.",
    },
    sauvegardeMachineVirtuelle: {
      description: 'Mettre en place une sauvegarde en continu de la machine virtuelle sur lequel est déployé le service numérique.',
      categorie: 'resilience',
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
    unionEuropeenne: { description: 'Union Européenne' },
    autre: { description: 'Autre' },
  },

  echeancesRenouvellement: {
    sixMois: { description: echeance('six mois'), expiration: expiration('six mois') },
    unAn: { description: echeance('un an'), expiration: expiration('un an') },
    deuxAns: { description: echeance('deux ans'), expiration: expiration('deux ans') },
  },
};
