<script lang="ts">
  import ResumeDuServiceLectureSeule from './ResumeDuServiceLectureSeule.svelte';

  const lectureSeule = true;
</script>

{#if lectureSeule}
  <ResumeDuServiceLectureSeule />
{/if}
