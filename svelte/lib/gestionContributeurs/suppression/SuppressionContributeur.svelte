<script lang="ts">
  import type { Utilisateur } from '../gestionContributeurs.d';
  import { store } from '../gestionContributeurs.store';
  import { toasterStore } from '../../ui/stores/toaster.store';

  let service = $derived($store.services[0]);
  let utilisateur = $derived(
    $store.utilisateurEnCoursDeSuppression as Utilisateur
  );

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
    Souhaitez-vous vraiment retirer les accès de {utilisateur.prenomNom} au service
    <strong>{service.nomService}</strong> ?
  </p>
  <div class="conteneur-actions">
    <button
      class="bouton bouton-secondaire"
      type="button"
      onclick={() => store.navigation.afficheEtapeListe()}
    >
      Annuler
    </button>
    <button
      class="bouton confirmation-suppression"
      type="button"
      onclick={supprimeContributeur}
    >
      Retirer du service
    </button>
  </div>
</div>
