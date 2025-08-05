<script lang="ts">
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';
  import type { ReferentielStatut } from '../../../ui/types.d';
  import type { StatutMesure } from '../../../modeles/modeleMesure';
  import TableauServicesAssocies from '../../servicesAssocies/TableauServicesAssocies.svelte';

  export let statuts: ReferentielStatut;
  export let statutSelectionne: StatutMesure | '';
  export let precision: string;
  export let servicesConcernes;

  const intitulePluralise =
    servicesConcernes.length > 1
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
    {servicesConcernes.length}
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
