<script lang="ts">
  import Bouton from '../ui/Bouton.svelte';
  import Etapier from '../ui/Etapier.svelte';
  import SelectionFonction from './SelectionFonction.svelte';
  import type {
    EstimationNombreServices,
    InformationsProfessionnelles,
    Intervalle,
  } from './inscription.d';

  export let estimationNombreServices: EstimationNombreServices[];
  export let informationsProfessionnelles: InformationsProfessionnelles;

  let etapeCourante = 1;

  $: titreEtape = [
    'Vos informations professionnelles',
    'Vos informations complémentaires',
    'Vos consentements',
  ][etapeCourante - 1];

  const etapePrecedente = () => {
    if (etapeCourante > 1) etapeCourante--;
  };
  const etapeSuivante = () => {
    if (etapeCourante < 3) etapeCourante++;
  };
  const valide = () => {
    axios.post('/api/utilisateur', formulaireInscription);
  };

  type FormulaireInscription = {
    prenom: string;
    nom: string;
    email: string;
    siretEntite: string;
    postes: string[];
    estimationNombreServices: Intervalle;
    agentConnect: boolean;
    cguAcceptees: boolean;
    infolettreAcceptee: boolean;
    transactionnelAccepte: boolean;
  };

  let formulaireInscription: FormulaireInscription = {
    prenom: informationsProfessionnelles.prenom,
    nom: informationsProfessionnelles.nom,
    email: informationsProfessionnelles.email,
    siretEntite: informationsProfessionnelles.organisation.siret,
    postes: [],
    estimationNombreServices: {
      borneBasse: 1,
      borneHaute: 2,
    },
    agentConnect: true,
    cguAcceptees: false,
    infolettreAcceptee: false,
    transactionnelAccepte: true,
  };

  let nombreServices: string = '';
  $: {
    formulaireInscription.estimationNombreServices = {
      borneBasse: Number(nombreServices.split('_')[0]),
      borneHaute: Number(nombreServices.split('_')[1]),
    };
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

  <div class="contenu-etape" class:active={etapeCourante === 1}>
    <div class="bloc">
      <h1>Votre identité</h1>
      <div>
        <span class="info-label">Nom :</span>
        <span class="info-valeur">{informationsProfessionnelles.nom}</span>
      </div>
      <div>
        <span class="info-label">Prénom :</span>
        <span class="info-valeur">{informationsProfessionnelles.prenom}</span>
      </div>
      <div>
        <span class="info-label">Mail professionnel :</span>
        <span class="info-valeur">{informationsProfessionnelles.email}</span>
      </div>
    </div>
    <div class="bloc">
      <h1>Votre organisation</h1>
      <div>
        <span class="info-label">Dénomination légale :</span>
        <span class="info-valeur"
          >{informationsProfessionnelles.organisation.denomination}</span
        >
      </div>
      <div>
        <span class="info-label">SIRET :</span>
        <span class="info-valeur"
          >{informationsProfessionnelles.organisation.siret}</span
        >
      </div>
      <div>
        <span class="info-label">Département de votre organisation :</span>
        <span class="info-valeur"
          >{informationsProfessionnelles.organisation.departement}</span
        >
      </div>
    </div>
  </div>

  <div class="contenu-etape" class:active={etapeCourante === 2}>
    <div class="bloc bloc-avec-separateur">
      <h1>Votre identité</h1>
      <div>
        <SelectionFonction requis bind:valeurs={formulaireInscription.postes} />
      </div>
    </div>
    <div class="bloc">
      <h1>Vos services numériques</h1>
      <div>
        <label for="estimation-nombre-services" class="info-label requis">
          Combien de services publics numériques avez-vous à sécuriser ?
        </label>
        <span class="exemple">
          Exemple : Systèmes d’information, site web, application mobile, API,
          téléservices
        </span>
        <select
          id="estimation-nombre-services"
          required
          bind:value={nombreServices}
        >
          <option value="" disabled selected>Sélectionner un nombre</option>
          {#each estimationNombreServices as estimation}
            {@const valeur = `${estimation.borneBasse}_${estimation.borneHaute}`}
            <option value={valeur}>{estimation.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="contenu-etape" class:active={etapeCourante === 3}>
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
      <div class="case-a-cocher">
        <input
          id="cguAcceptees"
          type="checkbox"
          bind:checked={formulaireInscription.cguAcceptees}
          name="cguAcceptees"
          required
        />
        <label for="cguAcceptees" class="requis">
          J'accepte les <a href="/cgu">conditions générales d'utilisation</a> de
          MonServiceSécurisé
        </label>
      </div>
    </div>
  </div>

  <div class="actions">
    <Bouton
      type="secondaire"
      titre="Précédent"
      on:click={etapePrecedente}
      actif={etapeCourante > 1}
    />
    {#if etapeCourante === 3}
      <Bouton type="primaire" titre="Valider" on:click={valide} />
    {:else}
      <Bouton type="primaire" titre="Suivant" on:click={etapeSuivante} />
    {/if}
  </div>
</div>

<style>
  .entete-inscription h1 {
    margin: 0;
    padding: 0;
    font-size: 40px;
    font-weight: bold;
    text-align: left;
  }

  .entete-inscription h2 {
    font-size: 22px;
    font-weight: normal;
    line-height: 30px;
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
    font-size: 22px;
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
    padding-bottom: 24px;
    border-bottom: solid 1px var(--liseres-fonce);
  }

  .bloc div {
    margin-bottom: 8px;
  }

  .etape {
    color: var(--texte-clair);
    font-size: 14px;
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

  .contenu-etape:not(.active) {
    display: none;
  }

  #estimation-nombre-services {
    appearance: auto;
  }

  .info-champ-obligatoire {
    text-align: right;
    font-size: 12px;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 16px;
  }

  .exemple {
    display: block;
    color: var(--texte-clair);
    font-size: 12px;
    line-height: 20px;
  }

  .case-a-cocher {
    background-color: #eff6ff;
    border-radius: 6px;
    padding: 16px;
  }

  input[type='checkbox'] {
    transform: none;
  }
</style>
