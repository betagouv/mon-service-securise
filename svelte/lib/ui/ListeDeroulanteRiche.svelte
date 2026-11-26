<script lang="ts">
  import type { OptionsListeDeroulanteRiche } from './ui.types.d';

  interface Props {
    id: string;
    libelle: string;
    options: OptionsListeDeroulanteRiche<string>;
    valeursSelectionnees?: Record<string, string[]>;
  }

  let {
    id,
    libelle,
    options,
    valeursSelectionnees = $bindable({}),
  }: Props = $props();

  const SEPARATEUR = '#';

  const versValeurCombobox = (idCategorie: string, valeur: string) =>
    `${idCategorie}${SEPARATEUR}${valeur}`;

  const valeursCombobox = $derived(
    Object.entries(valeursSelectionnees).flatMap(([idCategorie, valeurs]) =>
      valeurs.map((valeur) => versValeurCombobox(idCategorie, valeur))
    )
  );

  const regroupeParCategorie = (selections: string[]) => {
    const parCategorie: Record<string, string[]> = Object.fromEntries(
      options.categories.map((categorie) => [categorie.id, []])
    );
    selections.forEach((selection) => {
      const [idCategorie, valeur] = selection.split(SEPARATEUR);
      (parCategorie[idCategorie] ??= []).push(valeur);
    });
    return parCategorie;
  };

  const optionGroups = $derived(
    options.categories.map((c) => ({
      legend: c.libelle,
      options: options.items
        .filter((i) => i.idCategorie === c.id)
        .map((i) => ({
          value: versValeurCombobox(i.idCategorie, i.valeur),
          label: i.libelle,
        })),
    }))
  );
</script>

<dsfr-combobox
  {id}
  multiple
  label={libelle}
  option-groups={JSON.stringify(optionGroups)}
  searchable={false}
  placeholder="Filtrer"
  hide-label
  select-all-button
  values={valeursCombobox}
  onvalueschanged={(e: CustomEvent<string[]>) =>
    (valeursSelectionnees = regroupeParCategorie(e.detail))}
></dsfr-combobox>
