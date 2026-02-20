<script lang="ts">
  import ActionsTiroir from './ActionsTiroir.svelte';
  import Bouton from '../Bouton.svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import { tiroirStore } from '../stores/tiroir.store';
  import Formulaire from '../Formulaire.svelte';
  import type {
    BrouillonService,
    Service,
  } from '../../tableauDeBord/tableauDeBord.d';
  import Avertissement from '../Avertissement.svelte';
  import ChampTexte from '../ChampTexte.svelte';
  import type { ServiceOuBrouillon } from '../../tableauDeBord/ActionsDesServices.svelte';

  export let servicesEtBrouillon: ServiceOuBrouillon[];
  export const titre = 'Supprimer';
  export const sousTitre =
    servicesEtBrouillon.length > 1
      ? 'Effacer toutes les données des services sélectionnés.'
      : 'Effacer toutes les données du service sélectionné.';

  const confirmationSuppression =
    servicesEtBrouillon.length > 1
      ? `${servicesEtBrouillon.length} services`
      : servicesEtBrouillon[0].nomService;
  const intituleSuppression =
    servicesEtBrouillon.length > 1
      ? `les ${servicesEtBrouillon.length} services séléctionnés`
      : `le service ${servicesEtBrouillon[0].nomService}`;

  let confirmation = '';

  let enCoursEnvoi = false;
  const supprimeService = async () => {
    enCoursEnvoi = true;

    const services = servicesEtBrouillon?.filter((s) => s.type === 'Service');
    const brouillons = servicesEtBrouillon?.filter(
      (s) => s.type === 'Brouillon'
    );

    await Promise.all([
      ...services.map((s) => axios.delete(`/api/service/${s.id}`)),
      ...brouillons.map((b) => axios.delete(`/api/brouillon-service/${b.id}`)),
    ]);
    tiroirStore.ferme();
    document.body.dispatchEvent(new CustomEvent('rafraichis-services'));

    enCoursEnvoi = false;
  };

  const echappeTexte = (texte: string) => {
    const char = [
      '//',
      '\\',
      '^',
      '$',
      '.',
      '|',
      '?',
      '*',
      '+',
      '(',
      ')',
      '[',
      ']',
      '{',
      '}',
    ];
    let resultat = texte;
    for (const c of char) {
      resultat = resultat.replaceAll(c, `\\${c}`);
    }
    return resultat;
  };
</script>

<Formulaire on:formulaireValide={supprimeService} formulaireDuTiroir>
  <ContenuTiroir>
    <span>Souhaitez-vous vraiment supprimer <b>{intituleSuppression}</b> ?</span
    >
    <div>
      <Avertissement niveau="avertissement">
        <span>
          <b>Cette action est irréversible</b>
          <br />
          Les données seront définitivement effacées. Les contributeurs n'auront
          plus accès à ce service.
        </span>
      </Avertissement>
      <Avertissement>
        <span
          >Pour confirmer la suppression, veuillez saisir l'intitulé "<b
            >{confirmationSuppression}</b
          >" dans le champ ci-dessous</span
        >
      </Avertissement>
    </div>
    <div class="conteneur-champ-confirmation">
      <label for="confirmation-suppression" class="requis">Confirmation</label>
      <ChampTexte
        type="text"
        id="confirmation-suppression"
        nom="confirmation-suppression"
        bind:valeur={confirmation}
        modele={echappeTexte(confirmationSuppression)}
        requis
        messageErreur="La confirmation saisie est incorrecte"
      />
    </div>
  </ContenuTiroir>

  <ActionsTiroir>
    <Bouton
      titre="Annuler"
      type="secondaire"
      on:click={() => {
        if (!enCoursEnvoi) tiroirStore.ferme();
      }}
    />
    <Bouton
      titre="Confirmer la suppression"
      type="primaire"
      boutonSoumission
      {enCoursEnvoi}
    />
  </ActionsTiroir>
</Formulaire>

<style>
  label {
    margin-bottom: 8px;
  }

  label::before {
    position: absolute;
    left: -16px;
    content: '*';
    color: var(--rose-anssi);
  }

  .conteneur-champ-confirmation {
    position: relative;
  }

  :global(#confirmation-suppression.invalide) {
    border-color: var(--rose-anssi);
  }
</style>
