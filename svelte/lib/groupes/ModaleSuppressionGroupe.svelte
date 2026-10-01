<script lang="ts">
  import { toasterStore } from '../ui/stores/toaster.store';
  import { api } from './groupes.api';
  import type { Groupe } from './groupes.d';

  interface Props {
    groupe: Groupe | null;
    onSupprimee: (idGroupe: string) => void;
    onFerme: () => void;
  }

  let { groupe, onSupprimee, onFerme }: Props = $props();

  let enCours = $state(false);

  const supprime = async () => {
    if (!groupe) return;

    enCours = true;
    try {
      await api.supprimeGroupe(groupe.id);
      onSupprimee(groupe.id);
      toasterStore.succes('Succès', 'Le groupe a été supprimé.');
      onFerme();
    } catch {
      toasterStore.erreur(
        'Erreur',
        "Le groupe n'a pas pu être supprimé, veuillez réessayer."
      );
    } finally {
      enCours = false;
    }
  };
</script>

<dsfr-modal
  id="modale-suppression-groupe"
  has-footer
  opened={groupe !== null}
  title="Êtes-vous sûr·e de vouloir supprimer le groupe «&nbsp;{groupe?.libelle}&nbsp;»&nbsp;?"
  onclose={onFerme}
>
  <div>
    <p>
      Les services qui ne sont classés dans aucun autre groupe seront
      automatiquement déplacés dans «&nbsp;Sans groupe&nbsp;».
    </p>
  </div>
  <div slot="footer" class="conteneur-actions-modale">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Annuler"
      kind="secondary"
      size="md"
      type="button"
      onclick={onFerme}
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Supprimer le groupe"
      kind="primary"
      size="md"
      type="button"
      disabled={enCours}
      onclick={supprime}
    ></dsfr-button>
  </div>
</dsfr-modal>

<style lang="scss">
  p {
    color: #161616;
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
  }

  .conteneur-actions-modale {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }
</style>
