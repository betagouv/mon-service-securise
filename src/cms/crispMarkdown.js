const { marked } = require('marked');

const extensionBoite = (regex, nom, classe) => ({
  name: nom,
  level: 'block',
  start(src) {
    return src.match(regex)?.index;
  },
  tokenizer(src) {
    const match = regex.exec(src);
    if (match) {
      const token = {
        type: nom,
        raw: match[0],
        text: match[1].trim(),
        tokens: [],
      };
      this.lexer.inline(token.text, token.tokens);
      return token;
    }
    return false;
  },
  renderer(token) {
    return `<div class='${classe}'>${this.parser.parseInline(
      token.tokens
    )}</div>`;
  },
});

class CrispMarkdown {
  constructor(contenuMarkdown) {
    this.contenuMarkdown = contenuMarkdown;
    this.contenuHTML = null;
    this.aDejaParse = false;
    this.tdm = [];

    const boiteAide = extensionBoite(/^\|([^|\n]+)/, 'boiteAide', 'aide');
    const boiteInfo = extensionBoite(
      /^\|\|([^||\n]+)/,
      'boiteInfo',
      'information'
    );
    const boiteAlerte = extensionBoite(
      /^\|\|\|([^|||\n]+)/,
      'boiteAlerte',
      'alerte'
    );

    const regexVideo = /^\${frame}\[(.*)\]\((.*)\)\n/;
    const video = {
      name: 'video',
      level: 'block',
      start(src) {
        return src.match(regexVideo)?.index;
      },
      tokenizer(src) {
        const match = regexVideo.exec(src);
        if (match) {
          return {
            type: 'video',
            raw: match[0],
            text: match[2].trim(),
            legende: match[1].trim(),
            tokens: [],
          };
        }
        return false;
      },
      renderer(token) {
        return `<div class='conteneur-video'><video src='${token.text}' controls></video><p class='legende'>${token.legende}</p></div>`;
      },
    };

    const moteurDeRendu = (that) => ({
      heading(texte, profondeur) {
        const slugDuTitre = texte.toLowerCase().replace(/\W+/g, '-');
        const profondeurAjustee = Math.min(Math.max(profondeur + 1, 2), 4);
        that.tdm.push({
          profondeur: profondeurAjustee,
          texte,
          id: slugDuTitre,
        });

        return `<h${profondeurAjustee} id='${slugDuTitre}'>${texte}</h${profondeurAjustee}>`;
      },
      link(lien, _, texte) {
        if (texte.includes('Télécharger'))
          return `<a href='${lien}' class='telechargement' target='_blank' rel='noreferrer nofollow'>${texte}</a>`;
        return `<a href='${lien}' target='_blank' rel='noreferrer nofollow'>${texte}</a>`;
      },
    });

    marked.use({
      renderer: moteurDeRendu(this),
      extensions: [boiteAide, boiteInfo, boiteAlerte, video],
    });
  }

  parseLeMarkdown() {
    this.contenuHTML = marked.parse(this.contenuMarkdown);
    this.aDejaParse = true;
  }

  versHTML() {
    if (!this.aDejaParse) this.parseLeMarkdown();
    return this.contenuHTML;
  }

  tableDesMatieres() {
    if (!this.aDejaParse) this.parseLeMarkdown();
    return this.tdm;
  }
}

module.exports = CrispMarkdown;
