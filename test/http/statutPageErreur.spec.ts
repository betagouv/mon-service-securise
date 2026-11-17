import { statutPageErreur } from '../../src/http/statutPageErreur.js';

describe("Le statut HTTP de la page d'erreur", () => {
  it("utilise le statut porté par l'erreur en priorité", () => {
    expect(statutPageErreur({ statutErreur: 400, statutReponse: 403 })).toEqual(
      400
    );
  });

  it("conserve le statut déjà positionné sur la réponse si l'erreur n'en porte pas", () => {
    expect(statutPageErreur({ statutReponse: 403 })).toEqual(403);
    expect(statutPageErreur({ statutReponse: 503 })).toEqual(503);
  });

  it("ignore un statut d'erreur qui n'est pas une erreur HTTP", () => {
    expect(statutPageErreur({ statutErreur: 200, statutReponse: 403 })).toEqual(
      403
    );
  });

  it("rend une 500 si aucun statut n'est une erreur", () => {
    expect(statutPageErreur({ statutReponse: 200 })).toEqual(500);
    expect(statutPageErreur({ statutErreur: 302, statutReponse: 302 })).toEqual(
      500
    );
  });
});
