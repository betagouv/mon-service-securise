<script lang="ts">
  interface Props {
    label: string;
    value: string;
  }
  let { label, value = $bindable() }: Props = $props();

  const metsAJour = (event: CustomEvent<string>) => {
    value = event.detail;
  };
</script>

<dsfr-input {label} type="text" {value} onvaluechanged={metsAJour}></dsfr-input>
