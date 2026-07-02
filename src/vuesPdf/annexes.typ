#import "commun.typ": *

#let donnees = json(bytes(sys.inputs.payload))

#set text(font: "Marianne", size: 9pt, fill: encre, lang: "fr")
#set par(spacing: 0.65em, leading: 0.6em)
#set page(
  paper: "a4",
  margin: (x: 1cm, top: 0.78cm, bottom: 1.4cm),
  footer: context {
    set text(size: 7pt, fill: gris)
    v(1pt)
    grid(columns: (1fr, auto),
      [#text(fill: bleuFonce, weight: "bold")[MonServiceSécurisé] - #donnees.donneesDescription.nomService],
      align(right)[Page #counter(page).get().first() / #counter(page).final().first()],
    )
  },
)

#include "annexe.description.typ"

#pagebreak()
#include "annexe.mesures.typ"

#if donnees.at("donneesRisques", default: none) != none {
  pagebreak()
  if donnees.at("versionPdfRisques", default: "v1") == "v2" {
    set page(
      margin: (x: 1cm, top: 3cm, bottom: 1.4cm),
      header: [
        #v(0.78cm)
        #entete(
          "assets/icone_dossier.png",
          "Risques de sécurité",
          "Tous les risques que l'on peut rencontrer pour votre service, classés par niveau de gravité en matière d'impact.",
        )
      ],
    )
    include "annexe.risquesV2.typ"
  } else {
    set page(
      margin: (x: 1cm, top: 3cm, bottom: 1.4cm),
      header: [
        #v(0.78cm)
        #entete(
          "assets/icone_dossier.png",
          "Risques de sécurité",
          "Tous les risques que l'on peut rencontrer pour votre service, classés par niveau de gravité en matière d'impact.",
        )
      ],
    )
    include "annexe.risques.typ"
  }
}
