<script lang="ts">
  import { validationChampDsfr } from '../../directives/validationChampDsfr';
  import ActionsTiroir from './ActionsTiroir.svelte';
  import Bouton from '../Bouton.svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import { tiroirStore } from '../stores/tiroir.store';
  import Formulaire from '../Formulaire.svelte';
  import Lien from '../Lien.svelte';
  import type { Service } from '../../tableauDeBord/tableauDeBord.d';

  export let service: Service;

  let nombreCopies: number = 1;
  let enCoursEnvoi = false;
  let enErreur = false;
  const dupliqueService = async () => {
    enCoursEnvoi = true;
    const uneCopie = () =>
      axios({ method: 'copy', url: `/api/service/${service.id}` });

    try {
      for (let i = 0; i < nombreCopies; i++) {
        await uneCopie();
      }
      tiroirStore.ferme();
      document.body.dispatchEvent(new CustomEvent('rafraichis-services'));
    } catch (exc) {
      if (axios.isAxiosError(exc) && exc.response) {
        const { data, status } = exc.response;

        if (status === 424 && data.type === 'DONNEES_OBLIGATOIRES_MANQUANTES') {
          enErreur = true;
        }
      }

      throw exc;
    } finally {
      enCoursEnvoi = false;
    }
  };
</script>

<Formulaire on:formulaireValide={dupliqueService} formulaireDuTiroir>
  <ContenuTiroir>
    {#if enErreur}
      <span>
        Le service n'a pas été dupliqué car toutes les informations obligatoires
        n'ont pas été remplies dans la rubrique « Décrire ».<br />
        Remplissez ces informations avant de pouvoir dupliquer.
      </span>
    {:else}
      <label>
        Nombre de copies souhaitées
        <br />
        <input
          name="nombre-copie"
          type="number"
          inputmode="numeric"
          bind:value={nombreCopies}
          min="1"
          max="10"
          placeholder="ex : 2"
          required
          use:validationChampDsfr={{
            invalide: 'Veuillez utiliser une valeur entre 1 et 10.',
            valide: 'Valeur valide',
          }}
        />
      </label>
    {/if}
  </ContenuTiroir>

  <ActionsTiroir>
    {#if enErreur}
      <Lien
        type="bouton-primaire"
        titre="Aller dans « Décrire »"
        href="/service/{service.id}/descriptionService"
      />
    {:else}
      <Bouton
        titre="Annuler"
        type="secondaire"
        on:click={() => {
          if (!enCoursEnvoi) tiroirStore.ferme();
        }}
      />
      <Bouton titre="Valider" type="primaire" boutonSoumission {enCoursEnvoi} />
    {/if}
  </ActionsTiroir>
</Formulaire>

<style>
  label {
    font-weight: bold;
  }

  input {
    margin-top: 8px;
    padding: 8px 16px;
    border-radius: 4px 4px 0 0;
    border: none;
    box-shadow: inset 0 -2px 0 0 var(--gris-fonce);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.5rem;
    background: var(--fond-gris-pale-composant);
    font-family: 'Marianne';
    width: 100%;
    box-sizing: border-box;
  }

  input:hover {
    background: var(--fond-gris-fonce);
  }

  input:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  input:invalid {
    box-shadow: inset 0 -2px 0 0 var(--erreur-texte);
  }

  input:valid {
    box-shadow: inset 0 -2px 0 0 var(--succes-texte);
  }
</style>
