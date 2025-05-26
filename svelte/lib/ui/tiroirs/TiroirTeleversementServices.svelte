<script lang="ts">
  import ActionsTiroir from './ActionsTiroir.svelte';
  import Bouton from '../Bouton.svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import { tiroirStore } from '../stores/tiroir.store';
  import Formulaire from '../Formulaire.svelte';
  import Loader from '../Loader.svelte';

  export const titre = 'Téléverser des services';
  export const sousTitre =
    "Importez votre liste de services, qu'ils soient homologués ou non. Vous pourrez ainsi piloter plus facilement leur sécurisation dans MonServiceSécurisé grâce au tableau de bord, centre de notifications, mails de rappels, etc...";

  let elementFichier: HTMLInputElement;
  let fichier: FileList;

  let etatTeleversement: 'EnAttente' | 'EnCoursEnvoi' | 'Invalide' | 'Valide' =
    'EnAttente';

  const formatteTailleFichier = Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
  });

  const gereVerificationFichier = async () => {
    etatTeleversement = 'EnCoursEnvoi';

    const donnees = new FormData();
    donnees.append('fichier', fichier[0]);
    try {
      await axios.post('/api/televersement/services', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      etatTeleversement = 'Valide';
    } catch (e) {
      etatTeleversement = 'Invalide';
    }
  };

  const supprimeFichierTeleverse = () => {
    etatTeleversement = 'EnAttente';
  };
</script>

<Formulaire formulaireDuTiroir>
  <ContenuTiroir>
    <div>
      <h3>1. Téléchargez et complétez le template de vos services</h3>
      <a
        href="/statique/assets/fichiers/Template services - MSS.xlsx"
        download="Template services - MSS.xlsx"
        >Template de services à télécharger</a
      >
      <p>XLSX - 50,3 kB</p>
    </div>
    <div>
      <h3>2. Importez le template</h3>
      <div class="conteneur-drag-and-drop">
        <img
          src="/statique/assets/images/icone_documents.svg"
          alt="Icône de document à téléverser"
        />
        <Bouton
          type="secondaire"
          titre="Parcourir"
          taille="moyen"
          on:click={() => elementFichier.click()}
        />
        <input
          type="file"
          id="fichier"
          name="fichier"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          bind:files={fichier}
          bind:this={elementFichier}
          on:change={() => gereVerificationFichier()}
        />
        <p>ou faites glisser un fichier ici</p>
        <div>
          <span>Nombre de services maximum : 1000</span>
          <span>Taille maximale : 1 Mo. Format supporté : XLSX.</span>
        </div>
      </div>
      <div class="conteneur-resulat">
        {#if etatTeleversement === 'EnAttente'}
          <span class="etat-fichier">Aucun fichier sélectionné.</span>
        {:else if etatTeleversement === 'EnCoursEnvoi'}
          <div class="en-cours-envoi">
            <Loader />
            <span>Fichier en cours de chargement</span>
          </div>
        {:else if etatTeleversement === 'Valide'}
          <div class="fichier-valide">
            <img
              src="/statique/assets/images/icone_documents.svg"
              alt="Icône de document téléversé"
              width="40px"
              height="40px"
            />
            <div>
              {#if fichier[0]}
                <button on:click={supprimeFichierTeleverse}>
                  <img
                    src="/statique/assets/images/icone_fermeture_modale.svg"
                    alt="Suppression du fichier"
                    width="16px"
                    height="16px"
                  />
                </button>
                <span>{fichier[0].name}</span>
                <span>{formatteTailleFichier.format(fichier[0].size)}</span>
              {/if}
            </div>
          </div>
        {:else if etatTeleversement === 'Invalide'}
          <span class="invalide">Format du fichier invalide</span>
        {/if}
      </div>
    </div>
  </ContenuTiroir>

  <ActionsTiroir>
    <Bouton
      titre="Annuler"
      type="secondaire"
      actif={etatTeleversement !== 'EnCoursEnvoi'}
      on:click={() => {
        if (etatTeleversement !== 'EnCoursEnvoi') tiroirStore.ferme();
      }}
    />
    <Bouton
      titre="Valider le fichier"
      type="primaire"
      boutonSoumission
      enCoursEnvoi={etatTeleversement === 'EnCoursEnvoi'}
      actif={etatTeleversement === 'Valide'}
    />
  </ActionsTiroir>
</Formulaire>

<style lang="scss">
  h3 {
    margin: 0 0 24px;
  }

  a {
    font-size: 1rem;
    line-height: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--bleu-mise-en-avant);
    width: fit-content;

    &:after {
      content: '';
      background: url(/statique/assets/images/icone_telecharger.svg);
      width: 16px;
      height: 16px;
      display: flex;
    }
  }

  p {
    margin: 4px 0 0;
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: var(--texte-gris);
  }

  .conteneur-drag-and-drop {
    padding: 12px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    border-radius: 8px;
    border: 1px dashed var(--systeme-design-etat-contour-champs);
    margin-bottom: 12px;

    input[type='file'] {
      display: none;
    }

    p {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.75rem;
      color: var(--texte-fonce);
    }

    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      span {
        color: var(--texte-gris);
        font-size: 0.875rem;
        font-style: normal;
        font-weight: 400;
        line-height: 1.5rem;
      }
    }
  }

  .conteneur-resulat {
    .etat-fichier {
      color: #3a3a3a;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5rem;
    }

    .en-cours-envoi,
    .fichier-valide {
      padding: 24px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: 24px;
      border: 1px solid var(--systeme-design-etat-contour-champs);
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.5rem;
    }

    .fichier-valide {
      border-bottom: 4px solid #137bcd;
      position: relative;

      div {
        display: flex;
        flex-direction: column;
        gap: 4px;

        button {
          border: none;
          background: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          position: absolute;
          top: 30px;
          right: 24px;
        }

        span:first-of-type {
          color: #09416a;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.5rem;
        }

        span:last-of-type {
          color: var(--texte-gris);
          font-size: 0.75rem;
          font-style: normal;
          font-weight: 400;
          line-height: 1.25rem;
        }
      }
    }

    .invalide {
      color: var(--erreur-texte);
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5rem;
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;

      &:before {
        content: '';
        display: flex;
        width: 16px;
        height: 16px;
        background: url(/statique/assets/images/ui-kit/erreur.svg);
      }
    }
  }
</style>
