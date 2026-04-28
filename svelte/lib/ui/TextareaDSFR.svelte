<script lang="ts">
  interface Props {
    label: string;
    value: string;
    rows: number;
    hint?: string;
    disabled?: boolean;
  }
  let {
    hint,
    label,
    value = $bindable(),
    rows = 6,
    disabled,
  }: Props = $props();

  const metsAJour = (event: CustomEvent<string>) => {
    value = event.detail;
  };
</script>

<dsfr-textarea
  {label}
  {hint}
  {rows}
  {value}
  {disabled}
  onvaluechanged={metsAJour}
></dsfr-textarea>
