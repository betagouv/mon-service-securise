<script lang="ts">
  import TagStatutMesure from '../../../../ui/TagStatutMesure.svelte';
  import type {
    MesureReferentiel,
    ReferentielStatut,
  } from '../../../../ui/types';
  import type { StatutMesure } from '../../../../modeles/modeleMesure';
  import { decode } from 'html-entities';
  import Tableau from '../../../../ui/Tableau.svelte';
  import { servicesAvecMesuresAssociees } from '../../../stores/servicesAvecMesuresAssociees.store';
  import { mesuresAvecServicesAssociesStore } from '../../../stores/mesuresAvecServicesAssocies.store';

  export let mesure: MesureReferentiel;
  export let statuts: ReferentielStatut;
  export let statutSelectionne: StatutMesure;
  export let precision: string;
  export let idsServicesSelectionnes: string[];

  $: servicesConcernes =
    mesure &&
    $servicesAvecMesuresAssociees
      .filter((s) => {
        return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
      })
      .filter((s) => idsServicesSelectionnes.includes(s.id));

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
      <span>{precision}</span>
    </div>
  {/if}
</div>

<hr />

<div>
  <h3>{idsServicesSelectionnes.length} {intitulePluralise}</h3>
  <Tableau
    colonnes={[
      { cle: 'nom', libelle: 'Nom du service' },
      { cle: 'statut', libelle: 'Statut actuel' },
      { cle: 'modalites', libelle: 'Précision actuelle' },
    ]}
    donnees={servicesConcernes}
  >
    <svelte:fragment slot="cellule" let:donnee let:colonne>
      {#if colonne.cle === 'nom'}
        <div class="intitule-service">
          <span class="nom">{decode(donnee.nomService)}</span>
          <span class="organisation">{donnee.organisationResponsable}</span>
        </div>
      {:else if colonne.cle === 'statut'}
        <TagStatutMesure
          referentielStatuts={statuts}
          statut={donnee.mesuresAssociees[mesure.id].statut}
        />
      {:else if colonne.cle === 'modalites'}
        {decode(donnee.mesuresAssociees[mesure.id].modalites) || ''}
      {/if}
    </svelte:fragment>
  </Tableau>
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
    margin: 0;
    color: #161616;
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.75rem;
  }

  hr {
    width: 100%;
    border-top: none;
    border-bottom: 1px solid #dddddd;
  }

  .intitule-service {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .nom {
      font-weight: bold;
    }
  }
</style>
