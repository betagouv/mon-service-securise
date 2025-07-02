<script lang="ts">
  import { decode } from 'html-entities';
  import TagStatutMesure from '../../ui/TagStatutMesure.svelte';
  import Tableau from '../../ui/Tableau.svelte';
  import type {
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../ui/types.d';
  import type { ServiceAssocieAUneMesure } from '../listeMesures.d';

  export let referentielStatuts: ReferentielStatut;
  export let referentielTypesService: ReferentielTypesService | undefined =
    undefined;
  export let servicesAssocies: ServiceAssocieAUneMesure[];
  export let avecNomCliquable: boolean = false;
  export let avecTypeEtBesoinDeSecurite: boolean = false;

  const libellesNiveauSecurite = {
    niveau1: 'Basiques',
    niveau2: 'Modérés',
    niveau3: 'Avancés',
  };
</script>

<Tableau
  colonnes={[
    { cle: 'nom', libelle: 'Nom du service' },
    ...(avecTypeEtBesoinDeSecurite
      ? [
          { cle: 'typeService', libelle: 'Type de service' },
          { cle: 'niveauSecurite', libelle: 'Besoin de sécurité' },
        ]
      : []),
    { cle: 'statut', libelle: 'Statut actuel' },
    { cle: 'modalites', libelle: 'Précision actuelle' },
  ]}
  donnees={servicesAssocies}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {#if colonne.cle === 'nom'}
      {#if avecNomCliquable}
        <a
          class="intitule-service intitule-service-cliquable"
          href="/service/{donnee.id}/mesures"
        >
          <span class="nom">{decode(donnee.nomService)}</span>
          <span class="organisation">{donnee.organisationResponsable}</span>
        </a>
      {:else}
        <div class="intitule-service">
          <span class="nom">{decode(donnee.nomService)}</span>
          <span class="organisation">{donnee.organisationResponsable}</span>
        </div>
      {/if}
    {:else if colonne.cle === 'typeService' && referentielTypesService}
      <div>
        <span
          >{donnee.typeService
            .map((t) => referentielTypesService[t].description)
            .join(', ')}</span
        >
      </div>
    {:else if colonne.cle === 'niveauSecurite'}
      <div>
        <span>{libellesNiveauSecurite[donnee.niveauSecurite]}</span>
      </div>
    {:else if colonne.cle === 'statut'}
      <TagStatutMesure {referentielStatuts} statut={donnee.mesure.statut} />
    {:else if colonne.cle === 'modalites'}
      {decode(donnee.mesure.modalites) || ''}
    {/if}
  </svelte:fragment>
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

    .nom {
      font-weight: bold;
    }
  }

  .intitule-service-cliquable:hover {
    .nom {
      color: var(--bleu-mise-en-avant);
    }
  }
</style>
