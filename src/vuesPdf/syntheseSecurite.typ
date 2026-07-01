#let donnees = json(bytes(sys.inputs.payload))

#let bleu     = rgb("#000091")
#let encre    = rgb("#161616")
#let gris     = rgb("#666666")
#let grisBord = rgb("#dddddd")

#set text(font: "Marianne", size: 9pt, fill: encre, lang: "fr")
#set par(spacing: 0.65em, leading: 0.6em)
#set page(
  paper: "a4",
  margin: (x: 1.5cm, top: 1.2cm, bottom: 1.4cm),
  footer: context {
    set text(size: 7pt, fill: gris)
    line(length: 100%, stroke: 0.5pt + grisBord)
    v(1pt)
    grid(columns: (1fr, auto),
      [#text(fill: bleu, weight: "bold")[MonServiceSécurisé] - #donnees.nomService],
      align(right)[Page #counter(page).get().first() / #counter(page).final().first()],
    )
  },
)

CONTENU