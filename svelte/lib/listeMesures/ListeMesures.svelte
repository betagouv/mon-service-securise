<script lang="ts">
  import {
    servicesAvecMesuresAssociees,
    servicesAvecMesuresAssocieesEnCoursDeChargement,
  } from './stores/servicesAvecMesuresAssociees.store';
  import { onMount } from 'svelte';
  import ModaleDetailsMesure from './kit/ModaleDetailsMesure.svelte';
  import {
    CategorieMesure,
    type ModeleMesureGenerale,
    Referentiel,
    type ReferentielStatut,
    type ReferentielTypesService,
  } from '../ui/types.d';
  import Tableau from '../ui/Tableau.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import { mesuresAvecServicesAssociesStore } from './stores/mesuresAvecServicesAssocies.store';
  import Bouton from '../ui/Bouton.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirModificationMultipleMesuresGenerales from './kit/tiroir/TiroirModificationMultipleMesuresGenerales.svelte';
  import { modelesMesureGenerale } from './stores/modelesMesureGenerale.store';
  import ModaleRapportModification from './kit/ModaleRapportModification.svelte';
  import { modaleRapportStore } from './stores/modaleRapport.store';
  import Lien from '../ui/Lien.svelte';
  import Loader from '../ui/Loader.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import { modelesMesureSpecifique } from './stores/modelesMesureSpecifique.store';
  import type { ListeMesuresProps, ModeleDeMesure } from './listeMesures.d';
  import Onglets from '../ui/Onglets.svelte';
  import TiroirAjoutModeleMesureSpecifique from './kit/tiroir/TiroirAjoutModeleMesureSpecifique.svelte';

  export let statuts: ReferentielStatut;
  export let categories: ListeMesuresProps['categories'];
  export let typesService: ReferentielTypesService;
  export let afficheModelesMesureSpecifique: boolean;

  onMount(() => {
    servicesAvecMesuresAssociees.rafraichis();
  });

  let modaleDetailsMesure: ModaleDetailsMesure;
  let ongletActif: 'generales' | 'specifiques' = 'generales';

  const afficheModaleDetailsMesure = async (modeleMesure: ModeleDeMesure) => {
    await modaleDetailsMesure.affiche(modeleMesure);
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
      ...categories.map((c) => ({
        libelle: c.label,
        valeur: c.id,
        idCategorie: 'categorie',
      })),
    ],
  };

  let donneesModelesMesure: ModeleDeMesure[];
  $: {
    if (ongletActif === 'generales')
      donneesModelesMesure = Object.values($modelesMesureGenerale).map((m) => ({
        ...m,
        idsServicesAssocies: $mesuresAvecServicesAssociesStore[m.id],
        type: 'generale',
      }));
    else if (ongletActif === 'specifiques')
      donneesModelesMesure = $modelesMesureSpecifique.map((m) => ({
        ...m,
        referentiel: Referentiel.SPECIFIQUE,
        type: 'specifique',
      }));
  }

  const estModeleMesureGenerale = (
    modeleMesure: ModeleDeMesure
  ): modeleMesure is ModeleMesureGenerale => modeleMesure.type === 'generale';

  const afficheDetailServiceAssocies = async (modeleMesure: ModeleDeMesure) => {
    await afficheModaleDetailsMesure(modeleMesure);
  };

  const afficheTiroirModificationMultipleMesuresGenerales = (
    modeleMesure: ModeleDeMesure
  ) => {
    if (estModeleMesureGenerale(modeleMesure))
      tiroirStore.afficheContenu(TiroirModificationMultipleMesuresGenerales, {
        modeleMesureGenerale: modeleMesure,
        statuts,
      });
  };

  const afficheTiroirAjout = () => {
    tiroirStore.afficheContenu(TiroirAjoutModeleMesureSpecifique, {
      categories,
    });
  };
</script>

<Toaster />

<ModaleRapportModification
  referentielStatuts={statuts}
  referentielTypesService={typesService}
  on:close={() => modaleRapportStore.metEnAvantMesureApresModification()}
/>

<ModaleDetailsMesure
  bind:this={modaleDetailsMesure}
  referentielStatuts={statuts}
  referentielTypesService={typesService}
/>

<Tableau
  colonnes={[
    { cle: 'description', libelle: 'Intitulé de la mesure' },
    { cle: 'servicesAssocies', libelle: 'Services associés' },
    { cle: 'actions', libelle: 'Action' },
  ]}
  donnees={donneesModelesMesure}
  configurationRecherche={{
    champsRecherche: ['description', 'identifiantNumerique'],
  }}
  configurationFiltrage={{ options: optionsFiltrage }}
  champIdentifiantLigne="id"
>
  <div slot="actionsComplementaires" class="conteneur-actions-complementaires">
    <Lien
      type="bouton-tertiaire"
      href="/mesures/export.csv"
      titre="Télécharger la liste de mesures"
      target="_blank"
      icone="telecharger"
    />
    {#if afficheModelesMesureSpecifique}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        variante="primaire"
        taille="md"
        titre="Ajouter une mesure"
        icone="add-line"
        position-icone="gauche"
        on:click={afficheTiroirAjout}
      />
    {/if}
  </div>

  <div slot="onglets">
    {#if afficheModelesMesureSpecifique}
      <Onglets
        bind:ongletActif
        onglets={[
          {
            id: 'generales',
            label: 'Les mesures ANSSI & CNIL',
            badge: Object.keys($modelesMesureGenerale).length,
          },
          {
            id: 'specifiques',
            label: 'Mes mesures ajoutées',
            badge: $modelesMesureSpecifique.length,
          },
        ]}
      />
    {/if}
  </div>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {@const aDesServicesAssocies = donnee.idsServicesAssocies?.length > 0}
    {@const typeMesure = donnee.type}
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
        {#if $servicesAvecMesuresAssocieesEnCoursDeChargement}
          <Loader />
        {:else if aDesServicesAssocies}
          Cette mesure est associée à
          <Bouton
            type="lien-dsfr"
            titre={`${donnee.idsServicesAssocies.length} ${
              donnee.idsServicesAssocies.length > 1 ? 'services' : 'service'
            }`}
            on:click={async () => {
              await afficheDetailServiceAssocies(donnee);
            }}
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
        actif={aDesServicesAssocies && typeMesure === 'generale'}
        on:click={() => {
          afficheTiroirModificationMultipleMesuresGenerales(donnee);
        }}
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

  .conteneur-actions-complementaires {
    margin-left: auto;
    display: flex;
    gap: 12px;
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
