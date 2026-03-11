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

  interface Props {
    estComplete: boolean;
  }

  let { estComplete = $bindable() }: Props = $props();

  let niveauSelectionne: IdNiveauDeSecurite | '' = $state('');
  let niveauDeSecuriteMinimal: IdNiveauDeSecurite | undefined = $state();

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
    } else {
      // Dans le cas de la visite guidée
      niveauSelectionne = 'niveau1';
      niveauDeSecuriteMinimal = 'niveau1';
    }
  });

  const niveauEstConformeAuMinimumRequis = (
    niveau: IdNiveauDeSecurite,
    niveauDeSecuriteMinimal: IdNiveauDeSecurite
  ) =>
    questionsV2.niveauSecurite[niveau]?.position >=
    questionsV2.niveauSecurite[niveauDeSecuriteMinimal]?.position;

  $effect(() => {
    estComplete =
      niveauSelectionne !== '' &&
      !!niveauDeSecuriteMinimal &&
      niveauEstConformeAuMinimumRequis(
        niveauSelectionne,
        niveauDeSecuriteMinimal
      );
  });
</script>

<hr class="separateur-etapier" />

{#if niveauDeSecuriteMinimal}
  <NiveauDeSecuriteEditable
    bind:niveauSelectionne
    {niveauDeSecuriteMinimal}
    onChampModifie={async (miseAJour) => {
      $leBrouillon.niveauSecurite = miseAJour.niveauSecurite;
      if ($leBrouillon.id)
        await metsAJourBrouillonService($leBrouillon.id, miseAJour);
    }}
  />
{/if}

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
