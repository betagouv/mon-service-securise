<script lang="ts">
  import type { Risque } from './risquesV2.d';
  import BadgesTiroirRisqueV2 from './BadgesTiroirRisqueV2.svelte';
  import { untrack } from 'svelte';
  import ContenuTiroir from '../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../ui/Onglets.svelte';
  import { mappingNiveauGravite, mappingNiveauVraisemblance } from './kit';
  import ActionsTiroir from '../ui/tiroirs/ActionsTiroir.svelte';
  import Switch from '../ui/Switch.svelte';

  interface Props {
    risque: Risque;
    risqueBrut: Risque;
  }

  let { risque, risqueBrut }: Props = $props();

  export const titre = untrack(() => risque.intitule);
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueV2;
  export const propsComposantEntete = untrack(() => ({ risque }));

  let ongletActif: 'infos' | 'mesuresAssociees' = $state('infos');

  let commentaire = $state(untrack(() => risque.commentaire));
  const metsAJourCommentaire = (e: CustomEvent<string>) => {
    commentaire = e.detail;
  };

  let actif = $state(untrack(() => !risque.desactive));
</script>

<ContenuTiroir>
  <Onglets
    bind:ongletActif
    onglets={[
      {
        id: 'infos',
        label: 'Information sur le risque',
      },
      {
        id: 'mesuresAssociees',
        label: 'Mesures associées',
      },
    ]}
  />
  {#if ongletActif === 'infos'}
    <div>
      <p>
        <b>Description du risque</b>
        <br />
        <span><i>Temporaire: Lorem Ipsum</i></span>
      </p>
      <p>
        <b>Exemple de service numérique</b>
        <br />
        <span><i>Temporaire: Lorem Ipsum</i></span>
      </p>
      <div>
        <div class="ligne-niveau-risque">
          <span><b>Gravité potentielle :</b></span>
          <span>{mappingNiveauGravite[risque.gravite]}</span>
        </div>
        <div class="ligne-niveau-risque">
          <span><b>Vraisemblance au départ :</b></span>
          <span>{mappingNiveauVraisemblance[risqueBrut.vraisemblance]}</span>
        </div>
      </div>
      <div>
        <label for="commentaire"><b>Commentaire</b></label>
        <dsfr-input
          type="text"
          id="commentaire"
          nom="commentaire"
          value={commentaire}
          placeholder="Apportez des précisions sur le risque"
          onvaluechanged={metsAJourCommentaire}
        ></dsfr-input>
      </div>
    </div>
  {:else if ongletActif === 'mesuresAssociees'}
    <p>Mesures</p>
  {/if}
</ContenuTiroir>
<ActionsTiroir>
  <div class="actions">
    <Switch bind:actif id="risque-tiroir-{risque.id}-actif" />
    <dsfr-button
      label="Enregistrer les modifications"
      kind="primary"
      size="md"
      has-icon
      icon="save-line"
      icon-place="left"
    ></dsfr-button>
  </div>
</ActionsTiroir>

<style lang="scss">
  .ligne-niveau-risque {
    display: flex;
  }

  .actions {
    display: flex;
    gap: 24px;
    align-items: center;
  }
</style>
