<script lang="ts">
  import Modale from '../ui/Modale.svelte';
  import MatriceRisquesV2 from './MatriceRisquesV2.svelte';
  import type { TousRisques } from './risquesV2.d';
  let elementModale: Modale | undefined;

  interface Props {
    risques: TousRisques;
  }

  let { risques }: Props = $props();

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-cartographies-risques-v2" bind:this={elementModale}>
  {#snippet contenu()}
    <h4>Cartographie des risques usuels</h4>
    <div class="contenu-modale">
      <div class="conteneur-matrices">
        <div class="conteneur-matrice">
          <MatriceRisquesV2 risques={risques.risquesBruts} taille="sm" />
        </div>
        <div class="conteneur-matrice">
          <MatriceRisquesV2 risques={risques.risques} taille="sm" />
        </div>
        <div class="conteneur-matrice">
          <MatriceRisquesV2 risques={risques.risquesCibles} taille="sm" />
        </div>
      </div>
    </div>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Fermer"
      kind="secondary"
      size="md"
      onclick={() => elementModale?.ferme()}
    ></dsfr-button>
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-cartographies-risques-v2) {
    max-width: 1400px;
    max-height: 800px;
    width: calc(100% - 48px);

    :global(.contenu-modale) {
      margin-top: 0;
    }
  }

  .conteneur-matrices {
    text-align: center;
    display: flex;
    gap: 155px;
    padding-left: 45px;
  }

  .conteneur-matrice {
    max-width: 574px;
  }
</style>
