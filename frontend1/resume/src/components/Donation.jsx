import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { donationAPI } from '../services/api';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Donation() {
  const [amount, setAmount] = useState('500');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Preload script
    loadRazorpay();
  }, []);

  const startDonation = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setLoading(true);
    const scriptReady = await loadRazorpay();
    if (!scriptReady) {
      toast.error('Failed to load payment gateway');
      setLoading(false);
      return;
    }

    try {
      const { data } = await donationAPI.createOrder({ amount: amt, donorName, donorEmail });
      if (!data?.orderId || !data?.keyId) {
        throw new Error('Invalid order response');
      }

      const options = {
        key: data.keyId,
        amount: data.amountPaise,
        currency: data.currency || 'INR',
        name: 'Hacktopia Alumni',
        description: 'Donation',
        order_id: data.orderId,
        prefill: { name: donorName, email: donorEmail },
        theme: { color: '#10b981' },
        handler: async function (response) {
          try {
            const verifyRes = await donationAPI.verifyPayment({
              donationId: data.donationId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (verifyRes.data?.success) {
              toast.success('Thank you! Donation successful');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Verification error');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed');
      });
      rzp.open();
    } catch (err) {
      toast.error('Failed to create donation order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Support Alumni Mentorship</h1>
        <p className="text-neutral-400 mb-8">Your donation helps us run mentorship sessions, events, and student programs.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm text-neutral-400">Amount (INR)</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <label className="block text-sm text-neutral-400">Name (optional)</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your name"
            />

            <label className="block text-sm text-neutral-400">Email (optional)</label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
            />

            <button
              onClick={startDonation}
              disabled={loading}
              className="mt-4 w-full bg-green-500 text-black py-3 rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Donate'}
            </button>
          </div>

          <div className="p-6 bg-neutral-900 border border-white/10 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Why Donate?</h2>
            <ul className="text-neutral-300 space-y-2 list-disc list-inside">
              <li>Fund student mentorship sessions</li>
              <li>Support community events and workshops</li>
              <li>Help maintain the platform</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
