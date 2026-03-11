<script lang="ts">
  import type { Droits, Invitation } from '../gestionContributeurs.d';
  import { enDroitsSurRubrique } from '../gestionContributeurs.d';
  import { store } from '../gestionContributeurs.store';
  import ChampAvecSuggestions, {
    type Contributeur,
  } from '../kit/ChampAvecSuggestions.svelte';
  import PersonnalisationDroits from '../personnalisation/PersonnalisationDroits.svelte';
  import ListeInvitations from './ListeInvitations.svelte';
  import * as api from './invitation.api';
  import BoutonsActions from './BoutonsActions.svelte';
  import EnvoiEnCours from './EnvoiEnCours.svelte';
  import Rapport from './Rapport.svelte';
  import { contributeursRechercheVisiteGuidee } from '../modeVisiteGuidee/donneesVisiteGuidee';
  import { toasterStore } from '../../ui/stores/toaster.store';

  interface Props {
    modeVisiteGuidee: boolean;
  }

  let { modeVisiteGuidee }: Props = $props();

  type Etape = 'Ajout' | 'Personnalisation' | 'EnvoiEnCours' | 'Rapport';
  type Email = string;

  let invitations: Record<Email, Invitation> = $state({});
  let etapeCourante: Etape = $state('Ajout');
  let enPersonnalisation: Contributeur | undefined = $state();
  const aPersonnaliser = () => ({
    utilisateur: enPersonnalisation!,
    droits: invitations[enPersonnalisation!.email].droits,
  });
  const personnaliseLesDroitsInvite = (personnalises: Droits) => {
    personnalises.estProprietaire = false;
    invitations[enPersonnalisation!.email].droits = personnalises;
    invitations = invitations;
  };

  let services = $derived($store.services);
  let afficheLesBoutonsAction = $derived(
    $store.etapeCourante === 'InvitationContributeurs'
  );

  const ajouteInvitation = (contributeur: Contributeur) => {
    store.navigation.afficheEtapeInvitation();

    const memesEmails = (email1: string, email2: string) =>
      email1.localeCompare(email2, 'fr', { sensitivity: 'accent' }) === 0;

    const dejaInvite = Object.values(invitations).find((i) =>
      memesEmails(i.utilisateur.email, contributeur.email)
    );

    if (!dejaInvite)
      invitations = {
        ...invitations,
        [contributeur.email]: {
          utilisateur: contributeur,
          droits: enDroitsSurRubrique('ECRITURE'),
        },
      };
  };

  const supprimeInvitation = ({ email }: Contributeur) => {
    delete invitations[email];
    invitations = invitations;
  };

  const envoiInvitation = async () => {
    etapeCourante = 'EnvoiEnCours';
    await api.envoieInvitations(Object.values(invitations), services);
    invitations = {};
    etapeCourante = 'Rapport';
    toasterStore.succes('Succès', "Un e-mail d'invitation a bien été envoyé");
    document.body.dispatchEvent(
      new CustomEvent('collaboratif-service-modifie')
    );
  };
</script>

{#if etapeCourante === 'Ajout'}
  <form class="conteneur-formulaire" onsubmit={(e) => e.preventDefault()}>
    <label for="email-invitation-collaboration">
      Ajouter un ou plusieurs contributeurs
      {#if modeVisiteGuidee}
        <ChampAvecSuggestions
          id="email-invitation-collaboration"
          callbackDeRecherche={async () => contributeursRechercheVisiteGuidee}
          valeurInitiale="Fréd"
          modeVisiteGuidee={true}
        />
      {:else}
        <ChampAvecSuggestions
          id="email-invitation-collaboration"
          callbackDeRecherche={api.rechercheContributeurs}
          onContributeurChoisi={ajouteInvitation}
        />
      {/if}
    </label>
    <ListeInvitations
      invitations={Object.values(invitations)}
      onDroitsChange={(nouveauxDroits) => {
        invitations[nouveauxDroits.utilisateur.email].droits =
          nouveauxDroits.droits;
        invitations = invitations;
      }}
      onChoixPersonnalisation={(utilisateur) => {
        enPersonnalisation = utilisateur;
        etapeCourante = 'Personnalisation';
      }}
      onSupprimerInvitation={(aSupprimer) => supprimeInvitation(aSupprimer)}
    />
    {#if afficheLesBoutonsAction}
      <BoutonsActions
        afficherBoutonEnvoyer={Object.values(invitations).length > 0}
        onAnnuler={() => {
          invitations = {};
          store.navigation.afficheEtapeListe();
        }}
        onEnvoyer={() => envoiInvitation()}
      />
    {/if}
  </form>
{:else if etapeCourante === 'Personnalisation'}
  <PersonnalisationDroits
    utilisateur={aPersonnaliser().utilisateur}
    droitsOriginaux={aPersonnaliser().droits}
    onAnnuler={() => {
      enPersonnalisation = undefined;
      etapeCourante = 'Ajout';
    }}
    onValider={(droits) => {
      personnaliseLesDroitsInvite(droits);
      etapeCourante = 'Ajout';
    }}
  />
{:else if etapeCourante === 'EnvoiEnCours'}
  <EnvoiEnCours />
{:else if etapeCourante === 'Rapport'}
  <Rapport />
{/if}
