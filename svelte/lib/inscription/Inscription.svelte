<script lang="ts">
  import Bouton from '../ui/Bouton.svelte';
  import Etapier from '../ui/Etapier.svelte';
  import SelectionDomaineSpecialite from './SelectionDomaineSpecialite.svelte';
  import { validationChamp } from '../directives/validationChamp';
  import type {
    Departement,
    EstimationNombreServices,
    FormulaireInscription,
    InformationsProfessionnelles,
    Organisation,
  } from './inscription.d';
  import Formulaire from '../ui/Formulaire.svelte';
  import SelectionDepartement from './SelectionDepartement.svelte';
  import SelectionOrganisation from './SelectionOrganisation.svelte';
  import ChampTexte from '../ui/ChampTexte.svelte';
  import SelectionNombreServices from './SelectionNombreServices.svelte';
  import ControleFormulaire from '../ui/ControleFormulaire.svelte';

  export let estimationNombreServices: EstimationNombreServices[];
  export let informationsProfessionnelles: InformationsProfessionnelles;
  const modeleTelephone = '^0\\d{9}$';
  export let departements: Departement[];
  export let invite: boolean;

  let etapeCourante = 1;

  $: titreEtape = [
    'Vos informations professionnelles',
    'Vos informations complémentaires',
    'Vos consentements',
  ][etapeCourante - 1];

  let formulaireEtape1: Formulaire;
  let formulaireEtape2: Formulaire;
  let formulaireEtape3: Formulaire;

  $: tousFormulaires = [formulaireEtape1, formulaireEtape2, formulaireEtape3];
  $: formulaireCourant = tousFormulaires[etapeCourante - 1];

  const etapePrecedente = () => {
    if (etapeCourante > 1) etapeCourante--;
  };
  const etapeSuivante = () => {
    if (formulaireCourant.estValide() && etapeCourante < 3) {
      etapeCourante++;
    }
  };

  let enCoursEnvoi = false;

  const valide = async () => {
    if (formulaireCourant.estValide()) {
      try {
        enCoursEnvoi = true;
        if (invite) {
          await axios.put('/api/utilisateur', formulaireInscription);
        } else {
          await axios.post('/api/utilisateur', formulaireInscription);
        }
      } finally {
        enCoursEnvoi = false;
      }
      window.location.href = '/oidc/connexion';
    }
  };

  let formulaireInscription: FormulaireInscription = {
    prenom: informationsProfessionnelles.prenom,
    nom: informationsProfessionnelles.nom,
    email: informationsProfessionnelles.email,
    siretEntite: informationsProfessionnelles.organisation?.siret,
    telephone: '',
    postes: [],
    estimationNombreServices: null,
    agentConnect: true,
    cguAcceptees: false,
    infolettreAcceptee: false,
    transactionnelAccepte: true,
  };

  let departement: Departement;
  let organisation: Organisation;
  $: {
    formulaireInscription.siretEntite =
      informationsProfessionnelles.organisation?.siret || organisation?.siret;
  }
</script>

<div class="entete-inscription">
  <div class="contenu">
    <h1>Créez votre compte MonServiceSécurisé</h1>
    <h2>
      MonServiceSécurisé est accessible aux professionnels travaillant au sein
      d'une
      <b>organisation publique ou privée</b> dans la sécurisation de services publics
      numériques.
    </h2>
  </div>
</div>

<div class="contenu-inscription">
  <div class="titre-contenu">
    <div class="etape">Étape {etapeCourante} sur 3</div>
    <h1>{titreEtape}</h1>
    <Etapier {etapeCourante} nombreEtapes={3} />
  </div>
  <div class="info-champ-obligatoire requis">Champ obligatoire</div>

  {#if etapeCourante === 1}
    <Formulaire classe="formulaire-inscription" bind:this={formulaireEtape1}>
      <div class="contenu-etape">
        <div class="bloc">
          <h1>Votre identité</h1>
          <div>
            <span class="info-label">Nom :</span>
            <span class="info-valeur">{informationsProfessionnelles.nom}</span>
          </div>
          <div>
            <span class="info-label">Prénom :</span>
            <span class="info-valeur"
              >{informationsProfessionnelles.prenom}</span
            >
          </div>
          <div>
            <span class="info-label">Mail professionnel :</span>
            <span class="info-valeur">{informationsProfessionnelles.email}</span
            >
          </div>
        </div>
        {#if informationsProfessionnelles.organisation}
          <div class="bloc">
            <h1>Votre organisation</h1>
            <div>
              <span class="info-label">Dénomination légale :</span>
              <span class="info-valeur"
                >{informationsProfessionnelles.organisation.nom}</span
              >
            </div>
            <div>
              <span class="info-label">SIRET :</span>
              <span class="info-valeur"
                >{informationsProfessionnelles.organisation.siret}</span
              >
            </div>
            <div>
              <span class="info-label">Département de votre organisation :</span
              >
              <span class="info-valeur"
                >{informationsProfessionnelles.organisation.departement}</span
              >
            </div>
          </div>
        {/if}
      </div>
    </Formulaire>
  {/if}

  {#if etapeCourante === 2}
    <Formulaire classe="formulaire-inscription" bind:this={formulaireEtape2}>
      <div class="contenu-etape">
        {#if !informationsProfessionnelles.organisation}
          <div class="bloc bloc-avec-separateur champs-saisie">
            <h1>Votre organisation</h1>
            <ControleFormulaire
              requis={true}
              libelle="Département de votre organisation"
            >
              <SelectionDepartement bind:valeur={departement} {departements} />
            </ControleFormulaire>
            <ControleFormulaire
              requis={true}
              libelle="Nom ou SIRET de votre organisation"
            >
              <SelectionOrganisation
                bind:valeur={organisation}
                filtreDepartement={departement}
              />
            </ControleFormulaire>
          </div>
        {/if}

        <div class="bloc bloc-avec-separateur champs-saisie">
          <h1>Votre identité</h1>
          <ControleFormulaire
            libelle="Téléphone"
            sousTitre="Pour bénéficier d'un accompagement personnalisé"
          >
            <ChampTexte
              id="telephone"
              nom="telephone"
              aideSaisie="Ex : 0XXXXXXXXX"
              modele={modeleTelephone}
              bind:valeur={formulaireInscription.telephone}
              messageErreur="Le numéro de téléphone doit respecter le format 0000000000."
            />
          </ControleFormulaire>
          <ControleFormulaire requis={true} libelle="Domaine de spécialité">
            <SelectionDomaineSpecialite
              id="domaine-specialite"
              requis
              bind:valeurs={formulaireInscription.postes}
            />
          </ControleFormulaire>
        </div>
        <div class="bloc">
          <h1>Vos services numériques</h1>
          <ControleFormulaire
            requis={true}
            libelle="Combien de services publics numériques avez-vous à sécuriser ?"
            sousTitre="Exemple : Systèmes d’information, site web, application mobile, API, téléservices"
          >
            <SelectionNombreServices
              id="estimation-nombre-services"
              {estimationNombreServices}
              bind:valeur={formulaireInscription.estimationNombreServices}
            />
          </ControleFormulaire>
        </div>
      </div>
    </Formulaire>
  {/if}

  {#if etapeCourante === 3}
    <Formulaire classe="formulaire-inscription" bind:this={formulaireEtape3}>
      <div class="contenu-etape">
        <div class="bloc">
          <div class="case-a-cocher">
            <input
              id="infolettreAcceptee"
              type="checkbox"
              bind:checked={formulaireInscription.infolettreAcceptee}
              name="infolettreAcceptee"
            />
            <label for="infolettreAcceptee">
              J'accepte de recevoir la lettre d'information MonServiceSécurisé.
            </label>
          </div>
          <div class="case-a-cocher cgu">
            <input
              id="cguAcceptees"
              type="checkbox"
              bind:checked={formulaireInscription.cguAcceptees}
              name="cguAcceptees"
              required
              use:validationChamp={'Ce champ est obligatoire. Veuillez le cocher.'}
            />
            <label for="cguAcceptees" class="requis">
              J'accepte les <a href="/cgu">conditions générales d'utilisation</a
              > de MonServiceSécurisé
            </label>
          </div>
        </div>
      </div>
    </Formulaire>
  {/if}

  <div class="actions">
    <Bouton
      type="secondaire"
      titre="Précédent"
      on:click={etapePrecedente}
      actif={etapeCourante > 1}
    />
    {#if etapeCourante === 3}
      <Bouton
        type="primaire"
        titre="Valider"
        on:click={valide}
        {enCoursEnvoi}
      />
    {:else}
      <Bouton type="primaire" titre="Suivant" on:click={etapeSuivante} />
    {/if}
  </div>
</div>

<style>
  .entete-inscription h1 {
    margin: 0;
    padding: 0;
    font-size: 2.5rem;
    font-weight: bold;
    text-align: left;
  }

  .entete-inscription h2 {
    font-size: 1.375rem;
    font-weight: normal;
    line-height: 1.875rem;
    text-align: left;
  }

  .entete-inscription {
    background-color: var(--bleu-mise-en-avant);
    color: white;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .entete-inscription .contenu {
    width: 792px;
    margin: 0 auto;
    padding-top: 48px;
    padding-bottom: 56px;
  }

  .titre-contenu {
    padding-bottom: 32px;
    border-bottom: solid 1px var(--liseres-fonce);
  }

  .contenu-inscription {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin: 56px auto;
    width: 792px;
    background-color: white;
    text-align: left;
    padding: 56px 102px;
    color: #000;
  }

  .contenu-inscription h1 {
    font-size: 1.375rem;
    font-weight: bold;
    margin: 0 0 12px;
    padding: 0;
  }

  .info-valeur {
    font-weight: bold;
  }

  .bloc h1 {
    margin-bottom: 16px;
  }

  .bloc-avec-separateur {
    padding-bottom: 8px;
    border-bottom: solid 1px var(--liseres-fonce);
  }

  .bloc div {
    margin-bottom: 8px;
  }

  .etape {
    color: var(--texte-clair);
    font-size: 0.875rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }

  .contenu-etape {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .info-champ-obligatoire {
    text-align: right;
    font-size: 0.75rem;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 1rem;
  }

  label {
    font-weight: normal;
    margin: 0;
  }

  .case-a-cocher {
    background-color: #eff6ff;
    border-radius: 6px;
    padding: 16px;
  }

  input[type='checkbox'] {
    transform: none;
  }

  .case-a-cocher.cgu {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .cgu #cguAcceptees {
    order: -1;
  }

  .cgu label {
    order: -1;
  }
</style>
