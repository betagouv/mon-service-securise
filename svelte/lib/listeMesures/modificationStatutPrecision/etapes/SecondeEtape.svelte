<script lang="ts">
  import type { ReferentielStatut } from '../../../ui/types.d';
  import Infobulle from '../../../ui/Infobulle.svelte';
  import type { ServiceAssocie } from '../../mesureGenerale/modification/TiroirModificationMultipleMesuresGenerales.svelte';
  import TableauSelectionServices from '../../kit/TableauSelectionServices.svelte';

  interface Props {
    statuts: ReferentielStatut;
    modificationPrecisionUniquement: boolean;
    idsServicesSelectionnes: string[];
    servicesAssocies: ServiceAssocie[];
  }

  let {
    statuts,
    modificationPrecisionUniquement,
    idsServicesSelectionnes = $bindable(),
    servicesAssocies,
  }: Props = $props();

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
  services={servicesAssocies}
  {predicationDesactivation}
>
  {#snippet infoStatutMesure({ statut })}
    {#if modificationPrecisionUniquement && !statut}
      <Infobulle
        contenu="Cette précision ne peut pas être appliquée à ce service, car il ne dispose pas actuellement d'un statut."
      ></Infobulle>
    {/if}
  {/snippet}
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
