<script lang="ts">
  interface Props {
    score: number;
    idService: string;
  }

  let { score, idService }: Props = $props();

  const couleurs = [
    'purple-glycine',
    'pink-macaron',
    'blue-cumulus',
    'green-archipel',
    'green-menthe',
    'yellow-tournesol',
  ];
  let couleur = $derived(couleurs[Math.floor(score)]);
</script>

<dsfr-tag
  label="{score}/5"
  href="/service/{idService}/indiceCyber"
  accent={couleur}
  size="sm"
  type="clickable"
>
</dsfr-tag>
