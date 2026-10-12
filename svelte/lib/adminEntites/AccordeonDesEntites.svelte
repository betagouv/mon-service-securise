<script lang="ts">
  import { untrack } from 'svelte';
  import type { EntiteSupervisee } from './adminEntites.types';
  import type { GroupeEntites } from '../groupes/groupes.d';
  import TableauDesEntites from './TableauDesEntites.svelte';
  import AccordeonGroupe from '../ui/AccordeonGroupe.svelte';
  import { dissocieEntitesDuGroupe } from '../groupes/groupesEntites.api';
  import { singulierPluriel } from '../outils/string';
  import { toasterStore } from '../ui/stores/toaster.store';

  interface Props {
    entites: EntiteSupervisee[];
    groupe?: GroupeEntites;
    ouvertParDefaut?: boolean;
    selectionnable?: boolean;
    siretsSelectionnes?: string[];
    onSelectionChange?: (sirets: string[]) => void;
    onEntitesRetirees?: () => Promise<void>;
  }

  let {
    entites,
    groupe,
    ouvertParDefaut = false,
    selectionnable = false,
    siretsSelectionnes = [],
    onSelectionChange,
    onEntitesRetirees,
  }: Props = $props();

  let estOuvert = $state(untrack(() => ouvertParDefaut));
  let avecMentionGroupeVide = $derived(
    groupe !== undefined && groupe.siretsAssocies.length === 0
  );

  let siretsSelectionnesDansAccordeon = $derived(
    siretsSelectionnes.filter((siret) => entites.some((e) => e.siret === siret))
  );

  let texteSelection = $derived(
    groupe && siretsSelectionnesDansAccordeon.length > 0
      ? `${siretsSelectionnesDansAccordeon.length} ${singulierPluriel(
          'entité sélectionnée',
          'entités sélectionnées',
          siretsSelectionnesDansAccordeon.length
        )} dans ce groupe`
      : undefined
  );

  const retireEntitesDuGroupe = async () => {
    if (!groupe) return;

    const nombre = siretsSelectionnesDansAccordeon.length;
    await dissocieEntitesDuGroupe(groupe.id, siretsSelectionnesDansAccordeon);
    toasterStore.succes(
      singulierPluriel('Entité retirée', 'Entités retirées', nombre),
      `${nombre} ${singulierPluriel('entité a été retirée', 'entités ont été retirées', nombre)} de « ${groupe.libelle} ».`
    );
    await onEntitesRetirees?.();
  };
</script>

<AccordeonGroupe
  bind:ouvert={estOuvert}
  libelle={groupe ? groupe.libelle : 'Sans groupe'}
  nombreElements={entites.length}
  {texteSelection}
  onRetireSelection={retireEntitesDuGroupe}
>
  <TableauDesEntites
    {entites}
    {selectionnable}
    {siretsSelectionnes}
    {onSelectionChange}
    {avecMentionGroupeVide}
  />
</AccordeonGroupe>
