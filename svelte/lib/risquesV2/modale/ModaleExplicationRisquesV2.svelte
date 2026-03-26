<script lang="ts">
  import Modale from '../../ui/Modale.svelte';
  import Onglets from '../../ui/Onglets.svelte';
  import MatriceRisquesV2 from '../matrice/MatriceRisquesV2.svelte';
  import { onMount } from 'svelte';
  import { recupereRisques } from '../risquesV2.api';
  import type { TousRisques } from '../risquesV2.d';
  import LegendeMatrice from '../matrice/LegendeMatrice.svelte';
  import Tableau from '../../ui/Tableau.svelte';
  import CartouchesRisqueV2 from '../kit/CartouchesRisqueV2.svelte';
  import CartoucheIdentifiantRisque from '../kit/CartoucheIdentifiantRisque.svelte';
  import { couleur } from '../kit/kit';

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

  let cocheAVu = $state(false);

  onMount(async () => {
    risques = await recupereRisques(idService);
  });

  let risquesBrutsDeGraviteHaute = $derived(
    risques.risquesBruts.filter(
      (risque) => couleur(risque.gravite, risque.vraisemblance) === 'rouge'
    )
  );

  const enregistreUtilisateurAVuExplications = (e: CustomEvent<boolean>) => {
    cocheAVu = e.detail;
  };

  const fermeModale = async () => {
    if (cocheAVu) {
      await axios.post('/api/explicationRisquesV2/termine');
    }
    elementModale?.ferme();
  };

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
      {#if risquesBrutsDeGraviteHaute.length > 0}
        <h5>Risques bruts de gravité haute</h5>
        <Tableau
          colonnes={[
            { cle: 'id', libelle: 'Identifiant' },
            { cle: 'intitule', libelle: 'Intitulé du risque' },
          ]}
          donnees={risquesBrutsDeGraviteHaute}
        >
          {#snippet cellule({ donnee, colonne })}
            {#if colonne.cle === 'id'}
              <div class="colonne-identifiant colonne">
                <CartoucheIdentifiantRisque risque={donnee} />
              </div>
            {:else if colonne.cle === 'intitule'}
              <div class="colonne-intitule colonne">
                <span>{donnee.intitule}</span>
                <CartouchesRisqueV2 risque={donnee} />
              </div>
            {/if}
          {/snippet}
        </Tableau>
      {/if}
    </div>
  {/snippet}
  {#snippet actions()}
    <div class="contenu-actions">
      <dsfr-checkbox
        label="Ne plus voir cette information"
        id="checkbox-vu"
        onvaluechanged={enregistreUtilisateurAVuExplications}
      >
      </dsfr-checkbox>

      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Commencer à sécuriser mon service 🚀"
        kind="primary"
        size="md"
        onclick={async () => await fermeModale()}
      ></dsfr-button>
    </div>
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
  .contenu-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
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
        text-align: center;
      }
    }
    .colonne-identifiant {
      width: 168px;
    }
    .colonne-intitule {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;

      span {
        font-weight: 500;
      }
    }
  }
</style>
