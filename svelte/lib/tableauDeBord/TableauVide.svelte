<script lang="ts">
  import Lien from '../ui/Lien.svelte';
  import Bouton from '../ui/Bouton.svelte';
  import { affichageTableauVide } from './stores/affichageTableauVide';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';

  const supprimeRechercheEtFiltres = () => {
    $rechercheTextuelle = '';
  };
</script>

<div class="conteneur-tableau-vide">
  {#if $affichageTableauVide.etat === 'aucunService'}
    <div class="aucun-service">
      <h4>Laissez vous guider !</h4>
      <p>
        Nous vous accompagnons sur toutes les étapes de sécurisation de votre
        service numérique.
      </p>
      <Lien
        titre="Ajouter votre premier service"
        type="bouton-primaire"
        icone="plus"
        href="/service/creation"
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
  {/if}
</div>

<style>
  .conteneur-tableau-vide {
    border: 1px solid #ddd;
  }

  .aucun-resultat {
    padding: 36px 0;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: column;
    color: var(--texte-clair);
  }

  .aucun-resultat img {
    max-width: 128px;
  }

  .aucun-service {
    margin: 59px auto 47px;
    text-align: center;
    align-items: center;
    display: flex;
    gap: 8px;
    width: 389px;
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
  }
</style>
