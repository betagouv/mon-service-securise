<script lang="ts">
  import type { ReferentielStatut } from '../../../ui/types.d';
  import Infobulle from '../../../ui/Infobulle.svelte';
  import type { ServiceAssocie } from '../../mesureGenerale/modification/TiroirModificationMultipleMesuresGenerales.svelte';
  import TableauSelectionServices from '../../kit/TableauSelectionServices.svelte';

  export let statuts: ReferentielStatut;
  export let modificationPrecisionUniquement: boolean;
  export let idsServicesSelectionnes: string[];
  export let servicesAssocies: ServiceAssocie[];

  const doitEtreALaFin = (service: ServiceAssocie) =>
    !service.peutEtreModifie ||
    (modificationPrecisionUniquement && !service.mesure.statut);

  $: servicesOrdonnes = servicesAssocies.sort((a, b) => {
    if (
      (doitEtreALaFin(a) && doitEtreALaFin(b)) ||
      (!doitEtreALaFin(a) && !doitEtreALaFin(b))
    ) {
      return a.nomService.localeCompare(b.nomService);
    }
    return doitEtreALaFin(a) ? 1 : -1;
  });

  const predicationDesactivation = (donnee: ServiceAssocie) =>
    (modificationPrecisionUniquement && !donnee.mesure.statut) ||
    !donnee.peutEtreModifie;
</script>

<span class="explication">
  Sélectionnez les services concernés par ces modifications. Les données
  existantes seront remplacées.
</span>

<TableauSelectionServices
  {statuts}
  bind:idsServicesSelectionnes
  {servicesOrdonnes}
  {predicationDesactivation}
>
  <svelte:fragment slot="infoStatutMesure" let:donnee>
    {#if modificationPrecisionUniquement && !donnee.mesure.statut}
      <Infobulle
        contenu="Cette précision ne peut pas être appliquée à ce service, car il ne dispose pas actuellement d'un statut."
      ></Infobulle>
    {/if}
  </svelte:fragment>
</TableauSelectionServices>

<style lang="scss">
  span {
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .explication {
    max-width: 500px;
  }
</style>
