import type { NiveauDeSecurite } from './niveauxDeSecurite.d';

const donneesNiveauxDeSecurite: NiveauDeSecurite[] = [
  {
    id: 'niveau1',
    nom: 'Élémentaires',
    titreNiveau: 'élémentaire',
    resume:
      "Les besoins de sécurité sont élémentaires en l'absence de données ou de fonctionnalités sensibles.",
    description: {
      exemplesServicesNumeriques: [
        "Site vitrine d'un établissement public",
        "Site de la médiathèque d'une commune",
      ],
      demarcheIndicative: 'initiale',
      securisation: [
        'Mettez en œuvre <b>le socle de mesures de sécurité</b> proposé par MonServiceSécurisé afin de protéger contre les risques les plus courants, incluant la réalisation de tests de sécurité automatiques.',
      ],
      homologation: [
        "Constituez, grâce à MonServiceSécurisé, un <b>dossier d'homologation synthétique</b> indiquant a minima l'indice cyber et le plan d'action de renforcement de la sécurité.",
        "La décision d'homologation peut être prise dans le cadre d'un processus dématérialisé, sans nécessiter l'organisation d'une commission d'homologation en présentiel.",
      ],
    },
  },
  {
    id: 'niveau2',
    nom: 'Modérés',
    titreNiveau: 'modéré',
    resume:
      'Les besoins de sécurité sont modérés compte tenu de données ou de fonctionnalités plus sensibles traitées par le service.',
    description: {
      exemplesServicesNumeriques: [
        "Portail familles d'une collectivité traitant de données familiales et financières et concernant des personnes mineures.",
        'Service de stockage en ligne de documents.',
      ],
      demarcheIndicative: 'intermédiaire',
      evalutationBesoins:
        'Il est recommandé de réaliser une analyse de risques rapide, afin d\'identifier les principaux risques pour le service. Vous pouvez a minima vous appuyer sur l\'outil "risques" proposé dans MonServiceSécurisé.',
      securisation: [
        'Mettez en œuvre le socle de mesures de sécurité proposé par MonServiceSécurisé afin de protéger contre les risques les plus courants.',
        "Complétez avec des mesures de sécurité spécifiques adaptées aux risques identifiés dans l'analyse de risques.",
        "Complétez les tests de sécurité automatiques par la réalisation, par exemple, d'une campagne de recherche de bugs et/ou un test d'intrusion.",
      ],
      homologation: [
        "Constituez, grâce à MonServiceSécurisé, un dossier d'<b>homologation synthétique</b> et ajoutez toutes les pièces utiles (ex. analyse de risque rapide, résultats de tests, plan d'action / de traitement des risques).",
        "Il est recommandé de joindre au dossier l'avis d'un ou plusieurs spécialistes cyber (ex. RSSI, prestataires cyber) ayant vérifié la qualité du dossier d'homologation présenté ou de procéder à cette vérification à intervalle régulier sur la base d'un échantillon de services.",
        "Il est souhaitable que la décision d'homologation soit prise à la suite d'une <b>commission d'homologation en présentiel</b>, par l'autorité d'homologation ou par délégation, lors d'une commission d'homologation, pouvant être mutualisée avec d'autres services.",
      ],
    },
  },
  {
    id: 'niveau3',
    nom: 'Importants',
    titreNiveau: 'important',
    resume:
      'Les besoins de sécurité sont importants compte tenu de la sensibilité des données traitées ou des fonctionnalités proposées.',
    description: {
      exemplesServicesNumeriques: [
        "Service numérique d'ampleur régionale ou nationale traitant de données à caractère personnel ou d'autres sensibles.",
        'Service de signature électronique.',
      ],
      demarcheIndicative: 'renforcée',
      evalutationBesoins:
        "Il est nécessaire de réaliser une <b>analyse de risques approfondie</b> prenant appui sur la méthode Ebios Risk Manager afin d'affiner la compréhension des risques pour le service et identifier des mesures de sécurité spécifiques additionnelles adaptés aux risques identifiés.",
      securisation: [
        'Mettez en œuvre le <b>socle de mesures de sécurité</b> proposé par MonServiceSécurisé afin de protéger vos services contre les risques les plus courants.',
        "<b>Afin de vérifier l'état de la sécurité du service, réalisez un audit de sécurité approfondi, par exemple, par un prestataire qualifié par l'ANSSI (PASSI).</b>",
        "Complétez avec <b>des mesures de sécurité spécifiques</b> adaptées, identifiées dans le cadre l'analyse de risques et de l'audit de sécurité ou découlant de la politique de sécurité de votre organisation.",
      ],
      homologation: [
        "En vous appuyant sur la version synthétique proposée par MonServiceSécurisé, constituez un <b>dossier d'homologation complet</b> incluant toutes les pièces pertinentes notamment un dossier d'architecture détaillé, le rapport d'audit, les plans de maintien en conditions opérationnelles et de sécurité, le plan de résilience, etc.",
        "Joignez au dossier l'avis d'un ou plusieurs spécialistes cyber (ex. responsable des homologations, RSSI, prestataires externe) réunis au sein d'un \"comité d'homologation\", ayant vérifié le contenu du dossier d'homologation présenté, la pertinence des actions mises en œuvre et des actions futures proposées.",
        "La décision d'homologation doit être prise à l'occasion d'une <b>commission d'homologation dédiée</b> par l'autorité d'homologation ou par délégation.",
      ],
    },
  },
];

export default donneesNiveauxDeSecurite;
