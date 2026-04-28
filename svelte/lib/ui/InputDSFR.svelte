<script lang="ts">
  interface Props {
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
  }: Props = $props();

  const metsAJour = (event: CustomEvent<string>) => {
    value = event.detail;
  };
</script>

<dsfr-input {id} {label} {type} {value} {disabled} onvaluechanged={metsAJour}
></dsfr-input>
