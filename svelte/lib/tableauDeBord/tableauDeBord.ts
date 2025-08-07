import TableauDeBord from './TableauDeBord.svelte';
import type {
  TableauDeBordProps,
  NiveauSecuriteService,
} from './tableauDeBord.d';
import RapportTeleversementServices from './televersementServices/RapportTeleversementServices.svelte';

document.body.addEventListener(
  'svelte-recharge-tableau-de-bord',
  (e: CustomEvent<TableauDeBordProps>) => rechargeTableauDeBord({ ...e.detail })
);

document.body.addEventListener(
  'svelte-recharge-rapport-televersement-services',
  (e: CustomEvent) => rechargeRapportTeleversement()
);

let tdb: TableauDeBord;
const rechargeTableauDeBord = (props: TableauDeBordProps) => {
  tdb?.$destroy();
  tdb = new TableauDeBord({
    target: document.getElementById('tableau-de-bord')!,
    props,
  });
};

let rapport: RapportTeleversementServices;
const rechargeRapportTeleversement = () => {
  rapport?.$destroy();
  rapport = new RapportTeleversementServices({
    target: document.getElementById('rapport-televersement')!,
  });
};

export const donneesVisiteGuidee = {
  resume: {
    nombreServices: 1,
    nombreServicesHomologues: 0,
    nombreHomologationsExpirees: 0,
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
      actionRecommandee: undefined,
      niveauSecurite: 'niveau1' as NiveauSecuriteService,
      pourcentageCompletude: 0.5,
    },
  ],
  indicesCyber: [{ id: 'ID-SERVICE-VISITE-GUIDEE', indiceCyber: '4.3' }],
};

export default tdb!;
