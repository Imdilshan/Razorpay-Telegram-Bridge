// const axios = require('axios');
// const { decrypt } = require('../../lib/encryption');

// const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

// function getAuthHeader(merchant) {
//   const keySecret = decrypt(merchant.keySecretEncrypted);
//   const token = Buffer.from(`${merchant.keyId}:${keySecret}`).toString('base64');
//   return { Authorization: `Basic ${token}` };
// }

// async function fetchPayments(merchant, { from, to } = {}) {
//   const params = {};
//   if (from) params.from = from;
//   if (to) params.to = to;

//   const response = await axios.get(`${RAZORPAY_BASE_URL}/payments`, {
//     headers: getAuthHeader(merchant),
//     params,
//   });
//   return response.data.items || [];
// }

// async function fetchSettlements(merchant, { from, to } = {}) {
//   const params = {};
//   if (from) params.from = from;
//   if (to) params.to = to;

//   const response = await axios.get(`${RAZORPAY_BASE_URL}/settlements`, {
//     headers: getAuthHeader(merchant),
//     params,
//   });
//   return response.data.items || [];
// }

// async function getSuccessRate(merchant, { from, to } = {}) {
//   const payments = await fetchPayments(merchant, { from, to });
//   const total = payments.length;
//   const captured = payments.filter((p) => p.status === 'captured').length;
//   const rate = total === 0 ? null : (captured / total) * 100;
//   return { total, captured, failed: total - captured, rate };
// }

// async function getLastSettlement(merchant) {
//   const settlements = await fetchSettlements(merchant);
//   if (settlements.length === 0) return null;
//   return settlements.reduce((latest, s) => (s.created_at > latest.created_at ? s : latest));
// }

// module.exports = { fetchPayments, fetchSettlements, getSuccessRate, getLastSettlement };

const axios = require('axios');
const { decrypt } = require('../../lib/encryption');

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

function getAuthHeader(merchant) {
  const keySecret = decrypt(merchant.keySecretEncrypted);
  const token = Buffer.from(`${merchant.keyId}:${keySecret}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

async function fetchPayments(merchant, { from, to, count } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (count) params.count = count;

  const response = await axios.get(`${RAZORPAY_BASE_URL}/payments`, {
    headers: getAuthHeader(merchant),
    params,
  });
  return response.data.items || [];
}

async function fetchSettlements(merchant, { from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await axios.get(`${RAZORPAY_BASE_URL}/settlements`, {
    headers: getAuthHeader(merchant),
    params,
  });
  return response.data.items || [];
}

async function getSuccessRate(merchant, { from, to } = {}) {
  const payments = await fetchPayments(merchant, { from, to });
  const total = payments.length;
  const captured = payments.filter((p) => p.status === 'captured').length;
  const rate = total === 0 ? null : (captured / total) * 100;
  return { total, captured, failed: total - captured, rate };
}

async function getLastSettlement(merchant) {
  const settlements = await fetchSettlements(merchant);
  if (settlements.length === 0) return null;
  return settlements.reduce((latest, s) => (s.created_at > latest.created_at ? s : latest));
}

// Shared by "today" and "this week" — same shape, different date window.
// Unlike getSuccessRate, this also sums the ₹ amount actually collected
// (captured payments only), which the collections views need to show.
async function getCollectionStats(merchant, { from, to } = {}) {
  const payments = await fetchPayments(merchant, { from, to, count: 100 });
  const capturedPayments = payments.filter((p) => p.status === 'captured');

  const total = payments.length;
  const captured = capturedPayments.length;
  const failed = total - captured;
  const rate = total === 0 ? null : (captured / total) * 100;
  const amountCollected = capturedPayments.reduce((sum, p) => sum + p.amount, 0);

  return { total, captured, failed, rate, amountCollected };
}

// Razorpay returns payments newest-first by default, so no extra sorting needed.
async function getRecentPayments(merchant, { count = 5 } = {}) {
  return fetchPayments(merchant, { count });
}

module.exports = {
  fetchPayments,
  fetchSettlements,
  getSuccessRate,
  getLastSettlement,
  getCollectionStats,
  getRecentPayments,
};