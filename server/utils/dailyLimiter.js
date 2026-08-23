// Simple in-memory daily request counter — resets automatically at midnight.
// Not persistent across server restarts, which is fine for a free-tier
// friends-and-family deployment; if this app grows, swap for Redis/a DB.

const DAILY_LIMIT = parseInt(process.env.DAILY_CRAFT_LIMIT || "15", 10);

let count = 0;
let resetDate = new Date().toDateString();

function checkAndResetIfNewDay() {
  const today = new Date().toDateString();
  if (today !== resetDate) {
    count = 0;
    resetDate = today;
  }
}

export function canMakeRequest() {
  checkAndResetIfNewDay();
  return count < DAILY_LIMIT;
}

export function recordRequest() {
  checkAndResetIfNewDay();
  count++;
}

export function getUsage() {
  checkAndResetIfNewDay();
  return { used: count, limit: DAILY_LIMIT };
}