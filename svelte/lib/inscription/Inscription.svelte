<script>
  import Bouton from '../ui/Bouton.svelte';

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
  const valide = () => {};
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
    <div class="etapier"></div>
  </div>
  <hr />
  <div class="contenu-etape" class:active={etapeCourante === 1}>
    <div class="bloc">
      <h1>Votre identité</h1>
      <div>
        <span class="info-label">Nom :</span>
        <span class="info-valeur">Dupont</span>
      </div>
      <div>
        <span class="info-label">Prénom :</span>
        <span class="info-valeur">Jean-Baptiste</span>
      </div>
      <div>
        <span class="info-label">Mail professionnel :</span>
        <span class="info-valeur">jean-baptiste@orange.fr</span>
      </div>
    </div>
    <div class="bloc">
      <h1>Votre organisation</h1>
      <div>
        <span class="info-label">Dénomination légale :</span>
        <span class="info-valeur">ORANGE</span>
      </div>
      <div>
        <span class="info-label">SIRET :</span>
        <span class="info-valeur">380 129 866 </span>
      </div>
      <div>
        <span class="info-label">Département de votre organisation :</span>
        <span class="info-valeur">92</span>
      </div>
    </div>
  </div>

  <div class="contenu-etape" class:active={etapeCourante === 2}>
    <div class="bloc">
      <h1>Votre identité</h1>
      <div>
        <span class="info-label">Fonction / poste occupé :</span>
        <select id="fonction-poste">
          <option>Sélectionner une fonction</option>
        </select>
      </div>
      <hr />
    </div>
    <div class="bloc">
      <h1>Vos services numériques</h1>
      <div>
        <span class="info-label">
          * Combien de services publics numériques avez-vous à sécuriser ?
        </span>
        <span>
          Exemple : Systèmes d’information, site web, application mobile, API,
          téléservices
        </span>
        <select id="estimation-nombre-services" required>
          <option>Sélectionner un nombre</option>
          <option>1 à 10</option>
          <option>11 à 20</option>
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
          name="infolettreAcceptee"
        />
        <label for="infolettreAcceptee">
          J'accepte de recevoir la lettre d'information MonServiceSécurisé.
        </label>
      </div>
      <div class="case-a-cocher">
        <input id="cguAcceptees" type="checkbox" name="cguAcceptees" required />
        <label for="cguAcceptees">
          J'accepte les <a href="/cgu">conditions générales d'utilisation</a> et
          la
          <a href="/confidentialite">politique de confidentialité</a> de MonServiceSécurisé
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

  .contenu-inscription {
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
    margin: 0;
    padding: 0;
  }

  .info-valeur {
    font-weight: bold;
  }

  .bloc h1 {
    margin-bottom: 16px;
  }

  .bloc div {
    margin-bottom: 8px;
  }

  hr {
    margin: 0;
    border: 0;
    border-bottom: solid 1px var(--liseres);
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

  #fonction-poste,
  #estimation-nombre-services {
    appearance: auto;
  }
</style>
