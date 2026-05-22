<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import ListeAdmins from './ListeAdmins.svelte';
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
  let nouvelAdmin = $state('');
  const listeAdminsAInviter: SvelteSet<string> = new SvelteSet<string>();

  const inviteAdmin = () => {
    etatAffichage = 'INVITATION';
    listeAdminsAInviter.add(nouvelAdmin);
    nouvelAdmin = '';
  };

  const retourModeListe = () => {
    etatAffichage = 'LISTE';
    listeAdminsAInviter.clear();
    nouvelAdmin = '';
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
  <dsfr-input
    value={nouvelAdmin}
    onvaluechanged={(e: CustomEvent<string>) => (nouvelAdmin = e.detail)}
    type="email"
    label="Ajouter un administrateur"
    hint="Vous pouvez ajouter un administrateur via son adresse e-mail."
    status="info"
    infoMessage="L’utilisateur doit toutefois déjà disposer d’un compte sur MonServiceSécurisé ; dans le cas contraire, il ne pourra pas être ajouté en tant qu’administrateur."
  ></dsfr-input>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button label="Nommer admin" size="sm" onclick={() => inviteAdmin()}
  ></dsfr-button>

  <div class="conteneur-admins">
    {#if etatAffichage === 'LISTE'}
      <ListeAdmins administrateurs={entite.administrateurs} />
    {:else}
      <div class="conteneur-cartouches">
        {#each listeAdminsAInviter as emailAdmin, i (i)}
          <div class="cartouche-admin">
            <div class="identite">
              <span class="nom-prenom">{emailAdmin}</span>
            </div>
          </div>
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

      .cartouche-admin {
        padding: 24px;
        border: 1px solid #dddddd;
        border-radius: 8px;
        display: flex;
        gap: 16px;
        align-items: center;

        .identite {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .nom-prenom {
            font-size: 1rem;
            line-height: 1.5rem;
            color: #3a3a3a;
          }
        }
      }
    }
  }
</style>
