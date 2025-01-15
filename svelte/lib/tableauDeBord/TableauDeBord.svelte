<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    ReponseApiServices,
    ReponseApiIndicesCyber,
    IndiceCyberMoyen,
  } from './tableauDeBord.d';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';
  import TableauDesServices from './TableauDesServices.svelte';
  import BandeauInfo from './BandeauInfo.svelte';
  import { donneesVisiteGuidee } from './tableauDeBord';
  import { services } from './stores/services.store';
  import BandeauFiltres from './BandeauFiltres.svelte';
  import BandeauBlog from './BandeauBlog.svelte';
  import { selectionIdsServices } from './stores/selectionService.store';
  import Toaster from '../ui/Toaster.svelte';
  import Bouton from '../ui/Bouton.svelte';

  export let estSuperviseur: boolean;
  export let modeVisiteGuidee: boolean;
  export let dateInscriptionUtilisateur: Date;
  export let profilUtilisateurComplet: boolean = true;

  let enCoursChargement = true;

  let nombreServices: number;
  let nombreServicesHomologues: number;
  let nombreHomologationsExpirees: number;
  let indiceCyberMoyen: IndiceCyberMoyen | undefined;

  onMount(async () => {
    if (modeVisiteGuidee && profilUtilisateurComplet) {
      services.reinitialise(donneesVisiteGuidee.services);
      nombreServices = donneesVisiteGuidee.resume.nombreServices;
      nombreServicesHomologues =
        donneesVisiteGuidee.resume.nombreServicesHomologues;
      nombreHomologationsExpirees =
        donneesVisiteGuidee.resume.nombreHomologationsExpirees;
      services.ajouteIndicesCyber(donneesVisiteGuidee.indicesCyber);
      indiceCyberMoyen = donneesVisiteGuidee.indiceCyber;
      enCoursChargement = false;
    } else {
      await rafraichisServices();
    }
  });

  const recupereServices = async () => {
    const reponse: ReponseApiServices = (await axios.get('/api/services')).data;
    services.reinitialise(reponse.services);
    selectionIdsServices.vide();
    nombreServices = reponse.resume.nombreServices;
    nombreServicesHomologues = reponse.resume.nombreServicesHomologues;
    nombreHomologationsExpirees = reponse.resume.nombreHomologationsExpirees;
    enCoursChargement = false;
  };

  const recupereIndicesCybers = async () => {
    const reponse: ReponseApiIndicesCyber = (
      await axios.get('/api/services/indices-cyber')
    ).data;
    services.ajouteIndicesCyber(reponse.services);
    indiceCyberMoyen = reponse.resume.indiceCyberMoyen;
  };

  const rafraichisServices = async () => {
    await recupereServices();
    await recupereIndicesCybers();
    document.body.dispatchEvent(
      new CustomEvent('svelte-tableau-des-services-rafraichi')
    );
  };
</script>

<svelte:body
  on:rafraichis-services={rafraichisServices}
  on:collaboratif-service-modifie={rafraichisServices}
/>
<Toaster />
<div class="entete-pdf">
  <h1>Mon tableau de bord</h1>
</div>
<div class="tableau-de-bord">
  <div class="entete-tableau-de-bord">
    <h1>Mon tableau de bord</h1>
    <div class="entete-action">
      <Bouton
        titre="Exporter le tableau de bord en PDF"
        type="lien"
        icone="export"
        taille="petit"
        on:click={() => window.print()}
      />
      {#if estSuperviseur}
        <a href="/supervision" class="lien-supervision">Voir les statistiques</a
        >
      {/if}
    </div>
  </div>

  {#if enCoursChargement}
    <div class="conteneur-loader">
      <ChargementEnCours />
    </div>
  {:else}
    <BandeauInfo
      {nombreServices}
      {nombreServicesHomologues}
      {nombreHomologationsExpirees}
      {indiceCyberMoyen}
    />
    <BandeauFiltres />
    <TableauDesServices />
    <BandeauBlog {dateInscriptionUtilisateur} />
  {/if}
</div>

<style>
  :global(#tableau-de-bord) {
    width: 100%;
    padding: 32px 48px;
    text-align: left;
    background: white;
  }

  .conteneur-loader {
    width: 100%;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    margin: 0;
  }

  .tableau-de-bord {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .entete-tableau-de-bord {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lien-supervision {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 3px 12px;
    border-radius: 4px;
  }

  .lien-supervision::before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    background-size: contain;
    background: url('/statique/assets/images/tableauDeBord/icone_graphique.svg')
      no-repeat center;
  }

  .lien-supervision:hover {
    background: #f5f5f5;
  }

  .lien-supervision:active {
    background: var(--fond-gris-pale-composant);
    color: var(--systeme-design-etat-bleu);
  }

  .lien-supervision:active::before {
    filter: brightness(0) invert(8%) sepia(52%) saturate(5373%)
      hue-rotate(237deg) brightness(125%) contrast(140%);
  }

  .entete-action {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  .entete-pdf {
    display: none;
  }

  @media print {
    @page {
      size: auto;
      margin: 0;
      background: white;
    }

    :global(
        .conteneur-filtres,
        .ligne-onglet,
        .case-conteneur-action,
        .header-droit,
        .entete-tableau-de-bord,
        .contenu-blog,
        #visite-guidee-menu-navigation,
        footer,
        .bom,
        table tr td:first-of-type,
        table tr td:last-of-type,
        table tr th:last-of-type
      ) {
      display: none !important;
    }

    :global(main) {
      border-bottom: none;
    }

    .entete-pdf {
      display: flex;
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }
</style>
