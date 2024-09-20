<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  import StarterKit from '@tiptap/starter-kit';
  import Mention from '@tiptap/extension-mention';
  import Placeholder from '@tiptap/extension-placeholder';
  import type { Readable } from 'svelte/store';
  import suggestion from './suggestion';
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap';

  export let contenuCommentaire: string;
  export let nonce: string;

  let editor: Readable<Editor>;
  $: contenuCommentaire = $editor?.getText();

  onMount(() => {
    editor = createEditor({
      injectCSS: true,
      injectNonce: nonce,
      editorProps: {
        attributes: {
          class: 'champ-commentaire',
        },
        handleKeyDown: (vue, evenement) => {
          if (
            evenement.key === 'Enter' &&
            !evenement.shiftKey &&
            !evenement.altKey &&
            !evenement.ctrlKey
          ) {
            sauvegardeCommentaire();
            return true;
          }
        },
      },
      extensions: [
        StarterKit,
        Mention.configure({
          suggestion: suggestion(),
          renderHTML({ options, node }) {
            return [
              'span',
              { 'data-id': node.attrs.id, class: 'mention' },
              `${options.suggestion.char}${node.attrs.label}`,
            ];
          },
          renderText({ options, node }) {
            return `${options.suggestion.char}[${node.attrs.id}]`;
          },
        }),
        Placeholder.configure({
          placeholder: 'Écrivez un commentaire...',
        }),
      ],
    });
  });

  const dispatch = createEventDispatcher<{ submit: null }>();
  const sauvegardeCommentaire = () => {
    dispatch('submit');
    $editor.commands.clearContent();
    contenuCommentaire = '';
  };
</script>

<form on:submit|preventDefault={sauvegardeCommentaire}>
  <button
    type="button"
    class="mention-commentaire"
    on:click={() => $editor.commands.insertContent('@')}
  >
    <img
      src="/statique/assets/images/icone_mention.svg"
      alt="Ajouter une mention"
    />
  </button>
  <div class="conteneur-editeur">
    <EditorContent editor={$editor} />
  </div>
  <button
    type="submit"
    class="envoi-commentaire"
    disabled={!contenuCommentaire}
  >
    <img
      src="/statique/assets/images/icone_envoyer.svg"
      alt="Envoyer le commentaire"
    />
  </button>
</form>

<style>
  form {
    padding: 0 24px 0 2em;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    gap: 12px;
  }

  :global(.champ-commentaire) {
    border: 2px solid #eff6ff;
    border-radius: 4px;
    background: white;
    color: #667892;
  }

  button {
    margin: 0;
    padding: 8px;
    border: none;
    background: none;
    display: flex;
    cursor: pointer;
  }

  .mention-commentaire {
    padding-left: 6px;
  }

  :global(.mention) {
    color: var(--bleu-mise-en-avant);
    font-weight: 700;
  }

  :global(.champ-commentaire) {
    padding: 12px 16px;
    max-height: 60px;
    overflow-y: auto;
  }

  :global(.champ-commentaire:focus, .champ-commentaire:focus-visible) {
    outline: none;
  }

  :global(.champ-commentaire p) {
    margin: 0;
    color: var(--texte-fonce);
  }

  :global(.champ-commentaire p.is-editor-empty:first-child::before) {
    color: #667892;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .conteneur-editeur {
    flex: 1;
  }

  .envoi-commentaire[disabled] {
    /* #CBD5E1 */
    filter: brightness(0) invert(93%) sepia(5%) saturate(689%)
      hue-rotate(181deg) brightness(91%) contrast(94%);
  }

  .envoi-commentaire:not([disabled]):hover,
  .mention-commentaire img:hover {
    /* #08416A  */
    filter: brightness(0) saturate(100%) invert(20%) sepia(67%) saturate(1040%)
      hue-rotate(172deg) brightness(90%) contrast(99%);
  }
</style>
