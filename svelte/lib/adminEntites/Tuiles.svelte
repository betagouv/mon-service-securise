<script lang="ts">
  import Tuile from '../ui/Tuile.svelte';
  import type { EntiteSupervisee } from './adminEntites.types';

  interface Props {
    mesEntites: Array<EntiteSupervisee>;
  }

  let { mesEntites }: Props = $props();

  let nombreEntites = $derived(mesEntites.length);
  let nombreServicesTotal = $derived(
    mesEntites.reduce((total, entite) => total + entite.nombreServices, 0)
  );
  let nombreAdmins = $derived(
    new Set(
      mesEntites.flatMap((e) => e.administrateurs.map((a) => a.prenomNom))
    ).size
  );
  let nombreSansAdmins = $derived(
    mesEntites.filter((e) => e.administrateurs.length === 0).length
  );
</script>

<div class="tuiles">
  <Tuile
    nomSvg="illustration_teacher"
    titre={nombreEntites.toString()}
    description="Entités dans votre périmètre"
  />
  <Tuile
    nomSvg="illustration_data_security"
    titre={nombreServicesTotal.toString()}
    description="Services enregistrés"
  />
  <Tuile
    nomSvg="illustration_avatar"
    titre={nombreAdmins.toString()}
    description="Admins"
  />
  <Tuile
    nomSvg="illustration_warning"
    titre={nombreSansAdmins.toString()}
    description="Entités sans admins"
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
