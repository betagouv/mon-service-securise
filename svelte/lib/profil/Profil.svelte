<script lang="ts">
  import type { Utilisateur } from './profil.d';
  import Formulaire from '../ui/Formulaire.svelte';
  import type {
    EstimationNombreServices,
    Organisation,
  } from '../inscription/inscription.d';
  import { untrack } from 'svelte';
  import { writable } from 'svelte/store';
  import SelectionDomaineSpecialite from './SelectionDomaineSpecialite.svelte';
  import SelectionNombreServices from './SelectionNombreServices.svelte';
  import ChampOrganisation from '../ui/ChampOrganisation.svelte';

  interface Props {
    utilisateur: Utilisateur;
    entite: Organisation;
    estimationNombreServices: EstimationNombreServices[];
  }

  let { utilisateur: u, entite, estimationNombreServices }: Props = $props();

  let utilisateur = writable(untrack(() => u));

  const modeleTelephone = '^0\\d{9}$';

  let formulaire: Formulaire | undefined = $state();
  let selectionDomaine: SelectionDomaineSpecialite | undefined = $state();
  let enCoursEnvoi: boolean = $state(false);
  let siret = $state(untrack(() => entite.siret));

  const valide = async () => {
    if (!formulaire) return;
    const domaineValide = selectionDomaine?.valide() ?? false;
    if (formulaire.estValide() && domaineValide && siret) {
      try {
        enCoursEnvoi = true;
        await axios.put('/api/utilisateur', {
          estimationNombreServices: $utilisateur.estimationNombreServices,
          infolettreAcceptee: $utilisateur.infolettreAcceptee,
          postes: $utilisateur.postes,
          telephone: $utilisateur.telephone,
          transactionnelAccepte: $utilisateur.transactionnelAccepte,
          pixelDeSuiviAccepte: $utilisateur.pixelDeSuiviAccepte,
          siretEntite: siret,
        });
        window.location.href = '/tableauDeBord';
      } catch {
        // L'erreur est gérée, le formulaire reste visible pour que l'utilisateur puisse réessayer
      } finally {
        enCoursEnvoi = false;
      }
    }
  };
</script>

<div class="contenu-profil">
  <div>
    <h1>Mes informations MonServiceSécurisé</h1>
    <div class="entete">
      Informations recueillies dans le cadre de votre inscription à
      MonServiceSécurisé.
    </div>
  </div>

  <Formulaire classe="formulaire-profil" bind:this={formulaire}>
    <div class="bloc">
      <div>
        <h2>Mon identité</h2>
      </div>
      <dsfr-callout
        text="Pour modifier votre prénom ou votre nom, rendez-vous sur votre profil ProConnect."
        has-button
        accent="défaut"
      >
        <dsfr-button
          slot="button"
          label="Se rendre sur ProConnect"
          kind="secondary"
          size="md"
          has-icon
          icon="external-link-line"
          icon-place="right"
          markup="a"
          href="https://identite.proconnect.gouv.fr"
          target="_blank"
        ></dsfr-button>
      </dsfr-callout>
      <div class="identite-lecture-seule">
        <span>Mail professionnel : <b>{$utilisateur.email}</b></span>
        <span>Prénom : <b>{$utilisateur.prenom}</b></span>
        <span>Nom : <b>{$utilisateur.nom}</b></span>
      </div>
      <SelectionDomaineSpecialite
        bind:valeurs={$utilisateur.postes}
        bind:this={selectionDomaine}
      />
      <dsfr-input
        id="telephone"
        label="Téléphone"
        value={$utilisateur.telephone}
        hint="ex : 0123456789"
        pattern={modeleTelephone}
        type="tel"
        error-message="Le téléphone doit commencer par un 0 et être composé de 10 chiffres."
        onvaluechanged={(e: CustomEvent<string>) =>
          ($utilisateur.telephone = e.detail)}
      ></dsfr-input>
    </div>

    <div class="bloc" id="bloc-siret">
      <h2>Mon organisation</h2>
      <ChampOrganisation
        afficheLabel
        bind:siret
        label="Nom ou SIRET de votre organisation"
      />
    </div>

    <div class="bloc" id="estimation-nombre-services">
      <h2>Mes services numériques</h2>
      <SelectionNombreServices
        {estimationNombreServices}
        bind:valeur={$utilisateur.estimationNombreServices}
      />
    </div>
  </Formulaire>

  <div class="actions">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button label="Valider" onclick={valide} disabled={enCoursEnvoi}
    ></dsfr-button>
  </div>
</div>

<style>
  .contenu-profil {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 56px auto;
    width: 792px;
    background-color: white;
    text-align: left;
    padding: 56px 102px;
    color: var(--texte-fonce);
  }

  .contenu-profil h1 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.5rem;
    margin: 0 0 16px;
  }

  .contenu-profil .entete {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    margin: 0 0 48px;
  }

  .contenu-profil h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0;
  }

  .bloc {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 48px;
  }

  .identite-lecture-seule {
    font-size: 1rem;
    line-height: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  dsfr-callout {
    margin-bottom: -1.5rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
</style>
