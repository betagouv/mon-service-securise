/*
  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceCyFunEnTypescript.sh
  Ne pas modifier directement
*/

import { DonneesReferentielsMesuresCyFun23 } from '../../referentielV2.js';

export const mesuresCyFun23 = {
  'DE.AE-1': {
    description:
      'Une base de référence des opérations du réseau et des flux de données attendus pour les utilisateurs et les systèmes est établie et gérée.',
  },
  'DE.AE-1.1': {
    description:
      "L'organisation doit s'assurer qu'une base de référence des opérations du réseau et des flux de données attendus pour ses systèmes critiques est développée, documentée et maintenue pour suivre les événements.",
  },
  'DE.AE-2': {
    description:
      'Les événements détectés sont analysés pour comprendre les cibles et les méthodes d’attaque.',
  },
  'DE.AE-2.1': {
    description:
      "L'organisation doit examiner et analyser les événements détectés pour comprendre les cibles et les méthodes d'attaque.",
  },
  'DE.AE-2.2': {
    description:
      "L'organisation doit mettre en œuvre des mécanismes automatisés, lorsque cela est possible, pour examiner et analyser les événements détectés.",
  },
  'DE.AE-3': {
    description:
      'Les données d’événements sont collectées et corrélées à partir de sources et de capteurs multiples.',
  },
  'DE.AE-3.1': {
    description:
      "La fonctionnalité d'enregistrement de l'activité du matériel ou du logiciel de protection/détection (par exemple, les pare-feu, les anti-virus) doit être activée, sauvegardée et examinée.",
  },
  'DE.AE-3.2': {
    description:
      "L'organisation doit s'assurer que les données relatives aux événements sont compilées et corrélées dans l'ensemble de ses systèmes critiques en utilisant diverses sources telles que les rapports d'événements, la surveillance des audits, la surveillance du réseau, la surveillance de l'accès physique et les rapports des utilisateurs/administrateurs.",
  },
  'DE.AE-3.3': {
    description:
      "L'organisation doit intégrer l'analyse des événements, lorsque cela est possible, à l'analyse des informations du scannage de vulnérabilité, aux données sur les performances, à la surveillance de ses systèmes critiques et à la surveillance des installations, afin d'améliorer encore la capacité à identifier les activités inappropriées ou inhabituelles.",
  },
  'DE.AE-4': { description: 'L’impact des événements est déterminé.' },
  'DE.AE-4.1': {
    description:
      "Les impacts négatifs sur les opérations, les actifs et les individus de l'organisation résultant des événements détectés doivent être déterminés et mis en corrélation avec les résultats de l'évaluation des risques.",
  },
  'DE.AE-5': { description: 'Les seuils d’alerte des incidents sont établis.' },
  'DE.AE-5.1': {
    description:
      "L'organisation doit mettre en œuvre des mécanismes automatisés et des alertes générées par le système pour faciliter la détection des événements et l'identification des seuils d'alerte de sécurité.",
  },
  'DE.AE-5.2': {
    description: "L'organisation doit définir des seuils d'alerte d'incidents.",
  },
  'DE.CM-1': {
    description:
      'Le réseau est surveillé pour détecter les événements potentiels de cybersécurité.',
  },
  'DE.CM-1.1': {
    description:
      'Des pare-feu doivent être installés et exploités aux limites du réseau et complétés par une protection pare-feu sur les terminaux.',
  },
  'DE.CM-1.2': {
    description:
      "L'organisation doit surveiller et identifier l'utilisation non autorisée de ses systèmes critiques pour l'organisation en détectant les connexions locales, les connexions réseau et les connexions à distance non autorisées.",
  },
  'DE.CM-1.3': {
    description:
      "L'organisation doit effectuer une surveillance permanente de l'état de sécurité de son réseau afin de détecter les événements définis en matière d'information/cybersécurité et les indicateurs d'événements potentiels en matière d'information/cybersécurité.",
  },
  'DE.CM-1.4': {
    description:
      "L'environnement physique de l'installation doit être surveillé pour détecter les événements potentiels liés à l'information et à la cybersécurité.",
  },
  'DE.CM-2': {
    description:
      'L’environnement physique est surveillé pour détecter les événements potentiels de cybersécurité.',
  },
  'DE.CM-2.1': {
    description:
      "En plus de la surveillance de l'accès physique à l'installation, l'accès physique aux systèmes et dispositifs critiques de l'organisation doit être renforcé par des alarmes d'intrusion physique, des équipements de surveillance et des équipes de surveillance indépendantes.",
  },
  'DE.CM-3': {
    description:
      'L’activité du personnel est surveillée pour détecter les événements potentiels de cybersécurité.',
  },
  'DE.CM-3.1': {
    description:
      "Des outils de protection des terminaux et des réseaux permettant de surveiller le comportement de l'utilisateur final pour détecter toute activité dangereuse doivent être mis en œuvre.",
  },
  'DE.CM-3.2': {
    description:
      "Les outils de protection des terminaux et des réseaux qui surveillent le comportement de l'utilisateur final pour détecter toute activité dangereuse doivent être gérés.",
  },
  'DE.CM-3.3': {
    description:
      "Les restrictions d'utilisation et d'installation des logiciels sont appliqués.",
  },
  'DE.CM-4': { description: 'Le code malveillant est détecté.' },
  'DE.CM-4.1': {
    description:
      'Des programmes anti-virus, anti-spyware et autres programmes malveillants doivent être installés et mis à jour.',
  },
  'DE.CM-4.2': {
    description:
      "L'organisation doit mettre en place un système de détection des faux positifs lors de la détection et de l'éradication des codes malveillants.",
  },
  'DE.CM-5': { description: 'Un code mobile non autorisé est détecté.' },
  'DE.CM-5.1': {
    description:
      "L'organisation doit définir le code mobile et les technologies de code mobile acceptables et inacceptables ; et autoriser, surveiller et contrôler l'utilisation du code mobile au sein du système.",
  },
  'DE.CM-6': {
    description:
      'L’activité des prestataires de services externes est surveillée pour détecter les événements potentiels de cybersécurité.',
  },
  'DE.CM-6.1': {
    description:
      'Toutes les connexions externes des fournisseurs qui prennent en charge des applications ou des infrastructures IT/OT doivent être sécurisées et surveillées activement afin de garantir que seules des actions autorisées se produisent pendant la connexion.',
  },
  'DE.CM-6.2': {
    description:
      "La conformité des prestataires de services externes aux politiques et procédures de sécurité du personnel et aux exigences de sécurité contractuelles est contrôlée par rapport aux risques de cybersécurité qu'ils présentent.",
  },
  'DE.CM-7': {
    description:
      'La surveillance du personnel, des connexions, des dispositifs et des logiciels non autorisés est effectuée.',
  },
  'DE.CM-7.1': {
    description:
      "Les systèmes essentiels aux opérations de l'organisation doivent être surveillés pour détecter les accès, les connexions, les dispositifs, les points d'accès et les logiciels non autorisés par le personnel.",
  },
  'DE.CM-7.2': {
    description:
      "Les modifications non autorisées de la configuration des systèmes de l'organisation doivent être surveillées et traitées par des mesures d'atténuation appropriées.",
  },
  'DE.CM-8': { description: 'Les analyses de vulnérabilité sont effectuées.' },
  'DE.CM-8.1': {
    description:
      "L'organisation doit surveiller et analyser les vulnérabilités de ses systèmes critiques et de ses applications hébergées en veillant à ce que les fonctions du système ne soient pas affectées par le processus d'analyse.",
  },
  'DE.CM-8.2': {
    description:
      "Le processus d'analyse de la vulnérabilité comprend l'analyse, la correction et le partage des informations.",
  },
  'DE.DP-2': {
    description:
      'Les activités de détection sont conformes à toutes les exigences applicables.',
  },
  'DE.DP-2.1': {
    description:
      "L'organisation doit mener des activités de détection conformément aux lois fédérales et régionales, aux réglementations et normes industrielles, aux politiques et aux autres exigences applicables.",
  },
  'DE.DP-3': { description: 'Les processus de détection sont testés.' },
  'DE.DP-3.1': {
    description:
      "L'organisation doit valider que les processus de détection des événements fonctionnent comme prévu.",
  },
  'DE.DP-4': {
    description:
      'Les informations relatives à la détection des événements sont communiquées.',
  },
  'DE.DP-4.1': {
    description:
      "L'organisation doit communiquer les informations relatives à la détection des événements aux parties prédéfinies.",
  },
  'DE.DP-5': {
    description: 'Les processus de détection sont améliorés en permanence.',
  },
  'DE.DP-5.1': {
    description:
      "Les améliorations découlant de la surveillance, de la mesure, de l'évaluation, des tests, de l'examen et des enseignements tirés seront incorporées dans les révisions du processus de détection.",
  },
  'DE.DP-5.2': {
    description:
      "L'organisation doit effectuer des évaluations spécialisées, notamment une surveillance approfondie, un scannage de vulnérabilité, des tests d'utilisateurs malveillants, une évaluation de la menace interne, des tests de performance/charge, ainsi que des tests de vérification et de validation sur les systèmes critiques de l'organisation.",
  },
  'ID.AM-1': {
    description:
      'Les dispositifs et systèmes physiques utilisés dans l’organisation sont inventoriés.',
  },
  'ID.AM-1.1': {
    description:
      "Un inventaire des actifs associés aux informations et aux installations de traitement de l'information au sein de l'organisation doit être documenté, examiné et mis à jour lorsque des changements surviennent.",
  },
  'ID.AM-1.2': {
    description:
      "L'inventaire des actifs associés aux informations et aux installations de traitement de l'information doit refléter les changements intervenus dans le contexte de l'organisation et inclure toutes les informations nécessaires à une responsabilisation efficace.",
  },
  'ID.AM-1.3': {
    description:
      "Lorsque du matériel non autorisé est détecté, il est mis en quarantaine pour un éventuel traitement d'exception, retiré ou remplacé, et l'inventaire est mis à jour en conséquence.",
  },
  'ID.AM-1.4': {
    description:
      "Les mécanismes permettant de détecter la présence de composants matériels et micrologiciels non autorisés dans le réseau de l'organisation doivent être identifiés.",
  },
  'ID.AM-2': {
    description:
      'Les plateformes et applications logicielles utilisées au sein del’organisation sont inventoriées.',
  },
  'ID.AM-2.1': {
    description:
      "Un inventaire reflétant les plateformes et les applications logicielles utilisées dans l'organisation doit être documenté, révisé et mis à jour lorsque des changements surviennent.",
  },
  'ID.AM-2.2': {
    description:
      "L'inventaire des plates-formes logicielles et des applications associées à l'information et au traitement de l'information doit refléter l'évolution du contexte de l'organisation et inclure toutes les informations nécessaires à une responsabilisation efficace.",
  },
  'ID.AM-2.3': {
    description:
      "Les personnes qui sont responsables de l'administration des plates-formes et des applications logicielles au sein de l'organisation et qui doivent en rendre compte doivent être identifiées.",
  },
  'ID.AM-2.4': {
    description:
      "Lorsqu'un logiciel non autorisé est détecté, il est mis en quarantaine en vue d'un éventuel traitement d'exception, supprimé ou remplacé, et l'inventaire est mis à jour en conséquence.",
  },
  'ID.AM-2.5': {
    description:
      "Les mécanismes permettant de détecter la présence de logiciels non autorisés dans l'environnement TIC/OT de l'organisation doivent être identifiés.",
  },
  'ID.AM-3': {
    description:
      'La communication organisationnelle et les flux de données sont schématisés.',
  },
  'ID.AM-3.1': {
    description:
      "Les informations que l'organisation stocke et utilise doivent être identifiées.",
  },
  'ID.AM-3.2': {
    description:
      "Toutes les connexions au sein de l'environnement TIC/OT de l'organisation, ainsi qu'à d'autres plateformes internes à l'organisation, doivent être schématisées, documentées, approuvées et mises à jour le cas échéant.",
  },
  'ID.AM-3.3': {
    description:
      "Les flux d'informations/de données dans l'environnement TIC/OT de l'organisation, ainsi que vers d'autres systèmes internes à l'organisation, doivent être schématisés, documentés, autorisés et mis à jour lorsque des changements surviennent.",
  },
  'ID.AM-4': {
    description: 'Les systèmes d’information externes sont catalogués.',
  },
  'ID.AM-4.1': {
    description:
      "L'organisation doit schématiser, documenter, autoriser et, lorsque des changements surviennent, mettre à jour, tous les services externes et les connexions établies avec eux.",
  },
  'ID.AM-4.2': {
    description:
      "Le flux d'informations vers/depuis les systèmes externes doit être schématisé, documenté, autorisé et mis à jour lorsque des changements surviennent.",
  },
  'ID.AM-5': {
    description:
      'Les ressources sont organisées par ordre de priorité en fonction de leur classification, de leur criticité et de leur valeur opérationnelle.',
  },
  'ID.AM-5.1': {
    description:
      'Les ressources de l’organisation (matériel, dispositifs, données, temps, personnel, informations et logiciels) doivent être organisées par ordre de priorité en fonction de leur classification, de leur criticité et de leur valeur opérationnelle.',
  },
  'ID.AM-6': {
    description:
      'Les rôles, responsabilités et pouvoirs en matière de cybersécurité pour l’ensemble du personnel et les parties prenantes tierces (par exemple, les fournisseurs, les clients, les partenaires) sont établis.',
  },
  'ID.AM-6.1': {
    description:
      "Les rôles, les responsabilités et les pouvoirs en matière de sécurité de l'information et de cybersécurité au sein de l'organisation sont documentés, examinés, autorisés et mis à jour et alignés sur les rôles internes de l'organisation et les partenaires externes.",
  },
  'ID.AM-6.2': {
    description:
      "L'organisation doit nommer un responsable de la sécurité des informations.",
  },
  'ID.BE-1': {
    description:
      'Le rôle de l’organisation dans la chaîne d’approvisionnement est identifié et communiqué.',
  },
  'ID.BE-1.1': {
    description:
      "Le rôle de l'organisation dans la chaîne d'approvisionnement doit être identifié, documenté et communiqué.",
  },
  'ID.BE-1.2': {
    description:
      "L'organisation doit protéger son environnement TIC/OT des menaces pesant sur la chaîne d'approvisionnement en appliquant des mesures de sécurité dans le cadre d'une stratégie de sécurité globale documentée.",
  },
  'ID.BE-2': {
    description:
      'La place de l’organisation dans les infrastructures critiques et son secteur d’activité est identifiée et communiquée.',
  },
  'ID.BE-2.1': {
    description:
      "La place de l'organisation dans les infrastructures critiques et dans son secteur d'activité doit être identifiée et communiquée.",
  },
  'ID.BE-3': {
    description:
      'Les priorités de la mission, des objectifs et des activités de l’organisation sont établies et communiquées.',
  },
  'ID.BE-3.1': {
    description:
      "Les priorités pour les opérations, les objectifs et les activités de l'organisation doivent être établies et communiquées.",
  },
  'ID.BE-4': {
    description:
      'Les dépendances et les fonctions critiques pour la prestation des services critiques sont établies.',
  },
  'ID.BE-4.1': {
    description:
      "Les dépendances et les fonctions essentielles à la fourniture de services critiques doivent être identifiées, documentées et classées par ordre de priorité en fonction de leur criticité dans le cadre du processus d'évaluation des risques.",
  },
  'ID.BE-5': {
    description:
      'Les exigences en matière de résilience pour soutenir la prestation de services essentiels sont établies pour tous les états de fonctionnement (par exemple, en cas de contrainte/attaque, pendant le rétablissement, les opérations normales).',
  },
  'ID.BE-5.1': {
    description:
      'Pour soutenir la cyber-résilience et sécuriser la prestation de services essentiels, les exigences nécessaires sont identifiées, documentées et leur mise en œuvre testée et approuvée.',
  },
  'ID.BE-5.2': {
    description:
      "Les installations de traitement de l'information et de soutien doivent mettre en œuvre la redondance pour répondre aux exigences de disponibilité, telles que définies par l'organisation et/ou les cadres réglementaires.",
  },
  'ID.BE-5.3': {
    description:
      'Des objectifs de temps et de points de rétablissement pour le rétablissement des processus essentiels des systèmes TIC/OT sont définis.',
  },
  'ID.GV-1': {
    description:
      'La politique de cybersécurité de l’organisation est établie et communiquée.',
  },
  'ID.GV-1.1': {
    description:
      "Les politiques et procédures en matière de sécurité de l'information et de cybersécurité doivent être créées, documentées, examinées, approuvées et mises à jour lorsque des changements interviennent.",
  },
  'ID.GV-1.2': {
    description:
      "Une politique de sécurité des informations et de cybersécurité à l'échelle de l'organisation doit être établie, documentée, mise à jour en cas de changement, diffusée et approuvée par la direction générale.",
  },
  'ID.GV-3': {
    description:
      'Les exigences légales et réglementaires concernant la cybersécurité, y compris les obligations en matière de vie privée et de libertés civiles, sont comprises et gérées.',
  },
  'ID.GV-3.1': {
    description:
      "Les exigences légales et réglementaires en matière de sécurité de l'information/cybersécurité, y compris les obligations en matière de respect de la vie privée, doivent être comprises, mises en œuvre et gérées.",
  },
  'ID.GV-3.2': {
    description:
      "Les exigences légales et réglementaires en matière de sécurité de l'information/cybersécurité, y compris les obligations en matière de respect de la vie privée, doivent être gérées.",
  },
  'ID.GV-4': {
    description:
      'Les processus de gouvernance et de gestion des risques traitent les risques de cybersécurité.',
  },
  'ID.GV-4.1': {
    description:
      "Dans le cadre de la gestion globale des risques de l'organisation, une stratégie complète de gestion des risques liés à la sécurité de l'information et à la cybersécurité doit être élaborée et mise à jour lorsque des changements surviennent.",
  },
  'ID.GV-4.2': {
    description:
      "Les risques liés à la sécurité de l'information et à la cybersécurité doivent être documentés, approuvés formellement et mis à jour lorsque des changements surviennent.",
  },
  'ID.RA-1': {
    description:
      'Les vulnérabilités des actifs sont identifiées et documentées.',
  },
  'ID.RA-1.1': {
    description: 'Les menaces et les vulnérabilités doivent être identifiées.',
  },
  'ID.RA-1.2': {
    description:
      "Un processus doit être établi pour surveiller, identifier et documenter en permanence les vulnérabilités des systèmes critiques de l'organisation.",
  },
  'ID.RA-1.3': {
    description:
      "Pour s'assurer que les opérations de l'organisation ne sont pas affectées par le processus de test, les tests de performance/charge et les tests de pénétration sur les systèmes de l'organisation doivent être menés avec soin.",
  },
  'ID.RA-2': {
    description:
      'Les renseignements sur les cybermenaces sont reçus de forums de partage d’informations et de sources.',
  },
  'ID.RA-2.1': {
    description:
      "Un programme de sensibilisation aux menaces et aux vulnérabilités, comprenant une capacité de partage d'informations entre les organisations, doit être mis en œuvre.",
  },
  'ID.RA-2.2': {
    description:
      "Il se doit d'identifier les endroits où des mécanismes automatisés peuvent être mis en œuvre pour mettre les informations relatives aux alertes et aux avis de sécurité à la disposition des parties prenantes pertinentes de l'organisation.",
  },
  'ID.RA-5': {
    description:
      'Les menaces, les vulnérabilités, les probabilités et les impacts sont utilisés pour déterminer les risques.',
  },
  'ID.RA-5.1': {
    description:
      "L'organisation doit effectuer des évaluations des risques dans lesquelles le risque est déterminé par les menaces, les vulnérabilités et l'impact sur les processus et les actifs de l'organisation.",
  },
  'ID.RA-5.2': {
    description:
      "L'organisation doit effectuer et documenter des évaluations des risques dans lesquelles le risque est déterminé par les menaces, les vulnérabilités, l'impact sur les processus et les actifs de l'organisation, et la probabilité qu'ils se produisent.",
  },
  'ID.RA-5.3': {
    description:
      "Les résultats de l'évaluation des risques sont diffusés aux parties prenantes concernées.",
  },
  'ID.RA-6': {
    description:
      'Les réponses aux risques sont identifiées et classées par ordre de priorité.',
  },
  'ID.RA-6.1': {
    description:
      "Une stratégie globale doit être élaborée et mise en œuvre pour gérer les risques auxquels sont exposés les systèmes critiques de l'organisation, qui comprend l'identification et la hiérarchisation des réponses aux risques.",
  },
  'ID.RM-1': {
    description:
      'Les processus de gestion des risques sont établis, gérés et acceptés par les parties prenantes de l’organisation.',
  },
  'ID.RM-1.1': {
    description:
      'Un processus de gestion des cyber-risques qui identifie les principales parties prenantes internes et externes et facilite le traitement des questions et des informations liées aux risques doit être créé, documenté, examiné, approuvé et mis à jour lorsque des changements surviennent.',
  },
  'ID.RM-2': {
    description:
      'La tolérance de l’organisation au risque est déterminée et clairement exprimée.',
  },
  'ID.RM-2.1': {
    description:
      "L'organisation doit déterminer clairement son appétit pour le risque.",
  },
  'ID.RM-3': {
    description:
      'La détermination de la tolérance au risque de l’organisation est éclairée par son rôle dans l’infrastructure critique et l’analyse des risques spécifiques au secteur.',
  },
  'ID.RM-3.1': {
    description:
      "Le rôle de l'organisation dans les infrastructures critiques et son secteur déterminent l'appétit de l'organisation pour le risque.",
  },
  'ID.SC-1': {
    description:
      'Les processus de gestion des risques liés à la chaîne d’approvisionnement sont identifiés, établis, évalués, gérés et acceptés par les parties prenantes de l’organisation.',
  },
  'ID.SC-1.1': {
    description:
      "L'organisation doit documenter, examiner, approuver, mettre à jour lorsque des changements surviennent et mettre en œuvre un processus de gestion des risques liés à la chaîne d'approvisionnement cybernétique qui soutient l'identification, l'évaluation et l'atténuation des risques associés à la nature distribuée et interconnectée des chaînes d'approvisionnement en produits et services TIC/OT.",
  },
  'ID.SC-2': {
    description:
      'Les fournisseurs et les partenaires tiers de systèmes d’information, de composants et de services sont identifiés, classés par ordre de priorité et évalués à l’aide d’un processus d’évaluation des risques de la cyberchaîne d’approvisionnement.',
  },
  'ID.SC-2.1': {
    description:
      "L'organisation doit effectuer des évaluations des risques liés à la chaîne d'approvisionnement cybernétique au moins une fois par an ou lorsqu'un changement intervient dans les systèmes critiques, l'environnement opérationnel ou la chaîne d'approvisionnement de l'organisation ; ces évaluations doivent être documentées et les résultats diffusés aux parties prenantes concernées, y compris les responsables des systèmes TIC/OT.",
  },
  'ID.SC-2.2': {
    description:
      "Une liste documentée de tous les fournisseurs, vendeurs et partenaires de l'organisation susceptibles d'être impliqués dans un incident majeur doit être établie, tenue à jour et mise à disposition en ligne et hors ligne.",
  },
  'ID.SC-3': {
    description:
      'Les contrats avec les fournisseurs et les partenaires tiers sont utilisés pour mettre en œuvre des mesures appropriées conçues pour atteindre les objectifs du programme de cybersécurité et du plan de gestion des risques de la chaîne d’approvisionnement de l’organisation.',
  },
  'ID.SC-3.1': {
    description:
      "Sur la base des résultats de l'évaluation des risques liés à la cyberchaîne d'approvisionnement, un cadre contractuel est établi pour les fournisseurs et les partenaires externes afin de traiter le partage d'informations sensibles et de produits et services TIC/OT distribués et interconnectés.",
  },
  'ID.SC-3.2': {
    description:
      'Des exigences contractuelles en matière de "sécurité de l\'information et de cybersécurité" pour les fournisseurs et les partenaires tiers sont mises en œuvre pour garantir un processus vérifiable de correction des failles et pour garantir la correction des failles identifiées lors des tests et des évaluations de "sécurité de l\'information et de cybersécurité".',
  },
  'ID.SC-3.3': {
    description:
      'L\'organisation doit établir des exigences contractuelles lui permettant d\'examiner les programmes de "sécurité des informations et de cybersécurité" mis en œuvre par les fournisseurs et les partenaires tiers.',
  },
  'ID.SC-4': {
    description:
      'Les fournisseurs et les partenaires tiers sont régulièrement évalués à l’aide d’audits, de résultats de tests ou d’autres formes d’évaluation pour confirmer qu’ils respectent leurs obligations contractuelles.',
  },
  'ID.SC-4.1': {
    description:
      "L'organisation doit examiner les évaluations de la conformité des fournisseurs et des partenaires tiers aux obligations contractuelles en examinant régulièrement les audits, les résultats des tests et autres évaluations.",
  },
  'ID.SC-4.2': {
    description:
      "L'organisation doit examiner les évaluations de la conformité des fournisseurs et des partenaires tiers aux obligations contractuelles en examinant régulièrement les audits indépendants de tiers, les résultats des tests et autres évaluations.",
  },
  'ID.SC-5': {
    description:
      'La planification et les tests de réponse et de rétablissement sont effectués avec les fournisseurs et les prestataires tiers.',
  },
  'ID.SC-5.1': {
    description:
      "L'organisation doit identifier et documenter le personnel clé des fournisseurs et des partenaires tiers afin de les inclure en tant que parties prenantes dans les activités de planification de la réponse et du rétablissement.",
  },
  'ID.SC-5.2': {
    description:
      "L'organisation doit identifier et documenter le personnel clé des fournisseurs et des partenaires tiers afin de les inclure en tant que parties prenantes dans les tests et l'exécution des plans de réponse et de rétablissement.",
  },
  'PR.AC-1': {
    description:
      'Les identités et les identifiants sont émis, gérés, vérifiés, révoqués et audités pour les dispositifs, utilisateurs et processus autorisés.',
  },
  'PR.AC-1.1': {
    description:
      'Les identités et les identifiants des dispositifs et des utilisateurs autorisés doivent être gérés.',
  },
  'PR.AC-1.2': {
    description:
      'Les identités et les identifiants des dispositifs et des utilisateurs autorisés sont gérés, si possible par des mécanismes automatisés.',
  },
  'PR.AC-1.3': {
    description:
      "Les identifiants du système doivent être désactivés après une période d'inactivité déterminée, à moins que cela ne compromette le fonctionnement sûr des processus (critiques).",
  },
  'PR.AC-1.4': {
    description:
      "Pour les transactions au sein des systèmes critiques de l'organisation, l'organisation doit mettre <br>en œuvre :<br>• l'authentification multifactorielle de l'utilisateur final (MFA ou \"authentification forte\") ;<br>• authentification basée sur des certificats pour les communications système à système.",
  },
  'PR.AC-1.5': {
    description:
      "Les systèmes critiques de l'organisation doivent être surveillés pour détecter toute utilisation atypique des informations d'identification du système. Les identifiants associés à un risque important doivent être désactivés.",
  },
  'PR.AC-2': {
    description: 'L’accès physique aux actifs est géré et protégé.',
  },
  'PR.AC-2.1': {
    description:
      "L'accès physique à l'installation, aux serveurs et aux composants du réseau doit être géré.",
  },
  'PR.AC-2.2': {
    description:
      "L'accès physique doit être géré, y compris les mesures relatives à l'accès dans les situations d'urgence.",
  },
  'PR.AC-2.3': {
    description:
      "L'accès physique aux zones critiques doit être contrôlé en plus de l'accès physique à l'installation.",
  },
  'PR.AC-2.4': {
    description:
      'Les actifs liés aux zones critiques doivent être protégés physiquement.',
  },
  'PR.AC-3': { description: 'L’accès à distance est géré.' },
  'PR.AC-3.1': {
    description:
      "Les points d'accès sans fil de l'organisation doivent être sécurisés.",
  },
  'PR.AC-3.2': {
    description:
      'Les réseaux de l’organisation auxquels on accède à distance doivent être sécurisés, notamment par une authentification multifactorielle (MFA).',
  },
  'PR.AC-3.3': {
    description:
      "Les restrictions d'utilisation, les exigences de connexion, les conseils de mise en œuvre et les autorisations d'accès à distance à l'environnement des systèmes critiques de l'organisation doivent être identifiés, documentés et mis en œuvre.",
  },
  'PR.AC-3.4': {
    description:
      "L'accès à distance aux systèmes critiques de l'organisation doit être surveillé et des mécanismes cryptographiques doivent être mis en œuvre lorsque cela est jugé nécessaire.",
  },
  'PR.AC-3.5': {
    description:
      'La sécurité des connexions avec les systèmes externes doit être vérifiée et encadrée par des accords documentés.',
  },
  'PR.AC-4': {
    description:
      'Les permissions et autorisations d’accès sont gérées en intégrant les principes du moindre privilège et de la séparation des tâches.',
  },
  'PR.AC-4.1': {
    description:
      "Les autorisations d'accès des utilisateurs aux systèmes de l'organisation doivent être définies et gérées.",
  },
  'PR.AC-4.2': {
    description:
      "L'organisation doit identifier qui devrait avoir accès aux informations et aux technologies critiques de l'organisation et les moyens d'y accéder.",
  },
  'PR.AC-4.3': {
    description:
      "L'accès des employés aux données et aux informations doit être limité aux systèmes et aux informations spécifiques dont ils ont besoin pour faire leur travail (principe du moindre privilège).",
  },
  'PR.AC-4.4': {
    description:
      "Personne ne doit avoir de privilèges d'administrateur pour les tâches quotidiennes.",
  },
  'PR.AC-4.5': {
    description:
      "Dans la mesure du possible, des mécanismes automatisés doivent être mis en œuvre pour prendre en charge la gestion des comptes d'utilisateurs sur les systèmes critiques de l'organisation, y compris la désactivation, la surveillance, l'établissement de rapports et la suppression des comptes d'utilisateurs.",
  },
  'PR.AC-4.6': {
    description:
      "La séparation des tâches est assurée dans la gestion des droits d'accès.",
  },
  'PR.AC-4.7': {
    description:
      'Les utilisateurs privilégiés doivent être gérés et surveillés.',
  },
  'PR.AC-4.8': {
    description:
      "Les restrictions d'utilisation des comptes pour des périodes et des lieux spécifiques doivent être prises en compte dans la politique d'accès sécurisé de l'organisation et appliquées en conséquence.",
  },
  'PR.AC-4.9': {
    description:
      'Les utilisateurs privilégiés doivent être gérés, surveillés et audités.',
  },
  'PR.AC-5': {
    description:
      'L’intégrité du réseau (séparation du réseau, segmentation du réseau...).',
  },
  'PR.AC-5.1': {
    description:
      "Des pare-feu doivent être installés et activés sur tous les réseaux de l'organisation.",
  },
  'PR.AC-5.2': {
    description:
      'Le cas échéant, l’intégrité du réseau des systèmes critiques de l’organisation doit être protégée par l’intégration de la segmentation et de la ségrégation du réseau.',
  },
  'PR.AC-5.3': {
    description:
      "Le cas échéant, l'intégrité du réseau des systèmes critiques de l'organisation doit être protégée par :<br> (1) Identifier, documenter et contrôler les connexions entre les composants du système ;<br> (2) Limiter les connexions externes aux systèmes critiques de l'organisation",
  },
  'PR.AC-5.4': {
    description:
      "L'organisation doit mettre en œuvre, dans la mesure du possible, des serveurs proxy authentifiés pour le trafic de communication défini entre les systèmes critiques de l'organisation et les réseaux externes.",
  },
  'PR.AC-5.5': {
    description:
      "L'organisation doit surveiller et contrôler les connexions et les communications à la frontière externe et aux principales frontières internes des systèmes critiques de l'organisation en mettant en œuvre des dispositifs de protection des frontières, le cas échéant.",
  },
  'PR.AC-5.6': {
    description:
      "L'organisation doit s'assurer que les systèmes critiques de l'organisation tombent en panne en toute sécurité lorsqu'un dispositif de protection des frontières tombe en panne opérationnelle.",
  },
  'PR.AC-6': {
    description:
      'Les identités sont prouvées et liées aux identifiants et présentées dans les interactions.',
  },
  'PR.AC-6.1': {
    description:
      "L'organisation doit mettre en œuvre des procédures documentées pour vérifier l'identité des personnes avant de délivrer des identifiants donnant accès aux systèmes de l'organisation.",
  },
  'PR.AC-6.2': {
    description:
      "L'organisation doit garantir l'utilisation d'identifiants uniques liés à chaque utilisateur, dispositif et processus vérifié interagissant avec les systèmes critiques de l'organisation ; s'assurer qu'ils sont authentifiés et que les identifiants uniques sont capturés lors des interactions avec le système.",
  },
  'PR.AC-7': {
    description:
      'Les identités sont prouvées et liées aux identifiants et présentées dans les interactions.',
  },
  'PR.AC-7.1': {
    description:
      "L'organisation doit effectuer une évaluation des risques documentée sur les transactions des systèmes critiques de l'organisation et authentifier les utilisateurs, les dispositifs et les autres actifs (par exemple, à un ou plusieurs facteurs) en fonction du risque de la transaction (par exemple, les risques pour la sécurité et la vie privée des individus et les autres risques pour l'organisation).",
  },
  'PR.AT-1': {
    description: 'Tous les utilisateurs sont informés et entrainés.',
  },
  'PR.AT-1.1': {
    description: 'Les employés doivent être formés de manière appropriée.',
  },
  'PR.AT-1.2': {
    description:
      "L'organisation doit intégrer la reconnaissance et le signalement des menaces internes dans la formation à la sécurité.",
  },
  'PR.AT-1.3': {
    description:
      "L'organisation doit mettre en œuvre une méthode d'évaluation pour mesurer l'efficacité des formations de sensibilisation.",
  },
  'PR.AT-2': {
    description:
      'Les utilisateurs privilégiés comprennent leurs rôles et leurs responsabilités.',
  },
  'PR.AT-2.1': {
    description:
      "Les utilisateurs privilégiés doivent être qualifiés avant que les privilèges ne leurs soient accordés, et ces utilisateurs doivent pouvoir démontrer qu'ils comprennent leurs rôles, leurs responsabilités et leurs pouvoirs.",
  },
  'PR.AT-3': {
    description:
      'Les parties prenantes tierces (par exemple, les fournisseurs, les clients, les partenaires) comprennent leurs rôles et responsabilités.',
  },
  'PR.AT-3.1': {
    description:
      "L'organisation doit établir et appliquer des exigences de sécurité pour les fournisseurs et les utilisateurs tiers essentiels à l'organisation.",
  },
  'PR.AT-3.2': {
    description:
      "Les fournisseurs tiers sont tenus de notifier tout transfert, licenciement ou transition de personnel ayant un accès physique ou logique aux composants des systèmes critiques de l'organisation.",
  },
  'PR.AT-3.3': {
    description:
      "L'organisation doit contrôler les fournisseurs de services et les utilisateurs critiques pour l'organisation en matière de conformité à la sécurité.",
  },
  'PR.AT-3.4': {
    description:
      "L'organisation doit auditer les fournisseurs de services externes critiques pour l'organisation afin de vérifier leur conformité en matière de sécurité.",
  },
  'PR.AT-4': {
    description:
      'Les cadres supérieurs comprennent leurs rôles et responsabilités.',
  },
  'PR.AT-4.1': {
    description:
      "Les cadres supérieurs doivent démontrer qu'ils comprennent leurs rôles, leurs responsabilités et leurs pouvoirs.",
  },
  'PR.AT-5': {
    description:
      'Le personnel de la sécurité physique et de la cybersécurité comprend ses rôles et responsabilités.',
  },
  'PR.AT-5.1': {
    description:
      "L'organisation doit s'assurer que le personnel responsable de la protection physique et de la sécurité des systèmes et installations critiques de l'organisation est qualifié par une formation avant que des privilèges ne soient accordés, et qu'il comprend ses responsabilités.",
  },
  'PR.DS-1': { description: 'Les données au repos sont protégées.' },
  'PR.DS-1.1': {
    description:
      "L'organisme doit protéger ses informations critiques du système déterminées comme étant critiques/sensibles lorsqu'elles sont au repos.",
  },
  'PR.DS-2': { description: 'Les données en transit sont protégées.' },
  'PR.DS-2.1': {
    description:
      "L'organisation doit protéger les informations de ses systèmes jugées critiques lorsqu'elles sont en transit.",
  },
  'PR.DS-3': {
    description:
      'Les actifs sont gérés de manière formelle tout au long de leur retrait, de leur transfert et de leur mise à disposition.',
  },
  'PR.DS-3.1': {
    description:
      'Les actifs et les supports doivent être éliminés de manière sûre.',
  },
  'PR.DS-3.2': {
    description:
      "L'organisation doit faire respecter l'obligation de rendre compte de tous ses actifs essentiels à l'organisation tout au long du cycle de vie du système, y compris lors du retrait, du transfert et de leur mise à disposition.",
  },
  'PR.DS-3.3': {
    description:
      "L'organisation doit s'assurer que les actions d'élimination sont approuvées, suivies, documentées et vérifiées.",
  },
  'PR.DS-3.4': {
    description:
      "L'organisation doit veiller à ce que les mesures nécessaires soient prises pour faire face à la perte, à l'utilisation abusive, à la détérioration ou au vol des actifs.",
  },
  'PR.DS-4': {
    description:
      'Une capacité adéquate pour assurer la disponibilité est maintenue.',
  },
  'PR.DS-4.1': {
    description:
      "La planification des capacités doit garantir des ressources adéquates pour le traitement de l'information, la mise en réseau, les télécommunications et le stockage des données des systèmes critiques de l'organisation.",
  },
  'PR.DS-4.2': {
    description:
      "Les systèmes critiques de l'organisation doivent être protégés contre les attaques par déni de service ou, du moins, l'effet de ces attaques sera limité.",
  },
  'PR.DS-4.3': {
    description:
      "Les données d'audit des systèmes critiques de l'organisation doivent être déplacées vers un système alternatif.",
  },
  'PR.DS-5': {
    description:
      'Les protections contre les fuites de données sont mises en œuvre.',
  },
  'PR.DS-5.1': {
    description:
      "L'organisation doit prendre des mesures appropriées qui se traduisent par la surveillance de ses systèmes critiques aux frontières extérieures et aux points internes critiques lorsqu'un accès et des activités non autorisés, y compris une fuite de données, sont détectés.",
  },
  'PR.DS-6': {
    description:
      'Des mécanismes de vérification de l’intégrité sont utilisés pour vérifier l’intégrité des logiciels, des microprogrammes et des informations.',
  },
  'PR.DS-6.1': {
    description:
      "L'organisation doit mettre en œuvre des contrôles d'intégrité des logiciels, des microprogrammes et des informations pour détecter les modifications non autorisées apportées aux composants de ses systèmes critiques pendant le stockage, le transport, le démarrage et lorsque cela est jugé nécessaire.",
  },
  'PR.DS-6.2': {
    description:
      "L'organisation doit mettre en œuvre des outils automatisés, dans la mesure du possible, afin de fournir une notification lors de la découverte de divergences pendant la vérification de l'intégrité.",
  },
  'PR.DS-6.3': {
    description:
      "L'organisation doit mettre en œuvre une capacité de réponse automatique avec des garanties de sécurité prédéfinies lorsque des violations de l'intégrité sont découvertes.",
  },
  'PR.DS-7': {
    description:
      'L’environnement ou les environnements de développement et de test sont séparés de l’environnement de production.',
  },
  'PR.DS-7.1': {
    description:
      "Les environnements de développement et de test doivent être isolés de l'environnement de production.",
  },
  'PR.DS-8': {
    description:
      'Les mécanismes de contrôle d’intégrité sont utilisés pour vérifier l’intégrité du matériel.',
  },
  'PR.DS-8.1': {
    description:
      "L'organisation doit mettre en œuvre des contrôles d'intégrité du matériel pour détecter les altérations non autorisées du matériel de ses systèmes critiques.",
  },
  'PR.DS-8.2': {
    description:
      "L'organisation doit intégrer la détection de l'altération non autorisée du matériel de ses systèmes critiques dans sa capacité de réponse aux incidents.",
  },
  'PR.IP-1': {
    description:
      'Une configuration de base des systèmes de contrôle des technologies de l’information/de l’industrie est créée et maintenue en intégrant les principes de sécurité.',
  },
  'PR.IP-1.1': {
    description:
      "L'organisation doit développer, documenter et maintenir une configuration de base pour ses systèmes critiques.",
  },
  'PR.IP-1.2': {
    description:
      "L'organisation doit configurer ses systèmes critiques pour fournir uniquement les capacités essentielles. Par conséquent, la configuration de base doit être revue et les capacités inutiles doivent être désactivées.",
  },
  'PR.IP-11': {
    description:
      'La cybersécurité est incluse dans les pratiques de ressources humaines (déprovisionnement, sélection du personnel...).',
  },
  'PR.IP-11.1': {
    description:
      "Le personnel ayant accès aux informations ou aux technologies les plus critiques de l'organisation doit être vérifié.",
  },
  'PR.IP-11.2': {
    description:
      "Élaborer et maintenir un processus de sécurité de l'information/cyber des ressources humaines applicable lors du recrutement, pendant l'emploi et à la fin de l'emploi.",
  },
  'PR.IP-12': {
    description:
      'Un plan de gestion des vulnérabilités est élaboré et mis en œuvre.',
  },
  'PR.IP-12.1': {
    description:
      "L'organisation doit établir et maintenir un processus documenté qui permet un examen continu des vulnérabilités et des stratégies pour les atténuer.",
  },
  'PR.IP-2': {
    description:
      'Un cycle de vie du développement des systèmes pour gérer les systèmes est mis en œuvre.',
  },
  'PR.IP-2.1': {
    description:
      'Le cycle de vie du développement des systèmes et des applications doit inclure des considérations de sécurité.',
  },
  'PR.IP-2.2': {
    description:
      "Le processus de développement des systèmes critiques et de leurs composants doit couvrir l'ensemble du cycle de conception et fournir une description des propriétés fonctionnelles des contrôles de sécurité, ainsi que des informations sur la conception et la mise en œuvre des interfaces du système relatives à la sécurité.",
  },
  'PR.IP-3': {
    description:
      'Des processus de contrôle des changements de configuration sont en place.',
  },
  'PR.IP-3.1': {
    description:
      "Les modifications doivent être testées et validées avant d'être mises en œuvre dans les systèmes opérationnels.",
  },
  'PR.IP-3.2': {
    description:
      "Pour les modifications prévues des systèmes critiques de l'organisation, une analyse d'impact sur la sécurité doit être effectuée dans un environnement de test distinct avant la mise en œuvre dans un environnement opérationnel.",
  },
  'PR.IP-4': {
    description:
      'Des sauvegardes des informations sont effectuées, maintenues et testées.',
  },
  'PR.IP-4.1': {
    description:
      "Les sauvegardes des données critiques de l'organisation doivent être effectuées et stockées sur un système différent du dispositif sur lequel se trouvent les données originales.",
  },
  'PR.IP-4.2': {
    description:
      "La fiabilité et l'intégrité des sauvegardes doivent être vérifiées et testées régulièrement.",
  },
  'PR.IP-4.3': {
    description:
      "La vérification des sauvegardes doit être coordonnée avec les fonctions de l'organisation qui sont responsables des plans connexes.",
  },
  'PR.IP-4.4': {
    description:
      'Un site de stockage alternatif distinct pour les sauvegardes du système doit être exploité et les mêmes mesures de sécurité que le site de stockage principal doivent être utilisées.',
  },
  'PR.IP-4.5': {
    description:
      'La sauvegarde des systèmes critiques doit être séparée de la sauvegarde des informations critiques.',
  },
  'PR.IP-5': {
    description:
      'La politique et les règlements concernant l’environnement physique d’exploitation des actifs de l’organisation sont respectés.',
  },
  'PR.IP-5.1': {
    description:
      "L'organisation doit définir, mettre en œuvre et appliquer une politique et des procédures concernant les systèmes d'urgence et de sécurité, les systèmes de protection contre l'incendie et les contrôles de l'environnement pour ses systèmes critiques.",
  },
  'PR.IP-5.2': {
    description:
      "L'organisation doit mettre en place des dispositifs de détection d'incendie qui se déclenchent et avertissent automatiquement le personnel clé en cas d'incendie.",
  },
  'PR.IP-6': {
    description: 'Les données sont détruites conformément à la politique.',
  },
  'PR.IP-6.1': {
    description:
      "L'organisation doit s'assurer que les données de son système critique sont détruites conformément à la politique.",
  },
  'PR.IP-6.2': {
    description:
      "Les processus d'assainissement doivent être documentés et testés.",
  },
  'PR.IP-7': { description: 'Les processus de protection sont améliorés.' },
  'PR.IP-7.1': {
    description:
      "L'organisation doit intégrer les améliorations découlant de la surveillance, des mesures, des évaluations et des enseignements tirés dans les mises à jour du processus de protection (amélioration continue).",
  },
  'PR.IP-7.2': {
    description:
      "L'organisation doit mettre en place des équipes indépendantes pour évaluer le(s) processus de protection.",
  },
  'PR.IP-7.3': {
    description:
      "L'organisation doit s'assurer que le plan de sécurité de ses systèmes critiques facilite l'examen, le test et l'amélioration continue des processus de protection de la sécurité.",
  },
  'PR.IP-8': {
    description: 'L’efficacité des technologies de protection est partagée.',
  },
  'PR.IP-8.1': {
    description:
      "L'organisation doit collaborer et partager avec les partenaires désignés les informations relatives aux incidents de sécurité liés à son système critique et aux mesures d'atténuation.",
  },
  'PR.IP-8.2': {
    description:
      "La communication de l'efficacité des technologies de protection est partagée avec les parties appropriées.",
  },
  'PR.IP-8.3': {
    description:
      "L'organisation doit mettre en œuvre, dans la mesure du possible, des mécanismes automatisés pour faciliter la collaboration en matière d'information.",
  },
  'PR.IP-9': {
    description:
      'Des plans de réponse (réponse aux incidents et continuité des activités) et des plans de rétablissement (reprise après incident et reprise après sinistre) sont en place et gérés.',
  },
  'PR.IP-9.1': {
    description:
      "Des plans de réponse en cas d'incident (réponse aux incidents et continuité des activités) et des plans de rétablissement (rétablissement en cas d'incident et reprise après sinistre) doivent être établis, maintenus, approuvés et testés afin de déterminer l'efficacité des plans et l'état de préparation à l'exécution des plans.",
  },
  'PR.IP-9.2': {
    description:
      "L'organisation doit coordonner l'élaboration et le test des plans de réponse aux incidents et des plans de rétablissement avec les parties prenantes responsables des plans connexes.",
  },
  'PR.MA-1': {
    description:
      'L’entretien et la réparation des actifs de l’organisation sont effectués et consignés, avec des outils approuvés et contrôlés.',
  },
  'PR.MA-1.1': {
    description:
      "Les correctifs et les mises à jour de sécurité pour les systèmes d'exploitation et les composants critiques du système doivent être installés.",
  },
  'PR.MA-1.2': {
    description:
      "L'organisation doit planifier, réaliser et documenter la maintenance préventive et les réparations des composants critiques de son système selon des processus et des outils approuvés.",
  },
  'PR.MA-1.3': {
    description:
      "L'organisation doit appliquer les exigences d'approbation, de contrôle et de surveillance des outils de maintenance destinés à être utilisés sur ses systèmes critiques.",
  },
  'PR.MA-1.4': {
    description:
      "L'organisation doit vérifier les contrôles de sécurité après la maintenance ou la réparation du matériel et prendre les mesures qui s'imposent.",
  },
  'PR.MA-1.5': {
    description:
      "L'organisation doit empêcher le retrait non autorisé des équipements de maintenance contenant des informations critiques sur les systèmes de l'organisation.",
  },
  'PR.MA-1.6': {
    description:
      "Les outils de maintenance et les dispositifs de stockage portables doivent être inspectés lorsqu'ils sont introduits dans l'établissement et doivent être protégés par des solutions antimalware afin qu'ils soient analysés pour détecter les codes malveillants avant d'être utilisés sur les systèmes de l'organisation.",
  },
  'PR.MA-1.7': {
    description:
      "L'organisation doit vérifier les contrôles de sécurité à la suite de la maintenance ou de la réparation/du correctif du matériel et des logiciels et prendre les mesures qui s'imposent.",
  },
  'PR.MA-2': {
    description:
      'La maintenance à distance des actifs de l’organisation est approuvée, consignée et effectuée de manière à empêcher tout accès non autorisé.',
  },
  'PR.MA-2.1': {
    description:
      "La télémaintenance ne doit avoir lieu qu'après approbation préalable, surveillance pour éviter tout accès non autorisé, et approbation du résultat des activités de maintenance telles que décrites dans les processus ou procédures approuvés.",
  },
  'PR.MA-2.2': {
    description:
      "L'organisation doit exiger que les services de diagnostic relatifs à la télémaintenance soient effectués à partir d'un système qui met en œuvre une capacité de sécurité comparable à celle mise en œuvre sur le système critique de l'organisation équivalent.",
  },
  'PR.MA-2.3': {
    description:
      "L'organisation doit s'assurer de la mise en œuvre d'authentificateurs forts, de la prise d'enregistrements et de la fermeture de session pour la maintenance à distance.",
  },
  'PR.PT-1': {
    description:
      'Les enregistrements d’audit/logs sont déterminés, documentés, mis en œuvre et révisés conformément à la politique.',
  },
  'PR.PT-1.1': {
    description: 'Les logs doivent être maintenus, documentés et examinés.',
  },
  'PR.PT-1.2': {
    description:
      "L'organisation doit s'assurer que les enregistrements de log comprennent une source de temps faisant autorité ou un horodateur d'horloge interne qui sont comparés et synchronisés avec une source de temps faisant autorité.",
  },
  'PR.PT-1.3': {
    description:
      "L'organisation doit s'assurer que les échecs de traitement des audits sur les systèmes de l'organisation génèrent des alertes et déclenchent des réponses définies.",
  },
  'PR.PT-1.4': {
    description:
      "L'organisation doit permettre aux personnes autorisées d'étendre les capacités d'audit lorsque les événements l'exigent.",
  },
  'PR.PT-2': {
    description:
      'Les supports amovibles sont protégés et leur utilisation est limitée conformément à la politique.',
  },
  'PR.PT-2.1': {
    description:
      "La restriction de l'utilisation des dispositifs de stockage portables doit être assurée par une politique documentée appropriée et des mesures de protection complémentaires.",
  },
  'PR.PT-2.2': {
    description:
      "Il convient que l'organisation interdisse techniquement la connexion de supports amovibles, sauf si cela est strictement nécessaire ; dans les autres cas, il convient de désactiver l'exécution de programmes automatiques à partir de ces supports.",
  },
  'PR.PT-2.3': {
    description:
      'Les dispositifs de stockage portables contenant des données système doivent être contrôlés et protégés pendant leur transport et leur stockage.',
  },
  'PR.PT-3': {
    description:
      'Le principe de la moindre fonctionnalité est incorporé en configurant les systèmes de manière à ne fournir que les capacités essentielles.',
  },
  'PR.PT-3.1': {
    description:
      "L'organisation doit configurer les systèmes critiques pour l'organisation afin de ne fournir que les capacités essentielles.",
  },
  'PR.PT-3.2': {
    description:
      "L'organisation doit désactiver les fonctions, ports, protocoles et services définis au sein de ses systèmes critiques qu'il juge inutiles.",
  },
  'PR.PT-3.3': {
    description:
      "L'organisation doit mettre en œuvre des mesures de protection techniques pour appliquer une politique de refus de tout, d'autorisation par exception, afin de n'autoriser que l'exécution des programmes logiciels autorisés.",
  },
  'PR.PT-4': {
    description: 'Les réseaux de communication et de contrôle sont protégés.',
  },
  'PR.PT-4.1': {
    description:
      'Des filtres web et e-mail doivent être installés et utilisés.',
  },
  'PR.PT-4.2': {
    description:
      "L'organisation doit maîtriser les flux d'informations/de données au sein de ses systèmes critiques et entre les systèmes interconnectés.",
  },
  'PR.PT-4.3': {
    description:
      "L'organisation doit gérer l'interface pour les services de communication externe en établissant une politique de flux de trafic, protégeant la confidentialité et l'intégrité des informations transmises ; cela inclut l'examen et la documentation de chaque exception à la politique de flux de trafic.",
  },
  'RC.CO-1': { description: 'Les relations publiques sont gérées.' },
  'RC.CO-1.1': {
    description:
      "L'organisation doit centraliser et coordonner la manière dont les informations sont diffusées et gérer la manière dont l'organisation est présentée au public.",
  },
  'RC.CO-1.2': {
    description: 'Un responsable des relations publiques est désigné.',
  },
  'RC.CO-2': { description: 'La réputation est réparée après un incident.' },
  'RC.CO-2.1': {
    description:
      "L'organisation doit mettre en œuvre une stratégie de réponse aux crises afin de protéger l'organisation des conséquences négatives d'une crise et de contribuer à restaurer sa réputation.",
  },
  'RC.CO-3': {
    description:
      'Les activités de rétablissement sont communiquées aux parties prenantes internes et externes, ainsi qu’aux équipes de direction et de gestion.',
  },
  'RC.CO-3.1': {
    description:
      "L'organisation doit communiquer les activités de rétablissement aux parties prenantes prédéfinies, aux équipes de direction et de gestion.",
  },
  'RC.IM-1': {
    description: 'Les plans de rétablissement intègrent les leçons apprises.',
  },
  'RC.IM-1.1': {
    description:
      "L'organisation doit intégrer les enseignements tirés des activités de rétablissement des incidents dans les procédures de rétablissement du système, nouvelles ou mises à jour, et, après les avoir testées, les encadrer par une formation appropriée.",
  },
  'RC.RP-1': {
    description:
      'Le plan de reprise est exécuté pendant ou après un incident de cybersécurité.',
  },
  'RC.RP-1.1': {
    description:
      "Un processus de rétablissement en cas de catastrophes et d'incidents liés à l'information et à la cybersécurité est élaboré et exécuté selon les besoins.",
  },
  'RC.RP-1.2': {
    description:
      "Les fonctions et services de l'organisation essentielle doivent être poursuivis avec peu ou pas de perte de continuité opérationnelle et la continuité doit être maintenue jusqu'à la restauration complète du système.",
  },
  'RS.AN-1': {
    description: 'Les notifications des systèmes de détection sont examinées.',
  },
  'RS.AN-1.1': {
    description:
      "L'organisation doit enquêter sur les notifications relatives à l'information/la cybersécurité générées par les systèmes de détection.",
  },
  'RS.AN-1.2': {
    description:
      "L'organisation doit mettre en œuvre des mécanismes automatisés pour faciliter l'enquête et l'analyse des notifications liées à l'information/la cybersécurité.",
  },
  'RS.AN-2': { description: 'L’impact de l’incident est compris.' },
  'RS.AN-2.1': {
    description:
      "Une enquête approfondie et l'analyse des résultats doivent permettre de comprendre toutes les implications de l'incident de sécurité de l'information/cybersécurité.",
  },
  'RS.AN-2.2': {
    description:
      "L'organisation doit mettre en œuvre des mécanismes automatisés pour soutenir l'analyse de l'impact des incidents.",
  },
  'RS.AN-3': { description: 'L’analyse forensique est réalisée.' },
  'RS.AN-3.1': {
    description:
      "L'organisation doit fournir un examen, une analyse et un rapport d'audit à la demande pour les enquêtes après coup sur les incidents liés à l'information et à la cybersécurité.",
  },
  'RS.AN-3.2': {
    description:
      "L'organisation doit effectuer une analyse forensique des informations collectées/des informations sur les événements de cybersécurité afin de déterminer la cause d'origine.",
  },
  'RS.AN-4': {
    description:
      "L'organisation doit effectuer une analyse forensique des informations collectées/des informations sur les événements de cybersécurité afin de déterminer la cause d'origine.",
  },
  'RS.AN-4.1': {
    description:
      "Les incidents liés à l'information et à la cybersécurité sont classés en fonction de leur niveau de gravité et de leur impact, conformément aux critères d'évaluation inclus dans le plan de réponse aux incidents.",
  },
  'RS.AN-5': {
    description:
      'Des processus sont établis pour recevoir, analyser et répondre aux vulnérabilités divulguées à l’organisation par des sources internes et externes (par exemple, tests internes, bulletins de sécurité ou chercheurs en sécurité).',
  },
  'RS.AN-5.1': {
    description:
      "L'organisation doit mettre en œuvre des processus et des procédures de gestion des vulnérabilités qui comprennent le traitement, l'analyse et la correction des vulnérabilités provenant de sources internes et externes.",
  },
  'RS.AN-5.2': {
    description:
      "L'organisation doit mettre en place des mécanismes automatisés pour diffuser et suivre les efforts de remédiation pour les informations de vulnérabilités, capturées à partir de sources internes et externes, auprès des principales parties prenantes.",
  },
  'RS.CO-1': {
    description:
      'Le personnel connaît ses rôles et l’ordre des opérations lorsqu’une réponse est nécessaire.',
  },
  'RS.CO-1.1': {
    description:
      "L'organisation doit s'assurer que le personnel comprend ses rôles, ses objectifs, les priorités de restauration, les séquences de tâches (ordre des opérations) et les responsabilités d'affectation pour la réponse aux événements.",
  },
  'RS.CO-2': {
    description:
      'Les incidents sont signalés conformément aux critères établis.',
  },
  'RS.CO-2.1': {
    description:
      "L'organisation doit mettre en place un système de notification des incidents liés à la sécurité de l'information/cybersécurité sur ses systèmes critiques, dans un délai défini par l'organisation, à l'intention du personnel ou des rôles définis par l'organisation.",
  },
  'RS.CO-2.2': {
    description:
      'Les événements doivent être signalés conformément aux critères établis.',
  },
  'RS.CO-3': {
    description:
      'Les informations sont partagées conformément aux plans de réponse.',
  },
  'RS.CO-3.1': {
    description:
      "Les informations relatives aux incidents de cybersécurité doivent être communiquées et partagées avec les employés de l'organisation dans un format qu'ils peuvent comprendre.",
  },
  'RS.CO-3.2': {
    description:
      "L'organisation doit partager les informations relatives aux incidents de cybersécurité avec les parties prenantes concernées, comme prévu dans le plan de réponse aux incidents.",
  },
  'RS.CO-4': {
    description:
      'La coordination avec les parties prenantes se fait conformément aux plans de réponse.',
  },
  'RS.CO-4.1': {
    description:
      "L'organisation doit coordonner les actions de réponse aux incidents de sécurité de l'information/cybersécurité avec toutes les parties prenantes prédéfinies.",
  },
  'RS.CO-5': {
    description:
      'Le partage volontaire d’informations se fait avec des parties prenantes externes afin d’obtenir une meilleure connaissance de la situation en matière de cybersécurité.',
  },
  'RS.CO-5.1': {
    description:
      "L'organisation doit partager volontairement les informations sur les événements de cybersécurité, le cas échéant, avec les parties prenantes externes, les groupes de sécurité de l'industrie... afin de parvenir à une connaissance plus large de la situation en matière d'information et de cybersécurité.",
  },
  'RS.IM-1': {
    description: 'Les plans de réponse intègrent les leçons apprises.',
  },
  'RS.IM-1.1': {
    description:
      "L'organisation doit procéder à des évaluations post-incident afin d'analyser les enseignements tirés de la réponse à l'incident et du rétablissement, et par conséquent améliorer les processus/ procédures/technologies pour renforcer sa cyber-résilience.",
  },
  'RS.IM-1.2': {
    description:
      'Les enseignements tirés du traitement des incidents sont traduits en procédures de traitement des incidents actualisées ou nouvelles qui sont testées, approuvées et enseignées.',
  },
  'RS.IM-2': {
    description: 'Les plans de réponse intègrent les leçons apprises.',
  },
  'RS.IM-2.1': {
    description:
      "L'organisation doit mettre à jour les plans de réponse et de rétablissement pour tenir compte des changements survenus dans son contexte.",
  },
  'RS.MI-1': { description: 'Les incidents sont contenus.' },
  'RS.MI-1.1': {
    description:
      "L'organisation doit mettre en œuvre une capacité de traitement des incidents de sécurité de l'information/cybersécurité sur ses systèmes essentiels à l'activité, qui comprend la préparation, la détection et l'analyse, le confinement, l'éradication, le rétablissement et l'acceptation documentée des risques.",
  },
  'RS.RP-1': {
    description: 'Le plan de réponse est exécuté pendant ou après un incident.',
  },
  'RS.RP-1.1': {
    description:
      "Un processus de réponse aux incidents, comprenant les rôles, les responsabilités et les pouvoirs, doit être exécuté pendant ou après un événement lié à l'information ou à la cybersécurité sur les systèmes critiques de l'organisation.",
  },
} as const satisfies Record<string, DonneesReferentielsMesuresCyFun23>;

export type IdMesureCyFun23 = keyof typeof mesuresCyFun23;
