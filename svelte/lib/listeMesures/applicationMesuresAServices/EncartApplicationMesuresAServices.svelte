<script lang="ts">
  import type { ReferentielTypesService } from '../../ui/types';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import { servicesAvecMesuresAssociees } from '../servicesAssocies/servicesAvecMesuresAssociees.store';
  import { singulierPluriel } from '../../outils/string';
  import ModaleApplicationMesuresAServices from './ModaleApplicationMesuresAServices.svelte';

  interface Props {
    referentielTypesService: ReferentielTypesService;
  }

  let { referentielTypesService }: Props = $props();

  let modaleApplicationMesures: ModaleApplicationMesuresAServices | undefined =
    $state();

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
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
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
