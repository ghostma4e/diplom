import crypto from 'crypto';

export function generateInviteCode(length = 8) {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}
