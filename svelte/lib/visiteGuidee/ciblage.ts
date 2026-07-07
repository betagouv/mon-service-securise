import type { Attachment } from 'svelte/attachments';
import type { IdNiveauDeSecurite } from '../ui/types';

// Pour faire {@attach … }
export const cibleDeVisiteGuidee = (
  idDeCiblage: string
): Attachment<HTMLElement> => {
  return (node: HTMLElement) => {
    node.setAttribute('data-visite-guidee-id', idDeCiblage);
  };
};

class CibleVisiteGuidee {
  constructor(private readonly idCible: string) {}

  public query() {
    return `[data-visite-guidee-id="${this.idCible}"]`;
  }

  public el() {
    return this.enCible(this.query());
  }

  public id() {
    return this.idCible;
  }

  private enCible = (query: string) =>
    document.querySelector(query) as HTMLElement;
}

export const ciblage = () => ({
  decrireV2: () => ({
    nomService: () => new CibleVisiteGuidee('nom-service'),
    besoinsSecurite: (id: IdNiveauDeSecurite) =>
      new CibleVisiteGuidee(`besoins-securite-${id}`),
  }),
  securiser: () => ({
    premiereMesure: () => new CibleVisiteGuidee('titre-mesure'),
    onglets: () => new CibleVisiteGuidee('onglets-securiser'),
    gererContributeurs: () => new CibleVisiteGuidee('gerer-contributeurs'),
    indiceCyber: () => new CibleVisiteGuidee('incide-cyber'),
    planAction: () => new CibleVisiteGuidee('plan-action'),
    activite: () => new CibleVisiteGuidee('activite'),
  }),
  homologuer: () => ({
    creerHomologation: () => new CibleVisiteGuidee('creer-homologation'),
    voirTelechargement: () => new CibleVisiteGuidee('voir-telechargement'),
  }),
  piloter: () => ({
    nomService: () => new CibleVisiteGuidee('piloter-nom-service'),
    centreNotifications: () => new CibleVisiteGuidee('centre-notifications'),
    nouveauService: () => new CibleVisiteGuidee('nouveau-service'),
    premierService: () => ({
      el: () =>
        (document
          .querySelector('dsfr-table')
          ?.shadowRoot?.querySelector('tbody tr') as HTMLElement) ?? undefined,
    }),
  }),
  tiroir: () => new CibleVisiteGuidee('tiroir'),
});
