<script lang="ts">
  import TagStatutMesure from '../../../../ui/TagStatutMesure.svelte';
  import type {
    MesureReferentiel,
    ReferentielStatut,
  } from '../../../../ui/types';
  import type { StatutMesure } from '../../../../modeles/modeleMesure';
  import { servicesAvecMesuresAssociees } from '../../../stores/servicesAvecMesuresAssociees.store';
  import { mesuresAvecServicesAssociesStore } from '../../../stores/mesuresAvecServicesAssocies.store';
  import TableauServicesAssocies from '../../TableauServicesAssocies.svelte';

  export let mesure: MesureReferentiel;
  export let statuts: ReferentielStatut;
  export let statutSelectionne: StatutMesure | '';
  export let precision: string;
  export let idsServicesSelectionnes: string[];

  $: servicesConcernes =
    mesure &&
    $servicesAvecMesuresAssociees
      .filter((s) => {
        return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
      })
      .filter((s) => idsServicesSelectionnes.includes(s.id))
      .map(({ mesuresAssociees, ...autresDonnees }) => ({
        ...autresDonnees,
        mesure: mesuresAssociees[mesure.id],
      }));

  const intitulePluralise =
    idsServicesSelectionnes.length > 1
      ? 'services concernés par ces modifications'
      : 'service concerné par cette modification';
</script>

<div class="contenu-resume">
  <h3>Modifications prévues</h3>
  {#if statutSelectionne}
    <div>
      <span class="sous-titre-resume">Statut</span>
      <TagStatutMesure
        referentielStatuts={statuts}
        statut={statutSelectionne}
      />
    </div>
  {/if}
  {#if precision}
    <div>
      <span class="sous-titre-resume">Précision</span>
      <span class="contenu-precision">{precision}</span>
    </div>
  {/if}
</div>

<hr />

<div>
  <h3 class="titre-etape">
    {idsServicesSelectionnes.length}
    {intitulePluralise}
  </h3>
  <TableauServicesAssocies
    servicesAssocies={servicesConcernes}
    referentielStatuts={statuts}
  />
</div>

<style lang="scss">
  .contenu-resume {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .sous-titre-resume {
      color: #282828;
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.5rem;
    }

    & > div {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  h3 {
    color: #161616;
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0;

    &.titre-etape {
      margin: 0 0 24px;
    }
  }

  hr {
    width: 100%;
    border-top: none;
    border-bottom: 1px solid #dddddd;
  }

  .contenu-precision {
    max-width: 500px;
  }
</style>
