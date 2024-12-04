<script lang="ts">
  import ContenuTiroir from './ContenuTiroir.svelte';
  import GestionContributeurs from '../../gestionContributeurs/GestionContributeurs.svelte';
  import type { Service } from '../../gestionContributeurs/gestionContributeurs.d';
  import { store } from '../../gestionContributeurs/gestionContributeurs.store';

  export let services: Service[];

  store.reinitialise(services);
</script>

<ContenuTiroir>
  <div id="contenu-contributeurs">
    <GestionContributeurs modeVisiteGuidee={false} />
  </div>
</ContenuTiroir>
