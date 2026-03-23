<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../../ui/Onglets.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import BadgesTiroirRisqueSpecifiqueV2 from './BadgesTiroirRisqueSpecifiqueV2.svelte';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  export const titre = 'Ajouter un risque';
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueSpecifiqueV2;
  export const propsComposantEntete = {};

  let risqueAjoute = $state({
    intitule: '',
    description: '',
    categories: [],
    gravite: '',
    vraisemblance: '',
    graviteBrute: '',
    vraisemblanceBrute: '',
    commentaire: '',
  });

  const metsAJourCommentaire = (e: CustomEvent<string>) => {
    risqueAjoute.commentaire = e.detail;
  };

  const ajouteRisque = async () => {
    /*await metsAJourRisque(idService, risque.id, {
      desactive: !actif,
      commentaire,
    });*/
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
    toasterStore.succes(
      'Succès',
      `Le risque ${risqueAjoute.intitule} a été ajouté.`
    );
    tiroirStore.ferme();
  };
</script>

<ContenuTiroir>
  <div class="conteneur-onglets">
    <Onglets
      ongletActif="infos"
      onglets={[
        {
          id: 'infos',
          label: 'Information sur le risque',
        },
      ]}
    />
  </div>
  <div class="contenu-onglet">
    <div>
      <p>
        <b>Description du risque</b>
        <span><i>Temporaire: Lorem Ipsum</i></span>
      </p>
      <p>
        <b>Exemple de service numérique</b>
        <span><i>Temporaire: Lorem Ipsum</i></span>
      </p>
      <div class="niveaux-risque">
        <div class="ligne-niveau-risque">
          <span><b>Gravité potentielle :</b></span>
          <span></span>
        </div>
        <div class="ligne-niveau-risque">
          <span><b>Vraisemblance au départ :</b></span>
          <span></span>
        </div>
      </div>
      <div>
        <label for="commentaire"><b>Commentaire</b></label>
        <dsfr-input
          type="text"
          id="commentaire"
          nom="commentaire"
          value={risqueAjoute.commentaire}
          placeholder="Apportez des précisions sur le risque"
          onvaluechanged={metsAJourCommentaire}
        ></dsfr-input>
      </div>
    </div>
  </div>
</ContenuTiroir>
<ActionsTiroir>
  <div class="actions">
    <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
    <dsfr-button
      label="Ajouter le risque"
      kind="primary"
      size="md"
      has-icon
      icon="add-line"
      icon-place="left"
      onclick={ajouteRisque}
    ></dsfr-button>
  </div>
</ActionsTiroir>

<style lang="scss">
  .actions {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .contenu-onglet {
    padding: 32px;
    border: 1px solid #ddd;
    margin-top: -30px;
    border-top: none;

    label {
      margin-bottom: 8px;
      display: block;
    }

    & > div {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    p {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .intitule-mesures-associees {
      margin-bottom: 32px;
    }

    .statut {
      min-width: 80px;
    }

    .mesure-cliquable {
      text-decoration: none;
      color: #3a3a3a;

      &:hover {
        color: var(--bleu-mise-en-avant);
      }
    }

    .niveaux-risque {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .ligne-niveau-risque {
        display: flex;

        & > * {
          flex: 1;
        }
      }
    }
  }

  .conteneur-onglets {
    border-bottom: 1px solid #ddd;
    padding-left: 16px;
  }
</style>
