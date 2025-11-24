<script lang="ts">
  import type { IdNiveauDeSecurite } from '../../ui/types';
  import {
    metsAJourBrouillonService,
    niveauSecuriteMinimalRequis,
  } from '../creationV2.api';
  import { onMount } from 'svelte';
  import { leBrouillon } from './brouillon.store';
  import { questionsV2 } from '../../../../donneesReferentielMesuresV2';
  import NiveauDeSecuriteEditable from '../NiveauDeSecuriteEditable.svelte';

  export let estComplete: boolean;

  let niveauSelectionne: IdNiveauDeSecurite | '';
  let niveauDeSecuriteMinimal: IdNiveauDeSecurite;

  onMount(async () => {
    if ($leBrouillon.id) {
      niveauDeSecuriteMinimal = await niveauSecuriteMinimalRequis(
        $leBrouillon.id
      );
      const element: HTMLDetailsElement | null = document.querySelector(
        `#${niveauDeSecuriteMinimal}`
      );
      if (element) {
        element.open = true;
      }
      if (!$leBrouillon.niveauSecurite && niveauDeSecuriteMinimal) {
        $leBrouillon.niveauSecurite = niveauDeSecuriteMinimal;
        await metsAJourBrouillonService($leBrouillon.id, {
          niveauSecurite: niveauDeSecuriteMinimal,
        });
      }
      niveauSelectionne = $leBrouillon.niveauSecurite;
    }
  });

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
  on:champModifie={async (e) => {
    $leBrouillon.niveauSecurite = e.detail.niveauSecurite;
    await metsAJourBrouillonService($leBrouillon.id, e.detail);
  }}
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
