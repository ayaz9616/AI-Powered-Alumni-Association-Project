import Razorpay from 'razorpay';
import crypto from 'crypto';

const getKeys = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  return { key_id, key_secret };
};

let client: Razorpay | null = null;

export const getRazorpayClient = () => {
  if (client) return client;
  const { key_id, key_secret } = getKeys();
  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET missing');
  }
  client = new Razorpay({ key_id, key_secret });
  return client;
};

export const createOrder = async (amountPaise: number, currency = 'INR', receipt?: string, notes?: Record<string, any>) => {
  const rp = getRazorpayClient();
  const order = await rp.orders.create({ amount: amountPaise, currency, receipt, notes });
  return order;
};

export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string): boolean => {
  const { key_secret } = getKeys();
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', key_secret).update(body).digest('hex');
  return expected === signature;
};

export const getPublicKeyId = () => getKeys().key_id;
