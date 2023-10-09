<script lang="ts">
  import type {
    Invitation,
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
  import BoutonsActions from './BoutonsActions.svelte';
  import EnvoiEnCours from './EnvoiEnCours.svelte';
  import Rapport from './Rapport.svelte';

  type Etape = 'Ajout' | 'Personnalisation' | 'EnvoiEnCours' | 'Rapport';
  type Email = string;

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

  const supprimeInvitation = ({ email }: Utilisateur) => {
    delete invitations[email];
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
      <BoutonsActions
        afficherBoutonEnvoyer={Object.values(invitations).length > 0}
        on:annuler={() => {
          invitations = {};
          store.navigation.afficheEtapeListe();
        }}
        on:envoyer={() => envoiInvitation()}
      />
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
  <EnvoiEnCours />
{:else if etapeCourante === 'Rapport'}
  <Rapport />
{/if}
