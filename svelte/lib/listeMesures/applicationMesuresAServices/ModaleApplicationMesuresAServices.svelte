<script lang="ts">
  import type { ReferentielTypesService } from '../../ui/types';
  import type { ServiceAvecMesuresAssociees } from '../listeMesures.d';
  import Modale from '../../ui/Modale.svelte';
  import { singulierPluriel } from '../../outils/string';
  import TableauServicesPourApplication from './TableauServicesPourApplication.svelte';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import { associeServicesModeleMesureSpecifique } from '../listeMesures.api';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import { servicesAvecMesuresAssociees } from '../servicesAssocies/servicesAvecMesuresAssociees.store';

  let elementModale: Modale | undefined = $state();

  interface Props {
    referentielTypesService: ReferentielTypesService;
    services: ServiceAvecMesuresAssociees[];
  }

  let { referentielTypesService, services }: Props = $props();

  export const affiche = () => {
    elementModale?.affiche();
  };

  let modelesEtServicesConcernes = $derived(
    $modelesMesureSpecifique
      .map((m) => [
        m.id,
        services
          .filter(
            (s) => !s.mesuresSpecifiques.map((ms) => ms.idModele).includes(m.id)
          )
          .map((s) => s.id),
      ])
      .filter(([_, idsServices]) => idsServices.length > 0)
  );

  const appliqueAuxServices = async () => {
    await Promise.all(
      modelesEtServicesConcernes.map(([idModele, idServices]) => {
        associeServicesModeleMesureSpecifique(
          idModele as string,
          idServices as string[]
        );
      })
    );
    elementModale?.ferme();
    toasterStore.succes(
      'Succès',
      'Toutes vos mesures spécifiques sont désormais appliquées à tous vos services.'
    );
    await servicesAvecMesuresAssociees.rafraichis();
    await modelesMesureSpecifique.rafraichis();
  };
</script>

<Modale id="modale-application-mesures" bind:this={elementModale}>
  {#snippet entete()}
    <h4>Vérifiez avant d'appliquer vos mesures</h4>
    <p>
      {singulierPluriel(
        'La mesure',
        `Les ${$modelesMesureSpecifique.length} mesures`,
        $modelesMesureSpecifique.length
      )} de l'onglet « Mes mesures ajoutées » seront associées aux services qui ne
      les ont pas encore. Elles seront ajoutées avec le statut «&nbsp;À lancer&nbsp;»
      ; les statuts et précisions déjà renseignés ne seront pas modifiés.
    </p>
  {/snippet}
  {#snippet contenu()}
    <div class="contenu">
      <h4>
        {singulierPluriel(
          'Le service suivant va',
          `Les ${services.length} services suivants vont`,
          services.length
        )} recevoir les mesures manquantes
      </h4>
      <TableauServicesPourApplication {referentielTypesService} {services} />
    </div>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      kind="tertiary"
      label="Annuler"
      onclick={() => elementModale?.ferme()}
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label={singulierPluriel(
        "Confirmer l'application au service",
        `Confirmer l'application aux ${services.length} services`,
        services.length
      )}
      onclick={async () => appliqueAuxServices()}
    ></dsfr-button>
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-application-mesures) {
    max-width: 1242px;
    max-height: 827px;
    width: calc(100% - 48px);
  }

  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    text-align: left;
    margin: 0 0 24px;
  }

  .contenu {
    margin-top: 24px;
  }

  p {
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
  }
</style>
