<script lang="ts">
  import type { Utilisateur } from '../gestionContributeurs.d';
  import { store } from '../gestionContributeurs.store';
  import { toasterStore } from '../../ui/stores/toaster.store';

  $: service = $store.services[0];
  $: utilisateur = $store.utilisateurEnCoursDeSuppression as Utilisateur;

  const supprimeContributeur = async () => {
    await axios.delete('/api/autorisation', {
      params: { idService: service.id, idContributeur: utilisateur.id },
    });
    store.contributeurs.supprime(utilisateur);
    toasterStore.succes('Succès', 'Le contributeur a été retiré du service');
    document.body.dispatchEvent(
      new CustomEvent('collaboratif-service-modifie')
    );
    store.navigation.afficheEtapeListe();
  };
</script>

<div class="conteneur-confirmation">
  <p class="entete">
    Souhaitez-vous vraiment retirer les accès de {@html utilisateur.prenomNom} au
    service
    <strong>{@html service.nomService}</strong> ?
  </p>
  <div class="conteneur-actions">
    <button
      class="bouton bouton-secondaire"
      type="button"
      on:click={() => store.navigation.afficheEtapeListe()}
    >
      Annuler
    </button>
    <button
      class="bouton confirmation-suppression"
      type="button"
      on:click={supprimeContributeur}
    >
      Retirer du service
    </button>
  </div>
</div>
