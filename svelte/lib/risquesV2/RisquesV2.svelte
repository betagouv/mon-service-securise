<script lang="ts">
  import MatriceRisquesV2 from './matrice/MatriceRisquesV2.svelte';
  import { onMount } from 'svelte';
  import type {
    DonneesRisqueSpecifiqueV2,
    Risque,
    RisquesV1,
    TousRisques,
  } from './risquesV2.d';
  import * as api from './risquesV2.api';
  import { metsAJourRisque } from './risquesV2.api';
  import Tableau from '../ui/Tableau.svelte';
  import Niveau from './kit/Niveau.svelte';
  import Switch from '../ui/Switch.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirRisqueGeneralV2 from './tiroir/TiroirRisqueGeneralV2.svelte';
  import CartoucheIdentifiantRisque from './kit/CartoucheIdentifiantRisque.svelte';
  import CartouchesRisqueV2 from './kit/CartouchesRisqueV2.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import type { ReferentielStatut } from '../ui/types';
  import ModaleCartographies from './modale/ModaleCartographies.svelte';
  import LegendeMatrice from './matrice/LegendeMatrice.svelte';
  import TiroirRisqueSpecifiqueV2 from './tiroir/TiroirRisqueSpecifiqueV2.svelte';
  import type {
    ReferentielGravites,
    ReferentielVraisemblances,
  } from '../risques/risques.d';
  import Bouton from '../ui/Bouton.svelte';
  import ModaleAnciensRisques from './modale/ModaleAnciensRisques.svelte';
  import TableauRisquesV2 from './TableauRisquesV2.svelte';

  interface Props {
    idService: string;
    risquesV1: RisquesV1;
    statuts: ReferentielStatut;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
  }

  let {
    idService,
    risquesV1,
    statuts,
    niveauxGravite,
    niveauxVraisemblance,
  }: Props = $props();

  let risques: TousRisques = $state({
    risquesBruts: [],
    risques: [],
    risquesCibles: [],
    risquesSpecifiques: [],
  });

  let aDesRisquesV1 = $derived(
    risquesV1.risquesGeneraux.length > 0 ||
      risquesV1.risquesSpecifiques.length > 0
  );

  onMount(async () => {
    risques = await api.recupereRisques(idService);
  });

  let opacite = $state(2);

  const metAJourOpacite = (e: CustomEvent<number>) => (opacite = e.detail);

  const rafraichisRisques = async () => {
    risques = await api.recupereRisques(idService);
  };

  let modaleCartographies: ModaleCartographies | undefined;

  let modaleAnciensRisques: ModaleAnciensRisques | undefined;
  const afficheModaleAnciensRisques = () => {
    modaleAnciensRisques?.affiche();
  };
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
  <div class="entete-conteneur-tableau">
    <div class="titres">
      <h2>Risques</h2>
      <div class="sous-titre">
        <span>
          Le tableau ci-dessous présente le détail des risques, accompagné de
          leur gravité et de leur vraisemblance résiduelle actuelles. Pour les
          risques ANSSI, la gravité et la vraisemblance sont non modifiables.
        </span>
        {#if aDesRisquesV1}
          <br />
          <span
            >Seuls les risques de la dernière version sont pris en compte ;
            l'ancienne version reste consultable en lecture seule.</span
          >
          <Bouton
            type="lien-dsfr"
            titre="En savoir plus"
            onclick={afficheModaleAnciensRisques}
          />
        {/if}
      </div>
    </div>
    <div class="actions">
      <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
      <dsfr-button
        label="Ajouter un risque"
        kind="primary"
        size="md"
        has-icon
        icon="add-line"
        icon-place="left"
        onclick={() =>
          tiroirStore.afficheContenu(TiroirRisqueSpecifiqueV2, {
            idService,
            niveauxGravite,
            niveauxVraisemblance,
          })}
      ></dsfr-button>
    </div>
  </div>

  <TableauRisquesV2
    {risques}
    {idService}
    {statuts}
    {niveauxGravite}
    {niveauxVraisemblance}
  />
</div>

<ModaleCartographies
  bind:this={modaleCartographies}
  {risques}
  {idService}
  {statuts}
/>

<ModaleAnciensRisques
  bind:this={modaleAnciensRisques}
  {risquesV1}
  {statuts}
  {niveauxGravite}
  {niveauxVraisemblance}
/>

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

    .entete-conteneur-tableau {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;

      dsfr-button {
        white-space: nowrap;
      }
    }

    h2 {
      margin: 0px;
      margin-bottom: 8px;
      font-size: 1.25rem;
      line-height: 1.75rem;
      color: black;
    }

    .sous-titre {
      margin-bottom: 24px;
    }
  }
</style>
