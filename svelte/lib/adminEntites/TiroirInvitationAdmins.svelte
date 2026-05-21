<script lang="ts">
  import ContenuTiroir from '../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../ui/tiroirs/ActionsTiroir.svelte';
  import type { EntiteSupervisee } from './adminEntites.types';
  import { untrack } from 'svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { api } from './adminEntites.api';

  interface Props {
    entite: EntiteSupervisee;
  }

  let { entite }: Props = $props();
  export const titre: string = `Gestion des admins de ${untrack(() => entite.nom)}`;
  export const sousTitre: string =
    'Invitez et gérez les administrateurs de votre entité';

  let etatAffichage: 'LISTE' | 'INVITATION' = $state('LISTE');
  let nouvelAdmin = $state('');
  let listeAdminsAInviter: string[] = $state([]);

  const inviteAdmin = () => {
    etatAffichage = 'INVITATION';
    listeAdminsAInviter.push(nouvelAdmin);
    nouvelAdmin = '';
  };

  const retourModeListe = () => {
    etatAffichage = 'LISTE';
    listeAdminsAInviter = [];
    nouvelAdmin = '';
  };

  const envoieInvitations = async () => {
    await api.envoieInvitations(listeAdminsAInviter, entite.siret);
    toasterStore.succes(
      'Invitation envoyée',
      `${listeAdminsAInviter.length} administrateur(s) nommé(s) sur l'entité ${entite.nom}`
    );
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
  <dsfr-button label="Nommer admin" onclick={() => inviteAdmin()} size="sm"
  ></dsfr-button>

  <div class="conteneur-admins">
    {#if etatAffichage === 'LISTE'}
      <hr />
      <h3>Administrateurs de l’entité</h3>
      <span class="sous-titre"
        >Consultez la liste des utilisateurs disposant des droits admins.</span
      >
      <div class="conteneur-cartouches">
        {#each entite.administrateurs as admin, i (i)}
          <div class="cartouche-admin">
            <div class="initiales"><span>{admin.initiales}</span></div>
            <div class="identite">
              <span class="nom-prenom">{admin.prenomNom}</span>
              <span class="postes">{admin.postes}</span>
            </div>
          </div>
        {/each}
      </div>
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
    <dsfr-button
      label="Annuler"
      onclick={() => retourModeListe()}
      kind="tertiary-no-outline"
    ></dsfr-button>
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
    hr {
      border: none;
      border-top: 1px solid #dddddd;
    }
    h3 {
      font-size: 1rem;
      line-height: 1.5rem;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .sous-titre {
      font-size: 0.75rem;
      line-height: 1.125rem;
      color: #666666;
    }

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

          .postes {
            font-size: 1rem;
            line-height: 1.5rem;
            color: #666666;
          }
        }

        .initiales {
          width: 40px;
          height: 40px;
          background: var(--purple-glycine-925-125);
          border-radius: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          span {
            font-size: 0.875rem;
            line-height: 1.5rem;
            color: var(--purple-glycine-sun-319-moon-630);
          }
        }
      }
    }
  }
</style>
