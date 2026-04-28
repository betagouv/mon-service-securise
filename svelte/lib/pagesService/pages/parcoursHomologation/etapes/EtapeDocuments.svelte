<script lang="ts">
  import { untrack } from 'svelte';
  import type { Dossier } from '../../homologuer/homologuer.types';
  import * as api from '../parcoursHomologation.api';
  import Explication from '../kit/Explication.svelte';
  import InputDSFR from '../../../../ui/InputDSFR.svelte';
  import CarteFormulaire from '../../../../ui/CarteFormulaire.svelte';

  interface Props {
    idService: string;
    dossier: Dossier;
    estLectureSeule: boolean;
  }

  let { idService, dossier, estLectureSeule }: Props = $props();

  let avecDocuments = $state(untrack(() => dossier.avecDocuments ?? false));
  let documents: string[] = $state(untrack(() => dossier.documents ?? []));
  let nouveauDocument = $state('');

  const commandeDocuments = {
    updateAvecDocuments: (e: { detail: boolean }) => {
      avecDocuments = e.detail;
      if (!avecDocuments) documents = [];
    },
    ajoute: () => {
      const titre = nouveauDocument.trim();
      if (!titre) return;
      documents.push(titre);
      nouveauDocument = '';
    },
    supprime: (index: number) => {
      documents.splice(index, 1);
      avecDocuments = documents.length > 0;
    },
  };

  export const enregistre = async () => {
    await api.enregistrement(idService).documents(avecDocuments, documents);
  };
</script>

<Explication>
  Référencez, si vous le souhaitez, un ou plusieurs documents que vous prévoyez
  de présenter à l'autorité d'homologation. Cette liste apparaîtra en annexe du
  PDF de décision d'homologation de sécurité.
</Explication>

<dsfr-radios-group
  onvaluechanged={commandeDocuments.updateAvecDocuments}
  radios={[
    { label: 'Aucun document à référencer', id: 'aucun', value: false },
    {
      label: 'Référencer un ou plusieurs documents',
      id: 'un-ou-plusieurs',
      value: true,
    },
  ]}
  status="default"
  value={avecDocuments}
  disabled={estLectureSeule}
></dsfr-radios-group>

{#if avecDocuments}
  <CarteFormulaire titre="Documents">
    <div class="ajout-document">
      <InputDSFR
        label="Nom du document et informations utiles"
        bind:value={nouveauDocument}
        disabled={estLectureSeule}
      />
      {#if !estLectureSeule}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          label="Ajouter ce document"
          kind="secondary"
          type="button"
          has-icon
          icon="add-line"
          icon-place="left"
          onclick={commandeDocuments.ajoute}
        ></dsfr-button>
      {/if}
    </div>

    {#if documents.length > 0}
      <ul class="liste-documents">
        {#each documents as document, index (`${document}-${index}`)}
          <li>
            <span class="nom">{document}</span>
            {#if !estLectureSeule}
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <dsfr-button
                label="Supprimer"
                kind="secondary"
                has-icon
                icon="delete-line"
                icon-place="left"
                type="button"
                size="sm"
                onclick={() => commandeDocuments.supprime(index)}
              ></dsfr-button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </CarteFormulaire>
{/if}

<style lang="scss">
  .ajout-document {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .liste-documents {
    list-style: none;
    padding: 0;
    margin-bottom: 1.5rem;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      border: 1px solid #ddd;
      margin-bottom: 0;

      &:not(:last-child) {
        border-bottom: none;
      }

      .nom {
        color: #666;
        flex: 1;
        font-size: 0.75rem;
      }
    }
  }
</style>
