<script lang="ts">
  import MatriceRisquesV2 from './MatriceRisquesV2.svelte';
  import { onMount } from 'svelte';
  import type { TousRisques } from './risquesV2.d';
  import * as api from './risquesV2.api';
  import { metsAJourRisque } from './risquesV2.api';
  import Tableau from '../ui/Tableau.svelte';
  import { mappingNomCategories } from './kit';
  import Niveau from './Niveau.svelte';
  import Switch from '../ui/Switch.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirRisqueGeneralV2 from './TiroirRisqueGeneralV2.svelte';
  import CartoucheIdentifiantRisque from './CartoucheIdentifiantRisque.svelte';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  let risques: TousRisques = $state({
    risquesBruts: [],
    risques: [],
    risquesCibles: [],
  });

  onMount(async () => {
    risques = await api.recupereRisques(idService);
  });

  const legende = [
    { classe: 'vert', label: 'Faible : Acceptable en l’état' },
    { classe: 'orange', label: 'Moyen : Tolérable sous contrôle' },
    { classe: 'rouge', label: 'Élevé : Inacceptable' },
  ];

  let opacite = $state(2);

  const metAJourOpacite = (e: CustomEvent<number>) => (opacite = e.detail);

  const metsAJourDesactivationRisque = async (
    idRisque: string,
    desactive: boolean
  ) => {
    await metsAJourRisque(idService, idRisque, desactive);
    risques = await api.recupereRisques(idService);
  };
</script>

<div class="conteneur">
  <div class="entete">
    <h2>Cartographie des risques usuels</h2>
  </div>
  <div class="conteneur-matrice">
    <div class="relatif">
      <MatriceRisquesV2 risques={[]} />
      <div
        class="matrice"
        style="opacity: {Math.max(0, Math.min(1, 2 - opacite))}"
      >
        <MatriceRisquesV2 risques={risques.risquesBruts} transparent />
      </div>
      <div
        class="matrice"
        style="opacity: {Math.max(0, 1 - Math.abs(opacite - 2))}"
      >
        <MatriceRisquesV2 risques={risques.risques} transparent />
      </div>
      <div
        class="matrice"
        style="opacity: {Math.max(0, Math.min(1, opacite - 2))}"
      >
        <MatriceRisquesV2 risques={risques.risquesCibles} transparent />
      </div>
      <div class="conteneur-slider">
        <dsfr-range
          id="matrice-visible"
          size="md"
          min={1}
          max={3}
          value={2}
          step={0.5}
          is-step
          indicators={false}
          onvaluechanged={metAJourOpacite}
        ></dsfr-range>
        <div class="conteneur-legende-slider">
          <span>Risques bruts</span>
          <span>Risques résiduels</span>
          <span>Risques cibles</span>
        </div>
      </div>
    </div>
    <div class="conteneur-legende">
      {#each legende as { classe, label }, index (index)}
        <div class="entree-legende">
          <div class="carre-legende {classe}"></div>
          <span>{label}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<div class="conteneur-tableau">
  <h2>Risques</h2>
  <div class="sous-titre">
    <span>
      Le tableau ci-dessous présente le détail des risques, accompagné de leur
      gravité et de leur vraisemblance résiduelle actuelles. Pour les risques
      ANSSI, la gravité et la vraisemblance sont non modifiables.
    </span>
  </div>

  <Tableau
    colonnes={[
      { cle: 'id', libelle: 'Identifiant' },
      { cle: 'intitule', libelle: 'Intitulé du risque' },
      { cle: 'gravite', libelle: 'Gravité' },
      { cle: 'vraisemblance', libelle: 'Vraisemblance' },
      { cle: 'actions', libelle: 'Actions' },
    ]}
    donnees={risques.risques}
  >
    {#snippet cellule({ donnee, colonne })}
      {#if colonne.cle === 'id'}
        <div class="colonne-identifiant">
          <CartoucheIdentifiantRisque risque={donnee} />
        </div>
      {:else if colonne.cle === 'intitule'}
        <div class="colonne-intitule">
          <button
            class="lien-intitule-risque"
            onclick={() => {
              tiroirStore.afficheContenu(TiroirRisqueGeneralV2, {
                risque: donnee,
              });
            }}
          >
            <span>{donnee.intitule}</span>
            <div class="tags">
              <dsfr-tag label="ANSSI"></dsfr-tag>
              {#each donnee.categories as categorie (categorie)}
                <dsfr-tag label={mappingNomCategories[categorie]}></dsfr-tag>
              {/each}
            </div>
          </button>
        </div>
      {:else if colonne.cle === 'gravite'}
        <div class="colonne-gravite">
          <Niveau niveau={donnee.gravite} />
        </div>
      {:else if colonne.cle === 'vraisemblance'}
        <div class="colonne-vraisemblance">
          <Niveau niveau={donnee.vraisemblance} />
        </div>
      {:else if colonne.cle === 'actions'}
        <div class="colonne-actions">
          <Switch
            bind:actif={
              () => !donnee.desactive, (valeur) => (donnee.desactive = !valeur)
            }
            id="risque-{donnee.id}-actif"
            onChange={async (actif) =>
              await metsAJourDesactivationRisque(donnee.id, !actif)}
          />
        </div>
      {/if}
    {/snippet}
  </Tableau>
</div>

<style lang="scss">
  /* Annule la couleur `fond-pale` positionnée par le pug */
  :global(.zone-principale) {
    background: unset;
  }

  :global(tr:has(.lien-intitule-risque:hover)) {
    box-shadow: 0 12px 16px 0 rgba(0, 121, 208, 0.12);
  }

  .conteneur {
    box-shadow: 0 2px 6px 0 rgba(0, 0, 18, 0.16);
    display: flex;
    flex-direction: column;

    h2 {
      width: fit-content;
      margin: 0;
      color: #161616;
      font-size: 1.25rem;
      font-style: normal;
      font-weight: 700;
      line-height: 1.75rem;
    }

    .entete {
      padding: 1rem;
    }

    .conteneur-matrice {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;

      .relatif {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .matrice {
        position: absolute;
        top: 0;
        left: 0;
        transition: opacity 0.1s linear;
      }
    }

    .conteneur-slider {
      padding: 0 64px;

      .conteneur-legende-slider {
        display: flex;
        justify-content: space-between;

        span {
          color: #666;
          font-size: 0.75rem;
          font-style: normal;
          font-weight: 400;
          line-height: 1.25rem;
        }
      }
    }

    .conteneur-legende {
      display: flex;
      padding: 16px;
      gap: 24px;

      .entree-legende {
        display: flex;
        align-items: center;
        gap: 8px;

        .carre-legende {
          width: 13px;
          height: 13px;

          &.vert {
            background: #77b645;
          }

          &.orange {
            background: #fa7a35;
          }

          &.rouge {
            background: #e1000f;
          }
        }

        span {
          color: #3a3a3a;
          font-size: 0.875rem;
          font-weight: 400;
          line-height: 1.5rem;
        }
      }
    }
  }

  .conteneur-tableau {
    text-align: left;

    h2 {
      margin-top: 24px;
      margin-bottom: 8px;
      font-size: 1.25rem;
      line-height: 1.75rem;
      color: black;
    }

    .sous-titre {
      margin-bottom: 24px;
    }

    .colonne-identifiant {
      width: 168px;
    }

    .colonne-intitule {
      .lien-intitule-risque {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: none;
        outline: none;
        background: none;
        text-align: left;
        cursor: pointer;

        span {
          font-weight: 500;
        }

        &:hover span {
          color: var(--bleu-mise-en-avant);
        }
      }
    }

    .tags {
      display: flex;
      gap: 8px;
    }
  }
</style>
