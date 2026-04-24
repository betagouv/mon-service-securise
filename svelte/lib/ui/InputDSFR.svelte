<script lang="ts">
  interface Props {
    id?: string;
    label: string;
    value: string;
    type?: string;
  }
  let { id, type = 'text', label, value = $bindable() }: Props = $props();

  const metsAJour = (event: CustomEvent<string>) => {
    value = event.detail;
  };
</script>

<dsfr-input {id} {label} {type} {value} onvaluechanged={metsAJour}></dsfr-input>
