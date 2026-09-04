require('dotenv').config();
const axios = require('axios');

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

const DEMO_SET = [
  { amount: 500, outcome: 'success' },
  { amount: 1200, outcome: 'success' },
  { amount: 2500, outcome: 'failed' },
  { amount: 750, outcome: 'success' },
  { amount: 3000, outcome: 'success' },
  { amount: 1500, outcome: 'failed' },
  { amount: 850, outcome: 'success' },
  { amount: 2000, outcome: 'success' },
];

const TEST_CARDS = {
  success: { number: '4111 1111 1111 1111', note: "then enter OTP '1234' on the mock bank page" },
  failed: { number: '4100 2800 0008 0001', note: 'auto-declines — no OTP screen' },
};

function getArgTimes() {
  const arg = process.argv.find((a) => a.startsWith('--times='));
  const n = arg ? parseInt(arg.split('=')[1], 10) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function getAuthHeader() {
  const keyId = process.env.RAZORPAY_TEST_KEY_ID;
  const keySecret = process.env.RAZORPAY_TEST_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error('Set RAZORPAY_TEST_KEY_ID and RAZORPAY_TEST_KEY_SECRET in .env first.');
    process.exit(1);
  }
  const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

async function createPaymentLink({ amount, outcome, index }) {
  const payload = {
    amount: amount * 100, // paise
    currency: 'INR',
    accept_partial: false,
    description: `Merchant Copilot demo txn #${index} (${outcome})`,
    reference_id: `demo-${Date.now()}-${index}`,
    notify: { sms: false, email: false },
    reminder_enable: false,
  };

  const response = await axios.post(`${RAZORPAY_BASE_URL}/payment_links`, payload, {
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
  });

  return response.data; // includes short_url
}

async function main() {
  const times = getArgTimes();
  const batch = Array.from({ length: times }, () => DEMO_SET).flat();

  console.log(`\nCreating ${batch.length} Razorpay Test Mode payment links...\n`);

  const created = [];
  for (let i = 0; i < batch.length; i++) {
    const { amount, outcome } = batch[i];
    try {
      const link = await createPaymentLink({ amount, outcome, index: i + 1 });
      created.push({ amount, outcome, url: link.short_url });
      console.log(`  [${i + 1}/${batch.length}] ₹${amount} (${outcome}) → ${link.short_url}`);
    } catch (err) {
      const msg = err.response?.data?.error?.description || err.message;
      console.error(`  [${i + 1}/${batch.length}] FAILED to create link for ₹${amount}: ${msg}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  const totalCollected = created.filter((c) => c.outcome === 'success').reduce((s, c) => s + c.amount, 0);

  console.log('\n' + '='.repeat(60));
  console.log('NEXT STEP — pay each link in an actual browser tab:');
  console.log('='.repeat(60));
  console.log(`\nFor ✅ success links, use card ${TEST_CARDS.success.number}`);
  console.log(`  (${TEST_CARDS.success.note})`);
  console.log(`\nFor ❌ failed links, use card ${TEST_CARDS.failed.number}`);
  console.log(`  (${TEST_CARDS.failed.note})\n`);

  created.forEach((c, i) => {
    const mark = c.outcome === 'success' ? '✅' : '❌';
    console.log(`  ${i + 1}. ${mark} ₹${c.amount}  ${c.url}`);
  });

  console.log(`\nOnce paid, "today" / "this week" / "recent payments" will show these`);
  console.log(`~${created.length} payments (~₹${totalCollected} expected collected).`);
  console.log(`\nSettlement Status can't be forced via API — Razorpay Test Mode runs its`);
  console.log(`own mock settlement cycle once captured payments exist, usually within`);
  console.log(`a day. Check "settlement" again after paying the links above.\n`);
}

main().catch((err) => {
  console.error('Seed failed:', err.response?.data || err.message);
  process.exit(1);
});