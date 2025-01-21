<script lang="ts">
  import ContenuTiroir from './ContenuTiroir.svelte';
  import GestionContributeurs from '../../gestionContributeurs/GestionContributeurs.svelte';
  import type { Service } from '../../gestionContributeurs/gestionContributeurs.d';
  import { store } from '../../gestionContributeurs/gestionContributeurs.store';

  export let services: Service[];
  export const titre: string = 'Gérer les contributeurs';
  export const sousTitre: string =
    services.length > 1
      ? 'Gérer la liste des personnes invitées à contribuer aux services.'
      : 'Gérer la liste des personnes invitées à contribuer au service.';

  store.reinitialise(services);
</script>

<ContenuTiroir>
  <div id="contenu-contributeurs">
    <GestionContributeurs modeVisiteGuidee={false} />
  </div>
</ContenuTiroir>
