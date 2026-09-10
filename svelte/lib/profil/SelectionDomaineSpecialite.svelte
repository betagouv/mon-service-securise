<script lang="ts">
  interface Props {
    valeurs: string[];
  }

  let { valeurs = $bindable() }: Props = $props();

  const domaines = [
    { id: 'RSSI', libelle: 'Cybersécurité / SSI' },
    { id: 'DSI', libelle: 'Numérique et systèmes d’information' },
    { id: 'METIER', libelle: 'Direction métier' },
    { id: 'DPO', libelle: 'Protection des données' },
    { id: 'JURI', libelle: 'Juridique' },
    { id: 'RISQ', libelle: 'Gestion des risques' },
    { id: 'DG', libelle: 'Direction générale' },
    { id: 'autre', libelle: 'Autre' },
  ];
  const options = domaines.map(({ id, libelle }) => ({
    id,
    value: id,
    label: libelle,
  }));
  const idsConnus = domaines.map((d) => d.id);

  const valeursInitiales = valeurs ?? [];
  const domaineLibreInitial =
    valeursInitiales.find((v) => !idsConnus.includes(v)) ?? '';

  let selection: string[] = $state([
    ...valeursInitiales.filter((v) => idsConnus.includes(v)),
    ...(domaineLibreInitial ? ['autre'] : []),
  ]);
  let autreDomaine = $state(domaineLibreInitial);

  const afficheDomaineLibre = $derived(selection.includes('autre'));

  let erreurSelection = $state(false);
  let erreurAutre = $state(false);

  const autreVide = () => afficheDomaineLibre && autreDomaine.trim() === '';

  const recomposeValeurs = () => {
    valeurs = [
      ...selection.filter((v) => v !== 'autre'),
      ...(afficheDomaineLibre && autreDomaine.trim()
        ? [autreDomaine.trim()]
        : []),
    ];
  };
  recomposeValeurs();

  const surChangementSelection = (e: CustomEvent<string[]>) => {
    selection = e.detail;
    recomposeValeurs();
    if (erreurSelection) erreurSelection = selection.length === 0;
    if (erreurAutre) erreurAutre = autreVide();
  };

  const surChangementAutre = (e: CustomEvent<string>) => {
    autreDomaine = e.detail;
    recomposeValeurs();
    if (erreurAutre) erreurAutre = autreVide();
  };

  export const valide = () => {
    erreurSelection = selection.length === 0;
    erreurAutre = autreVide();
    return !erreurSelection && !erreurAutre;
  };
</script>

<div class="selection-domaine-specialite">
  <lab-anssi-multi-select
    id="selection-domaine-specialite"
    label="Domaine de spécialité"
    placeholder="Sélectionnez un domaine de spécialité"
    {options}
    values={selection}
    onvaluechanged={surChangementSelection}
    status={erreurSelection ? 'error' : 'default'}
    error-message="Veuillez renseigner un domaine de spécialité."
  ></lab-anssi-multi-select>

  {#if afficheDomaineLibre}
    <dsfr-input
      id="autre-domaine-specialite"
      label="Merci de préciser votre domaine de spécialité"
      required
      value={autreDomaine}
      onvaluechanged={surChangementAutre}
      status={erreurAutre ? 'error' : 'default'}
      error-message="Veuillez renseigner un domaine de spécialité."
    ></dsfr-input>
  {/if}
</div>

<style lang="scss">
  .selection-domaine-specialite {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
