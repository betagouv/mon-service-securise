<script lang="ts">
  import ContenuTiroir from './ContenuTiroir.svelte';
  import GestionContributeurs from '../../gestionContributeurs/GestionContributeurs.svelte';
  import type { Service } from '../../gestionContributeurs/gestionContributeurs.d';
  import { store } from '../../gestionContributeurs/gestionContributeurs.store';
  import { untrack } from 'svelte';
  import { donneesServiceVisiteGuidee } from '../../gestionContributeurs/modeVisiteGuidee/donneesVisiteGuidee';

  interface Props {
    services: Service[];
    modeVisiteGuidee?: boolean;
  }

  let { services, modeVisiteGuidee = false }: Props = $props();
  export const titre: string = 'Gérer les contributeurs';
  export const sousTitre: string = untrack(() =>
    services.length > 1
      ? 'Gérer la liste des personnes invitées à contribuer aux services.'
      : 'Gérer la liste des personnes invitées à contribuer au service.'
  );

  $effect(() => {
    if (modeVisiteGuidee) {
      store.reinitialise([donneesServiceVisiteGuidee]);
    } else {
      store.reinitialise(services);
    }
  });
</script>

<ContenuTiroir>
  <div id="contenu-contributeurs">
    <GestionContributeurs {modeVisiteGuidee} />
  </div>
</ContenuTiroir>
