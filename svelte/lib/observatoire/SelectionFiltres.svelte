<script lang="ts">
  import type {
    FiltresDisponibles,
    FiltresObservatoire,
    ValeurFiltre,
  } from './observatoire.d';

  interface Props {
    disponibles: FiltresDisponibles;
    filtres: FiltresObservatoire;
    onchange: (filtres: FiltresObservatoire) => void;
  }

  let { disponibles, filtres, onchange }: Props = $props();

  type CleFiltre = keyof FiltresObservatoire;

  const enOptions = (valeurs: ValeurFiltre[], libelleTous: string) => [
    { label: libelleTous, value: '' },
    ...valeurs.map(({ valeur, libelle }) => ({
      label: libelle,
      value: valeur,
    })),
  ];

  let selecteurs = $derived<
    {
      cle: CleFiltre;
      label: string;
      options: { label: string; value: string }[];
    }[]
  >([
    {
      cle: 'region',
      label: 'Région',
      options: enOptions(disponibles.regions, 'Toutes les régions'),
    },
    {
      cle: 'departement',
      label: 'Département',
      options: enOptions(disponibles.departements, 'Tous les départements'),
    },
    {
      cle: 'secteurActivite',
      label: 'Secteur d’activité',
      options: enOptions(disponibles.secteursActivite, 'Tous les secteurs'),
    },
    {
      cle: 'typeOrganisation',
      label: 'Type d’organisation',
      options: enOptions(disponibles.typesOrganisation, 'Tous les types'),
    },
  ]);

  const changeFiltre = (cle: CleFiltre, valeur: string) =>
    onchange({ ...filtres, [cle]: valeur || undefined });
</script>

<div class="filtres">
  {#each selecteurs as { cle, label, options } (cle)}
    <dsfr-select
      {label}
      {options}
      value={filtres[cle] ?? ''}
      id="filtre-{cle}"
      onvaluechanged={(e: CustomEvent<string>) => changeFiltre(cle, e.detail)}
    ></dsfr-select>
  {/each}
</div>

<style lang="scss">
  .filtres {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
</style>
