<script lang="ts">
  import ActionsTiroir from './ActionsTiroir.svelte';
  import Bouton from '../Bouton.svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import { tiroirStore } from '../stores/tiroir.store';
  import Formulaire from '../Formulaire.svelte';
  import type { Service } from '../../tableauDeBord/tableauDeBord.d';
  import Avertissement from '../Avertissement.svelte';
  import ChampTexte from '../ChampTexte.svelte';

  export let services: Service[];

  const confirmationSuppression =
    services.length > 1
      ? `${services.length} services`
      : services[0].nomService;
  const intituleSuppression =
    services.length > 1
      ? `les ${services.length} services séléctionnés`
      : `le service ${services[0].nomService}`;

  let confirmation = '';

  let enCoursEnvoi = false;
  const supprimeService = async () => {
    enCoursEnvoi = true;

    await Promise.all(
      services.map((s) => axios.delete(`/api/service/${s.id}`))
    );
    tiroirStore.ferme();
    document.body.dispatchEvent(new CustomEvent('rafraichis-services'));

    enCoursEnvoi = false;
  };
</script>

<Formulaire on:formulaireValide={supprimeService} formulaireDuTiroir>
  <ContenuTiroir>
    <span>Souhaitez-vous vraiment supprimer <b>{intituleSuppression}</b> ?</span
    >
    <div>
      <Avertissement niveau="avertissement">
        <span>
          <b>Cette action est irréversible</b>
          <br />
          Les données seront définitivement effacées. Les contributeurs n'auront
          plus accès à ce service.
        </span>
      </Avertissement>
      <Avertissement>
        <span
          >Pour confirmer la suppression, veuillez saisir l'intitulé "<b
            >{confirmationSuppression}</b
          >" dans le champ ci-dessous</span
        >
      </Avertissement>
    </div>
    <div class="conteneur-champ-confirmation">
      <label for="confirmation-suppression" class="requis">Confirmation</label>
      <ChampTexte
        type="text"
        id="confirmation-suppression"
        nom="confirmation-suppression"
        bind:valeur={confirmation}
        modele={confirmationSuppression}
        requis
        messageErreur="La confirmation saisie est incorrecte"
      />
    </div>
  </ContenuTiroir>

  <ActionsTiroir>
    <Bouton
      titre="Annuler"
      type="secondaire"
      on:click={() => {
        if (!enCoursEnvoi) tiroirStore.ferme();
      }}
    />
    <Bouton
      titre="Confirmer la suppression"
      type="primaire"
      boutonSoumission
      {enCoursEnvoi}
    />
  </ActionsTiroir>
</Formulaire>

<style>
  label {
    margin-bottom: 8px;
  }

  label::before {
    position: absolute;
    left: -16px;
    content: '*';
    color: var(--rose-anssi);
  }

  .conteneur-champ-confirmation {
    position: relative;
  }

  :global(#confirmation-suppression.invalide) {
    border-color: var(--rose-anssi);
  }
</style>
