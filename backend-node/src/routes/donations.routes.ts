import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import DonationModel from '../models/Donation';
import { createOrder, verifyPaymentSignature, getPublicKeyId } from '../services/razorpay.service';

const router = Router();

/**
 * Create Razorpay order for a donation
 * Body: { amount: number (rupees), currency?: string, donorName?: string, donorEmail?: string, notes?: object }
 */
router.post('/order', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency = 'INR', donorName, donorEmail, notes } = req.body || {};
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const amountPaise = Math.round(Number(amount) * 100);
    const receipt = uuidv4();

    // Create order with Razorpay
    const order = await createOrder(amountPaise, currency, receipt, notes);

    // Persist donation
    const donation = await DonationModel.create({
      donorName,
      donorEmail,
      userId: req.user?.userId,
      amount: amountPaise,
      currency,
      status: 'created',
      orderId: order.id,
      notes,
    });

    return res.json({
      success: true,
      orderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: getPublicKeyId(),
      donationId: donation._id,
    });
  } catch (err: any) {
    console.error('[Donations] Create order failed:', err.message || err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * Verify payment signature after checkout
 * Body: { donationId: string, orderId: string, paymentId: string, signature: string }
 */
router.post('/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { donationId, orderId, paymentId, signature } = req.body || {};
    if (!donationId || !orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing verification fields' });
    }

    const valid = verifyPaymentSignature(orderId, paymentId, signature);
    const donation = await DonationModel.findById(donationId);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    donation.paymentId = paymentId;
    donation.signature = signature;
    donation.status = valid ? 'paid' : 'failed';
    await donation.save();

    return res.json({ success: valid });
  } catch (err: any) {
    console.error('[Donations] Verify failed:', err.message || err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
