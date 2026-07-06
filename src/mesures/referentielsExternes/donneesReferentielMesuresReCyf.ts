/*
  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceReCyfEnTypescript.sh
  Ne pas modifier directement
*/

import { DonneesReferentielsMesuresReCyf } from '../../referentielV2.js';

export const mesuresReCyf: Record<string, DonneesReferentielsMesuresReCyf> = {
  '1.1-EI/EE': {
    objectif: "Objectif de sécurité 1: Recensement des systèmes d'information",
    thematique: 'Recensement des SI',
    description:
      "L’entité liste l’ensemble de ses activités et services, y compris les activités et services qui ne correspondent pas aux critères pour lesquels l’entité constitue une entité importante ou essentielle (par exemple : une entité essentielle au titre d’une activité exploitation d’un oléoduc doit lister, en plus des activités et services participant à l’exploitation de l’oléoduc, tous les services et les autres activités qu’elle fournit).\nPour chaque entrée de cette liste, l’entité :\n•\tidentifie un responsable de l’activité ou du service (par exemple le chef de service auquel est rattachée l'activité ou le service, un directeur métier, la direction générale) ;\n•\tliste les systèmes d’information les supportant.",
  },
  '1.2-EI/EE': {
    objectif: "Objectif de sécurité 1: Recensement des systèmes d'information",
    thematique: 'Recensement des SI',
    description:
      'L’entité précise dans la liste prévue au 1.1-EI/EE les systèmes d’information qui ne sont exposés à aucun des risques mentionnés à l’alinéa 2 de l’objectif de sécurité.\nL’entité renseigne les justifications de ces choix.',
  },
  '1.3-EI/EE': {
    objectif: "Objectif de sécurité 1: Recensement des systèmes d'information",
    thematique: 'Recensement des SI',
    description:
      'L’entité valide et réexamine annuellement la liste prévue au 1.1-EI/EE, et en tant que de besoin, notamment en cas d’évolution des activités et services de l’entité ou en cas de mise en service d’un nouveau système d’information.',
  },
  '2.A.1-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: 'Rôles et responsabilités',
    description:
      'Le dirigeant exécutif de l’entité est responsable de la sécurité numérique au sein de son entité et en particulier du suivi de la conformité des systèmes d’information aux présentes mesures.',
  },
  '2.A.2-EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: 'Rôles et responsabilités',
    description:
      'Il désigne au moins une personne qui le conseille et l’accompagne dans l’exercice de cette responsabilité. Cette personne est le point de contact privilégié de l’Agence nationale de la sécurité des systèmes d’information pour tous les sujets relatifs à la sécurité numérique (notamment incidents de sécurité, communications de l’ANSSI sur les sujets relatifs aux entités essentielles)',
  },
  '2.A.3-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: 'Rôles et responsabilités',
    description:
      'L’entité définit et met en œuvre une organisation adaptée pour assurer sa sécurité numérique (par exemple : la désignation d’un responsable de la sécurité numérique, l’établissement d’un RACI, la mise en place d’une comitologie).',
  },
  '2.B.1-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: "Politique de sécurité des systèmes d'information",
    description:
      'L’entité définit et met en œuvre une politique de sécurité des systèmes d’information (PSSI).',
  },
  '2.B.2-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: "Politique de sécurité des systèmes d'information",
    description:
      'Cette PSSI comprend au moins :\n•\tL’organisation de la gouvernance de la sécurité numérique et notamment les rôles et les responsabilités du personnel interne et externe (par exemple : prestataires, fournisseurs) ;\n•\tLes orientations et objectifs stratégiques en matière de sécurité numérique déclinés de la stratégie globale de l’entité ;\n•\tL’engagement du dirigeant exécutif de l’entité à assurer la sécurité numérique des systèmes d’information dont il est responsable ;\n•\tL’engagement du dirigeant exécutif de l’entité à respecter les exigences légales et réglementaires et en particulier celles définies dans la transposition nationale de la directive NIS 2.\n•\tLa PSSI tient également compte des exigences, procédures et spécificités propres au(x) secteur(s) dans lesquels l’entité exerce ses activités.',
  },
  '2.B.3-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: "Politique de sécurité des systèmes d'information",
    description: 'Le dirigeant exécutif de l’entité approuve la PSSI.',
  },
  '2.B.4-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: "Politique de sécurité des systèmes d'information",
    description:
      'La PSSI est au minimum revue annuellement et mise à jour lorsque nécessaire, notamment en cas d’évolutions majeures de la menace, du contexte métier, technique ou organisationnel intervenues après son approbation.',
  },
  '2.B.5-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: "Politique de sécurité des systèmes d'information",
    description:
      'L’entité décline, en tant que de besoin, la PSSI en politiques de sécurité relatives à des thèmes précis permettant de couvrir tout ou partie des présentes mesures.\nEn particulier, l’entité définit et met en œuvre, au minimum, des politiques de sécurité en matière :\n•\tD’usage du chiffrement ;\n•\tDe contrôle d’accès physique et logique ;\n•\tDe revue de l’application des mesures de sécurité mises en œuvre ;\n•\tDe gestion des comptes.',
  },
  '2.C.1-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: 'Gestion de la conformité',
    description:
      'Pour chaque système d’information, l’entité réalise et maintient à jour une analyse de la conformité du système d’information vis-à-vis des mesures du présent référentiel.\nL’analyse de la conformité identifie les éventuels écarts entre les mesures mises en œuvre par l’entité et les mesures prévues dans le présent référentiel.\nCette analyse tient compte de la PSSI de l’entité.',
  },
  '2.C.2-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: 'Gestion de la conformité',
    description:
      'L’entité établit, met en œuvre et suit dans la durée un plan d’action adapté à la structure et à l’environnement dans lequel elle opère afin de corriger ces écarts dans les meilleurs délais.\nLa responsabilité de ce plan d’action est déterminée au regard du cadre de gouvernance de la sécurité numérique mis en place.\nCe plan d’action prévoit, au minimum, une échéance raisonnable au regard du besoin de sécurisation du système d’information et un responsable pour la réalisation de chaque action.\nCe plan d’action ne préjuge pas de l’appréciation du respect de ses obligations légales et réglementaires lors d’un contrôle de l’ANSSI.',
  },
  '2.C.3-EI/EE': {
    objectif:
      "Objectif de sécurité 2: Mise en œuvre d'un cadre de gouvernance de la sécurité numérique",
    thematique: 'Gestion de la conformité',
    description:
      'Lorsque l’entité n’est pas tenue de mettre en œuvre le référentiel mais qu’elle décide de l’appliquer pour démontrer sa conformité aux objectifs de sécurité, et qu’elle applique une ou plusieurs mesures alternatives aux moyens acceptables de conformité du référentiel, elle en précise les justifications dans son analyse de la conformité. L’ANSSI peut apprécier la pertinence de la mesure retenue pour satisfaire la mesure du référentiel non retenue lors d’un contrôle.',
  },
  '3.A.1-EI/EE': {
    objectif: "Objectif de sécurité 3: Maîtrise de l'écosystème",
    thematique: "Cartographie de l'écosystème",
    description:
      'L’entité définit et maintient à jour une cartographie de l’écosystème dans lequel ses systèmes d’information sont mis en œuvre et contenant, au minimum, les informations suivantes :\n•\tLa liste des prestataires et fournisseurs informatiques contribuant à la réalisation des activités ou des services de l’entité et avec lesquels il existe une relation de droit ou de fait (par exemple : prestataire d’infogérance, matériels et services fournis par la maison mère à une filiale, fournisseur de matériel informatique)\n•\tLa liste des interconnexions avec les systèmes d’information de l’entité.\n(Cette liste peut s’appuyer sur les démarches déjà réalisées par l’entité pour réaliser une telle liste. Par exemple, la déclaration de sous-traitance réalisée dans le cadre d’un contrat de la commande publique).',
  },
  '3.A.2-EI/EE': {
    objectif: "Objectif de sécurité 3: Maîtrise de l'écosystème",
    thematique: "Cartographie de l'écosystème",
    description:
      'L’entité renseigne et maintient à jour les coordonnées d’au moins un point de contact pour chaque entrée figurant dans la cartographie de l’écosystème.',
  },
  '3.B.1-EI/EE': {
    objectif: "Objectif de sécurité 3: Maîtrise de l'écosystème",
    thematique:
      'Sécurité numérique dans les contrats avec les prestataires et fournisseurs informatiques',
    description:
      'En cas de recours à un prestataire ou à un fournisseur informatique, l’entité s’assure que la prestation est conforme aux obligations auxquelles l’entité est assujettie, notamment en matière de gestion des risques qui menacent la sécurité de leurs réseaux et systèmes d’information et de notification des incidents importants et s’assure de disposer des assurances contractuelles de cette conformité (par exemple : plan d’assurance sécurité, charte de télémaintenance, mise en place d’indicateurs de suivi de la conformité).',
  },
  '3.B.2-EI/EE': {
    objectif: "Objectif de sécurité 3: Maîtrise de l'écosystème",
    thematique:
      'Sécurité numérique dans les contrats avec les prestataires et fournisseurs informatiques',
    description:
      "L'entité vérifie périodiquement la conformité de la prestation aux obligations auxquelles l’entité est assujettie notamment en matière de gestion des risques qui menacent la sécurité de leurs réseaux et systèmes d’information et de notification des incidents importants. L’entité peut s’appuyer sur des audits dont les conditions sont précisées par les Moyens acceptables de conformité 17.2-EE, 17.4-EE et 17.5-EE relatifs à l’audit.",
  },
  '4.1-EI/EE': {
    objectif:
      'Objectif de sécurité 4: Prise en compte de la sécurité numérique dans la gestion des ressources humaines',
    thematique: 'Sécurité des ressources humaines',
    description:
      "L'entité définit et met en œuvre une charte d'usage des systèmes d'information, et la rend opposable à chacun des utilisateurs de ces systèmes d'information.\nCette charte peut prévoir des dispositions spécifiques pour les administrateurs.\nCette charte peut également couvrir les systèmes d'information pour lesquels l'entité a décidé de ne pas appliquer les objectifs de sécurité.",
  },
  '4.2-EI/EE': {
    objectif:
      'Objectif de sécurité 4: Prise en compte de la sécurité numérique dans la gestion des ressources humaines',
    thematique: 'Sécurité des ressources humaines',
    description:
      'L’entité définit et met en œuvre un programme de sensibilisation à la sécurité numérique de l’ensemble des utilisateurs.\nCe programme doit comporter des actions tout au long de la présence des utilisateurs dans l’entité.',
  },
  '4.3-EE': {
    objectif:
      'Objectif de sécurité 4: Prise en compte de la sécurité numérique dans la gestion des ressources humaines',
    thematique: 'Sécurité des ressources humaines',
    description:
      'L’entité prévoit des clauses de sécurité dans ses contrats de travail (par exemple : clauses de confidentialité de nature à garantir la confidentialité des informations auxquelles les salariés ont accès au cours de leur contrat et à l’issu de celui-ci).',
  },
  '4.4-EI/EE': {
    objectif:
      'Objectif de sécurité 4: Prise en compte de la sécurité numérique dans la gestion des ressources humaines',
    thematique: 'Sécurité des ressources humaines',
    description:
      'L’entité définit et met en œuvre un processus de gestion des arrivées, des départs et des changements de fonction des personnels et des tiers accédant aux systèmes d’information. Ce processus prévoit :\n•\tLa prise de connaissance des règles de sécurité en vigueur lors leur arrivée ;\n•\tL’attribution des accès appropriés lors de leur arrivée ;\n•\tLa mise à jour des accès lors d’un changement de fonction ;\n•\tLors du départ, la restitution de l’ensemble du matériel qui a été mis à disposition et la désactivation de l’ensemble des accès logiques aux systèmes d’information et physiques aux locaux et salles.',
  },
  '4.5-EI/EE': {
    objectif:
      'Objectif de sécurité 4: Prise en compte de la sécurité numérique dans la gestion des ressources humaines',
    thematique: 'Sécurité des ressources humaines',
    description:
      'L’entité définit et met en œuvre, pour les fonctions assumant des responsabilités dans le domaine du numérique, un programme de formations dédiées à la sécurité numérique adapté à leurs responsabilités.',
  },
  '5.A.1-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: "Cartographie des systèmes d'information",
    description:
      'L’entité élabore et maintient à jour au moins une cartographie de ses systèmes d’information dont le niveau de détail est suffisant pour lui permettre :\no\td’assurer le maintien en condition opérationnelles et de sécurité de ces systèmes (par exemple : être capable d’identifier les ressources matérielles ou logicielles vulnérables suite à la publication d’un bulletin d’alerte) ;\no\tde pouvoir réagir sans retard injustifié à un incident de sécurité affectant ces systèmes d’information (par exemple : être capable d’identifier les ressources matérielles ou logicielles affectées par un incident de sécurité et ainsi limiter les conséquences de l’incident).\nCette cartographie peut s’appuyer sur les recommandations de l’autorité nationale de sécurité des systèmes d’information en matière de cartographie.',
  },
  '5.B.1-EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'L’entité élabore, met en œuvre et maintient à jour une procédure de maintien en conditions opérationnelle et de sécurité des ressources matérielles et logicielles de ses systèmes d’information.',
  },
  '5.B.2-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'L’entité maintient à jour les bases de connaissances des outils de protection contre les codes malveillants qu’elle utilise (par exemple : la mise à jour de la base antivirale de l’antivirus, la mise à jour des signatures utilisées par la solution d’EDR).',
  },
  '5.B.3-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'L’entité met en œuvre une veille sur les vulnérabilités, les correctifs de sécurité et les mesures d’atténuation préconisées susceptibles de concerner les ressources de ses systèmes d’information, qui sont diffusées notamment par les fournisseurs ou les fabricants de ces ressources, par un prestataire mandaté ou par des centres de prévention et d’alerte en matière de cyber sécurité tels que le CERT-FR (centre gouvernemental de veille, d’alerte et de réponse aux attaques informatiques) ou les CSIRT (centres de réponse aux incidents de sécurité informatique).',
  },
  '5.B.4-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'L’entité met en œuvre, au regard de la nature de la vulnérabilité :\n•\tsans délai : les actions visant à l’installation des correctifs de sécurité (par exemple : le déploiement en environnement de test, pré-production et production, mécanismes de rollback) ;\n•\tsans retard injustifié : l’application effective des correctifs de sécurité après la réalisation des actions précédentes\nsur les ressources exposées à des systèmes d’information tiers (par exemple : un serveur Web, un pare-feu exposé sur Internet, un serveur de messagerie) et les postes de travail des utilisateurs.',
  },
  '5.B.5-EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'L’entité planifie et installe sur l’ensemble de ses ressources, y compris celles non exposées à des systèmes d’information tiers, les correctifs de sécurité.',
  },
  '5.B.6-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      "Lorsque des raisons techniques ou opérationnelles ne permettent pas l’installation des correctifs de sécurité sur les ressources concernées, l’entité met en œuvre des mesures d’atténuation pour réduire les risques liés à l’utilisation d’une version comportant des vulnérabilités connues (par exemple : isoler la ressource du reste du SI, mettre en place un contrôle d'accès renforcé).",
  },
  '5.B.7-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'L’entité met en œuvre sans délai les actions visant à l’installation et le maintien à jour des ressources logicielles de ses systèmes d’information, y compris les logiciels embarqués, dans des versions bénéficiant d’un support par leurs fournisseurs ou leurs fabricants et comportant les mises à jour de sécurité.',
  },
  '5.B.8-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'L’entité vérifie que toute nouvelle version d’un logiciel est téléchargée depuis les ressources officielles mises à disposition par les éditeurs ou les fournisseurs.',
  },
  '5.B.9-EI/EE': {
    objectif: "Objectif de sécurité 5: Maitrise des systèmes d'information",
    thematique: 'Maintien en condition opérationnelle et de sécurité',
    description:
      'Lorsque des raisons techniques ou opérationnelles ne permettent pas l’installation d’une version supportée par le fournisseur ou l’éditeur, l’entité met en œuvre des mesures pour réduire les risques liés à l’utilisation d’une version obsolète.',
  },
  '6.1-EI/EE': {
    objectif: 'Objectif de sécurité 6: Maitrise des accès physiques aux locaux',
    thematique: 'Maîtrise des accès physiques',
    description:
      'L’entité met en place des mesures de sécurité permettant de limiter l’accès de personnes non autorisées à ses locaux, ses salles serveurs et ses locaux techniques (par exemple : tenue d’un registre des visiteurs, badges d’accès, etc).',
  },
  '6.2-EE': {
    objectif: 'Objectif de sécurité 6: Maitrise des accès physiques aux locaux',
    thematique: 'Maîtrise des accès physiques',
    description:
      'L’entité s’assure de la protection physique des locaux, salles serveurs et locaux techniques (par exemple : vidéosurveillance, gardiennage, alarme).\nCette protection physique permet de prévenir, de surveiller et de réagir aux accès non autorisés à ces locaux.',
  },
  '6.3-EE': {
    objectif: 'Objectif de sécurité 6: Maitrise des accès physiques aux locaux',
    thematique: 'Maîtrise des accès physiques',
    description:
      "L’entité s’assure que les droits d'accès physique sont attribués au regard du besoin strictement nécessaire à l’exécution des missions des personnes.",
  },
  '6.4-EI/EE': {
    objectif: 'Objectif de sécurité 6: Maitrise des accès physiques aux locaux',
    thematique: 'Maîtrise des accès physiques',
    description:
      "L'entité s'assure que les personnes externes accédant aux locaux techniques et salles serveurs de l’entité sont accompagnées ou dûment autorisées.",
  },
  '7.A.1-EI/EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'L’entité cloisonne physiquement et/ou logiquement l’ensemble de ses systèmes d’information vis-à-vis des autres systèmes d’information, y compris des systèmes d’information pour lesquels elle a décidé de ne pas appliquer les objectifs de sécurité et les systèmes d’information tiers (par exemple : cloisonnement logique par VLAN – réseau local virtuel - (réseau), par VM – machine virtuelle - (calcul) ou par volume (stockage)).',
  },
  '7.A.2-EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'L’entité cloisonne physiquement et/ou logiquement chaque système d’information vis-à-vis des autres systèmes d’information, y compris des systèmes d’information pour lesquels elle a décidé de ne pas appliquer les objectifs de sécurité et des systèmes d’information tiers (par exemple : un système d’information est cloisonné logiquement des autres systèmes d’information de l’entité. Il est aussi cloisonné physiquement des systèmes d’information de l’entité pour lesquels elle a décidé de ne pas appliquer les objectifs de sécurité).',
  },
  '7.A.3-EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'L’entité mène des réflexions, pour chaque système d’information, sur la pertinence de définir des sous-systèmes. Lorsqu’elle n’identifie aucun sous-système, l’entité en apporte la justification.\nUn sous-système regroupe des ressources assurant des fonctionnalités similaires et ayant des niveaux de sensibilité, d’exposition et de sécurité homogènes.',
  },
  '7.A.4-EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'Les sous-systèmes identifiés à la mesure 7.A.4-EE sont cloisonnés entre eux physiquement et/ou logiquement.',
  },
  '7.A.5-EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'L’entité met en œuvre au moins un sous-système “passerelle sortante” permettant :\n•\taux ressources de ses systèmes d’information d’accéder aux systèmes d’informations tiers ;\n•\td’authentifier, de filtrer et de tracer les accès aux systèmes d’information tiers (par exemple : un serveur mandataire).',
  },
  '7.A.6-EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'L’entité met en œuvre au moins un sous-système “passerelle entrante” permettant :\n•\td’exposer des ressources de ses systèmes d’information aux systèmes d’information tiers ;\n•\tde filtrer et de tracer les accès depuis des systèmes d’information tiers (par exemple : un serveur mandataire inverse ou un relai).',
  },
  '7.A.7-EI/EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'Seules les interconnexions nécessaires à la réalisation des activités et services de l’entité ou au maintien en condition opérationnelle ou de sécurité sont mises en œuvre entre l’ensemble des systèmes d’information et, d’une part les systèmes d’information tiers et, d’autre part les autres systèmes d’information sous la responsabilité de l’entité pour lesquels elle a décidé de ne pas appliquer les objectifs de sécurité.',
  },
  '7.A.8-EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Cloisonnement',
    description:
      'Seules les interconnexions nécessaires à la réalisation des activités et services de l’entité ou au maintien en condition opérationnelle ou de sécurité sont mises en œuvre entre chaque système d’information et, d’une part les systèmes d’information tiers et, d’autre part les autres systèmes d’information sous la responsabilité de l’entité pour lesquels elle a décidé de ne pas appliquer les objectifs de sécurité, ou entre les sous-systèmes du système d’information.',
  },
  '7.B.1-EI/EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Filtrage des communications',
    description:
      'L’entité définit et documente les communications nécessaires :\n•\tà la réalisation de ses activités et services ;\n•\tau maintien en condition opérationnelle de sécurité circulant entre ses systèmes d’information et les autres systèmes d’information pour lesquels elle a décidé de ne pas appliquer les objectifs de sécurité, d’une part, et les systèmes d’information tiers, d’autre part.',
  },
  '7.B.2-EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Filtrage des communications',
    description:
      'L’entité définit et documente les communications nécessaires au maintien en condition opérationnelle de sécurité circulant entre les sous-systèmes du système d’information.',
  },
  '7.B.3-EI/EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Filtrage des communications',
    description:
      'L’entité met en œuvre, au niveau des interconnexions, les règles de filtrage pour n’autoriser que les communications identifiées à la mesure 7.B.1-EI/EE ou 7.B.2-EE. Les autres communications sont bloquées par défaut.',
  },
  '7.B.4-EI/EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Filtrage des communications',
    description:
      "L’entité filtre par un ou plusieurs pares-feux dédiés à cet usage, au minimum :\n•\tles communications entre les systèmes d’information de l’entité pour lesquels elle a décidé d'appliquer les objectifs ou non, d’une part ; et\n•\tles SI tiers d’autre part.\nPar exemple : une entité mettant en œuvre un pare-feu pour filtrer les communications entre ses systèmes d’information (pour lesquels elle applique les objectifs de sécurité ou non) d’une part et les systèmes d’information tiers d’autre part est une solution acceptable.",
  },
  '7.B.5-EI/EE': {
    objectif:
      "Objectif de sécurité 7: Sécurisation de l'architecture des systèmes d'information",
    thematique: 'Filtrage des communications',
    description:
      'L’entité effectue annuellement une revue de la mise en œuvre technique des règles de filtrage mentionnées à la mesure 7.B.4-EI/EE.',
  },
  '8.1-EI/EE': {
    objectif:
      "Objectif de sécurité 8: Sécurisation des accès distants aux systèmes d'information",
    thematique: 'Sécurisation des accès distants',
    description:
      'L’entité protège les accès à ses systèmes d’information effectués à travers un système d’information tiers au moyen de mécanismes de chiffrement conformes aux recommandations de l’autorité nationale de sécurité des systèmes d’information (par exemple : VPN TLS ou IPSec, protocoles applicatifs chiffrés comme TLS, SSH, etc.).',
  },
  '8.2-EI/EE': {
    objectif:
      "Objectif de sécurité 8: Sécurisation des accès distants aux systèmes d'information",
    thematique: 'Sécurisation des accès distants',
    description:
      "Lorsque les accès visés à la mesure 8.2-EI/EE sont effectués par les personnels et prestataires qu’elle a autorisée, l’entité protège les accès aux systèmes d’information par un mécanisme d'authentification conforme aux mesures relatives à l’Authentification.",
  },
  '8.3-EE': {
    objectif:
      "Objectif de sécurité 8: Sécurisation des accès distants aux systèmes d'information",
    thematique: 'Sécurisation des accès distants',
    description:
      'Pour les accès visés à la mesure 8.2-EI/EE le mécanisme d’authentification est multifacteur et repose sur au moins un facteur de connaissance (par exemple : authentification avec une carte à puce et un code PIN).',
  },
  '8.4-EE': {
    objectif:
      "Objectif de sécurité 8: Sécurisation des accès distants aux systèmes d'information",
    thematique: 'Sécurisation des accès distants',
    description:
      'Lorsque des raisons techniques ou opérationnelles ne permettent pas la mise en œuvre d’une authentification multifacteur, l’entité met en œuvre des mesures permettant de réduire le risque associé.',
  },
  '8.5-EE': {
    objectif:
      "Objectif de sécurité 8: Sécurisation des accès distants aux systèmes d'information",
    thematique: 'Sécurisation des accès distants',
    description:
      'Les mémoires de masse (par exemple : les « disques ») des postes de travail et équipements mobiles permettant aux personnels et prestataires de l’entité d’accéder à distance aux systèmes d’information depuis un lieu qui n’est pas maîtrisé par l’entité, sont en permanence protégées par des mécanismes de chiffrement et d’authentification conformes à l’état de l’art tel que recommandé par l’autorité nationale de sécurité des systèmes d’information (par exemple : disques chiffrés avec code PIN exigé pour le déchiffrement au démarrage).',
  },
  '9.1-EI/EE': {
    objectif:
      "Objectif de sécurité 9: Protection des systèmes d'information contre les codes malveillants",
    thematique: 'Protection contre les codes malveillants',
    description:
      'L’entité définit les ressources matérielles, en particulier les terminaux, autorisées à se connecter à ses systèmes d’information.\nNB : Cette mesure autorise le AVEC (Apportez votre équipement de communication) ou BYOD en anglais.',
  },
  '9.2-EE': {
    objectif:
      "Objectif de sécurité 9: Protection des systèmes d'information contre les codes malveillants",
    thematique: 'Protection contre les codes malveillants',
    description:
      'Seules les ressources matérielles dont l’entité, ou le prestataire qu’elle a mandaté à cet effet, assure la gestion et qui participent à la réalisation des activités ou des services de l’entité ou au maintien en condition opérationnelle et de sécurité se connectent aux systèmes d’information.\nNB : Cette mesure interdit le AVEC (Apportez votre équipement de communication) ou BYOD en anglais.',
  },
  '9.3-EI/EE': {
    objectif:
      "Objectif de sécurité 9: Protection des systèmes d'information contre les codes malveillants",
    thematique: 'Protection contre les codes malveillants',
    description:
      'L’entité met en œuvre des mesures organisationnelles ou techniques visant à empêcher la connexion des ressources matérielles autres que celles identifiées à la mesure 9.1-EI/EE sur ses systèmes d’information.',
  },
  '9.4-EE': {
    objectif:
      "Objectif de sécurité 9: Protection des systèmes d'information contre les codes malveillants",
    thematique: 'Protection contre les codes malveillants',
    description:
      'L’entité met en œuvre des mesures organisationnelles ou techniques visant à empêcher la connexion des ressources matérielles autres que celles identifiées à la mesure 9.2-EE sur ses systèmes d’information.',
  },
  '9.5-EI/EE': {
    objectif:
      "Objectif de sécurité 9: Protection des systèmes d'information contre les codes malveillants",
    thematique: 'Protection contre les codes malveillants',
    description:
      'Seuls les supports amovibles réinscriptibles nécessaires à la réalisation des activités et services de l’entité ou au maintien en condition opérationnelle ou de sécurité se connectent à ses systèmes d’information (par exemple : clefs USB ou disques dur amovibles).',
  },
  '9.6-EI/EE': {
    objectif:
      "Objectif de sécurité 9: Protection des systèmes d'information contre les codes malveillants",
    thematique: 'Protection contre les codes malveillants',
    description:
      "Les postes de travail, les serveurs et les équipements mobiles maîtrisés par l’entité, qui sont amenés à traiter de données provenant de sources externes (par exemple les supports amovibles, la messagerie ou la navigation web), à l’exception de données de mise à jour fournies par les éditeurs et dont l’authenticité et l’intégrité sont vérifiées, disposent de mécanismes de protection contre les risques d'exécution de codes malveillants (par exemple : un antivirus ou un EDR).",
  },
  '9.7-EI/EE': {
    objectif:
      "Objectif de sécurité 9: Protection des systèmes d'information contre les codes malveillants",
    thematique: 'Protection contre les codes malveillants',
    description:
      'L’entité procède à l’analyse des données provenant de sources externes lors de leur réception, pour y rechercher des codes malveillants, à l’exception de données de mise à jour fournies par les éditeurs et dont l’authenticité et l’intégrité sont vérifiées (par exemple : une passerelle mail analysant les pièces jointes avant distribution, un SAS de décontamination antivirale pour les clefs USB).',
  },
  '10.A.1-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Identification',
    description:
      'Les utilisateurs et les processus automatiques accédant aux ressources des systèmes d’information de l’entité disposent de comptes individuels. Les utilisateurs peuvent, le cas échéant, disposer de plusieurs comptes individuels.',
  },
  '10.A.2-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Identification',
    description:
      'L’emploi d’un compte individuel du système d’information est réservé à l’utilisateur ou au processus automatique auquel ce compte a été attribué.',
  },
  '10.A.3-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Identification',
    description:
      "Lorsque des raisons techniques ou opérationnelles ne permettent pas de créer de comptes individuels pour les utilisateurs ou pour les processus automatiques, l’entité met en place des mesures permettant de réduire le risque lié à l'utilisation de comptes partagés et d'assurer la traçabilité de l'utilisation de ces comptes (par exemple : carnet de quart dans une salle de supervision, badgeuse à l’entrée de la salle).",
  },
  '10.A.4-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Identification',
    description:
      "Lorsqu'un système d’information est utilisé pour diffuser de l'information au public, l’entité n'est pas tenue de créer de comptes pour l'accès du public à cette information (par exemple : l’accès à un site vitrine ne nécessite pas d’authentifier les visiteurs alors que l’accès à l’intranet doit authentifier les utilisateurs).",
  },
  '10.A.5-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Identification',
    description:
      'L’entité désactive les comptes qui ne sont plus nécessaires dans les délais prévus par sa politique de gestion des comptes (par exemple : sous 7 jours).',
  },
  '10.A.6-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Identification',
    description:
      "L’entité effectue périodiquement, au moins annuellement, une revue des comptes. Cette revue doit notamment vérifier le respect des présentes mesures relatives à l'identification et, le cas échéant, corriger les anomalies.",
  },
  '10.B.1-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Authentification',
    description:
      "L’entité protège les accès des utilisateurs et processus automatiques aux ressources de ses systèmes d’information au moyen d'un mécanisme d'authentification impliquant au moins un élément secret (par exemple : un mécanisme d’authentification mono-facteur tel qu’un mot de passe, ou multi-facteur, tel qu’une carte à puce avec code PIN).",
  },
  '10.B.2-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Authentification',
    description:
      "L’entité change les éléments secrets configurés par défaut, avant la mise en service d’une ressource. À cet effet, l’entité s'assure auprès du fabricant ou du fournisseur de la ressource qu'elle dispose des moyens et des droits permettant d’effectuer ces changements.",
  },
  '10.B.3-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Authentification',
    description:
      "L’élément secret d'un compte partagé est renouvelé à chaque retrait d'un utilisateur de ce compte.",
  },
  '10.B.4-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Authentification',
    description:
      'L’élément secret d’un compte n’est connu, que des utilisateurs autorisés à utiliser le compte (par exemple : les mots de passe des comptes partagés peuvent être stockés dans un coffre-fort de mots de passe).',
  },
  '10.B.5-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Authentification',
    description:
      'Les facteurs d’authentification sont conformes aux recommandations de l’autorité nationale de sécurité des systèmes d’information en matière de complexité, en tenant compte du niveau de complexité maximal permis par la ressource concernée, et en matière de fréquence de renouvellement.',
  },
  '10.B.6-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Authentification',
    description:
      "Lorsque des raisons techniques ou opérationnelles ne permettent pas de modifier l'élément secret, l’entité met en œuvre un contrôle d'accès approprié à la ressource concernée ainsi que des mesures de réduction du risque lié à l'utilisation d'un élément secret d'authentification fixe.",
  },
  '10.B.7-EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: 'Authentification',
    description:
      "Dans le cadre de cette exception, l’entité met également en œuvre des mesures de sécurité permettant d'assurer la traçabilité des accès.",
  },
  '10.C.1-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: "Droits d'accès",
    description:
      'L’entité n’attribue des droits qu’aux utilisateurs et processus automatiques authentifiés.',
  },
  '10.C.2-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: "Droits d'accès",
    description:
      "Pour chaque utilisateur ou chaque processus automatique, l’entité n'attribue les droits d'accès qu’aux seules ressources nécessaires à la réalisation des activités et services de l’entité ou au maintien en condition opérationnelle ou de sécurité.",
  },
  '10.C.3-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: "Droits d'accès",
    description:
      'Pour chaque ressource du système d’information, l’entité n’attribue les droits d’accès qu’aux seuls utilisateurs et processus automatiques justifiant d’un besoin au regard de leurs missions.',
  },
  '10.C.4-EI/EE': {
    objectif:
      "Objectif de sécurité 10: Gestion des identités et des accès des utilisateurs aux systèmes d'information",
    thematique: "Droits d'accès",
    description:
      'L’entité effectue périodiquement, au moins annuellement, une revue des droits d’accès. Cette revue doit notamment vérifier le respect des présentes mesures relatives au droit d’accès et, le cas échéant, corriger les anomalies.',
  },
  '11.A.1-EI/EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: "Comptes d'administration",
    description:
      "Les actions d'administration sont effectuées exclusivement à partir de comptes d'administration et les comptes d'administration sont utilisés exclusivement pour les actions d'administration.\nPar exemple : le compte d’administration d’un poste utilisateur est utilisé exclusivement pour l’administration de ce poste. L’utilisateur de ce poste dispose d’un compte bureautique non administrateur pour son utilisation quotidienne.",
  },
  '11.A.2-EI/EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: "Comptes d'administration",
    description:
      'Les comptes d’administration ne sont utilisés que par des administrateurs ou des personnes autorisées.',
  },
  '11.A.3-EI/EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: "Comptes d'administration",
    description:
      'Les comptes d’administration respectent les mesures relatives à la gestion des identités et des accès des utilisateurs aux systèmes d’information.',
  },
  '11.A.4-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: "Comptes d'administration",
    description:
      "Un compte d'administration est utilisé exclusivement pour se connecter aux ressources que ce compte administre pour effectuer des actions d’administration, ou à une ressource d’administration (par exemple : le compte administrateur d’un routeur est utilisé depuis un poste d’administration ou sur le routeur pour l’administrer).",
  },
  '11.A.5-EI/EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: "Comptes d'administration",
    description:
      "Lorsque des raisons techniques ou opérationnelles ne permettent pas d’effectuer des actions d’administration à partir d'un compte d'administration, l’entité met en œuvre des mesures permettant d'assurer le contrôle de ces actions d'administration et des mesures de réduction du risque lié à l'utilisation d'un compte non dédié à l'administration.",
  },
  '11.A.6-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: "Comptes d'administration",
    description:
      "L’entité établit et tient à jour la liste des comptes d'administration de ses systèmes d’information.",
  },
  '11.A.7-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: "Comptes d'administration",
    description:
      "Lors de toute modification d'un compte d’administration (ajout, suppression, suspension ou modification des droits associés), l’entité vérifie que les droits d'accès aux ressources et fonctionnalités sont attribués en cohérence avec les besoins d'utilisation du compte.\nEn particulier, afin de limiter la portée des droits individuels, ils sont attribués à chaque compte d’administration en les restreignant autant que possible au périmètre fonctionnel et technique de ce dernier.\nPour ceci, il est recommandé d’octroyer les droits d’administration au travers des groupes dont les comptes d’administration sont membres.",
  },
  '11.B.1-EI/EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: 'Sécurité des annuaires',
    description:
      'L’entité applique sans retard injustifié les correctifs de sécurité sur les annuaires gérant les utilisateurs ou les ressources de ses systèmes d’information.',
  },
  '11.B.2-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: 'Sécurité des annuaires',
    description:
      'La sécurité des systèmes d’information de l’entité repose en grande partie sur la sécurité du ou des annuaires gérant les utilisateurs ou les ressources des systèmes d’information.\nL’ensemble des ressources regroupant un annuaire, les ressources matérielles et logicielles hébergeant cet annuaire ou permettant de prendre le contrôle de cet annuaire (les comptes, les hyperviseurs, les machines d’administration, etc.) est désigné « cœur de confiance » (par exemple : Le Tier0 un annuaire AD DS constitue le cœur de confiance du système d’information).\nPour chacun de ses annuaires, l’entité identifie les ressources constituant son cœur de confiance.',
  },
  '11.B.3-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: 'Sécurité des annuaires',
    description:
      'Les actions d’administration d’un cœur de confiance sont réalisées depuis des comptes d’administration dédiés à l’administration de cœurs de confiance.',
  },
  '11.B.4-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: 'Sécurité des annuaires',
    description:
      "Les actions d'administration d’un cœur de confiance sont réalisées depuis des ressources dédiées exclusivement à l’administration de cœurs de confiance.",
  },
  '11.B.5-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: 'Sécurité des annuaires',
    description:
      'Les connexions externes à un cœur de confiance, à destination des ressources d’administration de cœurs de confiance sont interdites par un dispositif de filtrage sur les ressources d’administration (par exemple : le filtrage peut être réalisé par le pare-feu local de la ressource d’administration du cœur de confiance).',
  },
  '11.B.6-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: 'Sécurité des annuaires',
    description:
      'L’entité effectue annuellement une revue de la configuration des annuaires gérant les utilisateurs ou les ressources de ses systèmes d’information, afin d’identifier tout élément inutile ou anormal.\nIl est recommandé que cette revue s’appuie sur un outil automatisé.',
  },
  '11.B.7-EE': {
    objectif:
      "Objectif de sécurité 11: Maitrise de l'administration des systèmes d'information",
    thematique: 'Sécurité des annuaires',
    description:
      'Lorsqu’elles existent, les recommandations de l’autorité nationale de sécurité des systèmes d’information relatives au cœur de confiance sont mises en œuvre (par exemple : guide de sécurisation, guide de réponses à incidents, mémos techniques, recommandations issues des outils de revues de configurations).',
  },
  '12.1-EE': {
    objectif:
      'Objectif de sécurité 12: Identification et réaction aux incidents de sécurité',
    thematique: 'Gestion des incidents',
    description:
      'L’entité s’assure de l’élaboration, du maintien à jour et de la mise en œuvre d’une procédure de traitement des incidents de sécurité affectant ses systèmes d’information.',
  },
  '12.2-EE': {
    objectif:
      'Objectif de sécurité 12: Identification et réaction aux incidents de sécurité',
    thematique: 'Gestion des incidents',
    description:
      'L’entité s’assure de la mise en œuvre des outils permettant de collecter les signalements remontés, en particulier par les sources suivantes :\n•\tLes employés de l’entité essentielle ;\n•\tLes clients et les usagers des activités et services mis en œuvre par l’entité essentielle ;\n•\tLes prestataires et les fournisseurs contractant avec l’entité essentielle.',
  },
  '12.3-EI/EE': {
    objectif:
      'Objectif de sécurité 12: Identification et réaction aux incidents de sécurité',
    thematique: 'Gestion des incidents',
    description:
      'L’entité s’assure de la définition et de la mise en œuvre des mécanismes permettant d’analyser et de qualifier les événements remontés et d’identifier les incidents potentiels ou avérés.',
  },
  '12.4-EE': {
    objectif:
      'Objectif de sécurité 12: Identification et réaction aux incidents de sécurité',
    thematique: 'Gestion des incidents',
    description:
      'L’entité s’assure de la définition et de la mise en œuvre des mécanismes organisationnels et techniques permettant de réagir en cas d’incident et de limiter les conséquences sur la fourniture des services.\nCes mécanismes sont repris, le cas échéant, dans la définition des plans de continuité et de reprise d’activité.',
  },
  '12.5-EE': {
    objectif:
      'Objectif de sécurité 12: Identification et réaction aux incidents de sécurité',
    thematique: 'Gestion des incidents',
    description:
      'En complément des dispositions de l’article 17 de la loi XXX, l’entité s’assure, après chaque incident de sécurité, qu’une analyse des causes de l’incident a été réalisée.\nL’analyse des causes vise à définir et mettre en œuvre les mesures de sécurité permettant de limiter la vraisemblance d’un nouvel incident ou d’en réduire l’impact. L’entité conserve des preuves de cette analyse.',
  },
  '12.6-EI/EE': {
    objectif:
      'Objectif de sécurité 12: Identification et réaction aux incidents de sécurité',
    thematique: 'Gestion des incidents',
    description:
      'L’entité conserve les relevés techniques dont elles disposent (par exemple : rapport d’analyse, alertes remontées par les outils de protection contre les codes malveillants) et pouvant être utilisés comme éléments de preuve en cas de judiciarisation. Ces relevés techniques sont conservés pour une durée pertinente au regard de la protection des données à caractère personnel et en particulier la finalité du traitement.',
  },
  '12.7-EE': {
    objectif:
      'Objectif de sécurité 12: Identification et réaction aux incidents de sécurité',
    thematique: 'Gestion des incidents',
    description:
      'Les relevés techniques relatifs aux analyses des incidents sont protégés d’un incident qui les rendrait inexploitables (par exemple : le stockage hors-ligne pour répondre à un incident de type rançongiciel).',
  },
  '13.1-EI/EE': {
    objectif: "Objectif de sécurité 13: Continuité et reprise d'activité",
    thematique: "Continuité et reprise d'activité",
    description:
      'L’entité définit et met en œuvre des procédures de sauvegarde et de restauration de ses systèmes d’information et des données qu’ils manipulent.',
  },
  '13.2-EI/EE': {
    objectif: "Objectif de sécurité 13: Continuité et reprise d'activité",
    thematique: "Continuité et reprise d'activité",
    description:
      'L’entité s’assure que les processus de sauvegarde et de restauration sont testés au minimum une fois par an. Ces tests visent notamment à vérifier la bonne réalisation des sauvegardes et leur bonne restauration.',
  },
  '13.3-EI/EE': {
    objectif: "Objectif de sécurité 13: Continuité et reprise d'activité",
    thematique: "Continuité et reprise d'activité",
    description:
      'Les sauvegardes sont protégées d’un incident les rendant inexploitables (par exemple : le stockage hors-ligne pour répondre à un incident de type rançongiciel).',
  },
  '13.4-EE': {
    objectif: "Objectif de sécurité 13: Continuité et reprise d'activité",
    thematique: "Continuité et reprise d'activité",
    description:
      'L’entité, pour chacun de ses activités et services, définit et documente la durée maximale d’interruption admissible (DMIA) et le point de rétablissement des données (PRD).',
  },
  '13.5-EE': {
    objectif: "Objectif de sécurité 13: Continuité et reprise d'activité",
    thematique: "Continuité et reprise d'activité",
    description:
      'Les mécanismes de sauvegarde sont dimensionnés pour répondre aux besoins de disponibilité associés aux différents services et aux différentes activités fournis par l’entité.',
  },
  '13.6-EE': {
    objectif: "Objectif de sécurité 13: Continuité et reprise d'activité",
    thematique: "Continuité et reprise d'activité",
    description:
      'L’entité définit et met en œuvre un plan de continuité d’activité (PCA) et un plan de reprise d’activité (PRA) adaptés aux scénarios de crises d’origine cyber et cohérents avec la durée maximale d’interruption admissible et le point de rétablissement des données.',
  },
  '13.7-EE': {
    objectif: "Objectif de sécurité 13: Continuité et reprise d'activité",
    thematique: "Continuité et reprise d'activité",
    description:
      'L’identification de ces mesures de continuité s’appuie notamment :\n•\tSur la cartographie de l’écosystème ;\n•\tSur la procédure de gestion des incidents pour détecter et réagir au plus tôt aux incidents ;\n•\tSur la procédure de gestion des crises d’origine cyber pour permettre la reprise au plus tôt des services.',
  },
  '14.1-EI/EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure de la définition, du maintien à jour et de la mise en œuvre d’une procédure de gestion de crises en cas d’incident de sécurité sur ses systèmes d’information nécessitant le passage en mode crise (par exemple : pour les incidents importants au sens de l’article 17 du PJL).',
  },
  '14.10-EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure de la disponibilité de moyens de communication de secours, si possible, sécurisés en temps de crise lorsque les moyens de communication habituels sont indisponibles.',
  },
  '14.2-EI/EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure du maintien à jour d’une liste imprimée des personnes mobilisables dans la gestion de la crise sur les sujets relatifs à la sécurité numérique ainsi que leurs coordonnées.',
  },
  '14.3-EI/EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure que la liste des personnes mobilisables prévue au 14.2-EI/EE est accessible dans un format adapté à la nature de la crise (par exemple, la liste doit être accessible au format papier si les systèmes d’information ne sont plus disponibles, et elle doit être accessible au format numérique si la version papier n’est pas accessible).',
  },
  '14.4-EI/EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure du maintien à jour d’un annuaire des parties prenantes externes à l’entité pertinente dans la gestion de la crise en s’appuyant sur la cartographie de l’écosystème.',
  },
  '14.5-EI/EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité essentielle s’assure de la mise en œuvre de retour d’expérience (RETEX) permettant d’identifier les axes d’amélioration et les mesures associées à mettre en œuvre suite à un entraînement, un exercice ou une crise réelle.',
  },
  '14.6-EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure de la définition, du maintien à jour et de la mise en œuvre des critères permettant d’activer et de désactiver le dispositif de gestion de crise prenant en compte les menaces cyber.',
  },
  '14.7-EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure de la définition, du maintien à jour et de la mise en œuvre des procédures et des mécanismes de gestion de la crise adaptés à la menace cyber en s’appuyant sur les recommandations de l’autorité nationale de sécurité des systèmes d’information.',
  },
  '14.8-EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure de la définition et de la mise en œuvre des mesures pour isoler, protéger et, le cas échéant, reconstruire les systèmes d’information concernés, activables en cas d’incident de sécurité.\nCes mesures prennent en compte les infrastructures, applicatifs et services numériques externalisés à des prestataires et sont mises en place en cohérence avec les plans de continuité et de reprise d’activité.',
  },
  '14.9-EE': {
    objectif: "Objectif de sécurité 14: Réaction aux crises d'origine cyber",
    thematique: 'Gestion de crise',
    description:
      'L’entité s’assure de la définition d’une stratégie de communication adaptée aux crises d’origine cyber, incluant des scénarios de crise, le schéma d’organisation de la communication de crise, les outils de pilotage de la communication et des éléments de langage sur des sujets sensibles ou de crise. Cette stratégie prend en compte les scénarios de menaces cyber identifiés.',
  },
  '15.1-EI/EE': {
    objectif: 'Objectif de sécurité 15: Exercices, tests et entrainements',
    thematique: 'Exercices, tests et entraînements',
    description:
      'L’entité s’assure de la sensibilisation et de la mise en œuvre d’un exercice sur table à une fréquence qu’elle définit pour les personnes mobilisables dans le dispositif de gestion des crises d’origine cyber.',
  },
  '15.2-EE': {
    objectif: 'Objectif de sécurité 15: Exercices, tests et entrainements',
    thematique: 'Exercices, tests et entraînements',
    description:
      'L’entité définit et met en œuvre une stratégie d’entraînement qui comporte, au minimum, les éléments suivants :\n•\tUne liste des acteurs amenés à participer aux différents dispositifs d’entraînement et d’exercice ;\n•\tUne liste d’exercices permettant d’entraîner ou de tester les capacités opérationnelles ;\n•\tLes objectifs visés par la stratégie ; \n•\tLes moyens de vérification ou d’évaluation d’atteinte de ces objectifs ;\n•\tLes scénarios de risques ou d’attaques à tester en priorité ;\n•\tLa comitologie de suivi de la stratégie.\nCette stratégie peut être mutualisée avec d’autres livrables.',
  },
  '15.3-EE': {
    objectif: 'Objectif de sécurité 15: Exercices, tests et entrainements',
    thematique: 'Exercices, tests et entraînements',
    description:
      'Cette stratégie d’entraînement vise à tester les dispositifs mis en œuvre par l’entité en matière :\n•\tDe gestion des alertes relatives aux incidents, aux vulnérabilités et menaces ;\n•\tDe continuité et de reprise d’activité ;\n•\tDe gestion des crises d’origine cyber.',
  },
  '15.4-EE': {
    objectif: 'Objectif de sécurité 15: Exercices, tests et entrainements',
    thematique: 'Exercices, tests et entraînements',
    description:
      'L’entité décline cette stratégie dans la définition et la mise en œuvre d’un programme triennal d’entraînement et d’exercice. Ce programme précise notamment la fréquence de ces entraînements et exercices ainsi que leur nature et que leurs objectifs.\nCe programme triennal doit permettre de tester les dispositifs de gestion des incidents, de gestion des crises d’origine cyber et de coopération avec l’écosystème et, le cas échéant, le volet cyber des plans de continuité et de reprise d’activité.',
  },
  '16.1-EE': {
    objectif:
      "Objectif de sécurité 16: Mise en œuvre d'une approche par les risques",
    thematique: 'Approche par les risques',
    description:
      'L’entité définit, met en œuvre et maintient à jour une gouvernance par les risques.\nCette gouvernance vise à s’assurer que le risque numérique est pris en compte par le dirigeant exécutif de l’entité et les responsables d’activité ou de service de l’entité au regard des rôles et responsabilités définis et que les moyens financiers, humains ou techniques adéquats sont alloués pour maîtriser ce risque.\nCette gouvernance intègre les éléments issus de l’approche par la conformité et la complète par une approche par les risques, réalisée dans les conditions définies ci-après. Ces approches sont complémentaires et peuvent être mutualisées, notamment en termes de livrables attendus.',
  },
  '16.2-EE': {
    objectif:
      "Objectif de sécurité 16: Mise en œuvre d'une approche par les risques",
    thematique: 'Approche par les risques',
    description:
      'L’entité s’assure que chaque système d’information fait l’objet d’une analyse de risques.\nCette exigence peut être satisfaite via la réalisation et le maintien à jour d’une analyse de risques pour chaque activité ou service qu’elle fournit, couvrant l’ensemble des systèmes d’information supportant cette activité ou ce service.\nCette analyse de risques s’appuie sur les éléments issus :\n•\tDe la PSSI et des spécificités sectorielles ;\n•\tDe la maîtrise de l’écosystème ;\n•\tDe la maîtrise du système d’information ;\n•\tDe l’approche par conformité ;\n•\tDes audits.\nLa méthode EBIOS RM peut être utilisée pour réaliser cette analyse de risques.',
  },
  '16.3-EE': {
    objectif:
      "Objectif de sécurité 16: Mise en œuvre d'une approche par les risques",
    thematique: 'Approche par les risques',
    description:
      'L’entité valide l’analyse de risques, accepte les risques résiduels et met en œuvre le plan d’action pour maîtriser ces risques.\nLe plan d’action prévoit, au minimum, une échéance raisonnable et un responsable pour la réalisation de chaque action.',
  },
  '16.4-EE': {
    objectif:
      "Objectif de sécurité 16: Mise en œuvre d'une approche par les risques",
    thematique: 'Approche par les risques',
    description:
      'L’entité réexamine l’analyse de risques au minimum tous les trois ans et en tant que de besoin, notamment en cas d’incident de sécurité ou d’évolutions majeures du contexte métier, technique ou organisationnel.',
  },
  '17.1-EE': {
    objectif:
      "Objectif de sécurité 17: Audit de la sécurité des systèmes d'information",
    thematique: 'Audits de la sécurité',
    description:
      'L’entité définit et met en œuvre un programme d’audit de l’ensemble de ses systèmes d’information et s’assure que les audits associés à ce programme ainsi que leur profondeur et leur fréquence tiennent compte de tout ou partie de l’analyse de risque réalisée, de la criticité du système d’information au regard de son organisation et de l’exposition du système d’information aux risques numériques.\nPour évaluer cette criticité et ce niveau d’exposition, l’entité peut s’appuyer sur les recommandations de l’autorité nationale de sécurité des systèmes d’information en matière de gestion des risques numériques.',
  },
  '17.2-EE': {
    objectif:
      "Objectif de sécurité 17: Audit de la sécurité des systèmes d'information",
    thematique: 'Audits de la sécurité',
    description:
      'L’audit de sécurité permet, de manière indépendante :\n•\tDe vérifier, sur le périmètre défini, l’atteinte des objectifs fixés par la réglementation via \no\tLa conformité aux présentes mesures, ou \no\tLa mise en œuvre de mesures alternatives ; et\n•\tD’évaluer le niveau de sécurité du ou des systèmes d’information couverts au regard des menaces et des vulnérabilités connues.',
  },
  '17.3-EE': {
    objectif:
      "Objectif de sécurité 17: Audit de la sécurité des systèmes d'information",
    thematique: 'Audits de la sécurité',
    description:
      'Sans préjudice d’autres obligations légales et réglementaires, l’audit de sécurité comprend au minimum une activité parmi les suivantes : un test d’intrusion (couvrant au minimum les interfaces exposées à des systèmes sous la responsabilité de l’entité pour lesquels elle a décidé de ne pas appliquer les objectifs de sécurité ainsi qu’à des systèmes d’information tiers), un audit de configuration, un audit d’architecture, un audit organisationnel et physique et, lorsque cela est pertinent, un audit de code.',
  },
  '17.4-EE': {
    objectif:
      "Objectif de sécurité 17: Audit de la sécurité des systèmes d'information",
    thematique: 'Audits de la sécurité',
    description:
      'Le rapport de l’audit de sécurité présente :\n•\tUne synthèse de la conformité aux présentes mesures ou aux mesures définies par l’entité pour atteindre les objectifs fixés par la réglementation et du niveau de sécurité des systèmes d’information audités ;\n•\tLes constats de non-conformité et les vulnérabilités identifiées ;\n•\tLes recommandations pour y remédier.',
  },
  '17.5-EE': {
    objectif:
      "Objectif de sécurité 17: Audit de la sécurité des systèmes d'information",
    thematique: 'Audits de la sécurité',
    description:
      'L’entité définit et met en œuvre un plan d’action visant à corriger les non-conformités et les vulnérabilités identifiées.\nCe plan d’action prévoit, au minimum, une échéance raisonnable et un responsable pour la réalisation de chaque action.',
  },
  '18.1-EE': {
    objectif:
      "Objectif de sécurité 18: Sécurisation de la configuration des ressources des systèmes d'information",
    thematique: 'Sécurisation de la configuration',
    description:
      'L’entité n’installe et ne conserve sur ses systèmes d’information que les ressources logicielles nécessaires à la réalisation de ses activités et services ou au maintien en condition opérationnelle ou de sécurité de ses systèmes d’information (par exemple : utilisation d’un modèle de configuration centralisé (master) contenant exclusivement les logiciels/services strictement nécessaires aux besoins métiers et d’administration).',
  },
  '18.2-EE': {
    objectif:
      "Objectif de sécurité 18: Sécurisation de la configuration des ressources des systèmes d'information",
    thematique: 'Sécurisation de la configuration',
    description:
      'Lorsque des raisons techniques ou opérationnelles ne permettent pas de désactiver ou désinstaller une ressource logicielle, l’entité met en œuvre des mesures permettant de réduire le risque associé.',
  },
  '18.3-EE': {
    objectif:
      "Objectif de sécurité 18: Sécurisation de la configuration des ressources des systèmes d'information",
    thematique: 'Sécurisation de la configuration',
    description:
      'L’entité configure les ressources de ses systèmes d’information de manière sécurisée en s’appuyant sur les recommandations de l’éditeur de la fonctionnalité, du fabricant de la ressource ou de l’autorité nationale de sécurité des systèmes d’information.',
  },
  '18.4-EE': {
    objectif:
      "Objectif de sécurité 18: Sécurisation de la configuration des ressources des systèmes d'information",
    thematique: 'Sécurisation de la configuration',
    description:
      'L’entité effectue annuellement une revue de configuration des ressources de ses systèmes d’information pour vérifier l’application des mesures précédentes. Il est recommandé que cette revue s’appuie sur un ou des outils automatisés (par exemple : scan de port et de vulnérabilité, revue (manuel ou automatique) des configurations des pares-feux par rapport aux matrices de flux).',
  },
  '19.1-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      'Les actions d’administration sont effectuées au moyen d’un réseau d’administration dédié.',
  },
  '19.10-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      "Les communications associées à des actions d’administration sont protégées par des mécanismes de chiffrement et d’authentification conformes à l’état de l'art tel que recommandé par l’autorité nationale de sécurité des systèmes d’information (par exemple : en utilisant des protocoles sécurisés garantissant l’authentification de l’administrateur, l’intégrité et la confidentialité des messages).",
  },
  '19.11-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      'Les communications associées à des actions d’administration qui transitent sur des réseaux non dédiés à ces communications sont cloisonnées au moyen de mécanismes de chiffrement et d’authentification conformes aux mesures recommandées par l’autorité nationale de sécurité des systèmes d’information (par exemple : au travers de tunnels VPN).',
  },
  '19.12-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      'Lorsque des raisons techniques ou opérationnelles ne permettent pas de recourir à des mécanismes de chiffrement ou d’authentification de ces communications, l’entité met en œuvre des mesures permettant de protéger la confidentialité et l’intégrité de ces flux et de renforcer le contrôle et la traçabilité des actions d’administration.',
  },
  '19.2-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      "Les ressources des réseaux d'administration sont gérées et configurées par l’entité ou par le prestataire qu'elle a mandaté pour réaliser les actions d'administration.",
  },
  '19.3-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      'Les ressources matérielles des réseaux d’administration sont utilisées exclusivement pour réaliser des actions d’administration.',
  },
  '19.4-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      "Le poste physique utilisé pour effectuer des actions d'administration est utilisé exclusivement pour réaliser des actions d’administration.",
  },
  '19.5-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      'La connexion des administrateurs à un réseau d’administration s’effectue au moyen d’un poste physique utilisé exclusivement pour des actions d’administration.',
  },
  '19.6-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      "Lorsque des raisons techniques ou opérationnelles ne permettent pas de dédier le poste de travail physique de l'administrateur pour les actions d'administration, l’entité met en œuvre des mesures de durcissement et de cloisonnement du système d'exploitation du poste de travail permettant d'isoler le système d’exploitation utilisé pour les actions d'administration du système d’exploitation utilisé pour les autres actions. Ces mesures sont conformes aux recommandations de l’autorité nationale de sécurité des systèmes d’information, y compris les recommandations alternatives.",
  },
  '19.7-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      "Les réseaux d'administration sont connectés aux ressources du système d’information à administrer au travers d'une liaison réseau physique utilisée exclusivement pour les actions d'administration. Ces ressources sont administrées au travers de leur interface d'administration physique.",
  },
  '19.8-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      'Les modalités de cloisonnement et de filtrage du réseau d’administration respectent les modalités de cloisonnement et de filtrage mis en œuvre entre et au sein des systèmes d’information (par exemple : deux machines ne pouvant pas communiquer au travers des systèmes d’information ne peuvent pas communiquer au travers du réseau d’administration).',
  },
  '19.9-EE': {
    objectif:
      "Objectif de sécurité 19: Administration des systèmes d'information depuis des ressources dédiées",
    thematique: 'Administration des SI',
    description:
      "Lorsque des raisons techniques ou opérationnelles ne permettent pas d'administrer une ressource au travers d'une liaison réseau physique ou de son interface d'administration physique, l’entité met en œuvre des mesures de réduction du risque telles que des mesures de sécurité logique. Ces mesures sont conformes aux recommandations de l’autorité nationale de sécurité des systèmes d’information y compris les recommandations alternatives.",
  },
  '20.1-EE': {
    objectif:
      "Objectif de sécurité 20: Supervision de la sécurité des systèmes d'information",
    thematique: 'Supervision de la sécurité',
    description:
      'L’entité s’assure que les équipes en charge de l’activité de supervision de sécurité dimensionnent et opèrent le système d’information supportant l’activité de supervision de sécurité en adéquation avec leur capacité opérationnelle, afin de prendre en compte les journaux et les évènements de sécurité, sans retard injustifié et au maximum sous 24h ouvrés (Par exemple : l’ensemble des évènements de sécurité issus de l’EDR).',
  },
  '20.2-EE': {
    objectif:
      "Objectif de sécurité 20: Supervision de la sécurité des systèmes d'information",
    thematique: 'Supervision de la sécurité',
    description:
      'L’entité élabore et met en œuvre une démarche d’amélioration continue de son activité de supervision de sécurité, afin d’améliorer la couverture des scénarios de menaces identifiés à l’occasion de l’analyse de risque prévue à l’objectif de sécurité 16, et l’efficacité de la supervision de sécurité, en accord avec les dispositions prévues 20.1-EE (par exemple : augmentation des sources de collecte, amélioration des processus de traitements, augmentation des capacités de traitement, centralisation des journaux et des évènements de sécurité, mise en place de corrélation, prise en compte de scénarios de menace supplémentaires).',
  },
  '20.3-EE': {
    objectif:
      "Objectif de sécurité 20: Supervision de la sécurité des systèmes d'information",
    thematique: 'Supervision de la sécurité',
    description:
      'L’entité ou le prestataire qu’elle a mandaté à cet effet maîtrise l’architecture et la configuration du système d’information supportant l’activité de supervision de sécurité (par exemple : Le système peut être composé d’une ou plusieurs des chaînes suivantes : collecte, analyse, investigation, signalement).',
  },
  '20.4-EE': {
    objectif:
      "Objectif de sécurité 20: Supervision de la sécurité des systèmes d'information",
    thematique: 'Supervision de la sécurité',
    description:
      'En lien avec la démarche d’amélioration continue, l’entité collecte les données de supervision et les évènements de sécurité utiles à la détection des scénarios principaux de menaces, conformément à la disposition prévue en 20.1-EE. Les journaux et évènements reflètent, la variété des activités du système d’information associées (par exemple : réseau, système, applicatif, utilisateur).',
  },
  '20.5-EE': {
    objectif:
      "Objectif de sécurité 20: Supervision de la sécurité des systèmes d'information",
    thematique: 'Supervision de la sécurité',
    description:
      "L’entité s’assure que les données de supervision et les événements de sécurité sont conservés pour une durée d'au moins trois mois, sans préjudice d’autres obligations légales et réglementaires (par exemple : le règlement général sur la protection des données à caractère personnel).",
  },
  '20.6-EE': {
    objectif:
      "Objectif de sécurité 20: Supervision de la sécurité des systèmes d'information",
    thematique: 'Supervision de la sécurité',
    description:
      'Les données de supervision et les événements de sécurité sont protégés d’un incident les rendant inexploitables (par exemple : le stockage hors-ligne pour répondre à un incident de type rançongiciel).',
  },
} as const;

export type IdMesureReCyf = keyof typeof mesuresReCyf;
