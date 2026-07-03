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

export const ciblage = () => {
  const enCible = (query: string) =>
    document.querySelector(query) as HTMLElement;

  return {
    decrireV2: () => ({
      nomService: () => ({
        id: () => 'nom-service',
        query: () => `[data-visite-guidee-id="nom-service"]`,
        el: () => enCible(`[data-visite-guidee-id="nom-service"]`),
      }),
      besoinsSecurite: (id: IdNiveauDeSecurite) => ({
        id: () => `besoins-securite-${id}`,
        query: () => `[data-visite-guidee-id="besoins-securite-${id}`,
        el: () => enCible(`[data-visite-guidee-id="besoins-securite-${id}`),
      }),
    }),
    securiser: () => ({
      premiereMesure: () => ({
        id: () => 'titre-mesure',
        el: () => enCible('[data-visite-guidee-id="titre-mesure"]'),
      }),
      onglets: () => ({
        id: () => 'onglets-securiser',
        el: () => enCible('[data-visite-guidee-id="onglets-securiser"]'),
      }),
      gererContributeurs: () => ({
        id: () => 'gerer-contributeurs',
        el: () => enCible('[data-visite-guidee-id="gerer-contributeurs"]'),
      }),
    }),
    tiroir: () => ({
      id: () => 'tiroir',
      el: () => enCible('[data-visite-guidee-id="tiroir"]'),
    }),
    tiroirLegacy: () => ({
      el: () => enCible('[data-visite-guidee-id="tiroir-legacy"]'),
      fermetureEl: () =>
        enCible('[data-visite-guidee-id="tiroir-legacy-fermeture"]'),
    }),
  };
};
