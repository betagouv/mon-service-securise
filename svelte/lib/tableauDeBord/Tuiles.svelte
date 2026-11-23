<script lang="ts">
  import Tuile from '../ui/Tuile.svelte';
  import { singulierPluriel } from '../outils/string';
  import type { IndiceCyberMoyen } from './tableauDeBord.d';

  interface Props {
    nombreServices: number;
    nombreServicesHomologues: number;
    nombreHomologationsExpirees: number;
    indiceCyberMoyen: IndiceCyberMoyen | undefined;
  }

  let {
    nombreServices,
    nombreServicesHomologues,
    nombreHomologationsExpirees,
    indiceCyberMoyen,
  }: Props = $props();

  let valeurIndiceCyberMoyen = $derived(
    indiceCyberMoyen === undefined || indiceCyberMoyen === '-'
      ? '-'
      : new Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 2 }).format(
          indiceCyberMoyen
        )
  );
</script>

<div class="tuiles">
  <Tuile
    nomSvg="illustration_data_security"
    titre={nombreServices.toString()}
    description={singulierPluriel(
      'Service enregistré',
      'Services enregistrés',
      nombreServices
    )}
  />
  <Tuile
    nomSvg="illustration_contract"
    titre={nombreServicesHomologues.toString()}
    description={singulierPluriel(
      'Service homologué',
      'Services homologués',
      nombreServicesHomologues
    )}
  />
  <Tuile
    nomSvg="illustration_warning"
    titre={nombreHomologationsExpirees.toString()}
    description={singulierPluriel(
      'Homologation expirée',
      'Homologations expirées',
      nombreHomologationsExpirees
    )}
  />
  <Tuile
    nomSvg="illustration_data_visualization"
    titre={valeurIndiceCyberMoyen}
    description="Indice cyber moyen"
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
