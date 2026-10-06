<script lang="ts">
  import { resultatsDeRecherche } from './stores/resultatDeRecherche.store';
  import ActionsDesServices, {
    type TypeSelection,
  } from './ActionsDesServices.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import { selectionIdsServices } from './stores/selectionService.store';
  import { affichageTableauVide } from './stores/affichageTableauVide';
  import TableauVide from './TableauVide.svelte';
  import { resultatsDeRechercheBrouillons } from './stores/resultatDeRechercheBrouillons.store';
  import { singulierPluriel } from '../outils/string';
  import TableauDeServices from './TableauDeServices.svelte';
  import type { GroupeServices } from './tableauDeBord.d';
  import { resultatsDeRechercheDuStatutHomologationSelectionne } from './stores/affichageParStatutHomologation';
  import { derived } from 'svelte/store';
  import AccordeonDesServices from './AccordeonDesServices.svelte';

  let selection = $derived([
    ...$resultatsDeRecherche
      .filter((service) => $selectionIdsServices.includes(service.id))
      .map((s) => ({ ...s, type: 'Service' as TypeSelection })),
    ...$resultatsDeRechercheBrouillons
      .filter((brouillon) => $selectionIdsServices.includes(brouillon.id))
      .map((b) => ({ ...b, type: 'Brouillon' as TypeSelection })),
  ]);

  $effect(() => {
    if ($resultatsDeRecherche) selectionIdsServices.vide();
  });

  $effect(() => {
    if ($selectionIdsServices) tiroirStore.ferme();
  });

  interface Props {
    indicesCyberCharges?: boolean;
    groupes: GroupeServices[];
    avecGroupesServices: boolean;
  }
  let {
    indicesCyberCharges = false,
    groupes,
    avecGroupesServices,
  }: Props = $props();

  let tousIdsServicesDansGroupes = $derived([
    ...new Set(groupes.flatMap((g) => g.idServicesAssocies)),
  ]);
  let tousServicesSansGroupe = derived(
    [resultatsDeRechercheDuStatutHomologationSelectionne],
    ([$r]) => $r.filter((s) => !tousIdsServicesDansGroupes.includes(s.id))
  );

  const servicesDuGroupe = (groupe: GroupeServices) =>
    $resultatsDeRechercheDuStatutHomologationSelectionne.filter((s) =>
      groupe.idServicesAssocies.includes(s.id)
    );
</script>

{#if $affichageTableauVide.doitAfficher}
  <TableauVide />
{:else}
  <div class="barre-actions">
    <span class="sous-texte">
      {#if $selectionIdsServices.length > 0}
        {$selectionIdsServices.length}
        {singulierPluriel(
          'service sélectionné',
          'services sélectionnés',
          $selectionIdsServices.length
        )}
      {/if}
    </span>
    <ActionsDesServices {selection} {groupes} />
  </div>
  {#if groupes.length > 0 && avecGroupesServices}
    <div class="contenu-groupes">
      {#each groupes as groupe (groupe.id)}
        <AccordeonDesServices
          {groupe}
          {indicesCyberCharges}
          servicesAAfficher={servicesDuGroupe(groupe)}
          brouillonsAAfficher={[]}
        />
      {/each}
      <AccordeonDesServices
        {indicesCyberCharges}
        servicesAAfficher={$tousServicesSansGroupe}
        brouillonsAAfficher={$resultatsDeRechercheBrouillons}
        ouvertParDefaut
      />
    </div>
  {:else}
    <TableauDeServices
      {indicesCyberCharges}
      servicesAAfficher={$resultatsDeRechercheDuStatutHomologationSelectionne}
      brouillonsAAfficher={$resultatsDeRechercheBrouillons}
    />
  {/if}
{/if}

<style lang="scss">
  .contenu-groupes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .barre-actions {
    margin-bottom: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .sous-texte {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: #666666;
    white-space: nowrap;
  }
</style>
