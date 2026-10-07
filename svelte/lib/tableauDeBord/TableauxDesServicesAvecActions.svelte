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
    idGroupeOuvert: string | undefined;
  }
  let {
    indicesCyberCharges = false,
    groupes,
    avecGroupesServices,
    idGroupeOuvert,
  }: Props = $props();

  let tousServicesSansGroupe = $derived.by(() => {
    const tousIdsServicesDansGroupes = [
      ...new Set(groupes.flatMap((g) => g.idServicesAssocies)),
    ];
    return $resultatsDeRechercheDuStatutHomologationSelectionne.filter(
      (s) => !tousIdsServicesDansGroupes.includes(s.id)
    );
  });

  const servicesDuGroupe = (groupe: GroupeServices) =>
    $resultatsDeRechercheDuStatutHomologationSelectionne.filter((s) =>
      groupe.idServicesAssocies.includes(s.id)
    );

  let groupesTries = $derived(
    [...groupes].sort((a, b) => a.libelle.localeCompare(b.libelle))
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
    <ActionsDesServices {selection} {groupes} {avecGroupesServices} />
  </div>
  {#if groupesTries.length > 0 && avecGroupesServices}
    <div class="contenu-groupes">
      {#each groupesTries as groupe (groupe.id)}
        <AccordeonDesServices
          {groupe}
          {indicesCyberCharges}
          servicesAAfficher={servicesDuGroupe(groupe)}
          brouillonsAAfficher={[]}
          ouvertParDefaut={groupe.id === idGroupeOuvert}
        />
      {/each}
      <AccordeonDesServices
        {indicesCyberCharges}
        servicesAAfficher={tousServicesSansGroupe}
        brouillonsAAfficher={$resultatsDeRechercheBrouillons}
        ouvertParDefaut={!idGroupeOuvert}
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
