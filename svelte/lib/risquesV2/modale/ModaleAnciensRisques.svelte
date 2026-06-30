<script lang="ts">
  import Modale from '../../ui/Modale.svelte';
  import type { RisquesV1 } from '../risquesV2.d';
  import type {
    ReferentielGravites,
    ReferentielVraisemblances,
  } from '../../risques/risques.d';
  import Lien from '../../ui/Lien.svelte';
  import TableauAnciensRisques from '../TableauAnciensRisques.svelte';

  let elementModale: Modale | undefined;

  interface Props {
    idService: string;
    risquesV1: RisquesV1;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
  }

  let { idService, risquesV1, niveauxGravite, niveauxVraisemblance }: Props =
    $props();

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-anciens-risques" bind:this={elementModale}>
  {#snippet contenu()}
    <h4>Anciens risques</h4>
    <div class="contenu-modale">
      <p>
        Cette vue vous permet de consulter les risques issus de l’ancienne
        version. Ils sont accessibles en lecture seule et ne sont plus pris en
        compte dans le calcul de votre cartographie des risques.
        <br />
        Vous pouvez les télécharger au format CSV si nécessaire ou supprimer définitivement
        la liste.
      </p>
      <TableauAnciensRisques
        risques={risquesV1}
        {niveauxGravite}
        {niveauxVraisemblance}
      />
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
    <Lien
      type="bouton-primaire"
      href="/service/{idService}/risques/export.csv"
      titre="Télécharger la liste de risques en CSV"
      target="_blank"
      icone="telecharger"
    />
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-anciens-risques) {
    max-width: 1400px;
    max-height: 800px;
    width: calc(100% - 48px);
  }

  h4 {
    margin: 0 0 16px;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: bold;
  }

  .contenu-modale {
    display: flex;
    flex-direction: column;
    gap: 26px;
    margin-bottom: 24px;

    p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }
</style>
