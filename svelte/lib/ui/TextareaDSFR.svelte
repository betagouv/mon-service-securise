<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    id?: string;
    label: string;
    value: string;
    rows: number;
    hint?: string;
    disabled?: boolean;
  }
  let {
    id,
    hint,
    label,
    value = $bindable(),
    rows = 6,
    disabled,
    ...props
  }: Props = $props();

  const metsAJour = (event: CustomEvent<string>) => {
    value = event.detail;
  };
</script>

<dsfr-textarea
  {id}
  {label}
  {hint}
  {rows}
  {value}
  {disabled}
  onvaluechanged={metsAJour}
  {...props}
></dsfr-textarea>
