import mongoose, { Document, Schema } from 'mongoose';

export interface Donation extends Document {
  donorName?: string;
  donorEmail?: string;
  userId?: string; // optional platform user
  amount: number; // amount in smallest unit (paise)
  currency: string; // e.g., INR
  status: 'created' | 'paid' | 'failed' | 'refunded';
  orderId?: string;
  paymentId?: string;
  signature?: string;
  notes?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<Donation>(
  {
    donorName: { type: String },
    donorEmail: { type: String },
    userId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
    notes: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

DonationSchema.index({ orderId: 1 }, { unique: true, sparse: true });

export default mongoose.model<Donation>('Donation', DonationSchema);
