<script lang="ts">
  import { etapeCourante } from './etapes/etapes.store';

  $: avancement =
    ($etapeCourante.numeroQuestionCourante / $etapeCourante.nombreQuestions) *
    100;
</script>

<div class="courante">
  <b>
    Question {$etapeCourante.numeroQuestionCourante} sur {$etapeCourante.nombreQuestions}
  </b>
  <div
    class="avancement"
    style="background: linear-gradient(to right, var(--bleu-mise-en-avant) {avancement}%, #f6f6f6 0%)"
  ></div>
</div>

<style>
  .courante {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: #666;
  }

  .avancement {
    height: 8px;
    width: 100px;
    position: relative;
    top: 1px;
  }
</style>
