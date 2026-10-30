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
  import ChargementEnCours from '../../ui/ChargementEnCours.svelte';

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

  let etatModale: 'IDLE' | 'APPLICATION_EN_COURS' = $state('IDLE');
  let indexModeleEnCoursDApplication: number = $state(0);

  const appliqueAuxServices = async () => {
    etatModale = 'APPLICATION_EN_COURS';
    indexModeleEnCoursDApplication = 0;

    try {
      for (const [idModele, idServices] of modelesEtServicesConcernes) {
        indexModeleEnCoursDApplication++;
        await associeServicesModeleMesureSpecifique(
          idModele as string,
          idServices as string[]
        );
      }
      elementModale?.ferme();
      toasterStore.succes(
        'Succès',
        'Toutes vos mesures spécifiques sont désormais appliquées à tous vos services.'
      );
      await servicesAvecMesuresAssociees.rafraichis();
      await modelesMesureSpecifique.rafraichis();
    } catch {
      elementModale?.ferme();
      toasterStore.erreur(
        'Une erreur est survenue',
        'Merci de recharger la page'
      );
    } finally {
      etatModale = 'IDLE';
    }
  };
</script>

<Modale id="modale-application-mesures" bind:this={elementModale}>
  {#snippet entete()}
    <h4>Vérifiez avant d'appliquer vos mesures</h4>
    <p>
      {#if $modelesMesureSpecifique.length === 1}
        La mesure de l'onglet «&nbsp;Mes mesures ajoutées&nbsp;» sera associée
        aux services qui ne l'ont pas encore. Elles sera ajoutée avec le statut
        «&nbsp;À lancer&nbsp;»&nbsp;;
      {:else}
        Les {$modelesMesureSpecifique.length} mesures de l'onglet «&nbsp;Mes mesures
        ajoutées&nbsp;» seront associées aux services qui ne les ont pas encore. Elles
        seront ajoutées avec le statut «&nbsp;À lancer&nbsp;» ;
      {/if}
      les statuts et précisions déjà renseignés ne seront pas modifiés.
    </p>
  {/snippet}
  {#snippet contenu()}
    <div
      class="contenu"
      class:application-en-cours={etatModale === 'APPLICATION_EN_COURS'}
    >
      {#if etatModale === 'IDLE'}
        <h4>
          {singulierPluriel(
            'Le service suivant va',
            `Les ${services.length} services suivants vont`,
            services.length
          )} recevoir les mesures manquantes
        </h4>
        <TableauServicesPourApplication {referentielTypesService} {services} />
      {/if}

      {#if etatModale === 'APPLICATION_EN_COURS'}
        <ChargementEnCours />
        <p class="avancement">
          Mesure <span class="chiffre">{indexModeleEnCoursDApplication}</span>
          sur {modelesEtServicesConcernes.length}…
        </p>
      {/if}
    </div>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      kind="tertiary"
      label="Annuler"
      onclick={() => elementModale?.ferme()}
      disabled={etatModale === 'APPLICATION_EN_COURS'}
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label={singulierPluriel(
        "Confirmer l'application au service",
        `Confirmer l'application aux ${services.length} services`,
        services.length
      )}
      onclick={async () => appliqueAuxServices()}
      disabled={etatModale === 'APPLICATION_EN_COURS'}
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

    &.application-en-cours {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 1;

      .avancement {
        margin-top: 90px;
      }

      .chiffre {
        font-variant-numeric: tabular-nums;
        display: inline-block;
        min-width: 2ch;
        text-align: right;
      }
    }
  }

  p {
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
  }
</style>
