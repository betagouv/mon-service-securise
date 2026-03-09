import TableauDeBord from './TableauDeBord.svelte';
import type {
  TableauDeBordProps,
  NiveauSecuriteService,
} from './tableauDeBord.d';
import RapportTeleversementServicesV2 from './televersementServices/RapportTeleversementServicesV2.svelte';
import { mount, unmount } from 'svelte';

document.body.addEventListener(
  'svelte-recharge-tableau-de-bord',
  async (e: CustomEvent<TableauDeBordProps>) =>
    await rechargeTableauDeBord({ ...e.detail })
);

document.body.addEventListener(
  'svelte-recharge-rapport-televersement-services-v2',
  async () => await rechargeRapportTeleversementV2()
);

let tdb: TableauDeBord;
const rechargeTableauDeBord = async (props: TableauDeBordProps) => {
  if (tdb) await unmount(tdb);

  tdb = mount(TableauDeBord, {
    target: document.getElementById('tableau-de-bord')!,
    props,
  });
};

let rapportV2: RapportTeleversementServicesV2;
const rechargeRapportTeleversementV2 = async () => {
  if (rapportV2) await unmount(rapportV2);

  rapportV2 = mount(RapportTeleversementServicesV2, {
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
