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
<div class="tableau-de-bord">
  <span class="entete-tableau-de-bord">
    <h1>Mon tableau de bord</h1>
    {#if estSuperviseur}
      <span class="lien-supervision"
        ><a href="/supervision">Voir les statistiques</a></span
      >
    {/if}
  </span>

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
  }

  .entete-tableau-de-bord {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .lien-supervision a {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .lien-supervision a::before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    background-size: contain;
    background: url('/statique/assets/images/tableauDeBord/icone_graphique.svg')
      no-repeat center;
  }

  .lien-supervision a:hover {
    background: #f5f5f5;
  }

  .lien-supervision a:active {
    background: var(--fond-gris-pale-composant);
    color: var(--systeme-design-etat-bleu);
  }

  .lien-supervision a:active::before {
    filter: brightness(0) invert(8%) sepia(52%) saturate(5373%)
      hue-rotate(237deg) brightness(125%) contrast(140%);
  }
</style>
