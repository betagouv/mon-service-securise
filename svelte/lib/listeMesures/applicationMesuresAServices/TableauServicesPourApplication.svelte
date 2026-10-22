<script lang="ts">
  import Tableau from '../../ui/Tableau.svelte';
  import type { ReferentielTypesService } from '../../ui/types.d';
  import type { ServiceAvecMesuresAssociees } from '../listeMesures.d';
  import { referentielNiveauxSecurite } from '../../ui/referentielNiveauxSecurite';
  import { servicesAvecMesuresAssociees } from '../servicesAssocies/servicesAvecMesuresAssociees.store';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';

  interface Props {
    referentielTypesService?: ReferentielTypesService | undefined;
    services: ServiceAvecMesuresAssociees[];
  }

  let { referentielTypesService = undefined, services }: Props = $props();

  let modelesAppliquesAuxServices = $derived(
    Object.fromEntries(
      $servicesAvecMesuresAssociees.map((s) => [
        s.id,
        s.mesuresSpecifiques.map((ms) => ms.idModele).filter((id) => !!id),
      ])
    )
  );
</script>

<Tableau
  colonnes={[
    { cle: 'nom', libelle: 'Nom du service' },
    { cle: 'typeService', libelle: 'Type de service' },
    { cle: 'niveauSecurite', libelle: 'Besoin de sécurité' },
    { cle: 'mesures', libelle: 'Mesures à ajouter' },
  ]}
  donnees={services}
>
  {#snippet cellule({ donnee, colonne })}
    {#if colonne.cle === 'nom'}
      <div class="intitule-service">
        <span class="nom">{donnee.nomService}</span>
        <span class="organisation">{donnee.organisationResponsable ?? '-'}</span
        >
      </div>
    {:else if colonne.cle === 'typeService' && referentielTypesService}
      <div class="type-service">
        <span>
          {donnee.typeService
            .map((t) => {
              if (!referentielTypesService) return '';
              return referentielTypesService[t].description;
            })
            .join(', ')}
        </span>
      </div>
    {:else if colonne.cle === 'niveauSecurite'}
      <div class="besoin-securite">
        <span>{referentielNiveauxSecurite[donnee.niveauSecurite]}</span>
      </div>
    {:else if colonne.cle === 'mesures'}
      <span
        ><b
          >{$modelesMesureSpecifique.length -
            modelesAppliquesAuxServices[donnee.id].length}</b
        >
        sur {$modelesMesureSpecifique.length}</span
      >
    {/if}
  {/snippet}
</Tableau>

<style lang="scss">
  :global(tr:has(.intitule-service-cliquable:hover)) {
    box-shadow: var(--ombre-md);
  }

  .intitule-service {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #3a3a3a;
    width: 318px;

    .nom {
      font-weight: bold;
    }

    .nom,
    .organisation {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .type-service,
  .besoin-securite {
    width: 128px;
  }
</style>
