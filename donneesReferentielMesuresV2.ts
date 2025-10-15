/*
Cette liste de mesures a été générée d'après le Grist Dév MSS / Dév : Catalogue de Mesures exporté en CSV
et cette commande :

mlr --icsv --ojson cat Référentiels\ de\ mesures\ MSS-Dev_Catalogue_de_mesures.csv | jq '

def lpad(n):
  tostring
  | if (n > length) then ((n - length) * "0") + . else . end;

map(
.["description"] = (.["Libellé singulier"] | gsub("\n";"<br>"))
| del(.["Libellé singulier"])
| .["descriptionLongue"] = (.["Description singulier"] | gsub("\n";"<br>"))
| del(.["Description singulier"])
| .["categorie"] = (.["Tag : Catégorie"] | ascii_downcase | gsub("é";"e"))
| del(.["Tag : Catégorie"])
| .["identifiantNumerique"] = (.["ID"] | tostring | lpad(4))
| del(.["ID"])
| .["referentiel"] = .["Tag : Acteur"]
| del(.["Tag : Acteur"])
| {(."Réf Catalogue"): (del(."Réf Catalogue"))})
| add'

 */

export const mesuresV2 = {
  'RECENSEMENT.1': {
    description:
      "Etablir la liste de l'ensemble des services et données à protéger",
    descriptionLongue:
      "Lister l'ensemble des activités, services et données du système d'information à protéger, et mettre à jour cette liste a minima annuellement.<br><br>Cette mesure permet d'identifier les éléments métier à protéger au sein du système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0001',
    referentiel: 'ANSSI',
  },
  'RECENSEMENT.2': {
    description:
      "Etablir et tenir à jour la liste des équipements et des applicatifs contribuant au fonctionnement du système d'information",
    descriptionLongue:
      "Lister les équipements et les applicatifs qui sont utilisés au sein du système d'information, et tenir à jour cette liste.<br><br>Cette mesure permet d'identifier les éléments techniques à protéger au sein du système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0002',
    referentiel: 'ANSSI',
  },
  'RECENSEMENT.3': {
    description:
      'Minimiser les données stockées aux seules données nécessaires aux traitements',
    descriptionLongue:
      "S'assurer que seules les données nécessaires au système d'information sont stockées.<br><br>Cette mesure permet la conformité à certaines réglementations, peut potentiellement réduire les coûts liés au stockage des données ainsi que l'impact d'une fuite de données.",
    categorie: 'gouvernance',
    identifiantNumerique: '0003',
    referentiel: 'ANSSI',
  },
  'CONFORMITE.1': {
    description:
      'Réaliser une analyse de la conformité aux exigences réglementaires et normatives applicables',
    descriptionLongue:
      "Réaliser et maintenir à jour une analyse de la conformité du système d'information vis-à-vis des exigences réglementaires et normatives applicables.<br><br>Pour les entités concernées par la directive NIS2, en cas de recours à une ou plusieurs alternatives prévues au sein des exigences NIS2, l'entité les renseigne dans l'analyse de conformité avec les justifications associées.<br><br>Cette mesure permet de s'assurer de la conformité du système d'information aux réglementations et normes devant être appliquées.",
    categorie: 'gouvernance',
    identifiantNumerique: '0014',
    referentiel: 'ANSSI',
  },
  'CONFORMITE.2': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0015',
    referentiel: 'ANSSI',
  },
  'CONFORMITE.3': {
    description:
      "Définir et mettre en oeuvre en continu un plan d'action de renforcement de la cybersécurité",
    descriptionLongue:
      "Formaliser et mettre en oeuvre un plan d'action de renforcement de la cybersécurité se basant sur les analyses de la conformité du système d'information vis-à-vis des exigences réglementaires et normatives applicables, les audits et autres analyses réalisés sur le système. Les actions doivent être caractérisés par un porteur et une échéance réalisable.<br><br>Cette mesure permet une amélioration continue de la sécurité du système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0163',
    referentiel: 'ANSSI',
  },
  'PSSI.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0009',
    referentiel: 'ANSSI',
  },
  'PSSI.2': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0010',
    referentiel: 'ANSSI',
  },
  'PSSI.3': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0011',
    referentiel: 'ANSSI',
  },
  'PSSI.4': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0012',
    referentiel: 'ANSSI',
  },
  'PSSI.5': {
    description:
      'Vérifier a minima annuellement les politiques et procédures de sécurité et les mettre à jour si nécessaire',
    descriptionLongue:
      "Vérifier tous les ans ou en cas d'évolutions majeures du contexte métier, technique ou organisationnel que les politiques et procédures liées au système d'information sont à jour et pertinentes.<br><br>Cette mesure permet de s'assurer que les règles de sécurité stratégiques et opérationnelles sont toujours applicables au système d'information et aux activités liées.",
    categorie: 'gouvernance',
    identifiantNumerique: '0013',
    referentiel: 'ANSSI',
  },
  'ROLE.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0004',
    referentiel: 'ANSSI',
  },
  'ROLE.3': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0006',
    referentiel: 'ANSSI',
  },
  'ROLE.5': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0008',
    referentiel: 'ANSSI',
  },
  'CONTRAT.1': {
    description:
      'Identifier ou fixer les engagements des prestataires en matière de sécurité',
    descriptionLongue:
      "En cas de recours à des prestataires, fixer, si possible dès les clauses contractuelles, les exigences de sécurité à respecter. Dans le cas où ces exigences ne peuvent pas être fixées a priori, identifier l'ensemble des exigences de sécurité que s'engagent à respecter les prestataires.<br><br>Pour les entités concernées par NIS2, l'entité doit notamment s'assurer de la conformité de la prestation aux exigences de la directive NIS2 ainsi qu'aux autres réglementations pour lesquelles la conformité est attendue.<br><br>Cette mesure permet d'éclairer la sélection des prestataires en fonction des garanties de sécurité que ces derniers s'engagent à respecte, et, dans la mesure du possible, de contrôler ces garanties.",
    categorie: 'gouvernance',
    identifiantNumerique: '0022',
    referentiel: 'ANSSI',
  },
  'CONTRAT.2': {
    description:
      'Contrôler la conformité des prestataires aux exigences de sécurité',
    descriptionLongue:
      "Auditer périodiquement les prestataires afin de s'assurer du respect des exigences de sécurité identifiées ou fixées au sein des clauses contractuelles, et sanctionner les prestataires de façon adaptée lorsque cela est possible.<br>Ces audits doivent présenter, une synthèse des conformités, les constats et les recommandations en cas de non conformité ainsi que permettre la construction d'un plan d'action.<br><br>Pour les entités concernées par NIS2, ces audits doivent vérifier la conformité de la prestation aux exigences NIS2.<br><br>Cette mesure permet de s'assurer du niveau de sécurité des prestations réalisées, afin de réduire la vraisemblance d'une attaque par rebond via les prestataires.",
    categorie: 'protection',
    identifiantNumerique: '0023',
    referentiel: 'ANSSI',
  },
  'DEV.1': {
    description:
      'Mettre en oeuvre des bonnes pratiques de développement sécurisé',
    descriptionLongue:
      'Imposer aux développeurs des bonnes pratiques de développement sécurisé.<br><br>Cette mesure permet de réduire les risques de compromission du code due à la compromission des accès des développeurs ou à une altération du code (intentionnelle ou non).',
    categorie: 'gouvernance',
    identifiantNumerique: '0024',
    referentiel: 'ANSSI',
  },
  'ECOSYSTEME.1': {
    description:
      'Lister les prestataires et fournisseurs avec leurs coordonnées',
    descriptionLongue:
      "Lister les prestataires et fournisseurs contribuant à la réalisation des activités du système d'information avec lesquels il existe une relation contractuelle et formaliser leur coordonnées de contact. Mettre cette liste à jour a minima annuellement.<br><br>Cette mesure permet le suivi des prestations permettant les communications en cas d'incident ainsi que, dans la mesure du possible, le suivi opérationnel de la prestation.",
    categorie: 'gouvernance',
    identifiantNumerique: '0016',
    referentiel: 'ANSSI',
  },
  'ECOSYSTEME.2': {
    description:
      "Lister les interconnexions avec le systèmes d'information et leur point de contact",
    descriptionLongue:
      "Lister les interconnexions du système d'information à d'autres systèmes (externes et/ou internes) et renseigner un point de contact pour chacune de ces interconnexions. Mettre cette liste à jour a minima annuellement.<br><br>Cette mesure permet le suivi des communications ouvertes et autorisées entre le système d'information et son écosystème, permettant ainsi la mise en place de mesures de filtrage et de cloisonnement ainsi que la réaction efficace en cas de compromission d'un système interconnecté. ",
    categorie: 'gouvernance',
    identifiantNumerique: '0017',
    referentiel: 'ANSSI',
  },
  'ECOSYSTEME.3': {
    description:
      "Héberger le système d'information et les données au sein de l'Union européenne",
    descriptionLongue:
      "Privilégier le recours à un hébergeur proposant la localisation au sein de l'Union européenne du service numérique et des données.<br><br>Cette mesure permet de renforcer la protection des données grâce aux garanties offertes par la réglementation européenne et à faciliter les actions de remédiation et d'investigation en cas d'incident de sécurité.",
    categorie: 'gouvernance',
    identifiantNumerique: '0018',
    referentiel: 'ANSSI',
  },
  'ECOSYSTEME.4': {
    description:
      "Héberger le système d'information et les données auprès d'un prestataire d'informatique en nuage qualifié SecNumCloud",
    descriptionLongue:
      "Privilégier le recours à un prestataire de service en nuage (Cloud) qualifié SecNumCloud par l'ANSSI.<br><br>Cette mesure permet d'apporter des garanties élevées en matière de confiance et de sécurité de l'hébergement du service et de ses données.",
    categorie: 'gouvernance',
    identifiantNumerique: '0019',
    referentiel: 'ANSSI',
  },
  'ECOSYSTEME.5': {
    description:
      "Privilégier l'achat d'un nom de domaine en .fr, .eu ou un autre nom de domaine de confiance",
    descriptionLongue:
      "Lors de l'achat du nom de domaine du service, acheter de préférence un nom de domaine en .fr ou .eu.<br><br>Cette mesure permet de renforcer la confiance des utilisateurs dans le service et la protection du service au titre des règlementations européennes associées à la localisation européenne du nom de domaine.",
    categorie: 'gouvernance',
    identifiantNumerique: '0020',
    referentiel: 'ANSSI',
  },
  'ECOSYSTEME.6': {
    description:
      'Acheter un ou plusieurs noms de domaine proches du nom de domaine du site web',
    descriptionLongue:
      "Lors du choix du nom de domaine du service numérique, procédez à l'achat d'un ou plusieurs noms de domaines proches du nom de domaine du service numérique, par exemple en changeant des lettres ou en achetant des noms de domaine avec d'autres extensions (ex. .com ou .net).<br><br>Cette mesure permet de limiter le risque de typosquatting (ex. utilisation de noms de domaines proches contenant des modifications typographiques discrètes), permettant de rediriger les utilisateurs vers un site malveillant.",
    categorie: 'gouvernance',
    identifiantNumerique: '0021',
    referentiel: 'ANSSI',
  },
  'RH.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0025',
    referentiel: 'ANSSI',
  },
  'RH.2': {
    description:
      "Mettre en oeuvre un programme de sensibilisation à la sécurité pour l'ensemble des acteurs intervenant sur le système d'information",
    descriptionLongue:
      "Sensibiliser à la sécurité numérique les utilisateurs, administrateurs et prestataires ayant accès aux équipements et/ou applicatifs du système d'information.<br><br>Cette mesure permet de réduire la vraisemblance de compromission des utilisateurs, administration et prestataires ou de leurs ressources par un attaquant externe et permet d'accélérer le signalement d'incident.",
    categorie: 'gouvernance',
    identifiantNumerique: '0026',
    referentiel: 'ANSSI',
  },
  'RH.3': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0027',
    referentiel: 'ANSSI',
  },
  'RH.4': {
    description:
      'Formaliser et mettre en oeuvre un processus de gestion des arrivées, départs et changements de fonction',
    descriptionLongue:
      "Définir et mettre en oeuvre un processus de gestion des arrivées, des départs et des changements de fonction des personnels et des tiers accédant au système d'information.<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation d'un compte obsolète par un attaquant externe ou l'utilisation des accès obsolètes par un attaquant interne.",
    categorie: 'gouvernance',
    identifiantNumerique: '0028',
    referentiel: 'ANSSI',
  },
  'RH.5': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0029',
    referentiel: 'ANSSI',
  },
  'CARTO.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0031',
    referentiel: 'ANSSI',
  },
  'CARTO.2': {
    description:
      "Formaliser et tenir à jour le dossier d'architecture du système d'information",
    descriptionLongue:
      "Formaliser et tenir à jour un dossier d'architecture technique du système d'information.<br><br>Cette mesure permet d'assurer le maintien en condition opérationnel et de sécurité du système (ex. être en capacité d'identifier les équipements ou applicatifs vulnérables suite à la publication d'un bulletin d'alerte) ainsi que de pouvoir réagir sans retard injustifié à un incident de sécurité affectant ce système (ex. être capable d'identifier les équipements ou applicatifs affectés par un incident afin d'en limiter les conséquences).",
    categorie: 'gouvernance',
    identifiantNumerique: '0032',
    referentiel: 'ANSSI',
  },
  'DONNEES.1': {
    description: 'Chiffrer les données stockées au repos',
    descriptionLongue:
      "Chiffrer les données stockées au repos via des algorithmes à l'état de l'art et s'assurer du cycle de vie sécurisé des clés de chiffrement.<br><br>Cette mesure permet de réduire la vraisemblance de récupération de données non chiffrées par un attaquant.",
    categorie: 'protection',
    identifiantNumerique: '0049',
    referentiel: 'ANSSI',
  },
  'DONNEES.2': {
    description:
      "Anonymiser les données collectées concernant l’utilisation du système d'information par les utilisateurs",
    descriptionLongue:
      "Configurer le service en vue d'anonymiser autant que possible les données à caractère personnel des utilisateurs conservées pour le bon fonctionnement ou la sécurité du service (ex. log de tentatives d'accès au service) ou à des fins d'analyse (ex. statistiques).<br><br>Cette mesure permet de protéger les utilisateurs contre la traçabilité nominative de leurs actions dans le cadre de l'utilisation du service tout en permettant d'assurer la sécurité de ce dernier au travers du suivi et de l'imputabilité des actions.<br><br><br>",
    categorie: 'protection',
    identifiantNumerique: '0050',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.1': {
    description:
      'Formaliser et mettre en oeuvre une procédure de maintien en conditions opérationnelle et de sécurité des équipements et applicatifs',
    descriptionLongue:
      "Formaliser et mettre en oeuvre une procédure de maintien en condition opérationnelle et de sécurité des ressources matérielles et logicielles du système d'information.<br><br>Cette mesure permet de minimiser les temps d'arrêt des systèmes d'information, de garantir que celui-ci fonctionne à un niveau de performance voulu et adapté, et corriger les vulnérabilités du système d’information avant qu’elles ne soient exploitées.",
    categorie: 'protection',
    identifiantNumerique: '0033',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.10': {
    description:
      'Utiliser uniquement des magasins officiels d’applications mobiles pour leur téléchargement',
    descriptionLongue:
      "Publier l'application mobile permettant l'accès au service sur une ou plusieurs bibliothèques officielles (ex. AppStore, Google Play, etc.) et informer les utilisateurs que le service n'est téléchargeable que par ce moyen.<br><br>Cette mesure permet de faciliter les mises à jour de l'application par les utilisateurs et réduit le risque que des acteurs malveillants proposent au téléchargement une version de l'application susceptible de contenir un applicatif malveillant.",
    categorie: 'gouvernance',
    identifiantNumerique: '0042',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.11': {
    description:
      'Effacer les données des équipements avant toute réattribution ou mise au rebut',
    descriptionLongue:
      "Lors de la réutilisation d'un équipement (serveur, poste de travail, équipement mobile) ou de la mise au rebut de l'équipement, s'assurer d'effacer de façon sécurisée les données des équipements.<br><br>Cette mesure permet d'éviter la fuite des informations suite à la réutilisation ou à la mise au rebut d'un équipement.",
    categorie: 'protection',
    identifiantNumerique: '0043',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.12': {
    description:
      'Installer et tenir à jour un antivirus et/ou un EDR sur tous les postes de travail',
    descriptionLongue:
      "Installer sur les postes de travail maîtrisés traitant des données provenant de sources externes des mécanismes de protection contre les risques d'exécution de codes malveillants (ex. antivirus ou EDR), maintenir à jour les bases de connaissances de ces outils (base antivirale, signatures, etc.).<br><br>Cette mesure permet de réduire la vraisemblance de compromission par des malware (ex. ransomware) des postes de travail aux sources de risque externes. ",
    categorie: 'protection',
    identifiantNumerique: '0044',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.13': {
    description: 'Traiter les alertes générées par les antivirus et/ou les EDR',
    descriptionLongue:
      "S'assurer du traitement et réaction dans le cas échéant des alertes des moyens de protection contre les risques d'exécution de codes malveillants (antivirus ou malware).<br><br>Cette mesure permet de réduire la vraisemblance de compromission par des malware (ex. ransomware) des postes de travail aux sources de risque externes. ",
    categorie: 'defense',
    identifiantNumerique: '0045',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.14': {
    description: 'Mettre à jour systématiquement les postes de travail',
    descriptionLongue:
      "S'assurer des mises à jour sans délai injustifié des OS des postes de travail et des applicatifs sur ces postes de travail.<br><br>Cette mesure permet de réduire la vraisemblance de compromission des postes de travail suite à l'exploitation d'une vulnérabilité.",
    categorie: 'protection',
    identifiantNumerique: '0046',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.15': {
    description: 'Mettre à jour systématiquement les serveurs et services',
    descriptionLongue:
      "S'assurer de la mise à jour sans délai injustifié des OS et applicatifs installés des serveurs.<br><br>Cette mesure permet de réduire la vraisemblance de compromission des serveurs suite à l'exploitation d'une vulnérabilité.",
    categorie: 'protection',
    identifiantNumerique: '0047',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.16': {
    description:
      "Déployer et tenir à jour un pare-feu permettant de filtrer les communications avec le système d'information",
    descriptionLongue:
      "S'assurer de la mise à jour sans délai injustifié des pare-feux utilisés au sein du système d'information.<br><br>Cette mesure permet de s'assurer que les pare-feux restent fiables et continuent d'apporter le niveau de sécurité attendu.",
    categorie: 'protection',
    identifiantNumerique: '0048',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.17': {
    description:
      "Garantir l'installation sans délai injustifié des correctifs de sécurité sur l'ensemble des équipements et applicatifs",
    descriptionLongue:
      "Planifier et installer sans retard injustifié au regarde de la nature de la vulnérabilité les correctifs de sécurité sur l'ensemble des équipements et applicatifs du système d'information.<br>Si des raisons techniques ou opérationnelles ne permettent pas l’installation des correctifs de sécurité, mettre en oeuvre des mesures d’atténuation pour réduire les risques liés.<br><br>Cette mesure permet de réduire la vraisemblance d'exploitation d'une vulnérabilité connue sur le système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0166',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.2': {
    description:
      'Déployer, mettre en oeuvre et tenir à jour des moyens de protection des équipements contre les codes malveillants',
    descriptionLongue:
      "Installer sur les postes de travail, serveurs et équipements mobiles maîtrisés traitant des données provenant de sources externes des mécanismes de protection contre les risques d'exécution de codes malveillants (ex. antivirus ou Endpoint Detection and Response), maintenir à jour les bases de connaissances de ces outils (base antivirale, signatures, etc.), et traiter les alertes issues de ces mécanismes.<br><br>Cette mesure permet de réduire la vraisemblance de compromission par des malware (ex. ransomware) des équipements exposés aux sources de risque externes. ",
    categorie: 'protection',
    identifiantNumerique: '0034',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.3': {
    description:
      "Réaliser une veille régulière des vulnérabilités, des campagnes de compromission, des correctifs et des mesures d'atténuation",
    descriptionLongue:
      "Mettre en oeuvre une veille sur les vulnérabilités, les correctifs de sécurité et les mesures d'atténuation préconisées susceptibles de concerner les applicatifs et équipements du système d'information.<br>Ces alertes peuvent notamment être diffusées par les fournisseurs ou fabricants des applicatifs et équipements, par des prestataires contractualisés pour réaliser cette veille ou par des centres de prévention et d'alerte en matière de cyber sécurité.<br><br>Cette mesure permet d'identifier de potentielles vulnérabilités sur les applicatifs et équipements du système d'information pour les corriger avant exploitation par un attaquant.",
    categorie: 'protection',
    identifiantNumerique: '0035',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.4': {
    description:
      "Garantir l'installation sans délai injustifié des correctifs de sécurité sur les ressources exposées, les annuaires et les postes de travail",
    descriptionLongue:
      "Mettre en oeuvre sans retard injustifié au regarde de la nature de la vulnérabilité les actions visant à l'installation des correctifs de sécurité sur les équipements et applicatifs exposés à des systèmes d'information tiers, les annuaires gérant les utilisateurs ou les ressources et les postes de travail des utilisateurs.<br>Si des raisons techniques ou opérationnelles ne permettent pas l’installation des correctifs de sécurité, mettre en oeuvre des mesures d’atténuation pour réduire les risques liés.<br><br>Cette mesure permet de réduire la vraisemblance d’exploitation d’une vulnérabilité en s’assurant que les vulnérabilités connues sont corrigés de façon adaptée et efficace.",
    categorie: 'protection',
    identifiantNumerique: '0036',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.5': {
    description:
      'Installer uniquement des applicatifs récents et maintenus à jour par les éditeurs',
    descriptionLongue:
      "Installer et maintenir à jour les ressources logicielles du système d'information (dont les systèmes embarqués) dans des versions supportées par les fournisseurs ou fabricants et comportant les mises à jour de sécurité.<br>Si des raisons techniques ou opérationnelles ne permettent pas l'installation d'une version supportée par les fournisseurs ou fabricants, mettre en oeuvre des mesures pour réduire les risques liés à l'utilisation d'une version obsolète (cloisonnement, gestion des accès, traçabilité).<br><br>Cette mesure permet de s'assurer que les applicatifs installés sont maintenus par les fournisseurs ou fabriquants et qu'ils continuent à bénéficier de correctifs de sécurité.",
    categorie: 'protection',
    identifiantNumerique: '0037',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.6': {
    description:
      "Garantir l'installation régulière des mises à jour fonctionnelles et de sécurité",
    descriptionLongue:
      "S'assurer de l'installation régulière des mises à jour fonctionnelles et de sécurité.<br>Si des raisons techniques ou opérationnelles ne permettent pas l'installation des nouvelles versions, mettre en oeuvre des mesures pour réduire les risques liés à l'utilisation d'une version obsolète (cloisonnement, gestion des accès, traçabilité).<br><br>Cette mesure permet de s'assurer que les mises à jour fournies par les fournisseurs ou fabricants sont installées afin de réduire la vraisemblance d'exploitation d'une vulnérabilité sur une version obsolète d'un applicatif.",
    categorie: 'protection',
    identifiantNumerique: '0038',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.7': {
    description:
      'Télécharger uniquement les mises à jour officielles mises à disposition par les fournisseurs',
    descriptionLongue:
      "S'assurer que toute nouvelle version est téléchargée depuis les ressources officielles mises à disposition par les éditeurs ou les fournisseurs.<br><br>Cette mesure permet de s'assurer de l'installation de versions officielles, et donc de réduire la vraisemblance d'installation d'une version compromise.  ",
    categorie: 'protection',
    identifiantNumerique: '0039',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.8': {
    description:
      'Formaliser et mettre en oeuvre une procédure de prise en compte des alertes de sécurité',
    descriptionLongue:
      "Formaliser et mettre en oeuvre une procédure et des mécanismes permettant la prise en compte permettant de prendre connaissance, sans retard injustifié, les alertes émises par l'ANSSI, les éditeurs de produits utilisés par l'identité et/ou les prestataires. Traiter ces alertes et le cas échéant appliquer les mesures préconisées.<br><br>Cette mesure permet de s'assurer de la réalisation d'une veille de sécurité et de la mise en place d'actions permettant de réagir si les alertes peuvent concerner le système d'information.",
    categorie: 'defense',
    identifiantNumerique: '0040',
    referentiel: 'ANSSI',
  },
  'MCO_MCS.9': {
    description:
      "Héberger le système d'information dans une ou plusieurs machines virtuelles",
    descriptionLongue:
      "Lors du choix de la solution d'hébergement du service et de ses données, optez pour son hébergement dans une ou plusieurs machines virtuelles.<br><br>Cette mesure permet de renforcer la sécurité du service et des données. Elle permet de filtrer plus facilement les accès, de limiter le risque d'attaques par déni de service et les chemins d'attaques par parallélisation.<br>",
    categorie: 'protection',
    identifiantNumerique: '0041',
    referentiel: 'ANSSI',
  },
  'RGPD.1': {
    description: 'Remplir le registre des traitements et le tenir à jour',
    descriptionLongue:
      "Rapprochez-vous de votre DPD ou de l’équipe juridique pour compléter le registre avec les 6 informations suivantes :<br>les parties prenantes (responsable de traitement, sous-traitants, catégories de destinataires) qui interviennent dans le traitement des données,<br>les catégories de données traitées et de personnes concernées,<br>le but poursuivi (ce que vous faites des données),<br>qui a accès aux données et à qui elles sont communiquées,<br>combien de temps vous les conservez,<br>comment elles sont sécurisées.<br>Plus d’information [ici](https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement).<br><br>Cette mesure permet de se rapprocher de la conformité à l'article 30 du RGPD ainsi que d'identifier l'ensemble des traitements de données à caractère personnel afin de les protéger.",
    categorie: 'gouvernance',
    identifiantNumerique: '0051',
    referentiel: 'CNIL',
  },
  'RGPD.2': {
    description:
      'Minimiser la collecte des données à caractère personnel au strict nécessaire',
    descriptionLongue:
      'Evaluer le but de chaque collecte de données. Ne collecter que les données strictement nécessaires pour atteindre votre objectif. Il ne faut pas collecter des données inutiles pour votre traitement en se disant qu’elles pourraient servir plus tard.<br>Lorsque trop de données sont collectées, il faut immédiatement supprimer les données non-nécessaires.<br><br>Cette mesure permet de limiter la collecte des données personnelles uniquement aux informations essentielles pour réaliser un objectif spécifique. Cela réduit les risques liés à la gestion des données et renforce la protection de la vie privée des personnes.',
    categorie: 'gouvernance',
    identifiantNumerique: '0052',
    referentiel: 'CNIL',
  },
  'RGPD.3': {
    description:
      'Limiter la durée de traitement et de conservation des données à caractère personnel au strict nécessaire',
    descriptionLongue:
      "Ne conserver les données en « base active » (ou environnement de production) que le temps strictement nécessaire à la réalisation de l’objectif poursuivi.<br>Il faut ensuite détruire ou anonymiser les données ou les archiver dans le respect des obligations légales applicables en matière de conservation des archives publiques. Vous pouvez consulter le [guide pratique](https://www.cnil.fr/sites/cnil/files/atoms/files/guide_durees_de_conservation.pdf) prévu à cet effet.<br><br>Cette mesure permet de limiter le temps pendant lequel les données personnelles sont conservées et traitées, réduisant ainsi les risques de mauvaise utilisation, d'accès non autorisé, de fuite de données ou de réutilisation non-anticipée.",
    categorie: 'gouvernance',
    identifiantNumerique: '0053',
    referentiel: 'CNIL',
  },
  'RGPD.4': {
    description:
      "Fournir des informations aux personnes concernées sur l'utilisation de leurs données à caractère personnel.",
    descriptionLongue:
      'Informer clairement les personnes lors de la collecte de leurs données de manière à ce qu’elles puissent :<br>- connaître la raison de la collecte des différentes données les concernant ;<br>- comprendre le traitement qui sera fait de leurs données ;<br>- être assurées de la maîtrise de leurs données, notamment via l’exercice de leurs droits. La liste complète des informations à fournir [est disponible ici](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3#Article13).<br><br>Cette mesure permet aux personnes concernées de conserver la maîtrise de leurs données. Cela suppose qu’elles soient clairement informées de l’utilisation qui sera faite de leurs données. Les personnes doivent également être informées de leurs droits et des modalités d’exercice de ces droits. Plus d’information [ici](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence).',
    categorie: 'gouvernance',
    identifiantNumerique: '0054',
    referentiel: 'CNIL',
  },
  'RGPD.5': {
    description:
      "Fournir des informations aux personnes concernées sur les modalités d'exercice des droits.",
    descriptionLongue:
      "Permettre aux personnes d’exercer leurs droits d’accès aux données qui les concernent, de rectification ou de suppression, voire d’opposition (sauf si le traitement répond à une obligation légale). Une réponse à une demande de droit d’accès doit contenir une copie des données ainsi que : l’objectif du traitement des données, si possible sa durée, l'identité des destinataires, dans le cas d’un traitement automatisé sa logique et ses conséquences. Ces droits doivent pouvoir s’exercer par voie électronique à partir d’une adresse dédiée. Plus d’informations sont disponibles [ici](https://www.cnil.fr/fr/passer-laction/les-droits-des-personnes-sur-leurs-donnees).<br><br>Cette mesure permet d'informer les personnes concernées sur les modalités d'exercice de leurs droits.",
    categorie: 'gouvernance',
    identifiantNumerique: '0055',
    referentiel: 'CNIL',
  },
  'RGPD.6': {
    description:
      'Vérifier si une analyse sur la protection des données à caractère personnel doit être réalisée.',
    descriptionLongue:
      "Consulter la [liste des exemptions](https://www.cnil.fr/sites/cnil/files/atoms/files/liste-traitements-aipd-non-requise.pdf). Si votre traitement n’y figure pas, regarder s’il fait partie des traitements pour lesquels [une AIPD est obligatoire](https://www.cnil.fr/fr/analyse-dimpact-relative-la-protection-des-donnees-publication-dune-liste-des-traitements-pour). Si une AIPD est nécessaire, vous pouvez la réaliser à l’aide du [logiciel PIA](https://www.cnil.fr/fr/outil-pia-telechargez-et-installez-le-logiciel-de-la-cnil).<br><br>Cette mesure permet d'identifier et dans le cas échant de réaliser une AIPD, c'est-à-dire une Analyse d'Impact sur la Protection des Données (AIPD). Cette analyse vise à évaluer et à atténuer les risques liés au traitement des données personnelles, surtout dans le cas de traitements susceptibles de présenter des risques élevés pour les droits et libertés des individus.",
    categorie: 'gouvernance',
    identifiantNumerique: '0056',
    referentiel: 'CNIL',
  },
  'PHYS.1': {
    description:
      "Restreindre l'accès aux locaux aux seules personnes autorisées.",
    descriptionLongue:
      "Restreindre l'accès aux locaux (bureaux, salles serveurs, locaux techniques, etc.) via des mesures de sécurité (ex. tenue d'un registre des visiteurs) et s'assurer que les personnes externes accédant aux locaux techniques et salles serveurs sont accompagnées ou dûment autorisées.<br><br>Cette mesure permet de réduire la vraisemblance de l'intrusion physique d'un attaquant pouvant porter atteinte au système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0057',
    referentiel: 'ANSSI',
  },
  'PHYS.2': {
    description:
      "Mettre en place des mécanismes de protection physique et de contrôle d'accès aux locaux, salles serveur et locaux techniques",
    descriptionLongue:
      "S'assurer de la protection physique des locaux, salles serveurs et locaux techniques afin de prévenir, surveiller et réagir aux accès non autorisés (ex. vidéosurveillance, gardiennage, alarmes).<br>Cela doit notamment être mis en place via un contrôle d'accès à ces locaux en s'assurant que les droits d'accès physiques sont attribués au regard du besoin strictement nécessaire à l'exécution des missions des personnes.<br><br>Cette mesure permet de réduire la vraisemblance de l'intrusion physique d'un attaquant pouvant porter atteinte au système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0058',
    referentiel: 'ANSSI',
  },
  'CLOISON.1': {
    description:
      "Cloisonner le système d'information des systèmes non maîtrisés",
    descriptionLongue:
      "Cloisonner physiquement ou logiquement le système d'information des systèmes d'informations non maîtrisés, c'est-à-dire des systèmes d'information tiers ou des systèmes d'information sur lesquels les travaux de sécurisation selon le besoin de sécurité n'ont pas été réalisés. Ce cloisonnement peut par exemple être réalisé par VLAN (réseau), par VM (calcul) ou par volume (stockage).<br><br>Cette mesure permet de réduire la vraisemblance de compromission du système d'information par rebond sur un système d'information non maîtrisé.",
    categorie: 'protection',
    identifiantNumerique: '0059',
    referentiel: 'ANSSI',
  },
  'CLOISON.2': {
    description: "Cloisonner le système d'information des autres systèmes",
    descriptionLongue:
      "Cloisonner physiquement ou logiquement le système d'information de l'ensemble des autres systèmes d'informations. Ce cloisonnement peut par exemple être réalisé par VLAN (réseau, par VM (calcul) ou par volume (stockage).<br><br>Cette mesure permet de réduire la vraisemblance de compromission du système d'information par rebond sur un autre système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0060',
    referentiel: 'ANSSI',
  },
  'CLOISON.3': {
    description:
      "Identifier les éventuels sous-systèmes du système d'information et les cloisonner entre eux",
    descriptionLongue:
      'Définir, lorsque cela est pertinent, des sous-systèmes au sein du système d\'information et cloisonner physiquement ou logiquement ces sous-systèmes entre eux.<br>Un sous-système regroupe des ressources assurant des fonctionnalités similaires et ayant des niveaux de sensibilité, d\'exposition et de sécurité homogènes.<br>Si aucun sous-système n\'est identifié, en apporter la justification dans le dossier d\'homologation.<br><br>Cette mesure permet de réduire la vraisemblance de compromission des sous-systèmes les plus sensibles par rebond sur un autre sous-système. Par exemple, cette mesure permet de cloisonner les sous-systèmes "Présentation", "Application" et "Données".',
    categorie: 'protection',
    identifiantNumerique: '0061',
    referentiel: 'ANSSI',
  },
  'CLOISON.4': {
    description:
      "Mettre en œuvre des passerelles entrante et sortante entre le système d'information et les systèmes tiers",
    descriptionLongue:
      "Mettre en oeuvre au moins deux sous-systèmes passerelles :<br>- Sortante: permettant aux ressources du système d'information d'accéder aux systèmes tiers tout en authentifiant, filtrant et traçant ces communications,<br>- Entrante : permettant d'exposer les ressources du système d'information aux systèmes tiers tout en filtrant et traçant ces communications.<br><br>Cette mesure permet de réduire la vraisemblance de compromission du système d'information par rebond sur un système d'information non maîtrisé.",
    categorie: 'protection',
    identifiantNumerique: '0062',
    referentiel: 'ANSSI',
  },
  'CLOISON.5': {
    description:
      "Ouvrir uniquement les interconnexions nécessaires entre le système d'information et les systèmes non maîtrisés",
    descriptionLongue:
      "Définir et mettre en oeuvre uniquement les interconnexions nécessaires à la réalisation des activités et services (ou au maintien en condition opérationnelle ou de sécurité) du système d'information avec les systèmes d'informations non maîtrisés, c'est-à-dire des systèmes d'information tiers ou des systèmes d'information sur lesquels les travaux de sécurisation selon le besoin de sécurité n'ont pas été réalisés.<br><br>Cette mesure permet de réduire la vraisemblance de compromission du système d'information par rebond sur un système d'information non maîtrisé.",
    categorie: 'protection',
    identifiantNumerique: '0063',
    referentiel: 'ANSSI',
  },
  'CLOISON.6': {
    description:
      "Ouvrir uniquement les interconnexions nécessaires entre le système d'information et les autres systèmes",
    descriptionLongue:
      "Définir et mettre en oeuvre uniquement les interconnexions nécessaires à la réalisation des activités et services (ou au maintien en condition opérationnelle ou de sécurité) du système d'information avec l'ensemble des autres systèmes d'information, et mettre en oeuvre un filtrage des communications entre ces systèmes.<br><br>Cette mesure permet de réduire la vraisemblance de compromission du système d'information par rebond sur un autre système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0064',
    referentiel: 'ANSSI',
  },
  'FILTRE.1': {
    description:
      "Documenter et autoriser uniquement les communications nécessaires via des règles de filtrage entre le système d'information et les systèmes non maîtrisés",
    descriptionLongue:
      "Définir les communications nécessaires à la réalisation des activités et services (ou au maintien en condition opérationnelle de sécurité) du système d'information avec des systèmes d'information non maîtrisés, c'est-à-dire des systèmes d'information tiers ou des systèmes d'information sur lesquels les travaux de sécurisation selon le besoin de sécurité n'ont pas été réalisés.<br>Mettre en oeuvre, au niveau de ces interconnexions, des règles de filtrage pour n'autoriser que les communications identifiées avec les systèmes d'information non maîtrisés via un ou des pares-feux dédiés.<br><br>Cette mesure permet de réduire la vraisemblance de compromission du système d'information par rebond sur un système d'information non maîtrisé.",
    categorie: 'protection',
    identifiantNumerique: '0066',
    referentiel: 'ANSSI',
  },
  'FILTRE.2': {
    description:
      "Documenter et autoriser uniquement les communications nécessaires via des règles de filtrage entre le système d'information et les autres systèmes",
    descriptionLongue:
      "Définir les communications nécessaires à la réalisation des activités et services (ou au maintien en condition opérationnelle de sécurité) du système d'information avec l'ensemble des autres systèmes d'information.<br>Mettre en oeuvre, au niveau de ces interconnexions, des règles de filtrage pour n'autoriser que les communications identifiés avec l'ensemble des systèmes d'information via un ou des pares-feux dédiés.<br><br><br>Cette mesure permet de réduire la vraisemblance de compromission du système d'information par rebond sur un autre système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0067',
    referentiel: 'ANSSI',
  },
  'FILTRE.3': {
    description:
      'Effectuer a minima annuellement une revue de la mise en oeuvre technique des règles de filtrage',
    descriptionLongue:
      "Réaliser a minima annuellement une revue de la mise en oeuvre technique des règles de filtrage en place pour les communications entrantes et sortantes sur le système d'information.<br><br>Cette mesure permet de s'assurer de l'efficacité des règles de filtrages mises en oeuvre et ainsi de réduire la vraisemblance de compromission du système d'information par rebond sur un autre système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0068',
    referentiel: 'ANSSI',
  },
  'FILTRE.4': {
    description:
      'Recourir à un service de protection contre les attaques par déni de service',
    descriptionLongue:
      "Recourir à un service permettant de protéger le service contre les attaques de type «déni de service» (ex. attaques par déni de service distribué dites « DDoS »).<br><br>Cette mesure permet de réduire le risque d'indisponibilité partielle ou totale du service.",
    categorie: 'protection',
    identifiantNumerique: '0069',
    referentiel: 'ANSSI',
  },
  'FILTRE.5': {
    description: 'Installer un parefeu applicatif web (WAF)',
    descriptionLongue:
      "S'assurer d'installer un pare-feu applicatif (\"WAF\") pour filtrer les flux applicatifs entrant et sortant du système d'information.<br><br>Cette mesure permet de filtrer les communications entre les utilisateurs et le système afin de protéger le système des attaques courantes (ex. Injection SQL, cross-site scripting).",
    categorie: 'protection',
    identifiantNumerique: '0070',
    referentiel: 'ANSSI',
  },
  'FILTRE.6': {
    description: 'Filtrer les flux sur les postes de travail',
    descriptionLongue:
      "Mettre en oeuvre un filtrage des flux sur le poste de travail, par exemple via un pare-feu local.<br><br>Cette mesure permet de réduire l'exposition aux sources de risque et de contrôler les communications autorisées afin de réduire la vraisemblance de compromission des postes de travail par un attaquant .",
    categorie: 'protection',
    identifiantNumerique: '0071',
    referentiel: 'ANSSI',
  },
  'FILTRE.7': {
    description: 'Mettre en place un mécanisme de rate-limit',
    descriptionLongue:
      "Mettre en oeuvre un mécanisme de rate-limit sur les services exposés.<br><br>Cette mesure permet de réduire la vraisemblance de diverses attaques telles que les déni de service, les attaques par force brute et la sur-utilisation d'API.",
    categorie: 'protection',
    identifiantNumerique: '0072',
    referentiel: 'ANSSI',
  },
  'MAIL.1': {
    description:
      "Mettre en oeuvre une solution d'anti-spam et d'anti-hameçonnage",
    descriptionLongue:
      "Mettre en oeuvre une solution d'anti-spam et d'anti-hameçonnage.<br>Les systèmes de messagerie sont un des principaux vecteurs d’attaques puisque très largement utilisés et exposés sur internet. Qu’il s’agisse de la compromission d’un poste au travers de l’ouverture de pièces jointes contenant un code malveillant, d’un clic malencontreux sur un lien redirigeant vers un site lui-même malveillant (phishing ou hameçonnage) ou de l’exploitation d’une vulnérabilité et d’un défaut de paramétrage du service de messagerie.<br><br>Cette mesure permet donc de réduire le risque qu’un utilisateur se fasse piéger par un message malveillant.",
    categorie: 'protection',
    identifiantNumerique: '0073',
    referentiel: 'ANSSI',
  },
  'DISTANCE.1': {
    description:
      "Mettre en oeuvre un mécanisme de chiffrement pour les accès à distance aux systèmes d'information",
    descriptionLongue:
      "Protéger les accès distants aux systèmes d’information à l’aide de protocoles de chiffrement éprouvés (VPN utilisant TLS ou IPSec, ou protocoles applicatifs sécurisés comme TLS/SSL ou SSH), en s’appuyant sur les standards de sécurité actuels.<br><br>Cette mesure permet de réduire la vraisemblance de perte de confidentialité des échanges entre les utilisateurs et le système d'information lors des accès à distance.",
    categorie: 'protection',
    identifiantNumerique: '0074',
    referentiel: 'ANSSI',
  },
  'DISTANCE.2': {
    description:
      'Mettre en place une authentification multifacteur reposant sur au moins un facteur de connaissance pour les accès à distance',
    descriptionLongue:
      "Mettre en oeuvre un mécanisme d'authentification mutlifacteur pour les accès à distance.<br>Ce mécanisme doit reposer sur au moins un facteur de connaissance (\"ce que je sais\", comme par exemple l'authentification via une carte à puce associé un code PIN).<br>Lorsque des raisons techniques ou opérationnelles ne permettent pas la mise en oeuvre d'un tel mécanisme, mettre en oeuvre des mesures permettant de réduire le risque associé.<br><br>Cette mesure permet de réduire la vraisemblance de compromission des comptes utilisés pour les accès à distance.",
    categorie: 'protection',
    identifiantNumerique: '0075',
    referentiel: 'ANSSI',
  },
  'DISTANCE.3': {
    description:
      "Chiffrer les disques des équipements autorisés à accéder au système d'information à distance",
    descriptionLongue:
      "Chiffrer la mémoire des équipements (postes de travail et équipements mobiles) permettant d'accéder à distance aux systèmes d'information. Par exemple, chiffrer les disques des postes de travail avec un code PIN exigé pour le déchiffrement au démarrage.<br><br>Cette mesure permet de réduire la vraisemblance de fuite d'information suite à la récupération d'un poste de travail ou d'un équipement mobile par un attaquant.",
    categorie: 'protection',
    identifiantNumerique: '0076',
    referentiel: 'ANSSI',
  },
  'DISTANCE.4': {
    description:
      "Mettre en oeuvre une authentification pour les accès à distance aux systèmes d'informations par l'entité ou ses prestataires.",
    descriptionLongue:
      "Mettre en oeuvre une authentification pour les accès à distance aux systèmes d'informations par l'entité ou ses prestataires.<br><br>Pour les entités concernées par NIS2, cette authentification doit être conforme aux exigences NIS2.<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation illégitime des droits suite à une absence d'authentification.",
    categorie: 'protection',
    identifiantNumerique: '0167',
    referentiel: 'ANSSI',
  },
  'MALWARE.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'protection',
    identifiantNumerique: '0077',
    referentiel: 'ANSSI',
  },
  'MALWARE.2': {
    description:
      "Autoriser uniquement la connexion au système d'information aux équipements gérés par l'entité ou ses prestataires",
    descriptionLongue:
      "S'assurer que seuls les équipements nécessaires et directement gérés par l'entité ou les prestataires mandatés se connectent au système d'information via la mise en place de mesures organisationnelles ou techniques.<br><br>Cette mesure permet de réduire la vraisemblance d'intrusion dans le système d'information via la connexion d'un équipement non autorisé au système.",
    categorie: 'protection',
    identifiantNumerique: '0078',
    referentiel: 'ANSSI',
  },
  'MALWARE.3': {
    description:
      "Analyser l'ensemble des données reçues de sources externes afin d'identifier la présence de codes malveillants",
    descriptionLongue:
      "Analyser les données reçues de sources externes afin d'identifier la présence de codes malveillants (ex. passerelle mail analysant les pièces jointes avant distribution ou SAS de décontamination antivirale pour les clefs USB).<br><br>Cette mesure permet de réduire la vraisemblance d'infection des équipements par un malware suite à la réception de code malveillant.",
    categorie: 'protection',
    identifiantNumerique: '0079',
    referentiel: 'ANSSI',
  },
  'AUTH.1': {
    description:
      'Modifier les mots de passe ou autres éléments secrets configurés par défaut dans les équipements et applicatifs',
    descriptionLongue:
      "Modifier les éléments secrets configurés par défaut, avant la mise en service d'un équipement.<br>Cela demande notamment de s'assurer, avant sélection de l'équipement ou applicatif concerné, qu'il est possible de disposer des moyens et des droits permettant d'effectuer ce changement.<br>Lorsque des raisons techniques ou opérationnelles ne permettent pas de modifier l'élément secret, mettre en oeuvre un contrôle d'accès approprié à l'équipement ou au à l'applicatif, la traçabilité de ces accès ainsi que des mesures de réduction du risque lié.<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation malveillante d'utilisation de compte utilisant le secret par défaut.",
    categorie: 'protection',
    identifiantNumerique: '0083',
    referentiel: 'ANSSI',
  },
  'AUTH.10': {
    description:
      "S'assurer que tous les accès au système d'information sont authentifiés via a minima un secret",
    descriptionLongue:
      "Protéger les accès des utilisateurs et processus automatiques aux équipements et applicatifs des systèmes d'information via un mécanisme d'authentification impliquant au moins un secret (ex. mot de passe ou authentification multifacteur tel qu'une carte à puce avec un code PIN).<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation illégitime des droits suite à une absence d'authentification.",
    categorie: 'protection',
    identifiantNumerique: '0092',
    referentiel: 'ANSSI',
  },
  'AUTH.11': {
    description: 'Protéger les mots de passe stockés',
    descriptionLongue:
      "Dans le cadre de la configuration du service au niveau du serveur d'hébergement, veiller à ne pas stocker les mots de passe « en clair ». Seule une « empreinte » des mots de passe doit être stockée.<br><br>Cette mesure permet de limiter la capacité d'un attaquant à accéder aux mots de passe en cas de compromission de la base de données des mots de passe.",
    categorie: 'protection',
    identifiantNumerique: '0162',
    referentiel: 'ANSSI',
  },
  'AUTH.2': {
    description:
      'Renouveler les secrets des comptes partagés au départ ou mobilité interne de chaque utilisateur ayant un accès au compte',
    descriptionLongue:
      "En cas de compte partagé, renouveler les secrets de ces comptes à chaque retrait d'un utilisateur de ce compte.<br>Lorsque des raisons techniques ou opérationnelles ne permettent pas de modifier l'élément secret, mettre en oeuvre un contrôle d'accès approprié à l'équipement ou au à l'applicatif ainsi que des mesures de réduction du risque lié.<br><br>Pour les entités concernées par NIS2 et classées essentielles, si des raisons techniques ou opérationnelles ne permettent pas de modifier l'élément secret, mettre en oeuvre la traçabilité de accès liés à cet élément.<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation d'un compte générique par un attaquant externe suite au retrait d'un utilisateur et à la divulgation des secrets liés.",
    categorie: 'protection',
    identifiantNumerique: '0084',
    referentiel: 'ANSSI',
  },
  'AUTH.3': {
    description:
      'Garantir que les secrets des comptes partagés ne sont connus que des utilisateurs autorisés',
    descriptionLongue:
      "S'assurer que l'élément secret d'un compte n'est connu que de l'utilisateur autorisé à utiliser le compte (ou des utilisateurs en cas de compte partagé).<br><br>Cette mesure permet de s'assurer que l'authentification permet d'identifier le ou les utilisateurs ayant réalisé les actions.",
    categorie: 'protection',
    identifiantNumerique: '0085',
    referentiel: 'ANSSI',
  },
  'AUTH.4': {
    description:
      "S'assurer que les facteurs d'authentification utilisés sont conformes aux recommandations de l'ANSSI",
    descriptionLongue:
      "S'assurer que les facteurs d'authentification (ex. mot de passe) sont conformes aux recommandations de l'ANSSI en matière de complexité, en tenant compte du niveau de complexité maximal permis par la ressource concernée, et en matière de fréquence de renouvellement.<br><br>Cette mesure permet de diminuer le risque de découverte et l'usurpation de mots de passe par des acteurs malveillants, par exemple en testant plusieurs mots de passe sur la base de mots du dictionnaire.",
    categorie: 'protection',
    identifiantNumerique: '0086',
    referentiel: 'ANSSI',
  },
  'AUTH.5': {
    description:
      'Fixer des contraintes de complexité des mots de passe ou autres secrets aux comptes administrateurs techniques',
    descriptionLongue:
      "Fixer des règles de longueur et de complexité des mots de passe lors de la création d'un mot de passe ou de son renouvellement par un administrateurs technique. Lorsque cela est possible, configurer le mécanisme de création de mots de passe pour interdire les mots de passe faibles.<br><br>Cette mesure permet de diminuer le risque de découverte et l'usurpation de mots de passe par des acteurs malveillants, par exemple en testant plusieurs mots de passe sur la base de mots du dictionnaire.",
    categorie: 'protection',
    identifiantNumerique: '0087',
    referentiel: 'ANSSI',
  },
  'AUTH.6': {
    description:
      'Fixer des contraintes de complexité des mots de passe ou autres secrets aux comptes des processus',
    descriptionLongue:
      "Fixer des règles de longueur et de complexité des mots de passe lors de la création d'un mot de passe de processus automatisé (compte de service) ou de son renouvellement. Lorsque cela est possible, configurer le système d'information pour interdire les mots de passe faibles.<br><br>Cette mesure permet de diminuer le risque de découverte et l'usurpation de mots de passe par des acteurs malveillants, par exemple en testant plusieurs mots de passe sur la base de mots du dictionnaire.",
    categorie: 'protection',
    identifiantNumerique: '0088',
    referentiel: 'ANSSI',
  },
  'AUTH.7': {
    description:
      'Fixer des contraintes de complexité des mots de passe ou autres secrets aux comptes utilisateurs',
    descriptionLongue:
      "Fixer des règles de longueur et de complexité des mots de passe lors de la création d'un mot de passe ou de son renouvellement par un utilisateur. Lorsque cela est possible, configurer le système d'information pour interdire les mots de passe faibles.<br><br>Cette mesure permet de diminuer le risque de découverte et l'usurpation de mots de passe par des acteurs malveillants, par exemple en testant plusieurs mots de passe sur la base de mots du dictionnaire.",
    categorie: 'protection',
    identifiantNumerique: '0089',
    referentiel: 'ANSSI',
  },
  'AUTH.8': {
    description:
      'Mettre en place la déconnexion automatique des sessions après une durée déterminée',
    descriptionLongue:
      "Configurer le service afin d'activer la déconnexion automatique des sessions des administrateurs et des utilisateurs inactifs après une durée déterminée.<br><br>Cette mesure permet de limiter le risque d'utilisation, par une personne malveillante, du compte d'un utilisateur, qui aurait laissé son équipement non verrouillé sans surveillance et ne se serait pas déconnecté du service.",
    categorie: 'protection',
    identifiantNumerique: '0090',
    referentiel: 'ANSSI',
  },
  'AUTH.9': {
    description:
      'Mettre en oeuvre des protections contre les tentatives de connexion répétées',
    descriptionLongue:
      'Mettre en oeuvre des protections contre les tentatives de connexion répétées. <br>Ces protections doivent être mises en oeuvre sur le serveur.<br><br>Cette mesure permet de réduire la vraisemblance de récupération de compte via une attaque de type brute force.',
    categorie: 'protection',
    identifiantNumerique: '0091',
    referentiel: 'ANSSI',
  },
  'DROITS.1': {
    description:
      "Restreindre les droits d'accès de chaque utilisateur authentifié aux seules ressources nécessaires",
    descriptionLongue:
      "Pour chaque utilisateur, n'attribuer les droits d'accès qu'aux seuls équipements nécessaires à la réalisation des activités et services du système d'information (ou au maintien en condition opérationnelle ou de sécurité).<br>De plus, n'attribuer des droits d'accès qu'aux utilisateurs authentifiés justifiant d'un besoin au regard de leurs missions.<br><br>Cette mesure permet de limiter le risque d'utilisation par une personne malveillante de droits trop permissifs accordés.",
    categorie: 'protection',
    identifiantNumerique: '0093',
    referentiel: 'ANSSI',
  },
  'DROITS.2': {
    description:
      "Restreindre les droits d'accès de chaque processus authentifié aux seules ressources nécessaires",
    descriptionLongue:
      "Pour chaque processus automatisé, n'attribuer les droits d'accès qu'aux seuls équipements nécessaires à la réalisation des activités et services du système d'information (ou au maintien en condition opérationnelle ou de sécurité).<br>De plus, n'attribuer des droits d'accès qu'aux processus authentifiés justifiant d'un besoin au regard de leurs missions.<br><br>Cette mesure permet de limiter le risque d'utilisation par une personne malveillante de droits trop permissifs accordés.",
    categorie: 'protection',
    identifiantNumerique: '0094',
    referentiel: 'ANSSI',
  },
  'DROITS.3': {
    description:
      "Effectuer une revue des droits d'accès a minima annuellement ",
    descriptionLongue:
      "Effectuer, au moins annuellement, une revue des droits d'accès devant notamment vérifier le respect de l'attribution des droits selon le besoin au regard des missions et permettre de corriger les anomalies.<br><br>Cette mesure permet de s'assurer que les droits d'accès octroyés correspondent strictement aux besoins des utilisateurs et processus automatisés au regard de leurs missions.",
    categorie: 'protection',
    identifiantNumerique: '0095',
    referentiel: 'ANSSI',
  },
  'ID.1': {
    description:
      "Autoriser uniquement la création de comptes d’accès individuels utilisables uniquement par l'utilisateur ou processus automatique associé",
    descriptionLongue:
      "Autoriser uniquement la création de comptes d'accès individuels réservés à l'utilisateur ou au processus automatique auquel chaque compte est attribué.<br>Lorsque des raisons techniques ou opérationnelles ne permettent pas de créer de comptes individuels, mettre en place des mesures permettant de réduire le risque lié à l'utilisation de comptes partagés et d'assurer la traçabilité de l'utilisation de ces comptes (ex. carnet de quart dans une salle de supervision, badgeuse à l'entrée de la salle).<br><br>Cette mesure permet de s'assurer de la traçabilité des actions au sein du système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0080',
    referentiel: 'ANSSI',
  },
  'ID.2': {
    description:
      'Désactiver les comptes non nécessaires dans un délai formalisé',
    descriptionLongue:
      "Formaliser et mettre en oeuvre une procédure de suppression des comptes inactifs ou non nécessaires, prenant notamment en compte les délais de désactivation des comptes prévus dans la politique de gestion des comptes (ex. sous 7 jours).<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation d'un compte inactif ou non nécessaire par un attaquant.",
    categorie: 'protection',
    identifiantNumerique: '0081',
    referentiel: 'ANSSI',
  },
  'ID.3': {
    description:
      'Supprimer à intervalle régulier les comptes des administrateurs techniques inactifs et non nécessaires ',
    descriptionLongue:
      "Supprimer à intervalle régulier les comptes des administrateurs techniques, c'est-à-dire les comptes disposant de hauts privilèges sur les infrastructures, inactifs et non nécessaires.<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation d'un compte inactif ou non nécessaire par un attaquant.",
    categorie: 'protection',
    identifiantNumerique: '0082',
    referentiel: 'ANSSI',
  },
  'ANNUAIRE.1': {
    description:
      'Identifier et formaliser la liste des ressources du coeur de confiance',
    descriptionLongue:
      "Lister et tenir à jour l'ensemble des ressources composant le coeur de confiance du système d'information, c'est-à-dire les annuaires gérant les comptes et ressources, les équipements et applicatifs hébergeant ces annuaires, et les équipements ou comptes permettant de prendre le contrôle de ces annuaires (ex. comptes, hyperviseurs, postes de travail d'administration).<br><br>Cette mesure permet d'identifier le coeur de confiance afin de pouvoir le protéger.",
    categorie: 'gouvernance',
    identifiantNumerique: '0105',
    referentiel: 'ANSSI',
  },
  'ANNUAIRE.2': {
    description:
      "Proscrire les connexions à distance aux ressources d'administration du coeur de confiance via un mécanisme de filtrage sur ces ressources",
    descriptionLongue:
      "Interdire via du filtrage les connexions externes à destination des ressources d'administration du coeur de confiance, c'est-à-dire les annuaires gérant les comptes et ressources, les équipements et applicatifs hébergeant ces annuaires, et les équipements ou comptes permettant de prendre le contrôle de ces annuaires (ex. comptes, hyperviseurs, postes de travail d'administration).<br><br>Cette mesure permet de filtrer les connexions au coeur de confiance, réduisant ainsi la vraisemblance de compromission.",
    categorie: 'protection',
    identifiantNumerique: '0106',
    referentiel: 'ANSSI',
  },
  'ANNUAIRE.3': {
    description:
      'Effectuer a minima annuellement une revue de la configuration des annuaires',
    descriptionLongue:
      "Réaliser a minima annuellement une revue de la configuration des annuaires gérant les utilisateurs ou les ressources du système d'information afin d'identifier tout élément inutile ou anormal. Il est recommandé pour cela de s'appuyer sur un outil automatisé.<br><br>Cette mesure permet de s'assurer de la configuration adéquates des annuaires, et ainsi de s'assurer que ces configurations correspondent aux attentes fonctionnelles et de sécurité. ",
    categorie: 'protection',
    identifiantNumerique: '0107',
    referentiel: 'ANSSI',
  },
  'ANNUAIRE.4': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'protection',
    identifiantNumerique: '0108',
    referentiel: 'ANSSI',
  },
  'ANNUAIRE.5': {
    description:
      "Dédier les ressources et comptes d'administration du coeur de confiance à cet usage",
    descriptionLongue:
      "Réaliser les actions d'administration du coeur de confiance via des ressources (équipements et applicatifs) et des comptes d'administrations dédiés à cet usage.<br><br>Cette mesure permet de restreindre les accès avec privilèges au coeur de confiance.",
    categorie: 'protection',
    identifiantNumerique: '0161',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.1': {
    description:
      "N'autoriser les actions d'administration technique qu'avec des comptes d'administration technique et limiter ces comptes à ces seules actions",
    descriptionLongue:
      "N'autoriser les actions d'administration qu'avec des comptes d'administration technique, et limiter ces comptes à ces seules actions.<br><br>Pour les entités concernées par NIS2 et étant classées essentielles, si des raisons techniques ne permettent pas d'effectuer les actions d'administration à partir d'un compte dédié, mettre en oeuvre des mesures permettant d'assurer le contrôle des actions d'administration et des mesures de réduction du risque lié à l'utilisation d'un compte non dédié à cet usage.<br><br>Cette mesure permet de réduire la vraisemblance de compromission et d'utilisation d'un compte non dédié à l'administration technique pour réaliser une action nécessitant de hauts privilèges.",
    categorie: 'protection',
    identifiantNumerique: '0096',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.2': {
    description:
      "Restreindre les comptes d'administration aux seules personnes autorisées à administrer",
    descriptionLongue:
      "Restreindre l'utilisation des comptes d'administration aux seuls administrateurs ou personnes autorisées à administrer.<br><br>Cette mesure permet de réduire la vraisemblance d'utilisation d'un compte à haut privilège entrainant une erreur critique non-intentionnelle ainsi que la vraisemblance de compromission d'une compte administrateur d'un utilisateur non sensibilisé et formé aux bonnes pratiques liées à cet usage.",
    categorie: 'protection',
    identifiantNumerique: '0097',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.3': {
    description:
      "Restreindre le périmètre des comptes d'administration selon les périmètres",
    descriptionLongue:
      "Créer des comptes d'accès d'administration différents dotés de privilèges distincts selon les périmètres. Par exemple, le compte administrateur d'un routeur est utilisé depuis un poste d'administration ou sur le routeur uniquement pour administrer ce routeur.<br><br>Cette mesure permet de limiter la capacité d'action d'acteurs malveillants qui parviendraient à usurper un compte d'administration.",
    categorie: 'protection',
    identifiantNumerique: '0098',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.4': {
    description:
      "Formaliser et tenir à jour en continu une liste des comptes d'administration",
    descriptionLongue:
      "Etablir et tenir à jour une liste des comptes d'administration du système d'information.<br><br>Cette mesure permet de suivre et donc de limiter le nombre de comptes d'administration pouvant être compromis puis utilisés sur le système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0099',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.5': {
    description:
      "Garantir une revue des droits d'accès à chaque modification d'un compte d'administration",
    descriptionLongue:
      "Lors de toute modification d'un compte d'administration (ajout, suppression, suspension ou modification des droits associés), vérifier que les droits d'accès sont attribués en cohérence avec les besoins d'utilisation du compte.<br>Pour cela, il est recommandé d'octroyer les droits d'administration au travers de groupes dont les comptes d'administration sont membres.<br><br>Cette mesure permet de limiter les droits attribués aux comptes des administrateurs afin de réduire l'impact potentiel d'une compromission d'un tel compte.",
    categorie: 'protection',
    identifiantNumerique: '0100',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.6': {
    description:
      "Limiter les droits de chaque administrateur du système d'information au strict nécessaire",
    descriptionLongue:
      "Attribuer les droits individuels à chaque compte d'administration en les restreignant autant que possible au périmètre fonctionnel et technique. <br>Pour cela, il est recommandé d'octroyer les droits d'administration au travers de groupes dont les comptes d'administration sont membres.<br><br>Cette mesure permet de vérifier les droits attribués aux comptes des administrateurs techniques afin de réduire l'impact potentiel d'une compromission d'un tel compte.",
    categorie: 'protection',
    identifiantNumerique: '0101',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.7': {
    description:
      "Limiter drastiquement le nombre d'utilisateurs pouvant administrer localement leur poste de travail",
    descriptionLongue:
      "S'assurer de ne créer aux utilisateurs que des comptes utilisateurs ne disposant pas de privilège d’administration sur les postes de travail. Seuls les administrateurs chargés de l’administration des postes doivent disposer de ces droits lors de leurs interventions.<br><br>Cette mesure permet de réduire les droits des utilisateurs et ainsi réduire la vraisemblance de l’installation non autorisée de logiciels, la modification de paramètres sensibles du système et la propagation de logiciels malveillants avec des droits élevés.",
    categorie: 'protection',
    identifiantNumerique: '0102',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.8': {
    description:
      'Sauvegarder les mots de passe des administrateurs techniques dans un gestionnaire de mots de passe',
    descriptionLongue:
      "Fournir aux administrateurs techniques un gestionnaire de mot de passe et les former à son utilisation.<br><br>Cette mesure permet de réduire la vraisemblance de stockage non sécurisé des mots de passe par les administrateurs techniques (ex. sur un bloc note) et ainsi de réduire la vraisemblance de compromission d'un compte d'administrateur technique.",
    categorie: 'protection',
    identifiantNumerique: '0103',
    referentiel: 'ANSSI',
  },
  'COMPADMIN.9': {
    description:
      'Limiter au strict nécessaire le nombre de personnes disposant d’un accès administrateur',
    descriptionLongue:
      "N'attribuer des droits d'administration qu'aux comptes nécessaires à la réalisation des activités et services ou au maintien en condition opérationnelle ou de sécurité du système d'information.<br><br>Cette mesure permet de réduire le nombre de comptes disposant de droits d'administration et pouvant être compromis.",
    categorie: 'protection',
    identifiantNumerique: '0104',
    referentiel: 'ANSSI',
  },
  'INCIDENT.1': {
    description:
      'Formaliser et mettre en oeuvre une procédure de traitement des incidents de sécurité',
    descriptionLongue:
      "Formaliser et mettre en oeuvre une procédure de traitement des incidents de sécurité affectant les systèmes d'information.<br><br>Cette mesure permet de s'assurer du traitement efficace des incidents de sécurité afin d'en limiter les impacts.",
    categorie: 'defense',
    identifiantNumerique: '0109',
    referentiel: 'ANSSI',
  },
  'INCIDENT.2': {
    description:
      "Mettre en œuvre des outils permettant la collecte de signalements d'évènements de sécurité, notamment par les utilisateurs et les prestataires ou fournisseurs",
    descriptionLongue:
      "S'assurer de la mise en oeuvre des outils permettant de collecter les signalements d'évènements de sécurité par les utilisateurs, prestataires ou fournisseurs.<br><br>Cette mesure permet de renforcer l'activité de collecte des événements de sécurité",
    categorie: 'defense',
    identifiantNumerique: '0110',
    referentiel: 'ANSSI',
  },
  'INCIDENT.3': {
    description:
      "Mettre en œuvre des mécanismes permettant d’analyser et de qualifier les événements de sécurité ainsi que d'identifier d'éventuels incidents",
    descriptionLongue:
      "Définir et mettre en oeuvre des mécanismes permettant d'analyser et de qualifier les évènements de sécurité remontés et d'identifier les incidents potentiels ou avérés.<br><br>Cette mesure permet de s'assurer de la mise en place des mécanismes permettant l'identification d'incidents de sécurité.",
    categorie: 'defense',
    identifiantNumerique: '0111',
    referentiel: 'ANSSI',
  },
  'INCIDENT.4': {
    description:
      "Garantir que les causes de chaque incident majeur sont analysées et donnent lieu à un plan d'action",
    descriptionLongue:
      "S'assurer qu'après chaque incident majeur, une analyse des causes de l'incident a été réalisée. <br>Cette analyse de cause vise à définir et mettre en oeuvre les mesures de sécurité permettant de limiter la vraisemblance d'un nouvel incident ou d'en réduire l'impact. Les preuves de l'analyse doivent être conservées.<br><br>Cette mesure permet de limiter le risque de récurrence du même incident.",
    categorie: 'defense',
    identifiantNumerique: '0112',
    referentiel: 'ANSSI',
  },
  'INCIDENT.5': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0113',
    referentiel: 'ANSSI',
  },
  'INCIDENT.6': {
    description:
      'Rendre publics un point de contact et des modalités de communication de tout problème de sécurité',
    descriptionLongue:
      "Publier sur le système d'information un point de contact et les modalités de communication de tout problème de sécurité.<br><br>Cette mesure permet aux utilisateurs de signaler des problèmes de sécurité.",
    categorie: 'defense',
    identifiantNumerique: '0114',
    referentiel: 'ANSSI',
  },
  'INCIDENT.7': {
    description:
      "Lister les personnes à contacter en cas d'incident de sécurité informatique",
    descriptionLongue:
      "Lister l'ensembles des personnes (directions, prestataires, équipes techniques, autorités, etc.) devant être contactées en cas d'incident de sécurité informatique.<br><br>Cette mesure permet d'améliorer l'efficacité de la réponse aux incidents de sécurité informatique.",
    categorie: 'defense',
    identifiantNumerique: '0115',
    referentiel: 'ANSSI',
  },
  'INCIDENT.8': {
    description:
      "Mettre en oeuvre des mécanismes permettant de réagir aux incidents et d'en limiter les conséquences",
    descriptionLongue:
      "Définir et mettre en oeuvre des mécanismes organisationnels et techniques permettant de réagir en cas d'incident et d'en limiter les conséquences sur les services et activités.<br><br>Cette mesure permet d'améliorer la maîtrise des conséquences d'un incident de sécurité sur le système d'information.",
    categorie: 'resilience',
    identifiantNumerique: '0165',
    referentiel: 'ANSSI',
  },
  'CONTINU.1': {
    description:
      'Formaliser et mettre en oeuvre des procédures de sauvegarde et de restauration, et les tester a minima annuellement.',
    descriptionLongue:
      "Formaliser et mettre en oeuvre des procédures de sauvegarde et de restauration du système d'information et de ses données dont les dimensionnements sont adaptés pour répondre au besoin de disponibilité du système.<br>Tester ces procédures afin de vérifier notamment la bonne réalisation des sauvegardes et leur bonne restauration.<br><br>Cette mesure permet de s'assurer que le processus de sauvegarde et de restauration est en place et qu'il correspond aux besoins du système.",
    categorie: 'resilience',
    identifiantNumerique: '0116',
    referentiel: 'ANSSI',
  },
  'CONTINU.2': {
    description:
      "Protéger les sauvegardes d'un évènement les rendant inexploitables",
    descriptionLongue:
      "Protéger les sauvegardes d'un incident les rendant inexploitables (ex. stockage hors-ligne pour répondre à un incident de type rançongiciel).<br>Cela peut notamment être réalisé via la mise en oeuvre d'une politique de sauvegarde \"3-2-1\", c'est-à-dire 3 sauvegardes, sur 2 supports différents, dont 1 hors ligne.<br><br>Cette mesure permet de protéger les sauvegardes d'un incident les rendant inexploitables (par exemple pour répondre à un incident de type rançongiciel).",
    categorie: 'resilience',
    identifiantNumerique: '0117',
    referentiel: 'ANSSI',
  },
  'CONTINU.3': {
    description:
      "Formaliser la durée d'interruption et la perte de données maximales admissibles du système d'information",
    descriptionLongue:
      "Formaliser la durée maximale d'interruption admissible (DMIA) et la perte de données maximale admissible (PDMA) pour le système d'information.<br><br>Cette mesure permet d'établir les besoins de résilience du système.",
    categorie: 'resilience',
    identifiantNumerique: '0118',
    referentiel: 'ANSSI',
  },
  'CONTINU.4': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'resilience',
    identifiantNumerique: '0119',
    referentiel: 'ANSSI',
  },
  'CONTINU.5': {
    description:
      "Formaliser et mettre en oeuvre le plan de reprise de l'activité",
    descriptionLongue:
      "Définir et mettre en oeuvre un plan de reprise d'activité (PRA) cohérent avec la durée maximale d'interruption admissible et la perte de données maximale admissible.<br>La définition de ce plan doit notamment s'appuyer sur la cartographie de l'écosystème, la procédure de gestion des incidents et la procédure de gestion des crises d'origine cyber.<br><br>Cette mesure permet de préparer la reprise des activités du système selon ses besoins de résilience.",
    categorie: 'resilience',
    identifiantNumerique: '0120',
    referentiel: 'ANSSI',
  },
  'CONTINU.6': {
    description:
      "Recourir à une ou plusieurs solutions garantissant un haut niveau de disponibilité du système d'information",
    descriptionLongue:
      "Recourir à une ou plusieurs solutions garantissant un haut niveau de disponibilité, en particulier dans le cadre de l'hébergement du service (ex. obligation de redondance de la machine virtuelle et des données).<br><br>Cette mesure permet d'éviter une interruption du service dépassant quelques minutes.",
    categorie: 'defense',
    identifiantNumerique: '0121',
    referentiel: 'ANSSI',
  },
  'CRISE.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0122',
    referentiel: 'ANSSI',
  },
  'CRISE.2': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0123',
    referentiel: 'ANSSI',
  },
  'CRISE.3': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0124',
    referentiel: 'ANSSI',
  },
  'CRISE.4': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0125',
    referentiel: 'ANSSI',
  },
  'CRISE.5': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0126',
    referentiel: 'ANSSI',
  },
  'CRISE.6': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0127',
    referentiel: 'ANSSI',
  },
  'CRISE.7': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'resilience',
    identifiantNumerique: '0164',
    referentiel: 'ANSSI',
  },
  'EXO.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0128',
    referentiel: 'ANSSI',
  },
  'EXO.2': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0129',
    referentiel: 'ANSSI',
  },
  'RISQUE.1': {
    description:
      "Réaliser une analyse de risque approfondie de la sécurité du système d'information et la mettre à jour au minimum tous les trois ans",
    descriptionLongue:
      "Réaliser une analyse de risque approfondie du système d'information et la mettre à jour tous les trois ans et en cas d'incident de sécurité ou d'évolution majeure (métier, technique ou organisationnelle). Cette analyse de risque doit s'appuyer sur les éléments issus du socle normatif et/ou réglementaire applicable (ex. PSSI et réglementation applicable), des spécificités sectorielles, de la maîtrise de l'écosystème, de la maîtrise du système et des audits.<br>Cette analyse doit être validée par l'entité, les risques résiduels acceptés et un plan d'action présentant des échéances raisonnables et les responsables pour chaque action doit être mis en oeuvre.<br><br>La méthode EBIOS RM peut être utilisée pour cette analyse de risque.<br><br>Cette mesure permet d'identifier et de maîtrises les risques liés au système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0131',
    referentiel: 'ANSSI',
  },
  'RISQUE.2': {
    description:
      "Réaliser une analyse de risque rapide de la sécurité du système d'information",
    descriptionLongue:
      "Réaliser une analyse de risque rapide du système d'information et la mettre à jour tous les trois ans et en cas d'incident de sécurité ou d'évolution majeure (métier, technique ou organisationnel. <br>Cette analyse doit être validée par l'entité, les risques résiduels acceptés et un plan d'action présentant des échéances raisonnables et les responsables pour chaque action doit être mis en oeuvre.<br><br>Cette mesure permet d'identifier et de maîtrises les risques liés au système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0132',
    referentiel: 'ANSSI',
  },
  'RISQUE.3': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'gouvernance',
    identifiantNumerique: '0133',
    referentiel: 'ANSSI',
  },
  'AUDIT.1': {
    description:
      "Formaliser et mettre en oeuvre un programme d'audit du système d'information",
    descriptionLongue:
      "Définir et mettre en oeuvre un programme d'audit permettant l'audit du système d'information au moins tous les trois ans ou en cas d'évolution technique majeure du système.<br>Un audit doit permettre de vérifier la conformité aux mesures issues du socle normatif et/ou réglementaire (ex. PSSI et réglementations applicables) et d'évaluer le niveau de sécurité du système au regard des menaces et des vulnérabilités connues.<br>Chaque audit doit donner lieu à la formalisation d'un rapport présentant les résultats (synthèse de la conformité, constats et recommandations) et à la mise en oeuvre d'un plan d'action visant à corriger les non-conformités et les vulnérabilités identifiées. Ce plan d'action doit présenter des échéances raisonnables et responsables pour chaque action.<br><br>Cette mesure permet de s'assurer de l'efficacité des mesures de sécurité mises en place ainsi que d'identifier et de maîtriser les vulnérabilités liés au système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0134',
    referentiel: 'ANSSI',
  },
  'AUDIT.2': {
    description:
      "Intégrer, si nécessaire, au programme d'audit un audit de code",
    descriptionLongue:
      "Réaliser, lorsque cela est pertinent, un audit de code.<br><br>Cette mesure permet d'identifier et de maîtriser les vulnérabilités liées au code du système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0135',
    referentiel: 'ANSSI',
  },
  'AUDIT.3': {
    description: "Intégrer au programme d'audit un test d’intrusion",
    descriptionLongue:
      "Réaliser une test d'intrusion couvrant a minima les interface exposées à des systèmes non maîtrisés, c'est-à-dire à des systèmes d'information tiers ou des systèmes d'information sur lesquels les travaux de sécurisation selon le besoin de sécurité n'ont pas été réalisés. <br><br>Cette mesure permet d'identifier et de maîtriser les vulnérabilités liées au système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0136',
    referentiel: 'ANSSI',
  },
  'AUDIT.4': {
    description: "Intégrer au programme d'audit un audit de configuration",
    descriptionLongue:
      "Réaliser un audit de configuration.<br><br>Cette mesure permet de s'assurer du durcissement du système d'information.",
    categorie: 'gouvernance',
    identifiantNumerique: '0137',
    referentiel: 'ANSSI',
  },
  'AUDIT.5': {
    description: "Intégrer au programme d'audit un audit d'architecture",
    descriptionLongue:
      "Réaliser un audit d'architecture.<br><br>Cette mesure permet d'identifier les vulnérabilités issues des choix d'architecture de la solution.",
    categorie: 'gouvernance',
    identifiantNumerique: '0138',
    referentiel: 'ANSSI',
  },
  'AUDIT.6': {
    description: "Mettre en oeuvre des mécanismes d'audit automatique du code",
    descriptionLongue:
      "Mettre en place des mécanismes d’audit automatique du code (analyse statique, détection de vulnérabilités, vérification de conformité aux standards de développement, etc.), afin de contrôler sa qualité et sa sécurité avant toute intégration en production.<br><br>Cette mesure permet de réduire la vraisemblance d'exploitation d'une vulnérabilité liée au code.",
    categorie: 'protection',
    identifiantNumerique: '0168',
    referentiel: 'ANSSI',
  },
  'CONFIG.1': {
    description:
      'Installer et conserver uniquement les applicatifs et fonctionnalités nécessaires',
    descriptionLongue:
      "Installer sur les équipements uniquement les applicatifs et fonctionnalités strictement nécessaires à la réalisation des activités et services ou au maintien en condition opérationnelles ou de sécurité du système d'information.<br>Lorsque des raison techniques ou opérationnelles ne permettent pas de désactiver ou de désinstaller les applicatifs et fonctionnalités, mettre en oeuvre des mesures permettant de réduire le risque associé (ex. compartimentalisation, gestion des accès, traçabilité).<br><br>Cette mesure permet de réduire la vraisemblance d'exploitation de vulnérabilité sur un applicatif ou un fonctionnalité non nécessaire.",
    categorie: 'protection',
    identifiantNumerique: '0139',
    referentiel: 'ANSSI',
  },
  'CONFIG.2': {
    description:
      "Configurer les équipements et applicatifs en s'appuyant sur les recommandations disponibles",
    descriptionLongue:
      "Configurer les équipements et applicatifs  en s'appuyant sur les recommandations des éditeurs, fabricants ou de l'ANSSI.<br><br>Cette mesure permet de s'assurer du durcissement du système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0140',
    referentiel: 'ANSSI',
  },
  'CONFIG.3': {
    description:
      'Procéder a minima annuellement à une revue de configuration des équipements et applicatifs',
    descriptionLongue:
      "Mettre en oeuvre des vérifications techniques de la configuration des équipements et des applicatifs.<br>Il est recommandé que cette revue s'appuie sur un ou des outils automatisés (ex. scan de port et de vulnérabilité, revue des configurations des pares-feux par rapport aux matrices de flux).<br><br>Cette mesure permet de s'assurer du durcissement du système d'information.",
    categorie: 'protection',
    identifiantNumerique: '0141',
    referentiel: 'ANSSI',
  },
  'CONFIG.4': {
    description:
      'Chiffrer le trafic des données avec un certificat de sécurité conforme au référentiel général de sécurité',
    descriptionLongue:
      "Dans le cadre de la configuration du service, installer un certificat de sécurité serveur conforme au référentiel général de sécurité (RGS) défini par l'ANSSI, délivré par un prestataire de service de confiance qualifié.<br><br>Cette mesure permet de chiffrer les flux de données transitant par le service numérique avec des mécanismes de chiffrement robustes ainsi que de prouver l'identité de l'organisation détentrice du certificat.",
    categorie: 'protection',
    identifiantNumerique: '0142',
    referentiel: 'ANSSI',
  },
  'CONFIG.5': {
    description: 'Désactiver tout flux de données non chiffré',
    descriptionLongue:
      "Configurer le service en vue de désactiver tout flux de données qui n'est pas chiffré.<br><br>Cette mesure permet de protéger la confidentialité des données, dans le cas où des flux de données seraient interceptés.",
    categorie: 'protection',
    identifiantNumerique: '0143',
    referentiel: 'ANSSI',
  },
  'CONFIG.6': {
    description: 'Fermer tous les ports non strictement nécessaires',
    descriptionLongue:
      "Configurer le service en vue de fermer tous les ports réseau non strictement nécessaires à l'administration et au fonctionnement du service et fermer tous les autres ports.<br><br>Cette mesure permet de réduire le risque d'accès illégitime au service de la part d'acteurs malveillants.",
    categorie: 'protection',
    identifiantNumerique: '0144',
    referentiel: 'ANSSI',
  },
  'CONFIG.7': {
    description:
      'Installer un certificat de signature électronique conforme à la réglementation',
    descriptionLongue:
      "Dans le cadre de la configuration du service, installer un certificat de signature électronique qualifié au sens du règlement n° 910/2014 eIDAS, délivré par un prestataire qualifié, ou recourir à un service conforme.<br><br>Cette mesure permet la réalisation d'une signature électronique robuste sur le plan de la sécurité, conforme à la réglementation française et européenne.",
    categorie: 'protection',
    identifiantNumerique: '0145',
    referentiel: 'ANSSI',
  },
  'CONFIG.8': {
    description:
      'Désactiver, sauf dérogation tracée, les ports usb des serveurs',
    descriptionLongue:
      "Configurer les serveurs afin de désactiver les ports usb des serveurs, sauf en cas de dérogation tracée et limitée dans le temps.<br><br>Cette mesure permet de réduire la vraisemblance d'exfiltration ou de contamination par malware des serveurs via les ports usb. ",
    categorie: 'protection',
    identifiantNumerique: '0146',
    referentiel: 'ANSSI',
  },
  'ADMIN.1': {
    description:
      "Réaliser les actions d'administration technique depuis un réseau dédié",
    descriptionLongue:
      "Réaliser les actions d'administration au moyen d'un réseau d'administration dédié.<br><br><br>Cette mesure permet de réduire l'exposition des interfaces d'administration.",
    categorie: 'protection',
    identifiantNumerique: '0147',
    referentiel: 'ANSSI',
  },
  'ADMIN.2': {
    description:
      "S'assurer que les ressources des réseaux d'administration technique sont gérés et configurés par les personnes désignées",
    descriptionLongue:
      "S'assurer que seules les personnes désignées (interne ou externes) peuvent gérer et configurer les ressources des réseaux d'administration.<br><br>Cette mesure permet de réduire le nombre de personnes pouvant être compromises par un attaquant pour attaquer les réseaux d'administration.",
    categorie: 'protection',
    identifiantNumerique: '0148',
    referentiel: 'ANSSI',
  },
  'ADMIN.3': {
    description:
      "Dédier les ressources matérielles des réseaux d'administration technique aux actions d'administration ",
    descriptionLongue:
      "Dédier les ressources matérielles des réseaux d'administration aux actions d'administration technique.<br><br>Cette mesure permet de réduire la vraisemblance de compromission d'une ressource des réseaux d'administration.",
    categorie: 'protection',
    identifiantNumerique: '0149',
    referentiel: 'ANSSI',
  },
  'ADMIN.4': {
    description:
      "Utiliser des postes physiques dédiés pour la connexion et actions d'administration technique",
    descriptionLongue:
      "Utiliser pour l'administration technique des postes de travail physique dédiés uniquement à cet usage.<br>Lorsque des raisons techniques ou opérationnelles ne le permettent pas, mettre en oeuvre des mesures de durcissement du système d'exploitation utilisé pour réaliser les actions d'administration, et cloisonné ce système d'exploitation du système d'exploitation utilisé pour les autres actions.<br><br>Cette mesure permet de réduire la vraisemblance d'attaque par rebond sur un poste de travail utilisé pour l'administration technique.",
    categorie: 'protection',
    identifiantNumerique: '0150',
    referentiel: 'ANSSI',
  },
  'ADMIN.5': {
    description:
      "Administrer les ressources du système d'information au travers d'une liaison réseau et d'une interface physiques dédiées ",
    descriptionLongue:
      "Utiliser une liaison réseau physique dédiées pour la connexion des réseaux d'administration aux équipements du système d'information.<br>Administrer ces équipements au travers de leur interface d'administration physique.<br>Lorsque des raisons techniques ou opérationnelles ne le permettent pas, mettre en oeuvre des mesures de réduction du risque telles que des mesures de sécurité logique.<br><br>Cette mesure permet de cloisonner les accès aux ressources pour les actions d'administration technique.",
    categorie: 'protection',
    identifiantNumerique: '0151',
    referentiel: 'ANSSI',
  },
  'ADMIN.6': {
    description: "Cloisonner et filtrer les accès d'administration technique",
    descriptionLongue:
      "Cloisonner et filtrer le réseau d'administration et les accès d'administration technique afin de respecter les modalités de cloisonnement et de filtrage mises en oeuvre au sein des systèmes d'information. <br>Par exemple, deux machines ne pouvant pas communiquer au travers des systèmes d'information ne peuvent pas communiquer au travers du réseau d'administration.<br><br>Cette mesure permet de cloisonner et de filtrer les flux d'administration technique pour réduire les risques d'attaque via ces flux.",
    categorie: 'protection',
    identifiantNumerique: '0152',
    referentiel: 'ANSSI',
  },
  'ADMIN.7': {
    description:
      "Chiffrer et authentifier les communications associées aux actions d'administration technique",
    descriptionLongue:
      "Mettre en oeuvre des mécanismes de chiffrement et d'authentification à l'état de l'art pour les communications associées à des actions d'administration (ex. protocoles sécurisés garantissant authentification, intégrité et confidentialité).<br>Si ces communications transitent sur des réseaux non dédiés à ces communications, les cloisonner au moyen de mécanismes de chiffrement et d'authentification conformes à l'état de l'art (ex. tunnel VPN).<br>Lorsque des raisons techniques ou opérationnelles ne permettent pas de chiffrer ou d'authentifier ces communications, mettre en oeuvre des mesures permettant de protéger la confidentialité et l'intégrité de ces flux et de renforce le contrôle et la traçabilité des actions d'administration.<br><br>Cette mesure permet de protéger les communications associées à des actions d'administration de perte de confidentialité ou d'intégrité.",
    categorie: 'protection',
    identifiantNumerique: '0153',
    referentiel: 'ANSSI',
  },
  'SUPERVISION.1': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0154',
    referentiel: 'ANSSI',
  },
  'SUPERVISION.2': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0155',
    referentiel: 'ANSSI',
  },
  'SUPERVISION.3': {
    description: 'N/A',
    descriptionLongue: 'N/A',
    categorie: 'defense',
    identifiantNumerique: '0156',
    referentiel: 'ANSSI',
  },
  'SUPERVISION.4': {
    description:
      'Conserver et centraliser les journaux et évènements de sécurité utiles à la détection des principaux scénarios de menaces',
    descriptionLongue:
      "Conserver et centraliser les journaux et évènements de sécurité utiles à la détection des principaux scénarios de menace.<br>Ces journaux et évènement reflètent la variété des activités du système d'information (ex. réseau, système, applicatif, utilisateur).<br><br>Cette mesure permet de s'assurer de la collecte des journaux et évènement nécessaires à la détection et à la réaction des scénarios de menace liés au système d'information.",
    categorie: 'defense',
    identifiantNumerique: '0157',
    referentiel: 'ANSSI',
  },
  'SUPERVISION.5': {
    description:
      'Stocker les journaux et évènements de sécurité pour une durée minimum de trois mois',
    descriptionLongue:
      "Stocker les journaux et évènements de sécurité pour une durée minimum de trois mois, sans préjudice d'autres obligations légales et réglementaires (ex. RGPD).<br><br>Cette mesure permet de s'assurer que la durée de stockage des journaux et évènements de sécurité est suffisante pour la détection et la réaction des scénarios de menace.",
    categorie: 'defense',
    identifiantNumerique: '0158',
    referentiel: 'ANSSI',
  },
  'SUPERVISION.6': {
    description:
      'Conserver et centraliser le journal des accès des administrateurs technique',
    descriptionLongue:
      "Activer la journalisation et la centralisation des accès des administrateurs, des utilisateurs et des applicatifs concourant au fonctionnement du service.<br><br>Cette mesure permet de faciliter la détection d'actions inhabituelles susceptibles d'être malveillantes et d'investiguer a posteriori les causes d'un incident de sécurité, en vue de faciliter sa remédiation.",
    categorie: 'defense',
    identifiantNumerique: '0159',
    referentiel: 'ANSSI',
  },
  'SUPERVISION.7': {
    description:
      "Conserver et centraliser le journal des évènements de sécurité intervenus sur le système d'information",
    descriptionLongue:
      "Activer la journalisation et la centralisation des événements de sécurité.<br>A défaut, créer et maintenir à jour un document recensant l'ensemble des événements de sécurité ayant affecté le service et des mesures mises en œuvre pour y remédier.<br><br>Cette mesure permet de faciliter la détection d'évènements de sécurité connus et la résolution des incidents qui en découleraient.",
    categorie: 'defense',
    identifiantNumerique: '0160',
    referentiel: 'ANSSI',
  },
};

export const questionsV2 = {
  niveauSecurite: {
    niveau1: {
      position: 1,
    },
    niveau2: {
      position: 2,
    },
    niveau3: {
      position: 3,
    },
  },
  statutDeploiement: {
    enProjet: {
      description: 'En conception',
    },
    enCours: {
      description: 'En cours de développement ou de déploiement',
    },
    enLigne: {
      description: 'En ligne et accessible aux usagers et/ou agents',
    },
  },
  typeDeService: {
    portailInformation: {
      nom: "Portail d'information",
      exemple: 'ex. site web vitrine sans création de compte',
    },
    serviceEnLigne: {
      nom: 'Service en ligne',
      exemple: 'ex. démarche en ligne, téléservice avec création de compte',
    },
    api: {
      nom: 'API',
      exemple: 'ex. mise à disposition de données sur Internet',
    },
    applicationMobile: {
      nom: 'Application mobile',
      exemple:
        'ex. une application permettant de visualiser des vidéos en ligne',
    },
    autreSystemeInformation: {
      nom: "Autre Système d'information",
      exemple: '',
    },
  },
  specificiteProjet: {
    postesDeTravail: { nom: 'Des postes de travail', exemple: '' },
    accesPhysiqueAuxBureaux: {
      nom: "L'accès physique des bureaux",
      exemple: '',
    },
    accesPhysiqueAuxSallesTechniques: {
      nom: "L'accès physique des salles techniques",
      exemple: '',
    },
    annuaire: { nom: 'Un annuaire', exemple: '' },
    dispositifDeSignatureElectronique: {
      nom: 'Un dispositif de signature électronique',
      exemple: '',
    },
    echangeOuReceptionEmails: {
      nom: "L'échange et/ou la réception d'emails",
      exemple: '',
    },
  },
  typeHebergement: {
    onPremise: { nom: 'Hébergement interne (On-premise)' },
    cloud: {
      nom: 'Le système d’information repose sur une infrastructure ou une plateforme Cloud (IaaS/PaaS)',
    },
    saas: {
      nom: "Le système est entièrement fourni et vous l'utilisez directement via une interface (SaaS)",
    },
    autre: { nom: 'Autre' },
  },
  activiteExternalisee: {
    administrationTechnique: {
      nom: "L'administration technique",
      exemple: 'Administration logique des serveurs',
    },
    developpementLogiciel: {
      nom: 'Le développement',
      exemple: '',
    },
  },
  categorieDonneesTraitees: {
    donneesSensibles: {
      nom: 'Données sensibles',
      exemple: 'ex. santé, appartenance syndicale, etc.',
      criticite: 4,
    },
    documentsRHSensibles: {
      nom: 'Documents RH sensibles',
      exemple: 'ex. évaluations, sanctions, fiches de paye, RIB, IBAN, etc.',
      criticite: 4,
    },
    secretsDEntreprise: {
      nom: "Données liées au secret d'entreprise",
      exemple:
        'ex. Processus de fabrication spécifique, données de recherche & développement',
      criticite: 4,
    },
    donneesCaracterePersonnelPersonneARisque: {
      nom: 'Données à caractère personnel de personnes à risque',
      exemple: 'ex. mineurs',
      criticite: 3,
    },
    donneesSituationFamilialeEconomiqueFinanciere: {
      nom: 'Données relatives à la situation familiale, économique et financière',
      exemple: 'ex. revenus, état civil.',
      criticite: 3,
    },
    documentsIdentifiants: {
      nom: 'Documents identifiants',
      exemple: 'ex. CNI, Passeport, etc.',
      criticite: 3,
    },
    donneesTechniques: {
      nom: 'Données techniques',
      exemple: 'ex. DAT, logs, etc.',
      criticite: 3,
    },
    donneesDIdentite: {
      nom: "Données d'identité",
      exemple: 'ex. noms, prénoms, adresse mail, etc.',
      criticite: 2,
    },
    donneesAdministrativesEtFinancieres: {
      nom: 'Données administratives et financières',
      exemple: 'ex. organigramme, budgets, bilans, dépenses etc.',
      criticite: 2,
    },
  },
  volumetrieDonneesTraitees: {
    faible: {
      nom: 'Faible',
      description:
        "Le système stocke une quantité limitée et stable d'informations, facile à gérer et rapidement consultable.",
      criticite: 1,
    },
    moyen: {
      nom: 'Moyen',
      description:
        "Le système stocke un volume conséquent et stable d'informations, qui commence à nécessiter une organisation ou des outils spécifiques.",
      criticite: 2,
    },
    eleve: {
      nom: 'Elevé',
      description:
        "Le système stocke un grand et stable nombre d'informations, avec un impact notable sur la gestion, la sauvegarde ou l'accessibilité.",
      criticite: 3,
    },
    tresEleve: {
      nom: 'Très élevé',
      description:
        'Le système stocke une très grande quantité d’informations, en croissance constante, nécessitant des capacités de stockage importantes.',
      criticite: 4,
    },
  },
  ouvertureSysteme: {
    interneRestreint: {
      nom: "Accessible à très peu de personnes en interne de l'organisation",
      exemple:
        'ex. baie de stockage accessible uniquement depuis des postes physiques dédiés',
      criticite: 1,
    },
    interne: {
      nom: "Interne à l'organisation",
      exemple: "ex. outil RH accessible depuis le réseau de l'organisation",
      criticite: 2,
    },
    internePlusTiers: {
      nom: 'Interne et ouvert à certains tiers',
      exemple:
        "ex. plateforme de suivi accessible depuis le réseau de l'organisation  et pour certains tiers via un VPN",
      criticite: 3,
    },
    accessibleSurInternet: {
      nom: 'Accessible depuis internet',
      exemple:
        "ex. service public dont un portail avec une mire d'authentification accessible à tous sur internet",
      criticite: 4,
    },
  },
  audienceCible: {
    limitee: {
      nom: 'Limitée',
      description:
        'Utilisé par un petit nombre de personnes, souvent en interne.',
      criticite: 1,
    },
    moyenne: {
      nom: 'Moyenne',
      description:
        'Utilisé par un périmètre restreint à l’échelle locale ou régionale.',
      criticite: 2,
    },
    large: {
      nom: 'Large',
      description:
        'Utilisé à l’échelle nationale par plusieurs entités d’un même domaine.',
      criticite: 3,
    },
    tresLarge: {
      nom: 'Très large',
      description:
        'Ouvert ou accessible à un public national voire international.',
      criticite: 4,
    },
  },
  dureeDysfonctionnementAcceptable: {
    moinsDe4h: { nom: 'Moins de 4h', criticite: 4 },
    moinsDe12h: { nom: 'Moins de 12h', criticite: 3 },
    moinsDe24h: { nom: 'Moins de 24h', criticite: 2 },
    plusDe24h: { nom: 'Plus de 24h', criticite: 1 },
  },
  localisationDonneesTraitees: {
    UE: {
      nom: "Au sein de l'Union européenne",
    },
    horsUE: {
      nom: 'Hors Union européenne',
    },
  },
};

export type CategorieDonneesTraitees =
  keyof typeof questionsV2.categorieDonneesTraitees;
export type VolumetrieDonneesTraitees =
  keyof typeof questionsV2.volumetrieDonneesTraitees;
export type LocalisationDonneesTraitees =
  keyof typeof questionsV2.localisationDonneesTraitees;
export type AudienceCible = keyof typeof questionsV2.audienceCible;
export type DureeDysfonctionnementAcceptable =
  keyof typeof questionsV2.dureeDysfonctionnementAcceptable;
export type OuvertureSysteme = keyof typeof questionsV2.ouvertureSysteme;
export type TypeHebergement = keyof typeof questionsV2.typeHebergement;
export type TypeDeService = keyof typeof questionsV2.typeDeService;
export type SpecificiteProjet = keyof typeof questionsV2.specificiteProjet;
export type ActiviteExternalisee =
  keyof typeof questionsV2.activiteExternalisee;
export type StatutDeploiement = keyof typeof questionsV2.statutDeploiement;
export type NiveauSecurite = keyof typeof questionsV2.niveauSecurite;
