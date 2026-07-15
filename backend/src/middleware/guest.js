const { v4: uuidv4 } = require('uuid');

function guest(req, res, next) {
  let guestId = req.cookies?.guestId;
  if (!guestId) {
    guestId = uuidv4();

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('guestId', guestId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
  }
  req.guestId = guestId;
  next();
}

module.exports = guest;