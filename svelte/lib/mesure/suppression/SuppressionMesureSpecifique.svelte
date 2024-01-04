<script lang="ts">
  import { store } from '../mesure.store';
  import { supprimeMesureSpecifique } from '../mesure.api';
  import type { MesuresExistantes } from '../mesure.d';

  export let idService: string;
  export let mesuresExistantes: MesuresExistantes;

  let enCoursEnvoi = false;
  const supprimeMesure = async () => {
    enCoursEnvoi = true;
    await supprimeMesureSpecifique(
      idService,
      mesuresExistantes,
      $store.mesureEditee.metadonnees.idMesure as number
    );
    enCoursEnvoi = false;
    document.body.dispatchEvent(
      new CustomEvent('mesure-modifiee', {
        detail: {
          doitFermerTiroir: true,
        },
      })
    );
  };
</script>

<p class="introduction">Souhaitez-vous vraiment supprimer cette mesure ?</p>
<div class="banniere-information">
  <!-- svelte-ignore a11y-missing-attribute -->
  <img src="/statique/assets/images/icone_danger_bleu.svg" />
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
    on:click={store.afficheEtapeEditionSpecifique}>Annuler</button
  >
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
