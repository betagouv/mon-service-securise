<script lang="ts">
  import type {
    BrouillonService,
    GroupeServices,
    ServiceAvecIndiceCyber,
  } from './tableauDeBord.d';
  import TableauDeServices from './TableauDeServices.svelte';
  import AccordeonGroupe from '../ui/AccordeonGroupe.svelte';
  import { untrack } from 'svelte';
  import { derived } from 'svelte/store';
  import { selectionIdsServices } from './stores/selectionService.store';
  import { singulierPluriel } from '../outils/string';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { services } from './stores/services.store';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import { resultatsDeRechercheDuStatutHomologationSelectionne } from './stores/affichageParStatutHomologation';

  interface Props {
    indicesCyberCharges?: boolean;
    servicesAAfficher: ServiceAvecIndiceCyber[];
    brouillonsAAfficher: BrouillonService[];
    ouvertParDefaut?: boolean;
    groupe?: GroupeServices;
  }
  let {
    indicesCyberCharges = false,
    servicesAAfficher,
    brouillonsAAfficher,
    ouvertParDefaut = false,
    groupe,
  }: Props = $props();

  let accordeon: AccordeonGroupe | undefined = $state();
  let estOuvert = $state(untrack(() => ouvertParDefaut));
  let avecMentionGroupeVide = $derived(
    groupe &&
      groupe.idServicesAssocies.filter((id) =>
        $services.some((s) => s.id === id)
      ).length === 0
  );

  export const focus = () => accordeon?.focus();

  export const ferme = () => accordeon?.ferme();

  resultatsDeRechercheDuStatutHomologationSelectionne.subscribe(() => {
    if ($rechercheTextuelle.length > 0) {
      estOuvert =
        servicesAAfficher.length > 0 || brouillonsAAfficher.length > 0;
    } else {
      estOuvert = groupe === undefined;
    }
  });

  let servicesSelectionnesDansAccordeon = derived(
    [selectionIdsServices],
    ([$s]) => {
      return $s.filter((id) => servicesAAfficher.map((s) => s.id).includes(id));
    }
  );

  const retireServicesDuGroupe = async () => {
    await axios.delete(`/api/groupes-services/${groupe?.id}/associations`, {
      data: { idsServices: $servicesSelectionnesDansAccordeon },
    });
    toasterStore.succes(
      singulierPluriel(
        'Service retiré',
        'Services retirés',
        $servicesSelectionnesDansAccordeon.length
      ),
      `${$servicesSelectionnesDansAccordeon.length} ${singulierPluriel('service a été retiré', 'services ont été retirés', $servicesSelectionnesDansAccordeon.length)} de « ${groupe?.libelle} ».`
    );
    selectionIdsServices.vide();
    document.body.dispatchEvent(new CustomEvent('rafraichis-groupes'));
  };

  let texteSelection = $derived(
    groupe &&
      servicesAAfficher.length > 0 &&
      $servicesSelectionnesDansAccordeon.length > 0
      ? `${$servicesSelectionnesDansAccordeon.length} ${singulierPluriel(
          'service sélectionné',
          'services sélectionnés',
          $servicesSelectionnesDansAccordeon.length
        )} dans ce groupe`
      : undefined
  );
</script>

<AccordeonGroupe
  bind:this={accordeon}
  bind:ouvert={estOuvert}
  libelle={groupe ? groupe.libelle : 'Sans groupe'}
  nombreElements={servicesAAfficher.length + brouillonsAAfficher.length}
  {texteSelection}
  onRetireSelection={retireServicesDuGroupe}
>
  <TableauDeServices
    {indicesCyberCharges}
    {servicesAAfficher}
    {brouillonsAAfficher}
    {avecMentionGroupeVide}
  />
</AccordeonGroupe>
