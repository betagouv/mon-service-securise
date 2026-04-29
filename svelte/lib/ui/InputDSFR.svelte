<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    id?: string;
    label: string;
    value: string;
    type?: string;
    disabled?: boolean;
  }
  let {
    id,
    type = 'text',
    label,
    value = $bindable(),
    disabled,
    ...props
  }: Props = $props();

  const metsAJour = (event: CustomEvent<string>) => {
    value = event.detail;
  };
</script>

<dsfr-input
  {id}
  {label}
  {type}
  {value}
  {disabled}
  onvaluechanged={metsAJour}
  {...props}
></dsfr-input>
