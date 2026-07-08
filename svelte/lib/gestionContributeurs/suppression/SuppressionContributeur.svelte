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
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      kind="secondary"
      onclick={() => store.navigation.afficheEtapeListe()}
      label="Annuler"
    >
    </dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button onclick={supprimeContributeur} label="Retirer du service">
    </dsfr-button>
  </div>
</div>

<style>
  .conteneur-actions {
    display: flex;
    gap: 8px;
    margin-top: 32px;
    justify-content: flex-end;
  }
</style>
