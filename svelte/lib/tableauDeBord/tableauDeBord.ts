import TableauDeBord from './TableauDeBord.svelte';
import type { TableauDeBordProps } from './tableauDeBord.d';

document.body.addEventListener(
  'svelte-recharge-tableau-de-bord',
  (e: CustomEvent<TableauDeBordProps>) => rechargeApp({ ...e.detail })
);

let app: TableauDeBord;
const rechargeApp = (props: TableauDeBordProps) => {
  app?.$destroy();
  app = new TableauDeBord({
    target: document.getElementById('tableau-de-bord')!,
    props,
  });
};

export const donneesVisiteGuidee = {
  resume: {
    nombreServices: 1,
    nombreServicesHomologues: 0,
  },
  indiceCyber: 4.3,
  services: [
    {
      id: 'ID-SERVICE-VISITE-GUIDEE',
      nomService: 'MonServiceSécurisé',
      organisationResponsable: 'ANSSI',
      contributeurs: [],
      statutHomologation: {
        id: 'activee',
        enCoursEdition: false,
        libelle: 'Active',
        ordre: 5,
      },
      nombreContributeurs: 3,
      estProprietaire: true,
      documentsPdfDisponibles: ['annexes', 'syntheseSecurite'],
      permissions: {
        gestionContributeurs: true,
      },
      aUneSuggestionAction: false,
    },
  ],
  indicesCyber: [{ id: 'ID-SERVICE-VISITE-GUIDEE', indiceCyber: 4.3 }],
};

export default app!;
