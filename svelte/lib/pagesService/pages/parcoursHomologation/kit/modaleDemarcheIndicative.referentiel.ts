export const referentielBesoinsSecurite = {
  niveau1: {
    nomBesoin: 'basiques',
    resume:
      "Les besoins de sécurité sont basiques en l'absence de données ou de fonctionnalités sensibles.",
    demarcheIndicative: 'simplifiée',
    details: {
      dossier:
        'Il est succinct incluant l’historique du projet, la liste des mesures de sécurité mises en oeuvre et le plan d’action.',
      controle:
        'Le dossier est considéré recevable sur la base des seules déclarations de l’équipe (auto-déclaration sur l’application des mesures de sécurité). Pas de vérification de la mise en oeuvre effective des mesures de sécurité listées dans le dossier.',
      commission:
        'Réunion non nécessaire, le processus exclusivement dématérialisé possible (ex. mail, parapheur, signature électronique).',
      decision: 'Par l’autorité ou par délégation',
    },
  },
  niveau2: {
    nomBesoin: 'modérés',
    resume:
      'Les besoins de sécurité sont modérés compte tenu de données ou de fonctionnalités plus sensibles traitées par le service.',
    demarcheIndicative: 'intermédiaire',
    details: {
      dossier:
        'Il est succinct incluant l’historique du projet, la liste des mesures de sécurité mises en oeuvre, le plan d’action (plan de traitement des risques) et de toutes les informations nécessaires.',
      controle:
        'Contrôle des informations fournies dans le cadre de la préparation de l’homologation.',
      commission:
        'Réunion ou processus dématérialisé uniquement (ex. parapheur, signature électronique).',
      decision: 'Par l’autorité la plus élevée ou par délégation.',
    },
  },
  niveau3: {
    nomBesoin: 'avancés',
    resume:
      'Les besoins de sécurité sont avancés compte tenu de la sensibilité des données traitées ou des fonctionnalités proposées.',
    demarcheIndicative: 'renforcée',
    details: {
      dossier:
        'Il est complet incluant des PJ détaillées (dossier d’architecture, plans MCO/MCS, plan de résilience, audits, etc.).',
      controle:
        'Revue de l’ensemble des mesures de sécurité listées dans le dossier.',
      commission:
        'Réunion recommandée. La décision peut néanmoins toujours être adoptée de manière dématérialisée (ex. parapheur, signature électronique).',
      decision: 'Par l’autorité la plus élevée ou par délégation.',
    },
  },
};
