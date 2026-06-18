<script lang="ts">
  import { tiroirStore } from './stores/tiroir.store.js';
  import TiroirTeleversementServicesV2 from '../tableauDeBord/televersementServices/TiroirTeleversementServicesV2.svelte';
  import BoutonAvecListeDeroulante from './BoutonAvecListeDeroulante.svelte';
</script>

<BoutonAvecListeDeroulante
  titre="Ajouter votre premier service"
  options={[
    {
      label: 'Ajouter un service',
      icone: 'add-line',
      href: '/service/v2/creation',
    },
    {
      label: 'Téléverser des services',
      icone: 'upload-2-line',
      action: () =>
        tiroirStore.afficheContenu(TiroirTeleversementServicesV2, {}),
    },
  ]}
/>
