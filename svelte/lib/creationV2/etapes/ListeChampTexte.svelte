<script lang="ts">
  interface Props {
    valeurs: string[];
    nomGroupe: string;
    titreSuppression: string;
    titreAjout: string;
    inactif?: boolean;
    limiteTaille?: number | undefined;
    onSuppression: (index: number) => void;
    onAjout: () => void;
    onblur?: (e: FocusEvent) => void;
  }

  let {
    valeurs = $bindable(),
    nomGroupe,
    titreSuppression,
    titreAjout,
    inactif = false,
    limiteTaille = undefined,
    onSuppression,
    onAjout,
    onblur,
  }: Props = $props();

  const metAJour = (index: number) => (e: CustomEvent<string>) => {
    valeurs[index] = e.detail;
  };
</script>

{#each valeurs as valeur, index (index)}
  {@const afficheInfo = limiteTaille && index === valeurs.length - 1}
  {@const estInvalide = limiteTaille && valeur.length > limiteTaille}
  <div class="conteneur-champs-texte">
    <dsfr-input
      type="text"
      id={`${nomGroupe}-${index}`}
      nom={nomGroupe}
      value={valeur}
      disabled={inactif}
      status={estInvalide ? 'error' : afficheInfo ? 'info' : 'default'}
      infoMessage={estInvalide
        ? ''
        : afficheInfo
          ? `${limiteTaille} caractères maximum`
          : ''}
      errorMessage={estInvalide
        ? `Le champ ne doit pas dépasser ${limiteTaille} caractères`
        : ''}
      onvaluechanged={metAJour(index)}
      {onblur}
    ></dsfr-input>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <lab-anssi-bouton
      titre={titreSuppression}
      variante="tertiaire"
      taille="lg"
      actif={!inactif}
      icone="delete-line"
      positionIcone="seule"
      onclick={() => onSuppression(index)}
    ></lab-anssi-bouton>
  </div>
{/each}
<div class="conteneur-actions">
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    titre={titreAjout}
    variante="tertiaire"
    taille="md"
    icone="add-line"
    positionIcone="gauche"
    actif={!inactif}
    onclick={() => onAjout()}
  ></lab-anssi-bouton>
</div>

<style lang="scss">
  .conteneur-champs-texte {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    align-items: flex-start;

    :global(input) {
      width: 100%;
    }
  }

  dsfr-input {
    flex: 1;
  }

  .conteneur-actions {
    width: fit-content;
  }
</style>
