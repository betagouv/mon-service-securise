<script lang="ts">
  import { referentielBesoinsSecurite } from './modaleDemarcheIndicative.referentiel';
  import Modale from '../../../../ui/Modale.svelte';

  interface Props {
    niveauSecurite: 'niveau1' | 'niveau2' | 'niveau3';
    onHomologuer: () => void;
  }

  let { niveauSecurite, onHomologuer }: Props = $props();

  let donnees = $derived(referentielBesoinsSecurite[niveauSecurite]);

  let modale: Modale | undefined = $state();

  export const affiche = () => modale?.affiche();
  const ferme = () => modale?.ferme();

  const valideEtFerme = () => {
    ferme();
    onHomologuer();
  };
</script>

<Modale bind:this={modale} id="modale-demarche-indicative">
  {#snippet entete()}
    <h4>Rappel concernant votre service</h4>
  {/snippet}
  {#snippet contenu()}
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
      <dsfr-link
        label="Télécharger le document « l'homologation simplifiée »"
        href="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/LAB_Homologation_Simplifiee.pdf"
        blank
        size="sm"
      >
      </dsfr-link>
    </div>
  {/snippet}
  {#snippet actions()}
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
  {/snippet}
</Modale>

<style lang="scss">
  :global #modale-demarche-indicative {
    width: 875px;
  }

  h4 {
    margin: 0 0 32px;
    font-size: 28px;
    font-weight: 700;
    line-height: 36px;
  }

  .contenu-parcours-homologation {
    padding: 24px 32px;
    border-radius: 8px;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;

    dsfr-link {
      margin-left: auto;
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
</style>
