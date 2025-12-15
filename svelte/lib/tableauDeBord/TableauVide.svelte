<script lang="ts">
  import Bouton from '../ui/Bouton.svelte';
  import { affichageTableauVide } from './stores/affichageTableauVide';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import {
    filtrageServices,
    filtrageServicesVide,
  } from './stores/filtrageServices.store';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirTeleversementServices from './televersementServices/TiroirTeleversementServices.svelte';
  import BoutonAvecListeDeroulante, {
    type OptionBoutonListeDeroulante,
  } from '../ui/BoutonAvecListeDeroulante.svelte';
  import TiroirTeleversementServicesV2 from './televersementServices/TiroirTeleversementServicesV2.svelte';

  export let avecDecrireV2: boolean;

  const supprimeRechercheEtFiltres = () => {
    $rechercheTextuelle = '';
    $filtrageServices = { ...filtrageServicesVide };
  };

  const boutonsDisponiblesV1: OptionBoutonListeDeroulante[] = [
    {
      label: 'Ajouter un service',
      icone: 'plus',
      href: '/service/creation',
    },
    {
      label: 'Téléverser des services',
      icone: 'televerser',
      action: () => tiroirStore.afficheContenu(TiroirTeleversementServices, {}),
    },
  ];

  const boutonsDisponiblesV2: OptionBoutonListeDeroulante[] = [
    {
      label: 'Ajouter un service',
      icone: 'plus',
      href: '/service/v2/creation',
    },
    {
      label: 'Téléverser des services',
      icone: 'televerser',
      action: () =>
        tiroirStore.afficheContenu(TiroirTeleversementServicesV2, {}),
    },
  ];
</script>

<div class="conteneur-tableau-vide">
  {#if $affichageTableauVide.etat === 'aucunService'}
    <div class="aucun-service">
      <h4>Laissez vous guider !</h4>
      <p>
        Nous vous accompagnons sur toutes les étapes de sécurisation de votre
        service numérique.
      </p>
      <BoutonAvecListeDeroulante
        titre="Ajouter votre premier service"
        options={avecDecrireV2 ? boutonsDisponiblesV2 : boutonsDisponiblesV1}
      />
    </div>
  {:else if $affichageTableauVide.etat === 'aucunResultatDeRecherche'}
    <div class="aucun-resultat">
      <img
        src="/statique/assets/images/illustration_recherche_vide.svg"
        alt=""
      />
      Aucun service ne correspond à la recherche.
      <Bouton
        titre="Effacer la recherche"
        type="secondaire"
        icone="rafraichir"
        on:click={supprimeRechercheEtFiltres}
      />
    </div>
  {:else if $affichageTableauVide.etat === 'aucunDossierHomologationEnCours'}
    <div class="aucun-dossier-en-cours">
      <img src="/statique/assets/images/dossiers.png" alt="" />
      Aucune homologation en cours
    </div>
  {:else if $affichageTableauVide.etat === 'aucunDossierHomologationBientotExpiree'}
    <div class="aucun-dossier-en-cours">
      <img src="/statique/assets/images/dossiers.png" alt="" />
      Aucune homologation bientôt expirée
    </div>
  {:else if $affichageTableauVide.etat === 'aucunDossierHomologationExpiree'}
    <div class="aucun-dossier-en-cours">
      <img src="/statique/assets/images/dossiers.png" alt="" />
      Aucune homologation expirée
    </div>
  {/if}
</div>

<style>
  .conteneur-tableau-vide {
    position: relative;
    z-index: 2;
  }

  .conteneur-tableau-vide:after {
    background-image: linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd), linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd);
    background-position:
      0 0,
      100% 0,
      0 0,
      0 100%;
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
    background-size:
      1px 100%,
      1px 100%,
      100% 1px,
      100% 1px;
    height: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
    z-index: 2;
    content: '';
  }

  .aucun-resultat,
  .aucun-dossier-en-cours {
    padding: 36px 0;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: column;
    color: var(--texte-clair);
  }

  .aucun-resultat img,
  .aucun-dossier-en-cours img {
    max-width: 128px;
  }

  .aucun-service {
    padding: 36px 0;
    text-align: center;
    align-items: center;
    display: flex;
    gap: 8px;
    flex-direction: column;
  }

  .aucun-service h4 {
    margin: 0;
    padding: 0;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: bold;
  }

  .aucun-service p {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: var(--texte-gris);
    margin: 0 0 8px;
    max-width: 389px;
  }
</style>
