import tippy, { type GetReferenceClientRect, type Instance } from 'tippy.js';

import ListeSuggestionsMention from './ListeSuggestionsMention.svelte';
import { get } from 'svelte/store';
import { contributeurs } from '../../tableauDesMesures/stores/contributeurs.store';
import type { Contributeur } from '../../tableauDesMesures/tableauDesMesures.d';
import type {
  SuggestionProps,
  SuggestionKeyDownProps,
} from '@tiptap/suggestion';
import { SvelteRenderer } from 'svelte-tiptap';

const suggestion = () => {
  return {
    items: ({ query }: { query: string }) => {
      return get(contributeurs)
        .filter((item) =>
          item.prenomNom.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
    },
    render: () => {
      let conteneur: HTMLDivElement;
      let composant: ListeSuggestionsMention;
      let moteurDeRendu: SvelteRenderer;
      let menuFlotant: Instance[];

      return {
        onStart: (props: SuggestionProps) => {
          const { editor } = props;

          conteneur = document.createElement('div');
          editor.view.dom.parentNode?.appendChild(conteneur);

          composant = new ListeSuggestionsMention({
            target: conteneur,
            props: {
              items: props.items,
              callback: (item: Contributeur) => {
                props.command({ id: item.id, label: item.prenomNom });
              },
            },
          });

          moteurDeRendu = new SvelteRenderer(composant, {
            element: conteneur,
          });

          menuFlotant = tippy('body', {
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
            appendTo: () => document.body,
            content: moteurDeRendu.dom,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },
        onUpdate: (props: SuggestionProps) => {
          moteurDeRendu.updateProps(props);
          menuFlotant[0].setProps({
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          });
        },
        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === 'Escape') {
            menuFlotant[0].hide();
            return true;
          }
          return composant.onKeyDown(props.event);
        },
        onExit: (props: SuggestionProps) => {
          const range = {
            from: props.editor.state.selection.from,
            to: props.editor.state.selection.from + props.query.length,
          };
          props.editor.commands.setTextSelection(range);
          props.editor.commands.deleteSelection();
          menuFlotant[0].destroy();
          moteurDeRendu.destroy();
          conteneur.remove();
        },
      };
    },
  };
};

export default suggestion;
