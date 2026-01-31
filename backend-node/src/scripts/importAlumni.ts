import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import Alumni from '../models/Alumni';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hacktopia';

interface CSVRow {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  rollno: string;
  cgpa: string;
  dob: string;
  lifeMemberNo: string;
  profileCompletion: string;
  course: string;
  batch: string;
  duration: string;
  skills: string;
  experience: string;
  higherEducation: string;
  social: string;
  about: string;
  livesIn: string;
  homeTown: string;
  createdAt: string;
  updatedAt: string;
}

const parseJSON = (jsonString: string, defaultValue: any = {}) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

const importAlumniFromCSV = async () => {
  const csvFilePath = path.join(__dirname, '../../..', 'frontend1', 'resume', 'public', 'alumni_export_2025-11-05.csv');

  console.log('📂 CSV File Path:', csvFilePath);
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ CSV file not found:', csvFilePath);
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing alumni data
    console.log('🗑️  Clearing existing alumni data...');
    await Alumni.deleteMany({});
    console.log('✅ Cleared existing data');

    // Read and parse CSV
    const alumniData: any[] = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row: CSVRow) => {
          try {
            const alumni = {
              id: row.id,
              name: row.name,
              email: row.email,
              contactNo: row.contactNo || '',
              rollno: row.rollno,
              cgpa: row.cgpa || '',
              dob: row.dob || '',
              lifeMemberNo: row.lifeMemberNo || '',
              profileCompletion: row.profileCompletion || '0',
              course: parseJSON(row.course, { name: '' }),
              batch: parseJSON(row.batch, { year: '' }),
              duration: parseJSON(row.duration, { value: '' }),
              skills: row.skills || '',
              experience: row.experience || '',
              higherEducation: row.higherEducation || '',
              social: parseJSON(row.social, { github: null, twitter: null, facebook: null, linkedin: null }),
              about: parseJSON(row.about, {}),
              livesIn: parseJSON(row.livesIn, { city: '' }),
              homeTown: parseJSON(row.homeTown, { city: '' }),
              createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
              updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
            };
            
            alumniData.push(alumni);
          } catch (error) {
            console.error('❌ Error parsing row:', error);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Parsed ${alumniData.length} alumni records`);

    // Insert alumni data
    console.log('💾 Importing alumni data...');
    const result = await Alumni.insertMany(alumniData, { ordered: false });
    console.log(`✅ Successfully imported ${result.length} alumni records`);

    // Create text index
    console.log('🔍 Creating text index...');
    await Alumni.collection.createIndex({
      name: 'text',
      email: 'text',
      skills: 'text',
      experience: 'text',
      'course.name': 'text',
      'batch.year': 'text',
      'livesIn.city': 'text'
    });
    console.log('✅ Text index created');

    // Display statistics
    const stats = await Alumni.aggregate([
      {
        $group: {
          _id: '$course.name',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Import Statistics:');
    console.log('Total Alumni:', alumniData.length);
    console.log('\nBy Course:');
    stats.forEach(s => console.log(`  ${s._id}: ${s.count}`));

  } catch (error) {
    console.error('❌ Error importing alumni:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Import completed and disconnected from MongoDB');
  }
};

// Run the import
importAlumniFromCSV();
