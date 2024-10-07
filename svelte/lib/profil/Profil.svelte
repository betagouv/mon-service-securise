<script lang="ts">
  import type { Departement, Utilisateur } from './profil.d';
  import ChampTexte from '../ui/ChampTexte.svelte';
  import SelectionDomaineSpecialite from '../inscription/SelectionDomaineSpecialite.svelte';
  import Formulaire from '../ui/Formulaire.svelte';
  import SelectionDepartement from '../inscription/SelectionDepartement.svelte';
  import SelectionOrganisation from '../inscription/SelectionOrganisation.svelte';
  import type {
    EstimationNombreServices,
    Organisation,
  } from '../inscription/inscription.d';
  import SelectionNombreServices from '../inscription/SelectionNombreServices.svelte';
  import Bouton from '../ui/Bouton.svelte';

  export let departements: Departement[];
  export let utilisateur: Utilisateur;
  export let entite: Organisation;
  export let estimationNombreServices: EstimationNombreServices[];

  const modeleTelephone = '^0\\d{9}$';
  let departement: Departement | undefined = departements.find(
    (d) => d.code === entite.departement
  );

  let formulaire: Formulaire;
  let enCoursEnvoi: boolean = false;

  const valide = async () => {
    if (formulaire.estValide()) {
      try {
        enCoursEnvoi = true;
        await axios.put('/api/utilisateur', {
          ...utilisateur,
          siretEntite: entite.siret,
        });
      } finally {
        enCoursEnvoi = false;
      }
      window.location.href = '/tableauDeBord';
    }
  };
</script>

<div class="contenu-profil">
  <div>
    <h1>Mes informations MonServiceSecurisé</h1>
    <h2>
      Informations recueillies dans le cadre de votre inscription à
      MonServiceSécurisé.
    </h2>
  </div>

  <Formulaire classe="formulaire-profil" bind:this={formulaire}>
    <div class="bloc">
      <div>
        <div class="info-champ-obligatoire requis">Champ obligatoire</div>
        <h3>Mon identité</h3>
      </div>
      <span>Mail professionnel : <b>{utilisateur.email}</b></span>
      <div class="champ">
        <label class="requis" for="prenom">Prénom</label>
        <ChampTexte
          id="prenom"
          nom="prenom"
          bind:valeur={utilisateur.prenom}
          aideSaisie="ex : Jean"
          requis
          messageErreur="Le prénom est obligatoire. Les chiffres ne sont pas autorisés."
        />
      </div>
      <div class="champ">
        <label class="requis" for="nom">Nom</label>
        <ChampTexte
          id="nom"
          nom="nom"
          bind:valeur={utilisateur.nom}
          aideSaisie="ex : Dupont"
          requis
          messageErreur="Le nom est obligatoire. Les chiffres ne sont pas autorisés."
        />
      </div>
      <div class="champ">
        <label class="requis" for="domaine-specialite"
          >Domaine de spécialité</label
        >
        <SelectionDomaineSpecialite
          id="domaine-specialite"
          requis
          bind:valeurs={utilisateur.postes}
        />
      </div>
      <div class="champ">
        <label for="telephone">Téléphone</label>
        <span class="sous-titre"
          >Pour bénéficier d’un accompagnement personnalisé</span
        >
        <ChampTexte
          id="telephone"
          nom="telephone"
          bind:valeur={utilisateur.telephone}
          aideSaisie="ex : 0XXXXXXXXX"
          modele={modeleTelephone}
        />
      </div>
    </div>

    <div class="bloc">
      <h3>Mon organisation</h3>
      <div class="champ">
        <label for="departement" class="requis"
          >Département de votre organisation</label
        >
        <SelectionDepartement bind:valeur={departement} {departements} />
      </div>
      <div class="champ">
        <label for="nomSiret" class="requis"
          >Nom ou SIRET de votre organisation</label
        >
        <SelectionOrganisation
          id="nomSiret"
          bind:valeur={entite}
          filtreDepartement={departement}
        />
      </div>
    </div>

    <div class="bloc">
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
          bind:valeur={utilisateur.estimationNombreServices}
        />
      </div>
    </div>

    <div class="bloc">
      <h3>Mes consentements</h3>

      <div class="case-a-cocher">
        <input
          id="infolettreAcceptee"
          type="checkbox"
          bind:checked={utilisateur.infolettreAcceptee}
          name="infolettreAcceptee"
        />
        <label for="infolettreAcceptee">
          J'accepte de recevoir la lettre d'information MonServiceSécurisé
        </label>
      </div>
      <div class="case-a-cocher">
        <input
          id="transactionnelAccepte"
          type="checkbox"
          bind:checked={utilisateur.transactionnelAccepte}
          name="transactionnelAccepte"
        />
        <label for="transactionnelAccepte">
          J'accepte de recevoir des informations relatives à l'utilisation de
          MonServiceSécurisé
        </label>
      </div>
    </div>
  </Formulaire>

  <div class="actions">
    <Bouton type="primaire" titre="Valider" on:click={valide} {enCoursEnvoi} />
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

  .info-champ-obligatoire {
    text-align: right;
    font-size: 0.75rem;
    margin-bottom: 24px;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 1rem;
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
    gap: 16px;
    margin-bottom: 48px;
  }

  .champ {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.313rem;
    margin-bottom: 3px;
  }

  :global(form.formulaire-profil label) {
    margin: 0;
    font-weight: normal;
  }

  .sous-titre {
    display: block;
    color: var(--texte-clair);
    font-size: 0.75rem;
    line-height: 1.25rem;
    margin-bottom: 5px;
  }

  .case-a-cocher {
    background-color: #eff6ff;
    border-radius: 6px;
    padding: 16px;
  }

  .case-a-cocher label {
    font-weight: normal;
  }

  input[type='checkbox'] {
    transform: none;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
</style>
