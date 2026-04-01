<script lang="ts">
  import Modale from '../../ui/Modale.svelte';
  import MatriceRisquesV2 from '../matrice/MatriceRisquesV2.svelte';
  import type { TousRisques } from '../risquesV2.d';
  import Infobulle from '../../ui/Infobulle.svelte';
  import LegendeMatrice from '../matrice/LegendeMatrice.svelte';
  import TableauRisquesMesuresAssociees from './TableauRisquesMesuresAssociees.svelte';
  import type { ReferentielStatut } from '../../ui/types';
  let elementModale: Modale | undefined;

  interface Props {
    risques: TousRisques;
    idService: string;
    statuts: ReferentielStatut;
  }

  let { risques, idService, statuts }: Props = $props();

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
          <div class="conteneur-titre">
            <h5>Risques usuels bruts</h5>
            <Infobulle
              contenu="Les risques bruts sont les risques évalués sans prendre en compte la mise en place des mesures de sécurité."
              enfantDirect
            />
          </div>
          <MatriceRisquesV2 risques={risques.risquesBruts} taille="sm" />
        </div>
        <div class="conteneur-matrice">
          <div class="conteneur-titre">
            <h5>Risques résiduels actuels</h5>
            <Infobulle
              contenu="Les risques résiduels actuels sont les risques évalués en prenant en compte les mesures de sécurité que vous avez déjà mises en place."
              enfantDirect
            />
          </div>
          <MatriceRisquesV2 risques={risques.risques} taille="sm" />
        </div>
        <div class="conteneur-matrice">
          <div class="conteneur-titre">
            <h5>Risques cibles</h5>
            <Infobulle
              contenu="Les risques cibles sont les risques évalués en considérant toutes les mesures mises en place."
              enfantDirect
            />
          </div>
          <MatriceRisquesV2 risques={risques.risquesCibles} taille="sm" />
        </div>
      </div>
      <LegendeMatrice />
      <TableauRisquesMesuresAssociees
        risques={risques.risques}
        {idService}
        {statuts}
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

  h4 {
    margin-top: 0;
    margin-bottom: 32px;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: bold;
  }

  .contenu-modale {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .conteneur-matrices {
    text-align: center;
    display: flex;
    gap: 155px;
    padding-left: 54px;
    padding-bottom: 24px;
    overflow-x: scroll;
  }

  .conteneur-matrice {
    max-width: 574px;

    .conteneur-titre {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-left: -44px;
      margin-bottom: 16px;

      h5 {
        font-weight: 500;
        font-size: 1rem;
        line-height: 1.5rem;
        color: #666666;
        margin: 0;
      }
    }
  }
</style>
