<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

  export let estComplete: boolean;
  export let valeur: string[] = [];

  const illustrations: Record<keyof typeof questionsV2.typeDeService, string> =
    {
      api: 'api.svg',
      portailInformation: 'portailInformation.svg',
      serviceEnLigne: 'serviceEnLigne.svg',
      applicationMobile: 'applicationMobile.svg',
      autreSystemeInformation: 'autreSystemeInformation.svg',
    };

  const dispatch = createEventDispatcher<{ champModifie: string[] }>();
  const metsAJourValeur = () => {
    if (valeur) {
      dispatch('champModifie', valeur);
    }
  };

  $: estComplete = valeur.length > 0;

  const typesDeService = Object.entries(questionsV2.typeDeService) as [
    keyof typeof questionsV2.typeDeService,
    { nom: string; exemple: string },
  ][];
</script>

<label for="type-service">
  Quel est le type de service à sécuriser ?*

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
  {#each typesDeService as [idType, details]}
    <div class="ligne-type-service">
      <input
        type="checkbox"
        id={idType}
        name="type-service"
        value={idType}
        bind:group={valeur}
        on:change={metsAJourValeur}
      />

      <label for={idType} class="label-type-service">
        <img
          src="/statique/assets/images/typesService/{illustrations[idType]}"
          alt=""
        />
        <span class="details-type-service">
          {details.nom}
          {#if details.exemple}
            <span>{details.exemple}</span>
          {/if}
        </span>
      </label>
    </div>
  {/each}
</label>

<style lang="scss">
  label {
    .ligne-type-service {
      display: flex;
      gap: 8px;
      border: 1px solid #dddddd;
      padding: 4px 24px 4px 0;
      border-radius: 8px;
      cursor: pointer !important;

      * {
        cursor: pointer !important;
      }

      &:has(input:checked) {
        box-shadow: 0 0 0 2px var(--bleu-mise-en-avant);
        border-color: transparent;
        background: #f1f5f9;
      }

      img {
        width: 56px;
        height: 56px;
        padding: 12px 16px;
        border-right: 1px solid #dddddd;
      }

      label.label-type-service {
        font-size: 1rem !important;
        line-height: 1.5rem !important;
        font-weight: normal !important;
        display: flex !important;
        flex-direction: row !important;

        .details-type-service {
          display: flex;
          flex-direction: column;
          font-size: 1.5rem;
          line-height: 1.5rem;
          font-weight: 400;
          justify-content: center;
          color: #161616;

          span {
            font-size: 0.75rem;
            line-height: 1.25rem;
            color: #666;
            justify-content: center;
          }
        }
      }
    }
    .indication {
      font-size: 0.75rem;
      line-height: 1.15rem;
      color: #666;
      font-weight: normal;
      margin-top: 8px;
    }

    input[type='checkbox'] {
      display: none;
    }
  }
</style>
