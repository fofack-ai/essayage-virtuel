const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'yahoo.fr'];

function isValidCameroonPhone(phone) {
  if (!phone) return false;
  const cleaned = String(phone).replace(/\s+/g, '');
  return /^6\d{8}$/.test(cleaned);
}

function isValidAllowedEmail(email) {
  if (!email) return false;
  const match = /^[^\s@]+@([^\s@]+)$/.exec(String(email).trim().toLowerCase());
  if (!match) return false;
  return ALLOWED_EMAIL_DOMAINS.includes(match[1]);
}

module.exports = { isValidCameroonPhone, isValidAllowedEmail };