<script lang="ts">
  import { api } from '../adminEntites.api';

  interface Props {
    onemailvalide: (email: string) => void;
  }

  let { onemailvalide }: Props = $props();

  let nouvelAdmin = $state('');
  let emailValide = $state(true);

  const metAJourEmail = (email: string) => {
    nouvelAdmin = email;
    emailValide = true;
  };

  const valide = async () => {
    emailValide = (await api.verifieEmail(nouvelAdmin)).existe;
    if (!emailValide) return;

    onemailvalide(nouvelAdmin);
    nouvelAdmin = '';
  };
</script>

<div class="conteneur-saisie">
  <dsfr-input
    id="ajout-email-admin"
    value={nouvelAdmin}
    onvaluechanged={(e: CustomEvent<string>) => metAJourEmail(e.detail)}
    type="email"
    label="Ajouter un administrateur"
    hint="Vous pouvez ajouter un administrateur via son adresse e-mail."
    status={emailValide ? 'info' : 'error'}
    infoMessage="L’utilisateur doit déjà disposer d’un compte sur MonServiceSécurisé ; dans le cas contraire, il ne pourra pas être ajouté en tant qu’administrateur."
  ></dsfr-input>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button
    title="Ajouter cet admin à la liste à inviter"
    label="Ajouter cet admin"
    size="md"
    has-icon
    icon="add-line"
    icon-place="only"
    disabled={nouvelAdmin.length === 0}
    onclick={async () => await valide()}
  ></dsfr-button>
</div>

<style lang="scss">
  .conteneur-saisie {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
