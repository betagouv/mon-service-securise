<script lang="ts">
  import Modale from '../../ui/Modale.svelte';
  import Onglets from '../../ui/Onglets.svelte';
  import MatriceRisquesV2 from '../matrice/MatriceRisquesV2.svelte';
  import { onMount } from 'svelte';
  import { recupereRisques } from '../risquesV2.api';
  import type { TousRisques } from '../risquesV2.d';
  import LegendeMatrice from '../matrice/LegendeMatrice.svelte';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  let elementModale: Modale | undefined;
  let ongletActif: 'bruts' | 'residuels' | 'cibles' = $state('bruts');

  let risques: TousRisques = $state({
    risques: [],
    risquesBruts: [],
    risquesCibles: [],
    risquesSpecifiques: [],
  });
  onMount(async () => {
    risques = await recupereRisques(idService);
  });

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-explication-risques-v2" bind:this={elementModale}>
  {#snippet contenu()}
    <h4>Votre cartographie de risques personnalisée est prête</h4>
    <div class="contenu-modale">
      <span
        ><b
          >Nous avons analysé vos informations et généré une première
          cartographie de risques. La gravité de chaque risque a été calculée à
          partir des éléments que vous avez décrits, tandis que la vraisemblance
          est, pour l’instant, fixée à son niveau maximum.</b
        ></span
      >
      <span
        >💡 Dans l’étape suivante, vous allez renseigner les mesures de sécurité
        appliquées à votre service. Ces mesures permettront de réduire la
        vraisemblance de certains risques et d’obtenir une cartographie des
        risques résiduels actuels. Vous pourrez également visualiser la
        cartographie des risques résiduels cible (si 100% des mesures sauf
        celles non prises en compte sont faites).</span
      >
      <div>
        <h5>Cartographies des risques</h5>
        <span
          >Vous pouvez consulter cette matrice ainsi que le détail des risques
          sur la page “Risques” dans la section Sécuriser.</span
        >
      </div>
      <div class="conteneur-onglets">
        <Onglets
          bind:ongletActif
          onglets={[
            {
              id: 'bruts',
              label: 'Risques bruts',
            },
            {
              id: 'residuels',
              label: 'Risques résiduels',
            },
            {
              id: 'cibles',
              label: 'Risques cibles',
            },
          ]}
        />
      </div>
      <div class="contenu-onglet">
        {#if ongletActif === 'bruts'}
          <div class="conteneur-matrice">
            <MatriceRisquesV2 risques={risques.risquesBruts} taille="sm" />
          </div>
          <LegendeMatrice />
        {:else if ongletActif === 'residuels'}
          <div class="conteneur-matrice">
            <MatriceRisquesV2 risques={risques.risques} taille="sm" />
          </div>
          <LegendeMatrice />
        {:else if ongletActif === 'cibles'}
          <div class="conteneur-matrice">
            <MatriceRisquesV2 risques={risques.risquesCibles} taille="sm" />
          </div>
          <LegendeMatrice />
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet actions()}
    <!--    &lt;!&ndash; svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions &ndash;&gt;-->
    <!--    <dsfr-button-->
    <!--      label="Fermer"-->
    <!--      kind="secondary"-->
    <!--      size="md"-->
    <!--      onclick={() => elementModale?.ferme()}-->
    <!--    ></dsfr-button>-->
    <!--    <Lien-->
    <!--      type="bouton-primaire"-->
    <!--      href="/service/{idService}/risques/export.csv"-->
    <!--      titre="Télécharger la liste de risques en CSV"-->
    <!--      target="_blank"-->
    <!--      icone="telecharger"-->
    <!--    />-->
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-explication-risques-v2) {
    max-width: 860px;
    max-height: 800px;
    width: calc(100% - 48px);

    :global(.contenu-modale) {
      margin-top: 0;
    }
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
    gap: 24px;
    margin-bottom: 24px;

    h5 {
      margin: 0 0 4px;
      font-weight: bold;
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    .conteneur-onglets {
      border-bottom: 1px solid #ddd;
      padding-left: 16px;
    }

    .contenu-onglet {
      padding: 32px;
      border: 1px solid #ddd;
      margin-top: -24px;
      border-top: none;

      .conteneur-matrice {
        padding-left: 32px;
      }
    }
  }
</style>
