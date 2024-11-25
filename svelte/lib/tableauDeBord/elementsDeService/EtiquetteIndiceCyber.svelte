<script lang="ts">
  export let score: number;
  export let idService: string;

  const couleurs = ['rose', 'violet', 'marine', 'bleu', 'turquoise', 'or'];
  const couleur = couleurs[Math.floor(score)];
</script>

<a class={couleur} href="/service/{idService}/indiceCyber">
  <span>{score}</span>
  <span class="total">/5</span>
</a>

<style>
  a {
    border-radius: 4px;
    display: flex;
    padding: 0 6px;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    line-height: 20px;
    width: fit-content;
    color: white;
    background: var(--fond);
    cursor: pointer;
  }

  a:hover {
    background: var(--fond-hover);
  }

  a:active {
    background: var(--fond-actif);
  }

  .total {
    font-weight: 400;
  }

  .rose {
    --fond: #9926be;
    --fond-hover: #84329e;
    --fond-actif: #6a2880;
  }

  .violet {
    --fond: #7025da;
    --fond-hover: #581aae;
    --fond-actif: #3e137b;
  }
  .marine {
    --fond: #3352b0;
    --fond-hover: #1d3fa7;
    --fond-actif: #042794;
  }
  .bleu {
    --fond: #0079d0;
    --fond-hover: #026ab5;
    --fond-actif: #025591;
  }
  .turquoise {
    --fond: #23c8cb;
    --fond-hover: #19acae;
    --fond-actif: #169194;
  }

  .or {
    --fond: #eac14b;
    --fond-hover: #d3ae40;
    --fond-actif: #bc9b3c;
  }
</style>
