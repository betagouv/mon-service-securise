<script lang="ts">
  import type { AdminSupervise } from '../adminEntites.types';

  interface Props {
    admin: AdminSupervise;
  }

  let { admin }: Props = $props();
</script>

<p class="entete">
  Souhaitez-vous vraiment retirer les droits d'admin de
  <strong>{admin.prenomNom}</strong> ?
</p>
