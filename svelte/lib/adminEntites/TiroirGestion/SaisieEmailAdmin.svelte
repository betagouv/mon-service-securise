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

<dsfr-input
  value={nouvelAdmin}
  onvaluechanged={(e: CustomEvent<string>) => metAJourEmail(e.detail)}
  type="email"
  label="Ajouter un administrateur"
  hint="Vous pouvez ajouter un administrateur via son adresse e-mail."
  status={emailValide ? 'info' : 'error'}
  infoMessage="L’utilisateur doit toutefois déjà disposer d’un compte sur MonServiceSécurisé ; dans le cas contraire, il ne pourra pas être ajouté en tant qu’administrateur."
></dsfr-input>
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<dsfr-button
  label="Ajouter cet admin"
  size="sm"
  onclick={async () => await valide()}
></dsfr-button>
