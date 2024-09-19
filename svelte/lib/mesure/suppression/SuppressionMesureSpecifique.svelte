<script lang="ts">
  import { store } from '../mesure.store';
  import { supprimeMesureSpecifique } from '../mesure.api';

  export let idService: string;

  let enCoursEnvoi = false;
  const supprimeMesure = async () => {
    enCoursEnvoi = true;
    await supprimeMesureSpecifique(idService, $store.mesureEditee.mesure.id);
    enCoursEnvoi = false;
    document.body.dispatchEvent(
      new CustomEvent('mesure-modifiee', {
        detail: { sourceDeModification: 'tiroir' },
      })
    );
  };
</script>

<p class="introduction">Souhaitez-vous vraiment supprimer cette mesure ?</p>
<div class="banniere-information">
  <img
    src="/statique/assets/images/icone_danger_bleu.svg"
    alt="Avertissement de danger - Suppression"
  />
  <div class="contenu-texte-information">
    <strong>Cette action est irréversible</strong>
    <p>
      Les données seront définitivement effacées. Les contributeurs n'auront
      plus accès à cette mesure.
    </p>
  </div>
</div>
<div class="conteneur-actions">
  <button
    class="bouton bouton-secondaire"
    on:click={store.afficheEtapeEditionSpecifique}
    >Annuler
  </button>
  <button
    class="bouton"
    class:en-cours-chargement={enCoursEnvoi}
    disabled={enCoursEnvoi}
    on:click={supprimeMesure}
  >
    Confirmer la suppression
  </button>
</div>

<style>
  .introduction {
    margin-top: 0;
  }

  .conteneur-actions {
    display: flex;
    flex-direction: row;
    justify-content: end;
    margin-top: 40px;
  }
</style>
