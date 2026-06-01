<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ListeAdmins from './ListeAdmins.svelte';
  import CartoucheAdmin from './CartoucheAdmin.svelte';
  import SaisieEmailAdmin from './SaisieEmailAdmin.svelte';
  import ActionsSurInvitation from './ActionsSurInvitation.svelte';
  import ActionsSurConfirmationSuppression from './ActionsSurConfirmationSuppression.svelte';
  import type { AdminSupervise, EntiteSupervisee } from '../adminEntites.types';
  import { untrack } from 'svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import { api } from '../adminEntites.api';
  import { SvelteSet } from 'svelte/reactivity';
  import AucunAdmin from './AucunAdmin.svelte';
  import ConfirmationSuppression from './ConfirmationSuppression.svelte';
  import type { AxiosError } from 'axios';

  interface Props {
    entite: EntiteSupervisee;
  }

  let { entite }: Props = $props();
  export const titre: string = `Gestion des admins de ${untrack(() => entite.nom)}`;
  export const sousTitre: string =
    'Invitez et gérez les administrateurs de votre entité';

  let etatAffichage: 'LISTE' | 'INVITATION' | 'CONFIRMATION_SUPPRESSION' =
    $state('LISTE');

  const listeAdminsAInviter: SvelteSet<string> = new SvelteSet<string>();
  let adminPourSuppression: AdminSupervise | undefined = $state();

  const invitation = {
    ajouter: (email: string) => {
      etatAffichage = 'INVITATION';
      listeAdminsAInviter.add(email);
    },
    retirer: (email: string) => {
      listeAdminsAInviter.delete(email);
      if (listeAdminsAInviter.size === 0) etatAffichage = 'LISTE';
    },
    annuler: () => {
      etatAffichage = 'LISTE';
      listeAdminsAInviter.clear();
    },
    envoyer: async () => {
      await api.envoieInvitations([...listeAdminsAInviter], entite.siret);
      toasterStore.succes(
        'Invitation envoyée',
        `${listeAdminsAInviter.size} administrateur(s) nommé(s) sur l'entité ${entite.nom}`
      );
      document.dispatchEvent(new CustomEvent('admins-entites-modifiees'));
      tiroirStore.ferme();
    },
  };

  const suppression = {
    demanderConfirmation: (admin: AdminSupervise) => {
      adminPourSuppression = admin;
      etatAffichage = 'CONFIRMATION_SUPPRESSION';
    },
    annuler: () => {
      adminPourSuppression = undefined;
      etatAffichage = 'LISTE';
    },
    valider: async () => {
      try {
        await api.supprimeAdmin(adminPourSuppression!, entite.siret);
        etatAffichage = 'LISTE';
        toasterStore.succes(
          'Admin supprimé avec succès',
          `L'administrateur a bien été supprimé de l'entité ${entite.nom}`
        );
        document.dispatchEvent(new CustomEvent('admins-entites-modifiees'));
        tiroirStore.ferme();
      } catch (e) {
        const erreurAxios = e as AxiosError;
        if (erreurAxios?.response?.status === 422) {
          toasterStore.erreur(
            "Impossible de supprimer l'admin",
            `L'administrateur est seul contributeur d'un service de ${entite.nom} : il ne peut pas être supprimé`
          );
          etatAffichage = 'LISTE';
        }
      }
    },
  };
</script>

<ContenuTiroir>
  {#if etatAffichage === 'LISTE' || etatAffichage === 'INVITATION'}
    <SaisieEmailAdmin onemailvalide={invitation.ajouter} />

    <div class="conteneur-admins">
      {#if etatAffichage === 'LISTE'}
        <hr />
        <h3>Administrateurs de l’entité</h3>
        <span class="sous-titre">
          Consultez la liste des utilisateurs disposant des droits admins.
        </span>
        {#if entite.administrateurs.length === 0}
          <AucunAdmin />
        {:else}
          <ListeAdmins
            administrateurs={entite.administrateurs}
            onsupprimer={suppression.demanderConfirmation}
          />
        {/if}
      {/if}

      {#if etatAffichage === 'INVITATION'}
        <div class="conteneur-cartouches">
          {#each listeAdminsAInviter as emailAdmin, i (i)}
            <CartoucheAdmin
              prenomNom={emailAdmin}
              onsupprimer={() => invitation.retirer(emailAdmin)}
            />
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  {#if etatAffichage === 'CONFIRMATION_SUPPRESSION'}
    <ConfirmationSuppression admin={adminPourSuppression!} />
  {/if}
</ContenuTiroir>

{#if etatAffichage === 'INVITATION'}
  <ActionsSurInvitation
    onannuler={invitation.annuler}
    onvalider={invitation.envoyer}
  />
{/if}
{#if etatAffichage === 'CONFIRMATION_SUPPRESSION'}
  <ActionsSurConfirmationSuppression
    onannuler={suppression.annuler}
    onvalider={suppression.valider}
  />
{/if}

<style>
  .conteneur-admins {
    .conteneur-cartouches {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

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
  }
</style>
