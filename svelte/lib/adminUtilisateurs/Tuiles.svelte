<script lang="ts">
  import Tuile from '../ui/Tuile.svelte';
  import type { EntiteSupervisee } from '../adminEntites/adminEntites.types';

  interface Props {
    mesEntites: Array<EntiteSupervisee>;
    nombreUtilisateurs: number;
  }

  let { mesEntites, nombreUtilisateurs }: Props = $props();

  let nombreEntites = $derived(mesEntites.length);
  let nombreServicesTotal = $derived(
    mesEntites.reduce((total, entite) => total + entite.nombreServices, 0)
  );
</script>

<div class="tuiles">
  <Tuile
    nomSvg="illustration_human_cooperation"
    titre={nombreUtilisateurs.toString()}
    description="Utilisateurs"
  />
  <Tuile
    nomSvg="illustration_data_security"
    titre={nombreServicesTotal.toString()}
    description="Services enregistrés"
  />
  <Tuile
    nomSvg="illustration_teacher"
    titre={nombreEntites.toString()}
    description="Entités"
  />
</div>

<style lang="scss">
  .tuiles {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    margin-block: 24px;
  }
</style>
