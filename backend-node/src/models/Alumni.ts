import mongoose, { Document, Schema } from 'mongoose';

export interface ISocial {
  github?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
}

export interface ICourse {
  name: string;
}

export interface IBatch {
  year: string;
}

export interface IDuration {
  value: string;
}

export interface ILocation {
  city: string;
}

export interface IAlumni extends Document {
  id: string;
  name: string;
  email: string;
  contactNo?: string;
  rollno: string;
  cgpa?: string;
  dob?: string;
  lifeMemberNo?: string;
  profileCompletion: string;
  course: ICourse;
  batch: IBatch;
  duration: IDuration;
  skills: string;
  experience: string;
  higherEducation: string;
  social: ISocial;
  about: object;
  livesIn: ILocation;
  homeTown: ILocation;
  createdAt: Date;
  updatedAt: Date;
}

const AlumniSchema = new Schema<IAlumni>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNo: { type: String, default: '' },
    rollno: { type: String, required: true },
    cgpa: { type: String, default: '' },
    dob: { type: String, default: '' },
    lifeMemberNo: { type: String, default: '' },
    profileCompletion: { type: String, default: '0' },
    course: {
      name: { type: String, required: true }
    },
    batch: {
      year: { type: String, required: true }
    },
    duration: {
      value: { type: String, required: true }
    },
    skills: { type: String, default: '' },
    experience: { type: String, default: '' },
    higherEducation: { type: String, default: '' },
    social: {
      github: { type: String, default: null },
      twitter: { type: String, default: null },
      facebook: { type: String, default: null },
      linkedin: { type: String, default: null }
    },
    about: { type: Object, default: {} },
    livesIn: {
      city: { type: String, default: '' }
    },
    homeTown: {
      city: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Create text index for search functionality
AlumniSchema.index({
  name: 'text',
  email: 'text',
  skills: 'text',
  experience: 'text',
  'course.name': 'text',
  'batch.year': 'text',
  'livesIn.city': 'text'
});

export default mongoose.model<IAlumni>('Alumni', AlumniSchema);
