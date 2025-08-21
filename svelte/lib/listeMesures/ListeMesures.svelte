<script lang="ts">
  import {
    servicesAvecMesuresAssociees,
    servicesAvecMesuresAssocieesEnCoursDeChargement,
  } from './servicesAssocies/servicesAvecMesuresAssociees.store';
  import { onMount } from 'svelte';
  import ModaleDetailsMesure from './kit/ModaleDetailsMesure.svelte';
  import {
    type ModeleMesureGenerale,
    Referentiel,
    type ReferentielStatut,
    type ReferentielTypesService,
  } from '../ui/types.d';
  import Tableau from '../ui/Tableau.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import { mesuresAvecServicesAssociesStore } from './servicesAssocies/mesuresAvecServicesAssocies.store';
  import Bouton from '../ui/Bouton.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirModificationMultipleMesuresGenerales from './mesureGenerale/modification/TiroirModificationMultipleMesuresGenerales.svelte';
  import { modelesMesureGenerale } from './mesureGenerale/modelesMesureGenerale.store';
  import ModaleRapportModification from './modificationStatutPrecision/rapport/ModaleRapportModification.svelte';
  import { modaleRapportStore } from './modificationStatutPrecision/rapport/modaleRapport.store';
  import Lien from '../ui/Lien.svelte';
  import Loader from '../ui/Loader.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import { modelesMesureSpecifique } from '../ui/stores/modelesMesureSpecifique.store';
  import type {
    CapaciteAjoutDeMesure,
    ListeMesuresProps,
    ModeleDeMesure,
  } from './listeMesures.d';
  import Onglets from '../ui/Onglets.svelte';
  import TiroirAjoutModeleMesureSpecifique from './mesureSpecifique/ajout/TiroirAjoutModeleMesureSpecifique.svelte';
  import TiroirConfigurationModeleMesureSpecifique from './mesureSpecifique/configuration/TiroirConfigurationModeleMesureSpecifique.svelte';
  import BoutonAvecListeDeroulante from '../ui/BoutonAvecListeDeroulante.svelte';
  import TiroirTeleversementModeleMesureSpecifique from './televersement/TiroirTeleversementModeleMesureSpecifique.svelte';
  import type { ConfigurationFiltrage } from '../ui/Tableau.svelte';
  import TableauVideMesuresSpecifiques from './mesureSpecifique/TableauVideMesuresSpecifiques.svelte';
  import Infobulle from '../ui/Infobulle.svelte';

  export let statuts: ReferentielStatut;
  export let categories: ListeMesuresProps['categories'];
  export let typesService: ReferentielTypesService;
  export let capaciteAjoutDeMesure: CapaciteAjoutDeMesure;

  onMount(async () => {
    await servicesAvecMesuresAssociees.rafraichis();
  });

  const requete = new URLSearchParams(window.location.search);

  const valeursOnglets = ['toutes', 'generales', 'specifiques'];
  type OngletListeMesures = (typeof valeursOnglets)[number];

  let modaleDetailsMesure: ModaleDetailsMesure;

  let ongletActif: OngletListeMesures;

  $: {
    const ongletDemande = requete.get('ongletActif') as OngletListeMesures;
    ongletActif = valeursOnglets.includes(ongletDemande)
      ? ongletDemande
      : 'toutes';
  }

  $: peutAjouterModelesMesureSpecifique =
    $modelesMesureSpecifique.length < capaciteAjoutDeMesure.nombreMaximum;

  const afficheModaleDetailsMesure = async (modeleMesure: ModeleDeMesure) => {
    await modaleDetailsMesure.affiche(modeleMesure);
  };

  const itemsFiltrageReferentiel = [
    { libelle: 'ANSSI', valeur: Referentiel.ANSSI, idCategorie: 'referentiel' },
    { libelle: 'CNIL', valeur: Referentiel.CNIL, idCategorie: 'referentiel' },
  ];
  const itemsFiltrageReferentielAvecMesureSpecifiques = [
    ...itemsFiltrageReferentiel,
    {
      libelle: 'Mesures ajoutées',
      valeur: Referentiel.SPECIFIQUE,
      idCategorie: 'referentiel',
    },
  ];
  const itemsFiltrageCategories = categories.map((c) => ({
    libelle: c.label,
    valeur: c.id,
    idCategorie: 'categorie',
  }));

  const groupeReferentiel = { id: 'referentiel', libelle: 'Référentiel' };
  const groupeCategorie = { id: 'categorie', libelle: 'Catégories' };

  type ConfigurationTableau = {
    donnees: ModeleDeMesure[];
    configurationRecherche: { champsRecherche: string[] };
    configurationFiltrage: ConfigurationFiltrage;
  };
  let configurationTableau: ConfigurationTableau = {
    donnees: [],
    configurationRecherche: { champsRecherche: [] },
    configurationFiltrage: { options: { categories: [], items: [] } },
  };

  $: {
    const listeModeleMesuresGenerales: ModeleDeMesure[] = Object.values(
      $modelesMesureGenerale
    ).map((m) => ({
      ...m,
      idsServicesAssocies: $mesuresAvecServicesAssociesStore[m.id],
      type: 'generale',
    }));
    const listeModelesMesureSpecifique: ModeleDeMesure[] =
      $modelesMesureSpecifique.map((m) => ({
        ...m,
        referentiel: Referentiel.SPECIFIQUE,
        type: 'specifique',
      }));

    if (ongletActif === 'generales') {
      configurationTableau.donnees = listeModeleMesuresGenerales;
      configurationTableau.configurationRecherche.champsRecherche = [
        'description',
        'identifiantNumerique',
      ];
      configurationTableau.configurationFiltrage.options = {
        categories: [groupeReferentiel, groupeCategorie],
        items: [...itemsFiltrageReferentiel, ...itemsFiltrageCategories],
      };
    } else if (ongletActif === 'specifiques') {
      configurationTableau.donnees = listeModelesMesureSpecifique;
      configurationTableau.configurationRecherche.champsRecherche = [
        'description',
      ];
      configurationTableau.configurationFiltrage.options = {
        categories: [groupeCategorie],
        items: [...itemsFiltrageCategories],
      };
    } else if (ongletActif === 'toutes') {
      configurationTableau.donnees = [
        ...listeModeleMesuresGenerales,
        ...listeModelesMesureSpecifique,
      ];
      configurationTableau.configurationRecherche.champsRecherche = [
        'description',
        'identifiantNumerique',
      ];
      configurationTableau.configurationFiltrage.options = {
        categories: [groupeReferentiel, groupeCategorie],
        items: [
          ...itemsFiltrageReferentielAvecMesureSpecifiques,
          ...itemsFiltrageCategories,
        ],
      };
    }
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
    ongletActif = 'specifiques';
    tiroirStore.afficheContenu(TiroirAjoutModeleMesureSpecifique, {
      categories,
      statuts,
      referentielTypesService: typesService,
    });
  };

  const afficheTiroirTeleversement = () => {
    ongletActif = 'specifiques';
    tiroirStore.afficheContenu(TiroirTeleversementModeleMesureSpecifique, {
      capaciteAjoutDeMesure,
    });
  };

  const afficheTiroirModificationModeleMesureSpecifique = (
    modele: ModeleDeMesure
  ) => {
    tiroirStore.afficheContenu(TiroirConfigurationModeleMesureSpecifique, {
      categories,
      statuts,
      modeleMesure: modele,
      referentielTypesService: typesService,
      ongletActif: 'info',
    });
  };

  const ouvreTiroirEdition = (modeleMesure: ModeleDeMesure) => {
    if (modeleMesure.type === 'specifique') {
      afficheTiroirModificationModeleMesureSpecifique(modeleMesure);
    } else {
      afficheTiroirModificationMultipleMesuresGenerales(modeleMesure);
    }
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
  {categories}
  referentielStatuts={statuts}
  referentielTypesService={typesService}
/>

<Tableau
  colonnes={[
    { cle: 'description', libelle: 'Intitulé de la mesure' },
    { cle: 'servicesAssocies', libelle: 'Services associés' },
    { cle: 'actions', libelle: 'Action' },
  ]}
  donnees={configurationTableau.donnees}
  configurationRecherche={configurationTableau.configurationRecherche}
  configurationFiltrage={configurationTableau.configurationFiltrage}
  champIdentifiantLigne="id"
  composantTableauVide={ongletActif === 'specifiques' &&
  configurationTableau.donnees.length === 0
    ? {
        composant: TableauVideMesuresSpecifiques,
        props: { statuts, categories, typesService, capaciteAjoutDeMesure },
      }
    : undefined}
>
  <div slot="actionsComplementaires" class="conteneur-actions-complementaires">
    <Lien
      type="bouton-tertiaire"
      href="/mesures/export.csv"
      titre="Télécharger la liste de mesures"
      target="_blank"
      icone="telecharger"
    />
    <div class="action-ajout-modeles-mesure-specifique">
      <BoutonAvecListeDeroulante
        titre="Ajouter une / des mesures"
        options={[
          {
            label: 'Ajouter une mesure',
            icone: 'plus',
            action: afficheTiroirAjout,
          },
          {
            label: 'Téléverser des mesures',
            icone: 'televerser',
            action: afficheTiroirTeleversement,
          },
        ]}
        disabled={!peutAjouterModelesMesureSpecifique}
      />
      {#if !peutAjouterModelesMesureSpecifique}
        <Infobulle
          contenu={`Vous avez atteint la limite maximale de ${capaciteAjoutDeMesure.nombreMaximum} mesures. Pour ajouter des mesures, veuillez d'abord en supprimer.`}
        />
      {/if}
    </div>
  </div>

  <div slot="onglets">
    <Onglets
      bind:ongletActif
      onglets={[
        {
          id: 'toutes',
          label: 'Toutes les mesures',
          badge:
            Object.keys($modelesMesureGenerale).length +
            $modelesMesureSpecifique.length,
        },
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
  </div>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {@const aDesServicesAssocies = donnee.idsServicesAssocies?.length > 0}
    {@const typeMesure = donnee.type}
    {@const cliquable = typeMesure === 'specifique' || aDesServicesAssocies}
    {#if colonne.cle === 'description'}
      <div
        class="description-mesure"
        class:cliquable
        role="button"
        tabindex="0"
        on:keypress={() => cliquable && ouvreTiroirEdition(donnee)}
        on:click={() => cliquable && ouvreTiroirEdition(donnee)}
      >
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
      {#if typeMesure === 'generale'}
        <Bouton
          titre="Configurer la mesure"
          type="secondaire"
          taille="petit"
          icone="configuration"
          actif={aDesServicesAssocies}
          on:click={() => {
            afficheTiroirModificationMultipleMesuresGenerales(donnee);
          }}
        />
      {:else if typeMesure === 'specifique'}
        <Bouton
          titre="Configurer la mesure"
          type="secondaire"
          taille="petit"
          icone="configuration"
          on:click={() => {
            afficheTiroirModificationModeleMesureSpecifique(donnee);
          }}
        />
      {/if}
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

  :global(#liste-mesures tr:has(.description-mesure.cliquable:hover)) {
    box-shadow: 0 12px 16px 0 rgba(0, 121, 208, 0.12);
    cursor: pointer;
    color: var(--bleu-mise-en-avant);
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

    .action-ajout-modeles-mesure-specifique {
      display: flex;
      align-items: center;
      gap: 4px;
    }
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
