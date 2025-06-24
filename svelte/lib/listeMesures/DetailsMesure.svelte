<script lang="ts">
  import { decode } from 'html-entities';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import type { MesureReferentiel, ReferentielStatut } from '../ui/types.d';
  import DescriptionLongueMesure from '../ui/DescriptionLongueMesure.svelte';
  import { mesuresAvecServicesAssociesStore } from './mesuresAvecServicesAssocies.store';
  import { servicesAvecMesuresAssociees } from './servicesAvecMesuresAssociees.store';
  import TagStatutMesure from '../ui/TagStatutMesure.svelte';
  import DescriptionCompleteMesure from './DescriptionCompleteMesure.svelte';

  export let referentielStatuts: ReferentielStatut;

  let elementModale: HTMLDialogElement;
  let mesure: MesureReferentiel;
  $: servicesAssocies =
    mesure &&
    $servicesAvecMesuresAssociees.filter((s) => {
      return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
    });

  const ferme = () => {
    elementModale.close();
  };

  export const affiche = (mesureAAfficher: MesureReferentiel) => {
    mesure = mesureAAfficher;
    elementModale.showModal();
  };
</script>

<dialog bind:this={elementModale}>
  <div class="conteneur-fermeture">
    <button on:click={() => ferme()}>Fermer</button>
  </div>
  {#if mesure}
    <div class="conteneur-modale">
      <div class="entete-modale">
        <h4>Mesure</h4>
        <DescriptionCompleteMesure {mesure} />

        <h4>
          {servicesAssocies.length}
          {servicesAssocies.length > 1
            ? 'services associés'
            : 'service associé'} à cette mesure
        </h4>
      </div>
      <div class="contenu-modale">
        <table>
          <thead>
            <tr>
              <th>Nom du service</th>
              <th>Statut actuel</th>
              <th>Précision actuelle</th>
            </tr>
          </thead>
          <tbody>
            {#each servicesAssocies as service}
              <tr>
                <td>
                  <div class="intitule-service">
                    <span class="nom">{decode(service.nomService)}</span>
                    <span class="organisation"
                      >{service.organisationResponsable}</span
                    >
                  </div>
                </td>
                <td
                  ><TagStatutMesure
                    {referentielStatuts}
                    statut={service.mesuresAssociees[mesure.id].statut}
                  /></td
                >
                <td
                  >{decode(service.mesuresAssociees[mesure.id].modalites) ||
                    ''}</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="pied-modale">
        <div class="conteneur-actions">
          <button class="bouton bouton-secondaire" on:click={() => ferme()}
            >Retour à la liste de mesures
          </button>
        </div>
      </div>
    </div>
  {/if}
</dialog>

<style lang="scss">
  .conteneur-modale {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }
  .pied-modale,
  .entete-modale {
    flex-shrink: 0;
    position: sticky;
    z-index: 1;
    background: white;
  }
  .entete-modale {
    top: 0;
  }
  .pied-modale {
    bottom: 0;
  }
  .contenu-modale {
    flex-grow: 1;
    margin-top: 24px;
    overflow-y: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;

    thead {
      border: 1px solid #dddddd;

      th {
        padding: 8px 16px;
        color: #666666;
        font-weight: bold;
      }
    }

    tbody {
      border: 1px solid #dddddd;

      td {
        padding: 8px 16px;
        border-top: 1px solid #dddddd;
      }
    }

    .intitule-service {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .nom {
        font-weight: bold;
      }
    }
  }

  dialog::backdrop {
    background: rgba(22, 22, 22, 0.64);
  }

  dialog {
    width: min(calc(100vw - 52px), 1868px);
    height: min(calc(100vh - 70px), 1010px);
    padding: 64px 32px 0 32px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    box-sizing: border-box;
    position: relative;
  }

  .conteneur-fermeture {
    position: absolute;
    top: 16px;
    right: 35px;

    button {
      border: none;
      background: none;
      padding: 4px 8px 4px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--bleu-mise-en-avant);
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.5rem;
      border-radius: 4px;

      &:hover {
        background: #f5f5f5;
      }

      &:after {
        content: '';
        background-image: url(/statique/assets/images/icone_fermeture_modale.svg);
        width: 16px;
        height: 16px;
        background-size: contain;
        background-repeat: no-repeat;
        display: inline-block;
        filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
          hue-rotate(184deg) brightness(107%) contrast(101%);
        transform: translateY(2px);
      }
    }
  }

  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 24px;
    text-align: left;
  }

  .conteneur-actions {
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    width: 100%;
    background: white;
    display: flex;
    margin-left: -32px;
    padding: 32px;
    flex-direction: row;
    gap: 16px;
    justify-content: end;

    button {
      margin: 0;
      padding: 8px 12px;
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.5rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
</style>
