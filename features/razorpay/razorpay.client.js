const axios = require('axios');
const { decrypt } = require('../../lib/encryption');

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

function getAuthHeader(merchant) {
  const keySecret = decrypt(merchant.razorpayKeySecretEncrypted);
  const token = Buffer.from(`${merchant.razorpayKeyId}:${keySecret}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

async function fetchPayments(merchant, { from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

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

module.exports = { fetchPayments, fetchSettlements };