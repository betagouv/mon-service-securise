<script lang="ts">
  import { servicesAvecMesuresAssociees } from './stores/servicesAvecMesuresAssociees.store';
  import { onMount } from 'svelte';
  import ModaleDetailsMesure from './kit/ModaleDetailsMesure.svelte';
  import {
    CategorieMesure,
    type MesureReferentiel,
    Referentiel,
    type ReferentielStatut,
  } from '../ui/types.d';
  import Tableau from '../ui/Tableau.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import { mesuresAvecServicesAssociesStore } from './stores/mesuresAvecServicesAssocies.store';
  import Bouton from '../ui/Bouton.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirConfigurationMesure from './kit/tiroir/TiroirConfigurationMesure.svelte';
  import { mesuresReferentiel } from './stores/mesuresReferentiel.store';
  import ModaleRapportModification from './kit/ModaleRapportModification.svelte';
  import { modaleRapportStore } from './stores/modaleRapport.store';

  export let statuts: ReferentielStatut;

  onMount(() => {
    servicesAvecMesuresAssociees.rafraichis();
  });

  let modaleDetailsMesure: ModaleDetailsMesure;

  const afficheModaleDetailsMesure = async (mesure: MesureReferentiel) => {
    await modaleDetailsMesure.affiche(mesure);
  };

  const optionsFiltrage = {
    categories: [
      { id: 'referentiel', libelle: 'Référentiel' },
      { id: 'categorie', libelle: 'Catégories' },
    ],
    items: [
      {
        libelle: 'ANSSI',
        valeur: Referentiel.ANSSI,
        idCategorie: 'referentiel',
      },
      {
        libelle: 'CNIL',
        valeur: Referentiel.CNIL,
        idCategorie: 'referentiel',
      },
      {
        libelle: 'Défense',
        valeur: CategorieMesure.DEFENSE,
        idCategorie: 'categorie',
      },
      {
        libelle: 'Gouvernance',
        valeur: CategorieMesure.GOUVERNANCE,
        idCategorie: 'categorie',
      },
      {
        libelle: 'Protection',
        valeur: CategorieMesure.PROTECTION,
        idCategorie: 'categorie',
      },
      {
        libelle: 'Résilience',
        valeur: CategorieMesure.RESILIENCE,
        idCategorie: 'categorie',
      },
    ],
  };
</script>

<ModaleRapportModification
  referentielStatuts={statuts}
  on:close={() => modaleRapportStore.metEnAvantMesureApresModification()}
/>

<ModaleDetailsMesure
  bind:this={modaleDetailsMesure}
  referentielStatuts={statuts}
/>

<Tableau
  colonnes={[
    { cle: 'description', libelle: 'Intitulé de la mesure' },
    { cle: 'servicesAssocies', libelle: 'Services associés' },
    { cle: 'actions', libelle: 'Action' },
  ]}
  donnees={Object.values($mesuresReferentiel)}
  configurationRecherche={{
    champsRecherche: ['description', 'identifiantNumerique'],
  }}
  configurationFiltrage={{ options: optionsFiltrage }}
  champIdentifiantLigne="id"
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {@const mesureAvecServicesAssocies =
      $mesuresAvecServicesAssociesStore[donnee.id]}
    {@const aDesServicesAssocies = mesureAvecServicesAssocies?.length > 0}
    {#if colonne.cle === 'description'}
      <div class="description-mesure">
        <span>{donnee.description}</span>
        <div>
          <CartoucheReferentiel referentiel={donnee.referentiel} />
          <CartoucheCategorieMesure categorie={donnee.categorie} />
          <CartoucheIdentifiantMesure
            identifiant={donnee.identifiantNumerique}
          />
        </div>
      </div>
    {:else if colonne.cle === 'servicesAssocies'}
      <div class="services-associes">
        {#if aDesServicesAssocies}
          Cette mesure est associée à
          <Bouton
            type="lien-dsfr"
            titre={`${mesureAvecServicesAssocies.length} ${
              mesureAvecServicesAssocies.length > 1 ? 'services' : 'service'
            }`}
            on:click={async () => await afficheModaleDetailsMesure(donnee)}
          />
        {:else}
          <span class="aucun-service">Aucun service associé</span>
        {/if}
      </div>
    {:else if colonne.cle === 'actions'}
      <Bouton
        titre="Configurer la mesure"
        type="secondaire"
        taille="petit"
        icone="configuration"
        actif={aDesServicesAssocies}
        on:click={() =>
          tiroirStore.afficheContenu(TiroirConfigurationMesure, {
            mesure: donnee,
            statuts,
          })}
      />
    {/if}
  </svelte:fragment>
</Tableau>

<style lang="scss">
  :global(#liste-mesures) {
    text-align: left;
    width: 100%;
    max-width: 1200px;
    margin: 32px 0;
  }

  .description-mesure {
    display: flex;
    flex-direction: column;
    gap: 8px;

    span {
      font-size: 0.875rem;
      font-weight: bold;
      line-height: 1.5rem;
    }

    div {
      display: flex;
      flex-direction: row;
      gap: 8px;
    }
  }

  .services-associes {
    color: var(--gris-fonce);
    white-space: nowrap;
  }

  :global(tr.met-en-avant) {
    animation: montre-ligne 2s ease-out 0.5s;
  }

  @keyframes montre-ligne {
    0% {
      background-color: inherit;
    }
    40% {
      background-color: var(--fond-bleu-pale);
    }
    60% {
      background-color: var(--fond-bleu-pale);
    }
    100% {
      background-color: inherit;
    }
  }
</style>
