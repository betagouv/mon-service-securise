<script lang="ts">
  import Bouton from '../ui/Bouton.svelte';
  import { affichageTableauVide } from './stores/affichageTableauVide';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import {
    filtrageServices,
    filtrageServicesVide,
  } from './stores/filtrageServices.store';
  import BoutonAjouterPremierService from '../ui/BoutonAjouterPremierService.svelte';

  const supprimeRechercheEtFiltres = () => {
    $rechercheTextuelle = '';
    $filtrageServices = { ...filtrageServicesVide };
  };
</script>

{#if $affichageTableauVide.etat === 'aucunService'}
  <div class="aucun-service">
    <h4>Laissez vous guider !</h4>
    <p>
      Nous vous accompagnons sur toutes les étapes de sécurisation de votre
      service numérique.
    </p>
    <BoutonAjouterPremierService />
  </div>
{:else if $affichageTableauVide.etat === 'aucunResultatDeRecherche'}
  <div class="aucun-resultat">
    <img src="/statique/assets/images/illustration_recherche_vide.svg" alt="" />
    Aucun service ne correspond à la recherche.
    <Bouton
      titre="Effacer la recherche"
      type="secondaire"
      icone="rafraichir"
      onclick={supprimeRechercheEtFiltres}
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

<style>
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
