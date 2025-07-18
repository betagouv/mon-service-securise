<script lang="ts">
  import { onMount } from 'svelte';
  import type { RapportDetaille } from './rapportTeleversement.types';
  import {
    confirmeImport,
    progressionTeleversement,
    recupereRapportDetaille,
    supprimeTeleversement,
  } from './rapportTeleversement.api';
  import LigneService from './composants/LigneService.svelte';
  import Toast from '../ui/Toast.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirTeleversementServices from '../ui/tiroirs/TiroirTeleversementServices.svelte';
  import { toasterStore } from '../ui/stores/toaster.store';

  let elementModale: HTMLDialogElement;

  let rapportDetaille: RapportDetaille;
  onMount(async () => {
    const resultat = await recupereRapportDetaille();
    if (!resultat) return;
    rapportDetaille = resultat;

    elementModale.inert = true;
    elementModale.showModal();
    elementModale.inert = false;
  });

  $: estValide = rapportDetaille?.statut === 'VALIDE';
  $: nbServicesInvalides = rapportDetaille?.services.filter(
    (s) => s.erreurs.length > 0
  ).length;
  $: nbServicesValides = rapportDetaille?.services.filter(
    (s) => s.erreurs.length === 0
  ).length;

  const fermeModale = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('rapportTeleversement');
    window.history.replaceState({}, '', url);
    elementModale.close();
  };

  const fermeRapport = async () => {
    await supprimeTeleversement();
    fermeModale();
  };

  const fermeRapportEtOuvreTiroir = async () => {
    await fermeRapport();
    tiroirStore.afficheContenu(TiroirTeleversementServices, {});
  };

  let progression = 0;
  const recupereProgression = async () => {
    try {
      const resultat = await progressionTeleversement();
      progression = resultat.data.progression;
    } catch (e) {
      setTimeout(recupereProgression, 5000);
      return;
    }
    if (progression === 100) {
      document.body.dispatchEvent(new CustomEvent('rafraichis-services'));
      enCoursEnvoi = false;
      fermeModale();
      const nbServices = rapportDetaille.services.length;
      toasterStore.succes(
        `${nbServices} ${pluraliseChaine(
          'service importé avec succès',
          'services importés avec succès',
          nbServices
        )}`,
        `Nous vous invitons à <b>finaliser la description</b> de ${pluraliseChaine(
          'votre service importé',
          'vos services importés',
          nbServices
        )} afin d’accéder à une évaluation personnalisée de leur sécurité et bénéficier de recommandations adaptées.`
      );
    } else {
      setTimeout(recupereProgression, 1000);
    }
  };

  let enCoursEnvoi = false;
  const valideImport = async () => {
    enCoursEnvoi = true;
    await confirmeImport();
    await recupereProgression();
  };

  const pluraliseChaine = (
    chaineSingulier: string,
    chainePluriel: string,
    nombre: number
  ) => (nombre > 1 ? chainePluriel : chaineSingulier);
</script>

<dialog bind:this={elementModale} class:enCoursEnvoi>
  {#if !enCoursEnvoi}
    <div class="conteneur-fermeture">
      <button on:click={() => fermeRapport()}>Fermer</button>
    </div>
  {/if}
  <div class="conteneur-modale">
    {#if enCoursEnvoi}
      <div class="conteneur-progression">
        <div class="texte-progression">
          <h2>
            Téléversement en cours... <span class="pourcentage-progression"
              >{progression}%</span
            >
          </h2>
          <span>Merci de ne pas rafraichir votre navigateur</span>
        </div>
        <progress value={progression} max="100" />
      </div>
    {:else if rapportDetaille}
      <div class="entete-modale">
        <h2>Rapport du téléversement des services</h2>
        <div class="conteneur-toasts">
          {#if rapportDetaille.statut === 'INVALIDE'}
            <Toast
              niveau="erreur"
              titre={`${nbServicesInvalides} ${pluraliseChaine(
                'service invalide',
                'services invalides',
                nbServicesInvalides
              )}`}
              contenu="Corriger le fichier XLSX et réimportez-le"
              avecOmbre={false}
              avecAnimation={false}
            />
          {/if}
          <Toast
            niveau="succes"
            titre={`${nbServicesValides} ${pluraliseChaine(
              'service valide',
              'services valides',
              nbServicesValides
            )}`}
            contenu="Aucune erreur détéctée"
            avecOmbre={false}
            avecAnimation={false}
          />
        </div>
      </div>
      <div class="contenu-modale">
        <h2>Rapport détaillé</h2>
        <div class="conteneur-rapport-detaille">
          <table>
            <thead>
              <tr>
                <th scope="colgroup">État</th>
                <th scope="colgroup" class="bordure-droite"
                  >Raison de l'erreur</th
                >
                <th>Ligne</th>
                <th>Nom du service numérique</th>
                <th>SIRET de l'organisation</th>
                <th>Nombre d'organisation(s) utilisatrice(s)</th>
                <th>Type</th>
                <th>Provenance</th>
                <th>Statut</th>
                <th>Localisation des données</th>
                <th>Durée maximale de dysfonctionnement</th>
                <th>Date d'homologation</th>
                <th>Durée d'homologation</th>
                <th>Autorité</th>
                <th>Fonction de l'autorité</th>
              </tr>
            </thead>
            <tbody>
              {#each rapportDetaille.services as service, idx (idx)}
                {#if service.erreurs.length > 0}
                  <LigneService {service} numeroLigne={idx + 1} />
                {/if}
              {/each}
              {#each rapportDetaille.services as service, idx (idx)}
                {#if service.erreurs.length === 0}
                  <LigneService {service} numeroLigne={idx + 1} />
                {/if}
              {/each}
            </tbody>
          </table>
        </div>
      </div>
      <div class="pied-modale">
        <div class="conteneur-actions">
          <button
            class="bouton bouton-secondaire"
            on:click={() => fermeRapport()}
            >Annuler
          </button>
          <button
            class="bouton bouton-primaire bouton-accepter"
            class:estValide
            on:click={() =>
              estValide ? valideImport() : fermeRapportEtOuvreTiroir()}
          >
            {estValide
              ? `Importer les ${
                  rapportDetaille.services.length
                } ${pluraliseChaine(
                  'service',
                  'services',
                  rapportDetaille.services.length
                )}`
              : 'Réimporter le fichier XLSX corrigé'}
          </button>
        </div>
      </div>
    {/if}
  </div>
</dialog>

<style lang="scss">
  dialog::backdrop {
    background: rgba(22, 22, 22, 0.64);
  }
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

  dialog {
    width: min(calc(100vw - 52px), 1868px);
    height: min(calc(100vh - 70px), 1010px);
    padding: 64px 32px 0 32px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    box-sizing: border-box;
    position: relative;

    &.enCoursEnvoi {
      width: 556px;
      height: fit-content;
      padding: 48px 32px;
    }
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

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 24px;
    text-align: left;
  }

  .conteneur-rapport-detaille {
    overflow-x: scroll;
  }

  table {
    border-collapse: collapse;
  }

  th {
    white-space: nowrap;
    padding: 8px 16px;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.5rem;
    font-weight: 700;
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    border-bottom: 1px solid var(--systeme-design-etat-contour-champs);
    color: #3a3a3a;
  }

  tr th:first-of-type {
    border-left: 1px solid var(--systeme-design-etat-contour-champs);
  }

  tr th:last-of-type,
  .bordure-droite {
    border-right: 1px solid var(--systeme-design-etat-contour-champs);
  }

  th[scope='colgroup'] {
    background: var(--fond-pale);
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

      &.bouton-accepter.estValide:before {
        content: url(/statique/assets/images/icone_import_services.svg);
      }

      &.bouton-accepter:before {
        content: url(/statique/assets/images/icone_import_fichier.svg);
        display: flex;
        width: 16px;
        height: 16px;
      }
    }
  }

  .conteneur-toasts {
    display: flex;
    flex-direction: row;
    gap: 24px;
    margin-bottom: 48px;
  }

  .conteneur-progression {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    gap: 16px;

    .texte-progression {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      span {
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5rem;
      }

      h2 {
        margin-bottom: 8px;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 2rem;

        span {
          margin-bottom: 8px;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 2rem;
          color: #137bcd;
        }
      }
    }

    progress {
      width: 100%;
      margin: 24px 0;
      height: 15px;
      border-radius: 95px;
      border: none;
      accent-color: var(--bleu-mise-en-avant);
      background-color: var(--cyan-clair);
      -webkit-appearence: none;
      appearance: none;
      overflow: hidden;

      &::-webkit-progress-bar {
        background-color: var(--cyan-clair);
      }

      &::-webkit-progress-value {
        background-color: var(--bleu-mise-en-avant);
      }

      &::-moz-progress-bar {
        background-color: var(--bleu-mise-en-avant);
      }
    }
  }
</style>
