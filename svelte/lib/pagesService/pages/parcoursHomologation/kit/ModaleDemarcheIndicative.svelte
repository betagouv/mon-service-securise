<script lang="ts">
  import { referentielBesoinsSecurite } from './modaleDemarcheIndicative.referentiel';

  interface Props {
    niveauSecurite: 'niveau1' | 'niveau2' | 'niveau3';
    onHomologuer: () => void;
  }

  let { niveauSecurite, onHomologuer }: Props = $props();

  let donnees = $derived(referentielBesoinsSecurite[niveauSecurite]);

  let elementModale: HTMLDialogElement | undefined = $state();
  export const affiche = () => elementModale?.showModal();
  const ferme = () => elementModale?.close();

  const valideEtFerme = () => {
    ferme();
    onHomologuer();
  };
</script>

<dialog bind:this={elementModale}>
  <div class="conteneur-modale-parcours-homologation">
    <div class="conteneur-fermeture">
      <button type="button" onclick={ferme}>
        Fermer
        <img
          src="/statique/assets/images/icone_fermer_blanche.svg"
          alt="Fermeture de la modale"
        />
      </button>
    </div>
    <div class="conteneur-parcours-homologation">
      <h4>Rappel concernant votre service</h4>
      <div class="contenu-parcours-homologation">
        <div class="entete-parcours-homologation">
          <div>
            <h5>Les besoins de sécurité : {donnees.nomBesoin}</h5>
            <p>{donnees.resume}</p>
          </div>
          <img
            src={`/statique/assets/images/niveauxSecurite/${niveauSecurite}.svg`}
            alt="Illustration du besoin de sécurité"
          />
        </div>
        <div class="detail-parcours-homologation">
          <h5>
            Démarche d’homologation indicative adaptée : {donnees.demarcheIndicative}
          </h5>
          <table>
            <tbody>
              <tr>
                <th scope="row">Dossier d'homologation</th>
                <td>{donnees.details.dossier}</td>
              </tr>
              <tr>
                <th scope="row">Contrôle</th>
                <td>{donnees.details.controle}</td>
              </tr>
              <tr>
                <th scope="row">Commission d’homologation</th>
                <td>{donnees.details.commission}</td>
              </tr>
              <tr>
                <th scope="row">Décision d'homologation</th>
                <td>{donnees.details.decision}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <a
          href="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/LAB_Homologation_Simplifiee.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Télécharger le document "l'homologation simplifiée"
        </a>
      </div>
    </div>
    <div class="conteneur-actions">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button label="Fermer" kind="secondary" type="button" onclick={ferme}
      ></dsfr-button>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Ok, j’homologue le service !"
        kind="primary"
        type="button"
        onclick={valideEtFerme}
      ></dsfr-button>
    </div>
  </div>
</dialog>

<style lang="scss">
  dialog {
    max-width: 890px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    outline: none;
    padding: 0;
    text-align: left;
    max-height: calc(100vh - 110px);

    &::backdrop {
      background: rgba(22, 22, 22, 0.64);
    }
  }

  .conteneur-modale-parcours-homologation {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .conteneur-fermeture {
    display: flex;
    flex-direction: row;
    justify-content: end;
    padding: 16px;

    button {
      background: none;
      border: none;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--bleu-mise-en-avant);
      font-size: 14px;
      font-weight: 500;
      line-height: 24px;
      cursor: pointer;
      padding: 4px 8px 4px 12px;
      border-radius: 4px;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      img {
        width: 10px;
        height: 10px;
        margin-top: 3px;
        filter: brightness(0) invert(32%) sepia(67%) saturate(1923%)
          hue-rotate(185deg) brightness(93%) contrast(101%);
      }
    }
  }

  .conteneur-parcours-homologation {
    padding: 0 32px;

    h4 {
      margin: 0 0 32px;
      font-size: 28px;
      font-weight: 700;
      line-height: 36px;
    }
  }

  .contenu-parcours-homologation {
    padding: 24px 32px;
    border-radius: 8px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;

    a {
      color: #042794;
      align-self: end;
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: end;
      border-bottom: 1px solid #042794;
      padding-bottom: 1px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &:after {
        content: url('/statique/assets/images/icone_telecharger_dsfr.svg');
        width: 16px;
        height: 16px;
        display: flex;
      }
    }
  }

  .entete-parcours-homologation {
    display: flex;
    flex-direction: row;

    div {
      padding: 40px 40px 40px 8px;
    }

    h5 {
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 700;
      line-height: 32px;
      white-space: nowrap;
    }

    p {
      font-size: 18px;
      font-weight: 400;
      line-height: 28px;
    }

    img {
      padding: 0 50px;
    }
  }

  .detail-parcours-homologation {
    margin-bottom: 24px;

    h5 {
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 700;
      line-height: 32px;
    }

    table {
      border-collapse: collapse;

      :is(th, td) {
        padding: 8px 16px;
        border: 1px solid #dddddd;
        color: #3a3a3a;
      }

      th {
        white-space: nowrap;
      }
    }
  }

  .conteneur-actions {
    display: flex;
    flex-direction: row;
    justify-content: end;
    padding: 32px;
    gap: 16px;
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid #ddd;
  }
</style>
