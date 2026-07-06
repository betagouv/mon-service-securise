<script lang="ts">
  import ActionsTiroir from '../../../../ui/tiroirs/ActionsTiroir.svelte';
  import Bouton from '../../../../ui/Bouton.svelte';
  import ContenuTiroir from '../../../../ui/tiroirs/ContenuTiroir.svelte';
  import { tiroirStore } from '../../../../ui/stores/tiroir.store';
  import Formulaire from '../../../../ui/Formulaire.svelte';
  import Avertissement from '../../../../ui/Avertissement.svelte';
  import ChampTexte from '../../../../ui/ChampTexte.svelte';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  export const titre = 'Supprimer';
  export const sousTitre =
    "Effacer toutes les données du projet d'homologation.";

  let confirmation = $state('');
  let enCoursEnvoi = $state(false);

  const supprimeDossierCourant = async () => {
    enCoursEnvoi = true;
    try {
      await axios.delete(
        `/api/service/${idService}/homologation/dossierCourant`
      );
      document.dispatchEvent(new CustomEvent('homologation-supprimee'));
      tiroirStore.ferme();
    } finally {
      enCoursEnvoi = false;
    }
  };
</script>

<Formulaire onFormulaireValide={supprimeDossierCourant} formulaireDuTiroir>
  <ContenuTiroir>
    <span
      >Souhaitez-vous vraiment supprimer <b>le projet d'homologation</b> ?</span
    >
    <div>
      <Avertissement niveau="avertissement">
        <span>
          <b>Cette action est irréversible</b>
          <br />
          Les données seront définitivement effacées. Les contributeurs n'auront plus
          accès à ce projet d'homologation.
        </span>
      </Avertissement>
      <Avertissement>
        <span
          >Pour confirmer la suppression du projet d'homologation, veuillez
          saisir l'intitulé "<b>projet d'homologation</b>" dans le champ
          ci-dessous</span
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
        modele="projet d'homologation"
        requis
        messageErreur="La confirmation saisie est incorrecte"
      />
    </div>
  </ContenuTiroir>

  <ActionsTiroir>
    <Bouton
      titre="Annuler"
      type="secondaire"
      boutonSoumission={false}
      onclick={() => {
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
