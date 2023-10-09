<script lang="ts">
  import type {
    Permission,
    Rubrique,
    Utilisateur,
  } from '../gestionContributeurs.d';
  import { enDroitsSurRubrique } from '../gestionContributeurs.d';
  import { store } from '../gestionContributeurs.store';
  import ChampAvecSuggestions from '../kit/ChampAvecSuggestions.svelte';
  import PersonnalisationDroits from '../personnalisation/PersonnalisationDroits.svelte';
  import ListeInvitations from './ListeInvitations.svelte';
  import * as api from './invitation.api';

  type Etape = 'Ajout' | 'Personnalisation' | 'EnvoiEnCours' | 'Rapport';
  type Email = string;
  type Invitation = {
    utilisateur: Utilisateur;
    droits: Record<Rubrique, Permission>;
  };

  let invitations: Record<Email, Invitation> = {};
  let etapeCourante: Etape = 'Ajout';
  let enPersonnalisation: Utilisateur | null;
  const aPersonnaliser = () => ({
    utilisateur: enPersonnalisation!,
    droits: invitations[enPersonnalisation!.email].droits,
  });
  const personnaliseLesDroitsInvite = (
    personnalises: Record<Rubrique, Permission>
  ) => {
    invitations[enPersonnalisation!.email].droits = personnalises;
    invitations = invitations;
  };

  $: services = $store.services;
  $: afficheLesBoutonsAction =
    $store.etapeCourante === 'InvitationContributeurs';

  const ajouteInvitation = (evenement: CustomEvent<Utilisateur>) => {
    store.navigation.afficheEtapeInvitation();

    const memesEmails = (email1: string, email2: string) =>
      email1.localeCompare(email2, 'fr', { sensitivity: 'accent' }) === 0;

    const dejaInvite = Object.values(invitations).find((i) =>
      memesEmails(i.utilisateur.email, evenement.detail.email)
    );

    if (!dejaInvite)
      invitations = {
        ...invitations,
        [evenement.detail.email]: {
          utilisateur: evenement.detail,
          droits: enDroitsSurRubrique('ECRITURE'),
        },
      };
  };

  const supprimeInvitation = ({ id }: Utilisateur) => {
    delete invitations[id];
    invitations = invitations;
  };

  const envoiInvitation = async () => {
    etapeCourante = 'EnvoiEnCours';
    await api.envoieInvitations(Object.values(invitations), services);
    invitations = {};
    etapeCourante = 'Rapport';
    document.body.dispatchEvent(new CustomEvent('jquery-recharge-services'));
  };
</script>

{#if etapeCourante === 'Ajout'}
  <form class="conteneur-formulaire" on:submit|preventDefault>
    <label for="email-invitation-collaboration">
      Ajouter un ou plusieurs contributeurs
      <ChampAvecSuggestions
        callbackDeRecherche={api.rechercheContributeurs}
        on:contributeurChoisi={ajouteInvitation}
      />
      <ListeInvitations
        invitations={Object.values(invitations)}
        on:droitsChange={({ detail: nouveauxDroits }) => {
          invitations[nouveauxDroits.utilisateur.email].droits =
            nouveauxDroits.droits;
          invitations = invitations;
        }}
        on:choixPersonnalisation={({ detail: utilisateur }) => {
          enPersonnalisation = utilisateur;
          etapeCourante = 'Personnalisation';
        }}
        on:supprimerInvitation={({ detail: aSupprimer }) =>
          supprimeInvitation(aSupprimer)}
      />
    </label>
    {#if afficheLesBoutonsAction}
      <div class="conteneur-actions">
        <button
          class="bouton bouton-secondaire fermeture-tiroir"
          type="button"
          on:click={() => {
            invitations = {};
            store.navigation.afficheEtapeListe();
          }}
        >
          Annuler
        </button>
        {#if Object.values(invitations).length}
          <button
            class="bouton"
            id="action-invitation"
            type="button"
            on:click={() => envoiInvitation()}
          >
            Envoyer une invitation
          </button>
        {/if}
      </div>
    {/if}
  </form>
{:else if etapeCourante === 'Personnalisation'}
  <PersonnalisationDroits
    utilisateur={aPersonnaliser().utilisateur}
    droitsOriginaux={aPersonnaliser().droits}
    on:annuler={() => {
      enPersonnalisation = null;
      etapeCourante = 'Ajout';
    }}
    on:valider={({ detail: personnalises }) => {
      personnaliseLesDroitsInvite(personnalises);
      etapeCourante = 'Ajout';
    }}
  />
{:else if etapeCourante === 'EnvoiEnCours'}
  <div class="conteneur-loader">
    <div class="icone-chargement"></div>
    <div class="titre-loader">Envoi en cours...</div>
    <div class="info-loader">Merci de ne pas rafraîchir la page</div>
  </div>
{:else if etapeCourante === 'Rapport'}
  <div class="conteneur-rapport">
    <img
      src="/statique/assets/images/image_succes_invitation.svg"
      alt="Icône envoi email"
    />
    <p>Un e-mail d'invitation a bien été envoyé.</p>
  </div>
{/if}
