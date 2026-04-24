<script lang="ts">
  interface Props {
    label: string;
    value: string;
    rows: number;
    hint?: string;
  }
  let { hint, label, value = $bindable(), rows = 6 }: Props = $props();

  const metsAJour = (event: CustomEvent<string>) => {
    value = event.detail;
  };
</script>

<dsfr-textarea {label} {hint} {rows} {value} onvaluechanged={metsAJour}
></dsfr-textarea>
