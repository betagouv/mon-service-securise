<script lang="ts">
  import type {
    Permission,
    ResumeNiveauDroit,
    Rubrique,
    Utilisateur,
  } from '../gestionContributeurs.d';
  import { enDroitsSurRubrique } from '../gestionContributeurs.d';
  import { store } from '../gestionContributeurs.store';
  import ChampAvecSuggestions from '../kit/ChampAvecSuggestions.svelte';
  import Initiales from '../kit/Initiales.svelte';
  import TagNiveauDroit from '../kit/TagNiveauDroit.svelte';
  import PersonnalisationInvitation from './PersonnalisationInvitation.svelte';

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

  const rechercheContributeurs = async (recherche: string) => {
    const reponse = await axios.get('/api/annuaire/contributeurs', {
      params: { recherche },
    });

    return reponse.data.suggestions;
  };

  const resumeLesDroits = (
    droits: Record<Rubrique, Permission>
  ): ResumeNiveauDroit => {
    if (Object.values(droits).every((p) => p === 1)) return 'LECTURE';
    if (Object.values(droits).every((p) => p === 2)) return 'ECRITURE';
    return 'PERSONNALISE';
  };

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
    await Promise.all(
      Object.values(invitations).map((i) =>
        axios.post('/api/autorisation', {
          emailContributeur: i.utilisateur.email,
          droits: i.droits,
          idServices: services.map((s) => s.id),
        })
      )
    );
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
        callbackDeRecherche={rechercheContributeurs}
        on:contributeurChoisi={ajouteInvitation}
      />
      <ul id="liste-ajout-contributeur">
        {#each Object.values(invitations) as { utilisateur, droits } (utilisateur.email)}
          <li class="contributeur-a-inviter">
            <div class="contenu-nom-prenom">
              <Initiales
                valeur={utilisateur.initiales}
                resumeNiveauDroit={resumeLesDroits(droits)}
              />
              <span>{@html utilisateur.prenomNom}</span>
            </div>
            <div class="conteneur-actions">
              <TagNiveauDroit
                niveau={resumeLesDroits(droits)}
                droitsModifiables={true}
                on:droitsChange={(e) =>
                  (droits = enDroitsSurRubrique(e.detail))}
                on:choixPersonnalisation={() => {
                  enPersonnalisation = utilisateur;
                  etapeCourante = 'Personnalisation';
                }}
              />
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <img
                class="bouton-suppression-contributeur"
                src="/statique/assets/images/icone_supprimer_gris.svg"
                alt="bouton de suppression d'un contributeur"
                on:click={() => supprimeInvitation(utilisateur)}
              />
            </div>
          </li>
        {/each}
      </ul>
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
  <PersonnalisationInvitation
    invite={aPersonnaliser().utilisateur}
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

<style>
  .contributeur-a-inviter {
    display: flex;
    justify-content: space-between;
  }
  .contenu-nom-prenom {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
