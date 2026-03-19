<script lang="ts">
  import MatriceRisquesV2 from './MatriceRisquesV2.svelte';
  import { onMount } from 'svelte';
  import type { Risque, TousRisques } from './risquesV2.d';
  import * as api from './risquesV2.api';
  import { metsAJourRisque } from './risquesV2.api';
  import Tableau from '../ui/Tableau.svelte';
  import Niveau from './Niveau.svelte';
  import Switch from '../ui/Switch.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirRisqueGeneralV2 from './TiroirRisqueGeneralV2.svelte';
  import CartoucheIdentifiantRisque from './CartoucheIdentifiantRisque.svelte';
  import CartouchesRisqueV2 from './CartouchesRisqueV2.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import type { ReferentielStatut } from '../ui/types';
  import ModaleCartographies from './ModaleCartographies.svelte';
  import LegendeMatrice from './LegendeMatrice.svelte';

  interface Props {
    idService: string;
    statuts: ReferentielStatut;
  }

  let { idService, statuts }: Props = $props();

  let risques: TousRisques = $state({
    risquesBruts: [],
    risques: [],
    risquesCibles: [],
  });

  onMount(async () => {
    risques = await api.recupereRisques(idService);
  });

  let opacite = $state(2);

  const metAJourOpacite = (e: CustomEvent<number>) => (opacite = e.detail);

  const metsAJourDesactivationRisque = async (
    risque: Risque,
    desactive: boolean
  ) => {
    await metsAJourRisque(idService, risque.id, {
      desactive,
      commentaire: risque.commentaire,
    });
    await rafraichisRisques();
  };

  const rafraichisRisques = async () => {
    risques = await api.recupereRisques(idService);
  };

  let modaleCartographies: ModaleCartographies | undefined;
</script>

<svelte:body on:risques-v2-modifies={rafraichisRisques} />

<div class="conteneur">
  <div class="entete">
    <h2>Cartographie des risques usuels</h2>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Voir les 3 cartographies"
      kind="tertiary"
      size="md"
      onclick={() => modaleCartographies?.affiche()}
    ></dsfr-button>
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
          hideOutputLabel={true}
        ></dsfr-range>
        <div class="conteneur-legende-slider">
          <span>Risques bruts</span>
          <span>Risques résiduels</span>
          <span>Risques cibles</span>
        </div>
      </div>
    </div>
    <LegendeMatrice />
  </div>
</div>

<Toaster />
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
        <div
          class="colonne-identifiant colonne"
          class:inactif={donnee.desactive}
        >
          <CartoucheIdentifiantRisque risque={donnee} />
        </div>
      {:else if colonne.cle === 'intitule'}
        {@const risqueBrut = risques.risquesBruts.find(
          (r) => r.id === donnee.id
        )}
        <div class="colonne-intitule colonne" class:inactif={donnee.desactive}>
          {#if risqueBrut}
            <button
              class="lien-intitule-risque"
              disabled={donnee.desactive}
              onclick={() => {
                tiroirStore.afficheContenu(TiroirRisqueGeneralV2, {
                  idService,
                  risque: donnee,
                  risqueBrut,
                  statuts,
                });
              }}
            >
              <span>{donnee.intitule}</span>
              <CartouchesRisqueV2 risque={donnee} />
            </button>
          {/if}
        </div>
      {:else if colonne.cle === 'gravite'}
        <div class="colonne-gravite colonne" class:inactif={donnee.desactive}>
          <Niveau niveau={donnee.gravite} />
        </div>
      {:else if colonne.cle === 'vraisemblance'}
        <div
          class="colonne-vraisemblance colonne"
          class:inactif={donnee.desactive}
        >
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
              await metsAJourDesactivationRisque(donnee, !actif)}
          />
        </div>
      {/if}
    {/snippet}
  </Tableau>
</div>

<ModaleCartographies bind:this={modaleCartographies} {risques} />

<style lang="scss">
  /* Annule la couleur `fond-pale` positionnée par le pug */
  :global(.zone-principale) {
    background: unset;
  }

  :global(tr:has(.colonne:not(.inactif) .lien-intitule-risque:hover)) {
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
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .conteneur-matrice {
      padding: 30px 16px;
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

    .colonne.inactif {
      opacity: 0.5;
    }

    .colonne-identifiant {
      width: 168px;
    }

    .colonne:not(.inactif) .lien-intitule-risque {
      cursor: pointer;

      &:hover span {
        color: var(--bleu-mise-en-avant);
      }
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

        span {
          font-weight: 500;
        }
      }
    }

    .colonne-actions {
      min-width: 132px;
    }
  }
</style>
