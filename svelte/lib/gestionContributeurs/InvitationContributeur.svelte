<script lang="ts">
  import type {
    ResumeNiveauDroit,
    Utilisateur,
  } from './gestionContributeurs.d';
  import { enDroitsSurRubrique } from './gestionContributeurs.d';

  import { store } from './gestionContributeurs.store';
  import ChampAvecSuggestions from './ChampAvecSuggestions.svelte';
  import Initiales from './Initiales.svelte';
  import TagNiveauDroit from './TagNiveauDroit.svelte';

  type Etape = 'Ajout' | 'EnvoiEnCours' | 'Rapport';
  type Invitation = {
    utilisateur: Utilisateur;
    droit: ResumeNiveauDroit;
  };

  let invitations: Invitation[] = [];
  let etapeCourante: Etape = 'Ajout';

  $: services = $store.services;
  $: afficheLesBoutonsAction =
    $store.etapeCourante === 'InvitationContributeurs';

  const rechercheContributeurs = async (recherche: string) => {
    const reponse = await axios.get('/api/annuaire/contributeurs', {
      params: { recherche },
    });

    return reponse.data.suggestions;
  };

  const ajouteInvitation = (evenement: CustomEvent<Utilisateur>) => {
    store.navigation.afficheEtapeInvitation();
    const dejaInvite = invitations.find(
      (c) => c.utilisateur.email === evenement.detail.email
    );
    if (!dejaInvite)
      invitations = [
        ...invitations,
        { utilisateur: evenement.detail, droit: 'ECRITURE' },
      ];
  };

  const supprimeInvitation = ({ email }: Utilisateur) => {
    invitations = invitations.filter((c) => c.utilisateur.email !== email);
  };

  const envoiInvitation = async () => {
    etapeCourante = 'EnvoiEnCours';
    await Promise.all(
      invitations.map((i) =>
        axios.post('/api/autorisation', {
          emailContributeur: i.utilisateur.email,
          droits: enDroitsSurRubrique(i.droit),
          idServices: services.map((s) => s.id),
        })
      )
    );
    invitations = [];
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
        {#each invitations as { utilisateur, droit } (utilisateur.email)}
          <li class="contributeur-a-inviter">
            <div class="contenu-nom-prenom">
              <Initiales
                valeur={utilisateur.initiales}
                resumeNiveauDroit={droit}
              />
              <span>{@html utilisateur.prenomNom}</span>
            </div>
            <div class="conteneur-actions">
              <TagNiveauDroit
                niveau={droit}
                droitsModifiables={true}
                on:droitsChange={(e) => (droit = e.detail)}
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
            invitations = [];
            store.navigation.afficheEtapeListe();
          }}
        >
          Annuler
        </button>
        {#if invitations.length}
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
