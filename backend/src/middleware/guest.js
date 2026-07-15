// src/middleware/guest.js
const { v4: uuidv4 } = require('uuid');

function guest(req, res, next) {
  let guestId = req.cookies?.guestId;
  if (!guestId) {
    guestId = uuidv4();
    res.cookie('guestId', guestId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
  }
  req.guestId = guestId;
  next();
} 