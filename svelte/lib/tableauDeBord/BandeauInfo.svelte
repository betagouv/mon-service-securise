<script lang="ts">
  import type { IndiceCyberMoyen } from './tableauDeBord.d';

  export let nombreServices: number;
  export let nombreServicesHomologues: number;
  export let nombreHomologationsExpirees: number;
  export let indiceCyberMoyen: IndiceCyberMoyen | undefined;
  export let estSuperviseur: boolean;

  $: valeurIndiceCyberMoyen = (): string =>
    indiceCyberMoyen === undefined || indiceCyberMoyen === '-'
      ? '-'
      : new Intl.NumberFormat('fr-FR', { maximumSignificantDigits: 2 }).format(
          indiceCyberMoyen
        );
</script>

<div class="bandeau-cartes-info">
  <div class="carte-info" id="carte-info-nombre-services">
    <span class="contenu-carte">
      <span class="libelle-carte">
        <span class="metrique">{nombreServices}</span> Services enregistrés</span
      >
    </span>
  </div>
  <div class="carte-info" id="carte-info-nombre-services-homologues">
    <span class="contenu-carte">
      <span class="libelle-carte">
        <span class="metrique">{nombreServicesHomologues}</span> Services homologués</span
      >
    </span>
  </div>
  <div class="carte-info" id="carte-info-nombre-services-homologation-expirees">
    <span class="contenu-carte">
      <span class="libelle-carte">
        <span class="metrique">{nombreHomologationsExpirees}</span> Homologations
        expirées</span
      >
    </span>
  </div>
  <div class="carte-info" id="carte-info-indice-cyber-moyen">
    <span class="contenu-carte">
      <span class="libelle-carte">
        <span class="metrique">{valeurIndiceCyberMoyen()}</span> Indice cyber moyen</span
      >
    </span>
  </div>
  {#if estSuperviseur}
    <a class="carte-info" id="carte-superviseur" href="/supervision">
      <span class="contenu-carte">
        <span class="contenu-carte-superviseur">
          <span class="libelle-carte"> Suivre les statistiques </span>
          <img
            src="/statique/assets/images/fleche_gauche_bleue.svg"
            alt="Flèche vers la droite"
          />
        </span>
      </span>
    </a>
  {/if}
</div>

<style>
  .bandeau-cartes-info {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .carte-info {
    gap: 32px;
    padding: 32px;
    border-radius: 10px;
    box-sizing: border-box;
    border: 1px;
    max-width: 280px;
  }

  .contenu-carte::before {
    content: '';
    display: block;
    width: 64px;
    height: 64px;
    background-size: contain;
  }

  #carte-info-nombre-services-homologues .contenu-carte::before {
    background: url('/statique/assets/images/tableauDeBord/icone_nombre_services_homologues.svg')
      no-repeat center;
  }

  #carte-info-nombre-services .contenu-carte::before {
    background: url('/statique/assets/images/tableauDeBord/icone_nombre_services.svg')
      no-repeat center;
  }

  #carte-info-nombre-services-homologation-expirees .contenu-carte::before {
    background: url('/statique/assets/images/tableauDeBord/icone_nombre_homologation_expirees.svg')
      no-repeat center;
  }

  #carte-info-indice-cyber-moyen .contenu-carte::before {
    background: url('/statique/assets/images/tableauDeBord/icone_indice_cyber_moyen.svg')
      no-repeat center;
  }

  #carte-superviseur .contenu-carte::before {
    background: url('/statique/assets/images/tableauDeBord/icone_superviseur.svg')
      no-repeat center;
  }

  #carte-info-nombre-services {
    background-color: #e9ddff;
  }

  #carte-info-nombre-services-homologues {
    background-color: #defbe5;
  }

  #carte-info-nombre-services-homologation-expirees {
    background-color: #feecc2;
  }

  #carte-info-indice-cyber-moyen {
    background-color: #eaf5ff;
  }

  #carte-superviseur {
    border: 1px solid #ddd;
    color: #666666;
    position: relative;
  }

  #carte-superviseur:hover {
    box-shadow: var(--ombre-md);
  }

  .contenu-carte-superviseur img {
    transform: rotate(180deg);
    position: absolute;
    bottom: 24px;
    right: 24px;
  }

  .contenu-carte {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  .libelle-carte {
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .metrique {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.75rem;
  }

  @media screen and (max-width: 1280px) {
    .carte-info {
      padding: 24px;
    }

    .libelle-carte {
      font-size: 0.875rem;
    }

    .libelle-carte .metrique {
      font-size: 1rem;
    }

    .contenu-carte {
      gap: 24px;
    }
  }
</style>
