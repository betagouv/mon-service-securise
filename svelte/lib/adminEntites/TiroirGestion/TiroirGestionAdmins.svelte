<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import ListeAdmins from './ListeAdmins.svelte';
  import CartoucheAdmin from './CartoucheAdmin.svelte';
  import SaisieEmailAdmin from './SaisieEmailAdmin.svelte';
  import type { EntiteSupervisee } from '../adminEntites.types';
  import { untrack } from 'svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import { api } from '../adminEntites.api';
  import { SvelteSet } from 'svelte/reactivity';

  interface Props {
    entite: EntiteSupervisee;
  }

  let { entite }: Props = $props();
  export const titre: string = `Gestion des admins de ${untrack(() => entite.nom)}`;
  export const sousTitre: string =
    'Invitez et gérez les administrateurs de votre entité';

  let etatAffichage: 'LISTE' | 'INVITATION' = $state('LISTE');
  const listeAdminsAInviter: SvelteSet<string> = new SvelteSet<string>();

  const inviteAdmin = (email: string) => {
    etatAffichage = 'INVITATION';
    listeAdminsAInviter.add(email);
  };

  const retourModeListe = () => {
    etatAffichage = 'LISTE';
    listeAdminsAInviter.clear();
  };

  const envoieInvitations = async () => {
    await api.envoieInvitations([...listeAdminsAInviter], entite.siret);
    toasterStore.succes(
      'Invitation envoyée',
      `${listeAdminsAInviter.size} administrateur(s) nommé(s) sur l'entité ${entite.nom}`
    );
    document.dispatchEvent(new CustomEvent('admins-entites-modifiees'));
    tiroirStore.ferme();
  };
</script>

<ContenuTiroir>
  <SaisieEmailAdmin onemailvalide={inviteAdmin} />

  <div class="conteneur-admins">
    {#if etatAffichage === 'LISTE'}
      <ListeAdmins administrateurs={entite.administrateurs} />
    {:else}
      <div class="conteneur-cartouches">
        {#each listeAdminsAInviter as emailAdmin, i (i)}
          <CartoucheAdmin prenomNom={emailAdmin} />
        {/each}
      </div>
    {/if}
  </div>
</ContenuTiroir>
{#if etatAffichage === 'INVITATION'}
  <ActionsTiroir>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Annuler"
      onclick={() => retourModeListe()}
      kind="tertiary-no-outline"
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Envoyer une invitation"
      onclick={() => envoieInvitations()}
      kind="primary"
      hasIcon
      icon="send-plane-line"
    ></dsfr-button>
  </ActionsTiroir>
{/if}

<style>
  .conteneur-admins {
    .conteneur-cartouches {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
</style>
