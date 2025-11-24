<script lang="ts">
  import type { IdNiveauDeSecurite } from '../../ui/types';
  import { onMount } from 'svelte';
  import { questionsV2 } from '../../../../donneesReferentielMesuresV2';
  import { leBrouillon } from '../../creationV2/etapes/brouillon.store';
  import NiveauDeSecuriteEditable from '../../creationV2/NiveauDeSecuriteEditable.svelte';
  import { type MiseAJour } from '../../creationV2/creationV2.api';
  import {
    metsAJourSimulation,
    niveauSecuriteMinimalRequis,
  } from '../simulationv2.api';

  export let estComplete: boolean;

  let niveauSelectionne: IdNiveauDeSecurite | '';
  let niveauDeSecuriteMinimal: IdNiveauDeSecurite;

  onMount(async () => {
    niveauDeSecuriteMinimal = await niveauSecuriteMinimalRequis(
      $leBrouillon.id!
    );
    const element: HTMLDetailsElement | null = document.querySelector(
      `#${niveauDeSecuriteMinimal}`
    );
    if (element) {
      element.open = true;
    }
    if (!$leBrouillon.niveauSecurite && niveauDeSecuriteMinimal) {
      $leBrouillon.niveauSecurite = niveauDeSecuriteMinimal;
      await metsAJourSimulation($leBrouillon.id!, {
        niveauSecurite: niveauDeSecuriteMinimal,
      });
    }
    niveauSelectionne = $leBrouillon.niveauSecurite;
  });

  const metsAJour = async (e: CustomEvent<MiseAJour>) => {
    $leBrouillon.niveauSecurite = e.detail.niveauSecurite;
    await metsAJourSimulation($leBrouillon.id!, e.detail);
  };

  const niveauEstConformeAuMinimumRequis = (
    niveau: IdNiveauDeSecurite,
    niveauDeSecuriteMinimal: IdNiveauDeSecurite
  ) =>
    questionsV2.niveauSecurite[niveau]?.position >=
    questionsV2.niveauSecurite[niveauDeSecuriteMinimal]?.position;

  $: estComplete =
    niveauSelectionne !== '' &&
    niveauEstConformeAuMinimumRequis(
      niveauSelectionne,
      niveauDeSecuriteMinimal
    );
</script>

<hr class="separateur-etapier" />

<NiveauDeSecuriteEditable
  bind:niveauSelectionne
  {niveauDeSecuriteMinimal}
  on:champModifie={metsAJour}
/>

<style>
  hr {
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
    margin: -24px 0 8px;
    width: 690px;
  }
</style>
