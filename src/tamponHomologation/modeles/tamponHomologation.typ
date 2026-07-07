#let donnees = json(bytes(sys.inputs.payload))
#let taille = donnees.tailleDispositif

#let bleuFonce  = rgb("#0d0c21")
#let bleuTitre  = rgb("#1c293b")
#let bleuPilule = rgb("#0163cb")
#let fondPilule = rgb("#e8edff")
#let fondEntete = rgb("#dbecf1")
#let grisFooter = rgb("#3a3a3a")

// Sous Typst, Marianne a une hauteur de ligne "naturelle" (sans interligne additionnel)
// d'environ 0.7em, bien plus compacte que la métrique ~1.15-1.2em habituelle des
// navigateurs. La maquette CSS d'origine choisit ses tailles de police et line-height
// indépendamment (ex. 14px/24px, 28px/36px) : pour obtenir le même rendu, on calcule le
// nombre de lignes réellement produites par le texte à une largeur donnée, puis on
// détermine l'interligne à appliquer pour que ce nombre de lignes occupe exactement
// `nombreDeLignes * hauteurLigneCss`, et on centre le tout verticalement dans une boîte
// de cette hauteur (pour reproduire l'effet du line-height sur une ligne unique).
#let hauteur-naturelle-ligne = 0.7

#let ligneCss(taillePolice, hauteurLigneCss, disponible, corps) = context {
  let naturelle = hauteur-naturelle-ligne * taillePolice
  let hauteurSansInterligne = measure(
    block(width: disponible)[
      #set par(leading: 0em, spacing: 0pt)
      #corps
    ]
  ).height
  let nombreDeLignes = calc.max(calc.round(hauteurSansInterligne / naturelle), 1)
  let hauteurTotale = nombreDeLignes * hauteurLigneCss
  let interligne = if nombreDeLignes <= 1 {
    0em
  } else {
    (
      nombreDeLignes * (hauteurLigneCss - naturelle)
        / ((nombreDeLignes - 1) * taillePolice)
    ) * 1em
  }
  box(height: hauteurTotale, width: disponible)[
    #align(horizon + left)[
      #block(width: disponible)[
        #set par(leading: interligne, spacing: 0pt)
        #corps
      ]
    ]
  ]
}

#set page(width: donnees.largeur * 1pt, height: auto, margin: 0pt, fill: none)
#set text(font: "Marianne", fill: bleuFonce, size: 14pt)
#set par(spacing: 0pt)
#set block(spacing: 0pt)

#let presets = (
  mobile: (
    inset-entete: (x: 24pt, y: 24pt),
    inset-pied: (x: 24pt, y: 24pt),
    taille-titre: 28pt,
    hauteur-ligne-titre: 36pt,
    cartouche-en-ligne: false,
    inset-cartouche: (x: 24pt, y: 12pt),
    titre-largeur-min: 0pt,
    pilule-largeur-max: none,
    contenu-largeur-max: none,
    logo-mss-absolu: false,
    logo-tampon-largeur: 94pt,
    logo-tampon-dx: 0pt,
    logo-tampon-dy: -40pt,
    footer-largeur: none,
    marge-gauche-pied: 0pt,
  ),
  tablette: (
    inset-entete: (x: 48pt, y: 24pt),
    inset-pied: (x: 48pt, y: 24pt),
    taille-titre: 32pt,
    hauteur-ligne-titre: 40pt,
    cartouche-en-ligne: true,
    inset-cartouche: (x: 12pt, y: 12pt),
    titre-largeur-min: 0pt,
    pilule-largeur-max: none,
    contenu-largeur-max: none,
    logo-mss-absolu: false,
    logo-tampon-largeur: 155pt,
    logo-tampon-dx: 20pt,
    logo-tampon-dy: -90pt,
    footer-largeur: 398pt,
    marge-gauche-pied: 0pt,
  ),
  desktop: (
    inset-entete: (x: 64pt, y: 47pt),
    inset-pied: (x: 64pt, y: 24pt),
    taille-titre: 32pt,
    hauteur-ligne-titre: 40pt,
    cartouche-en-ligne: true,
    inset-cartouche: (x: 12pt, y: 12pt),
    titre-largeur-min: 300pt,
    pilule-largeur-max: 354pt,
    contenu-largeur-max: 644pt,
    logo-mss-absolu: true,
    logo-tampon-largeur: 226pt,
    logo-tampon-dx: 22pt,
    logo-tampon-dy: -236pt,
    footer-largeur: none,
    marge-gauche-pied: 164pt,
  ),
)

#let p = presets.at(taille)

// Largeur du contenu de l'entête (titre + cartouches), en tenant compte du plafond
// éventuel (max-width desktop) qui est plus étroit que la largeur disponible.
#let largeurContenuEntete = if p.contenu-largeur-max != none {
  p.contenu-largeur-max
} else {
  donnees.largeur * 1pt - 2 * p.inset-entete.x
}

#let largeurContenuCartouche = largeurContenuEntete - 2 * p.inset-cartouche.x

#let titreCartouche(texte, disponible) = block(width: disponible)[
  #text(fill: bleuTitre, weight: "medium", size: 14pt)[#texte]
]

// Version "nue" (sans son propre contexte) pour pouvoir être appelée depuis un
// contexte déjà ouvert (cartouche en ligne) sans imbriquer deux contextes autour
// d'un measure() : cette imbrication désynchronisait la largeur mesurée de la
// pilule de sa largeur réellement dessinée, et la faisait déborder de la cartouche.
#let construitPilule(texte, largeur-max) = {
  let contenu = text(fill: bleuPilule, weight: "bold", size: 14pt)[#texte]
  let largeur-naturelle = measure(contenu).width
  let largeur = if largeur-max != none and largeur-naturelle > largeur-max {
    largeur-max
  } else {
    auto
  }
  box(fill: fondPilule, radius: 4pt, inset: (x: 8pt, y: 4pt), width: largeur)[#contenu]
}

#let pilule(texte, largeur-max: none) = context construitPilule(texte, largeur-max)

#let cartouche(titre, description) = context {
  if p.cartouche-en-ligne {
    // calc.max (plutôt qu'un simple if/else renvoyant p.titre-largeur-min tel quel)
    // reproduit la vraie sémantique CSS de min-width (le titre grandit si besoin), et
    // évite au passage un bug de mise en cache de Typst : un contexte dont une branche
    // ne mesure jamais rien (ici, l'ancienne branche qui renvoyait la constante du
    // preset sans passer par `measure`) peut ne pas être réévalué correctement lors des
    // passes de mise en page suivantes, ce qui désynchronisait la hauteur réelle de la
    // pilule (repliée sur plusieurs lignes) de la hauteur retenue pour la cartouche.
    let colTitre = calc.max(
      p.titre-largeur-min,
      measure(text(fill: bleuTitre, weight: "medium", size: 14pt)[#titre]).width,
    )
    // La pilule ne doit jamais pouvoir demander plus que la place restante sur la ligne,
    // à l'intérieur de la cartouche (donc after déduction du padding interne de la
    // cartouche elle-même, pas seulement de la colonne de titre et du séparateur) : sur
    // desktop par exemple, titre-largeur-min (300pt) + séparateur (12pt) +
    // pilule-largeur-max (354pt) + le padding de la cartouche (24pt) dépasse déjà
    // contenu-largeur-max (644pt). Sans ce plafond, la pilule se replie en tenant compte
    // de sa seule largeur maximale déclarée, alors que la cartouche (elle, contrainte par
    // la largeur disponible réelle) se redessine plus étroite : les deux tailles se
    // désynchronisent et la pilule déborde de la cartouche.
    let largeurRestante = largeurContenuEntete - 2 * p.inset-cartouche.x - colTitre - 12pt
    let plafondPilule = if p.pilule-largeur-max != none {
      calc.min(p.pilule-largeur-max, largeurRestante)
    } else {
      largeurRestante
    }
    // On résout la pilule (et sa largeur exacte, replis compris) avant de construire la
    // grille et la cartouche : les mesurer une fois pour toutes ici évite qu'une colonne
    // "auto" (ou une cartouche dont la taille dépend encore d'un contexte interne) ne se
    // désynchronise de la hauteur réellement occupée par la pilule repliée sur 2 lignes.
    let contenuPilule = construitPilule(description, plafondPilule)
    let colPilule = measure(contenuPilule).width
    box(fill: white, radius: 5pt, inset: p.inset-cartouche)[
      #grid(
        columns: (colTitre, colPilule),
        column-gutter: 12pt,
        align: (left + horizon, left + horizon),
        titreCartouche(titre, colTitre),
        contenuPilule,
      )
    ]
  } else {
    block(fill: white, radius: 5pt, width: 100%, inset: p.inset-cartouche)[
      #titreCartouche(titre, largeurContenuCartouche)
      #v(8pt)
      #pilule(description, largeur-max: largeurContenuCartouche)
    ]
  }
}

#let entete = block(fill: fondEntete, width: 100%, inset: p.inset-entete)[
  #block(width: largeurContenuEntete)[
    #ligneCss(
      p.taille-titre,
      p.hauteur-ligne-titre,
      largeurContenuEntete,
      text(size: p.taille-titre, weight: "bold")[#donnees.nomService],
    )
  ]
  #v(28pt)
  #block(width: largeurContenuEntete)[
    #stack(
      spacing: 8pt,
      cartouche("Organisation responsable", donnees.organisationResponsable),
      cartouche("Date d'homologation", donnees.dateHomologation),
      cartouche("Durée et échéance de l'homologation", donnees.dureeEtEcheance),
    )
  ]
]

#let logoMss = image("../../../public/assets/images/logo_mss.png", width: 140pt)
#let logoTampon = image(
  "../../../public/assets/images/tampon_homologation.png",
  width: p.logo-tampon-largeur,
)

#let piedPage = block(fill: white, width: 100%, inset: p.inset-pied)[
  #place(top + right, dx: p.logo-tampon-dx, dy: p.logo-tampon-dy)[#logoTampon]
  #if p.logo-mss-absolu [
    #place(top + left)[#logoMss]
  ] else [
    #logoMss
    #v(if taille == "mobile" { 24pt } else { 12pt })
  ]
  #let largeurPied = donnees.largeur * 1pt - 2 * p.inset-pied.x - p.marge-gauche-pied
  #block(width: 100% - p.marge-gauche-pied, inset: (left: p.marge-gauche-pied))[
    #let largeurTexteFooter = if p.footer-largeur != none { p.footer-largeur } else { largeurPied }
    #block(width: largeurTexteFooter)[
      #ligneCss(
        14pt,
        24pt,
        largeurTexteFooter,
        text(fill: grisFooter)[
          Ce service a été sécurisé et homologué avec l'aide de MonServiceSécurisé : un outil
          gratuit et 100% en ligne proposé par l'Agence nationale de la sécurité des systèmes
          d'information (ANSSI) pour les entités publiques et leurs prestataires.
        ],
      )
    ]
    #v(16pt)
    #ligneCss(
      14pt,
      24pt,
      largeurPied,
      text[
        Protégeons les services publics en ligne |
        #text(weight: "bold")[monservicesecurise.cyber.gouv.fr]
      ],
    )
  ]
]

#box(width: 100%, radius: 8pt, clip: true)[
  #entete
  #piedPage
]
