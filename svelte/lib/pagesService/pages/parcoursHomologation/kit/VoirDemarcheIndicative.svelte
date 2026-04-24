<script lang="ts">
  import type { IdEtapeParcoursHomologation } from '../parcoursHomologation.types';
  import ModaleDemarcheIndicative from './ModaleDemarcheIndicative.svelte';

  interface Props {
    etapeCourante: IdEtapeParcoursHomologation;
    niveauSecurite: 'niveau1' | 'niveau2' | 'niveau3';
  }

  let { etapeCourante, niveauSecurite }: Props = $props();

  const etapesConcernees: IdEtapeParcoursHomologation[] = [
    'autorite',
    'avis',
    'documents',
    'decision',
  ];

  let modale: { affiche: () => void } | undefined = $state();
</script>

{#if etapesConcernees.includes(etapeCourante)}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-link
    label="Voir la démarche d'homologation indicative"
    icon="question-line"
    icon-place="right"
    has-icon
    href="#"
    onclick={() => modale?.affiche()}
  >
  </dsfr-link>

  <ModaleDemarcheIndicative
    bind:this={modale}
    {niveauSecurite}
    onHomologuer={() => {}}
  />
{/if}

<style lang="scss">
  dsfr-link {
    display: inline-block;
    margin-top: 2rem;
  }
</style>
