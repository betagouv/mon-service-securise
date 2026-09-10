<script lang="ts">
  import type { Departement, Utilisateur } from './profil.d';
  import Formulaire from '../ui/Formulaire.svelte';
  import type {
    EstimationNombreServices,
    Organisation,
  } from '../inscription/inscription.d';
  import SelectionNombreServices from '../inscription/SelectionNombreServices.svelte';
  import Bouton from '../ui/Bouton.svelte';
  import { untrack } from 'svelte';
  import { writable } from 'svelte/store';
  import SelectionDomaineSpecialite from './SelectionDomaineSpecialite.svelte';
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
    <h2>
      Informations recueillies dans le cadre de votre inscription à
      MonServiceSécurisé.
    </h2>
  </div>

  <Formulaire classe="formulaire-profil" bind:this={formulaire}>
    <div class="bloc">
      <div>
        <h3>Mon identité</h3>
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
      <h3>Mon organisation</h3>
      <ChampOrganisation
        afficheLabel
        bind:siret
        label="Nom ou SIRET de votre organisation"
      />
    </div>

    <div class="bloc" id="estimation-nombre-services">
      <h3>Mes services numériques</h3>
      <div class="champ">
        <label for="estimation-nombre-services" class="info-label requis">
          Combien de services publics numériques avez-vous à sécuriser ?
        </label>
        <span class="sous-titre">
          Exemple : Systèmes d’information, site web, application mobile, API,
          téléservices
        </span>
        <SelectionNombreServices
          id="estimation-nombre-services"
          {estimationNombreServices}
          bind:valeur={$utilisateur.estimationNombreServices}
        />
      </div>
    </div>
  </Formulaire>

  <div class="actions">
    <Bouton type="primaire" titre="Valider" onclick={valide} {enCoursEnvoi} />
  </div>
</div>

<style>
  .contenu-profil {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 48px;
    margin: 56px auto;
    width: 792px;
    background-color: white;
    text-align: left;
    padding: 56px 102px;
    color: var(--texte-fonce);
  }

  .contenu-profil h1 {
    font-size: 1.625rem;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0 0 16px;
  }

  .contenu-profil h2 {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    margin: 0;
  }

  .contenu-profil h3 {
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0;
  }

  .bloc {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 48px;
  }

  .identite-lecture-seule {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sous-titre {
    display: block;
    color: var(--texte-clair);
    font-size: 0.75rem;
    line-height: 1.25rem;
    margin-bottom: 5px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
</style>
