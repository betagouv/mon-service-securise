<script lang="ts">
  import type { ReferentielStatut, ReferentielTypesService } from '../ui/types';
  import type { ListeMesuresProps } from './listeMesures.d';
  import { modelesMesureSpecifique } from '../ui/stores/modelesMesureSpecifique.store';
  import { servicesAvecMesuresAssociees } from './servicesAssocies/servicesAvecMesuresAssociees.store';
  import { singulierPluriel } from '../outils/string';
  import ModaleApplicationMesuresAServices from './ModaleApplicationMesuresAServices.svelte';

  interface Props {
    referentielStatuts: ReferentielStatut;
    referentielTypesService: ReferentielTypesService;
    categories: ListeMesuresProps['categories'];
  }

  let { referentielStatuts, referentielTypesService, categories }: Props =
    $props();

  let modaleApplicationMesures: ModaleApplicationMesuresAServices | undefined;

  let modelesAppliquesAuxServices = $derived(
    Object.fromEntries(
      $servicesAvecMesuresAssociees.map((s) => [
        s.id,
        new Set(
          s.mesuresSpecifiques.map((ms) => ms.idModele).filter((id) => !!id)
        ),
      ])
    )
  );
  let idModeles = $derived(new Set($modelesMesureSpecifique.map((m) => m.id)));

  let servicesSansToutesLesMesuresAppliquees = $derived(
    $servicesAvecMesuresAssociees.filter(
      (s) => !modelesAppliquesAuxServices[s.id].isSupersetOf(idModeles)
    )
  );
</script>

{#if servicesSansToutesLesMesuresAppliquees.length > 0}
  <ModaleApplicationMesuresAServices
    bind:this={modaleApplicationMesures}
    {categories}
    {referentielStatuts}
    {referentielTypesService}
    services={servicesSansToutesLesMesuresAppliquees}
  />
  <dsfr-alert has-description={false} has-title type="warning">
    <h3 slot="title" class="fr-alert__title">
      {singulierPluriel(
        "Un service n'a pas",
        `${servicesSansToutesLesMesuresAppliquees.length} services n'ont pas`,
        servicesSansToutesLesMesuresAppliquees.length
      )}
      {singulierPluriel(
        `la mesure « ${$modelesMesureSpecifique[0].description} » appliquée`,
        `les ${$modelesMesureSpecifique.length} mesures ajoutées appliquées`,
        $modelesMesureSpecifique.length
      )}
      <dsfr-button
        kind="secondary"
        label="Appliquer à tous les services"
        onclick={() => modaleApplicationMesures?.affiche()}
      ></dsfr-button>
    </h3>
  </dsfr-alert>
{/if}

<style lang="scss">
  dsfr-alert {
    margin-bottom: 32px;
  }

  h3 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
