function startOfTodayUnix() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function daysAgoUnix(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

module.exports = { startOfTodayUnix, daysAgoUnix, nowUnix };