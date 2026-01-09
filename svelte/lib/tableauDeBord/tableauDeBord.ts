import TableauDeBord from './TableauDeBord.svelte';
import type {
  TableauDeBordProps,
  NiveauSecuriteService,
} from './tableauDeBord.d';
import RapportTeleversementServicesV2 from './televersementServices/RapportTeleversementServicesV2.svelte';

document.body.addEventListener(
  'svelte-recharge-tableau-de-bord',
  (e: CustomEvent<TableauDeBordProps>) => rechargeTableauDeBord({ ...e.detail })
);

document.body.addEventListener(
  'svelte-recharge-rapport-televersement-services-v2',
  () => rechargeRapportTeleversementV2()
);

let tdb: TableauDeBord;
const rechargeTableauDeBord = (props: TableauDeBordProps) => {
  tdb?.$destroy();
  tdb = new TableauDeBord({
    target: document.getElementById('tableau-de-bord')!,
    props,
  });
};

let rapportV2: RapportTeleversementServicesV2;
const rechargeRapportTeleversementV2 = () => {
  rapportV2?.$destroy();
  rapportV2 = new RapportTeleversementServicesV2({
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
