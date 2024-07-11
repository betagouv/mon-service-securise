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
        return `<div class='conteneur-video'><video src='${token.text}' controls /><p class='legende'>${token.legende}</p></div>`;
      },
    };

    marked.use({ extensions: [boiteAide, boiteInfo, boiteAlerte, video] });
  }

  versHTML() {
    return marked.parse(this.contenuMarkdown);
  }
}

module.exports = CrispMarkdown;
