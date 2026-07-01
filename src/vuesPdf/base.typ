#import "commun.typ": *

#let mise-en-page(
  nomService: none,
  corps,
) = {
  set text(font: "Marianne", size: 9pt, fill: encre, lang: "fr")

  set par(spacing: 0.65em, leading: 0.6em)

  set page(
    paper: "a4",
    margin: (x: 1.5cm, top: 1.2cm, bottom: 1.4cm),
    footer: context {
      set text(size: 7pt, fill: gris)
      v(1pt)
      grid(columns: (1fr, auto),
        [#text(fill: bleuFonce, weight: "bold")[MonServiceSécurisé] - #nomService],
        align(right)[Page #counter(page).get().first() / #counter(page).final().first()],
      )
    },
  )

  corps
}