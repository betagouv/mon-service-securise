<script lang="ts">
  interface Props {
    titre: string;
    description: string;
  }

  let { titre, description }: Props = $props();
</script>

<div class="titre-tableau">
  <h4>{titre}</h4>
  <span>{description}</span>
</div>

<style lang="scss">
  .titre-tableau {
    display: flex;
    flex-direction: column;
    gap: 8px;

    h4 {
      font-size: 1.375rem;
      font-weight: 700;
      line-height: 1.75rem;
      margin: 0;
    }

    span {
      color: #666666;
      max-width: 620px;
      font-size: 0.875rem;
      line-height: 1.5rem;
      margin-bottom: 24px;
    }
  }
</style>
