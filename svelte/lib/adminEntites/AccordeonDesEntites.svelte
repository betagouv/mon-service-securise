<script lang="ts">
  import { untrack } from 'svelte';
  import type { EntiteSupervisee } from './adminEntites.types';
  import type { GroupeEntites } from '../groupes/groupes.d';
  import TableauDesEntites from './TableauDesEntites.svelte';
  import AccordeonGroupe from '../ui/AccordeonGroupe.svelte';

  interface Props {
    entites: EntiteSupervisee[];
    groupe?: GroupeEntites;
    ouvertParDefaut?: boolean;
  }

  let { entites, groupe, ouvertParDefaut = false }: Props = $props();

  let estOuvert = $state(untrack(() => ouvertParDefaut));
</script>

<AccordeonGroupe
  bind:ouvert={estOuvert}
  libelle={groupe ? groupe.libelle : 'Sans groupe'}
  nombreElements={entites.length}
>
  <TableauDesEntites {entites} />
</AccordeonGroupe>
