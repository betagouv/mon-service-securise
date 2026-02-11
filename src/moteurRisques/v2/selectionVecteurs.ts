import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';

type IdVecteurRisque = 'V1';

type AjouteOuRetire = 'Ajouter' | 'Retirer';

type Modificateurs = {
  niveauSecurite?: {
    niveau1?: AjouteOuRetire;
    niveau2?: AjouteOuRetire;
  };
  specificitesProjet?: { postesDeTravail?: AjouteOuRetire };
};

export type ConfigurationSelectionVecteurs = Record<
  IdVecteurRisque,
  {
    presentInitialement: boolean;
    modificateurs: Modificateurs;
  }
>;

export class SelectionVecteurs {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly configuration: ConfigurationSelectionVecteurs) {}

  selectionnePourService(service: DescriptionServiceV2) {
    const vecteur = this.configuration.V1;

    const choix = new Set<AjouteOuRetire>();

    if (vecteur.presentInitialement) choix.add('Ajouter');

    // eslint-disable-next-line no-restricted-syntax
    for (const proprieteDuService of Object.keys(
      vecteur.modificateurs
    ) as (keyof Modificateurs)[]) {
      const modificateur = vecteur.modificateurs[proprieteDuService];

      // eslint-disable-next-line no-continue
      if (!modificateur) continue;

      // eslint-disable-next-line no-restricted-syntax
      for (const valeur of Object.keys(
        modificateur
      ) as (keyof typeof modificateur)[]) {
        const ordre = modificateur[valeur];
        const serviceEstConcerne =
          (Array.isArray(service[proprieteDuService]) &&
            service[proprieteDuService].includes(valeur)) ||
          service[proprieteDuService] === valeur;

        if (ordre && serviceEstConcerne) {
          if (ordre === 'Ajouter') choix.add('Ajouter');
          if (ordre === 'Retirer') choix.add('Retirer');
        }
      }
    }

    if (choix.has('Retirer')) return [];
    if (choix.has('Ajouter')) return ['V1'];
    return [];
  }
}
