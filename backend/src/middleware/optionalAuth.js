const { verifyToken } = require("../utils/jwt");
const guest = require("./guest");

/**
 * Identifie le porteur du panier sans jamais rejeter la requête :
 *   - token valide -> req.owner = { userId }
 *   - sinon        -> cookie guestId -> req.owner = { guestId }
 *
 * Permet d'ajouter au panier sans compte, afin de mettre l'essayage
 * virtuel en avant dès la première visite.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (header) {
    try {
      req.user = verifyToken(header.split(" ")[1]);
      req.owner = { userId: req.user.id };
      return next();
    } catch (_) {
      // Token invalide ou expiré : on bascule en invité plutôt que de bloquer.
    }
  }

  return guest(req, res, () => {
    req.owner = { guestId: req.guestId };
    next();
  });
}

module.exports = optionalAuth;