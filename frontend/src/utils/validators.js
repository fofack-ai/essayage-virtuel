// Numéros mobiles camerounais : 9 chiffres, commencent par 6
// Ex : 671207375, 690123456
export function isValidCameroonPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/\s+/g, '');
  return /^6\d{8}$/.test(cleaned);
}

// Domaines de messagerie acceptés à l'inscription
const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'yahoo.fr'];

export function isValidAllowedEmail(email) {
  if (!email) return false;
  const match = /^[^\s@]+@([^\s@]+)$/.exec(email.trim().toLowerCase());
  if (!match) return false;
  return ALLOWED_EMAIL_DOMAINS.includes(match[1]);
}