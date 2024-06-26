<script lang="ts">
  import IndicateurEtape from './IndicateurEtape.svelte';
  import type {
    EtapeVisiteGuidee,
    ConfigurationIndicateurEtape,
  } from '../visiteGuidee.d';
  import { visiteGuidee } from '../visiteGuidee.store';
  import { metsEnPause, reprends } from '../visiteGuidee.api';

  export let nombreEtapesRestantes: number;
  export let etapeCourante: EtapeVisiteGuidee;
  export let etapesVues: EtapeVisiteGuidee[] = [];
  export let enPause: boolean;

  let menuOuvert: boolean = false;

  $: doitMontrerNombre = !menuOuvert;

  const ouvreMenu = () => {
    menuOuvert = true;
    visiteGuidee.masqueModale();
  };

  const fermeMenu = async () => {
    if (enPause) {
      menuOuvert = false;
    } else {
      await metsEnPause();
      window.location.href = '/tableauDeBord';
    }
  };

  const configuration: ConfigurationIndicateurEtape = {
    etapes: [
      {
        titre: 'Décrivez',
        id: 'DECRIRE',
        icone: '/statique/assets/images/actionsSaisie/descriptionService.svg',
        lien: '/visiteGuidee/decrire',
      },
      {
        titre: 'Sécurisez',
        id: 'SECURISER',
        icone: '/statique/assets/images/actionsSaisie/mesures.svg',
        lien: '/visiteGuidee/securiser',
      },
      {
        titre: 'Homologuez',
        id: 'HOMOLOGUER',
        icone: '/statique/assets/images/actionsSaisie/dossiers.svg',
        lien: '/visiteGuidee/homologuer',
      },
      {
        titre: 'Pilotez vos services',
        id: 'PILOTER',
        icone: '/statique/assets/images/actionsSaisie/piloter.svg',
        lien: '/visiteGuidee/piloter',
      },
    ],
  };

  const etapeSuivante = configuration.etapes.filter(
    (etape) => !etapesVues.includes(etape.id)
  )[0];
  const continuerVisite = async () => {
    if (etapeSuivante) {
      await reprends();
      window.location.href = etapeSuivante.lien || '';
    }
  };

  const gereRepriseVisiteGuidee = async (e: MouseEvent) => {
    if (!enPause) return;

    e.preventDefault();
    if (!e.target) return;

    const cible = (e.target as HTMLElement).closest('a')?.href;
    if (!cible) return;

    await reprends();
    window.location.href = cible;
  };
</script>

<div class="conteneur-menu-navigation">
  {#if menuOuvert}
    <div class="conteneur-indicateurs-etape">
      <h2>Bienvenue dans <br />MonServiceSécurisé</h2>
      <p class="decouvrir-outil">Découvrons l’outil ensemble.</p>
      <IndicateurEtape
        {etapeCourante}
        {etapesVues}
        {configuration}
        on:click={gereRepriseVisiteGuidee}
      />
      <div class="conteneur-actions">
        <button class="bouton" on:click={async () => await continuerVisite()}
          >Continuer la visite</button
        >
        <button
          class="bouton bouton-tertiaire bouton-fermeture"
          on:click={async () =>
            await visiteGuidee.fermeDefinitivementVisiteGuidee()}
          >Non merci, je le ferai moi même</button
        >
      </div>
    </div>
  {/if}
  <div class="conteneur-bouton-declencheur">
    <button
      class="declencheur-menu-navigation"
      on:click={async () => (menuOuvert ? await fermeMenu() : ouvreMenu())}
    >
      <img
        src={menuOuvert
          ? '/statique/assets/images/icone_fermeture_modale.svg'
          : '/statique/assets/images/icone_liste_a_cocher.svg'}
        alt="Ouverture du menu de navigation de la visite guidée"
      />
      {#if doitMontrerNombre}
        <span class="nombre-etapes-restantes">{nombreEtapesRestantes}</span>
      {/if}
    </button>
  </div>
</div>

<style>
  .conteneur-indicateurs-etape {
    border-radius: 8px;
    background: #ffffff;
    padding: 24px;
    width: fit-content;
    margin-bottom: 16px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
  }

  h2 {
    margin: 0;
    color: var(--bleu-anssi);
  }

  p.decouvrir-outil {
    margin-bottom: 24px;
  }

  .nombre-etapes-restantes {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0 6px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    background: #ca3535;
    border-radius: 9999px;
    border: 1px solid #ffffff;
    transform: translate(40%, -15%);
  }

  .declencheur-menu-navigation {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: white;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
  }

  .conteneur-actions {
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: 10px;
  }

  button {
    margin: 0;
    width: fit-content;
    padding: 8px 16px;
  }

  .bouton-fermeture {
    font-size: 14px;
  }
</style>
