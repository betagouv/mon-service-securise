<script lang="ts">
  import type {
    EstimationNombreServices,
    Intervalle,
  } from '../inscription/inscription.d';

  interface Props {
    estimationNombreServices: EstimationNombreServices[];
    valeur: Intervalle | null;
  }

  let { estimationNombreServices, valeur = $bindable() }: Props = $props();

  let nombreServices: string = $state(
    valeur ? `${valeur.borneBasse}_${valeur.borneHaute}` : ''
  );

  $effect(() => {
    valeur = nombreServices
      ? {
          borneBasse: nombreServices.split('_')[0],
          borneHaute: nombreServices.split('_')[1],
        }
      : null;
  });

  let options = $derived(
    estimationNombreServices.map((e) => {
      const valeur = `${e.borneBasse}_${e.borneHaute}`;
      return { id: valeur, value: valeur, label: e.label };
    })
  );
</script>

<dsfr-select
  id="selection-estimation-nombre-services"
  label="Combien de services publics numériques avez-vous à sécuriser ?"
  hint="Exemple : Systèmes d’information, site web, application mobile, API, téléservices"
  required
  {options}
  value={nombreServices}
  onvaluechanged={(e: CustomEvent<string>) => {
    nombreServices = e.detail;
  }}
></dsfr-select>
