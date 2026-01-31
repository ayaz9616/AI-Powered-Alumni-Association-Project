import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, setProfileComplete, isProfileComplete } from '../lib/authManager';
import { 
  parseResume, 
  getStudentProfile, updateStudentProfile, createStudentProfileManual,
  getAlumniProfile, updateAlumniProfile, createAlumniProfileManual 
} from '../services/mentorshipApi';

const inputClass =
  "w-full bg-black text-white caret-green-400 " +
  "border border-white/10 rounded-lg px-4 py-2 text-sm " +
  "placeholder:text-neutral-500 " +
  "transition-all duration-200 " +
  "hover:border-white/20 " +
  "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30";

function Onboarding() {
  const navigate = useNavigate();
  const userProfile = getUserProfile();
  const [step, setStep] = useState(1); // 1: Upload Resume, 2: Fill Details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: '',
    branch: '',
    batch: '',
    cgpa: '',
    domain: '',
    currentRole: '',
    company: '',
    totalExperience: '',
    skills: '',
    linkedIn: '',
    github: '',
    portfolioUrl: '',
    careerGoals: '',
    profileSummary: ''
  });

  useEffect(() => {
    if (isProfileComplete()) {
      navigate('/');
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError('Please select a resume file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('resume', resumeFile);

      const response = await parseResume(uploadFormData);

      if (response.parsedData) {
        const parsed = response.parsedData;
        setFormData({
          name: parsed.Name || userProfile.name || '',
          email: parsed.Email || userProfile.email || '',
          phone: parsed["Phone Number"] || '',
          branch: parsed.Branch || '',
          batch: parsed.Batch || '',
          cgpa: parsed.CGPA || '',
          domain: parsed.Domain || '',
          currentRole: '',
          company: '',
          totalExperience: parsed["Total year of experience"] || '',
          skills: Array.isArray(parsed["skill keyword"]) ? parsed["skill keyword"].join(', ') : '',
          linkedIn: parsed.LinkedIn || '',
          github: parsed.github || '',
          portfolioUrl: parsed["portfolio URL"] || '',
          careerGoals: parsed.Goal || '',
          profileSummary: parsed["Profile Summary"] || ''
        });
        setStep(2);
      } else {
        throw new Error('Failed to parse resume');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.email) {
        throw new Error('Name and email are required');
      }

      if (userProfile.role === 'student') {
        if (!formData.branch || !formData.batch) {
          throw new Error('Branch and batch are required for students');
        }
      } else {
        if (!formData.currentRole || !formData.company) {
          throw new Error('Current role and company are required for alumni');
        }
      }

      let profileExists = false;
      try {
        if (userProfile.role === 'student') {
          await getStudentProfile(userProfile.userId);
          profileExists = true;
        } else {
          await getAlumniProfile(userProfile.userId);
          profileExists = true;
        }
      } catch (err) {
        profileExists = false;
      }

      const profileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        branch: formData.branch,
        batch: formData.batch,
        cgpa: formData.cgpa,
        domain: formData.domain,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        linkedIn: formData.linkedIn,
        github: formData.github,
        portfolioUrl: formData.portfolioUrl,
        profileSummary: formData.profileSummary
      };

      if (userProfile.role === 'student') {
        profileData.careerGoals = formData.careerGoals;
        if (profileExists) {
          await updateStudentProfile(userProfile.userId, profileData);
        } else {
          await createStudentProfileManual(profileData);
        }
      } else {
        profileData.currentRole = formData.currentRole;
        profileData.company = formData.company;
        profileData.totalExperience = formData.totalExperience;
        profileData.domainsOfExpertise = formData.domain ? formData.domain.split(',').map(d => d.trim()) : [];
        profileData.mentorshipPreferences = '';
        if (profileExists) {
          await updateAlumniProfile(userProfile.userId, profileData);
        } else {
          await createAlumniProfileManual(profileData);
        }
      }

      setProfileComplete(true);
      navigate('/');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium mb-3">Complete Your Profile</h1>
          <p className="text-neutral-400 mb-6">
            {step === 1 ? 'Upload your resume to get started' : 'Review and complete your information'}
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-green-400' : 'text-neutral-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-green-500 bg-green-500/20' : 'border-white/10'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium">Upload Resume</span>
            </div>
            
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-green-500' : 'bg-white/10'}`} />
            
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-green-400' : 'text-neutral-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-green-500 bg-green-500/20' : 'border-white/10'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Complete Details</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Upload Resume */}
        {step === 1 && (
          <div className="border border-white/10 rounded-2xl p-8 bg-neutral-950">
            <label
              htmlFor="resume-upload"
              className="block cursor-pointer"
            >
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-green-500/50 transition">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-medium mb-2">
                  {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                </p>
                <p className="text-sm text-neutral-500">
                  PDF, DOC, or DOCX (max 10MB)
                </p>
              </div>
            </label>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleResumeUpload}
                disabled={!resumeFile || uploading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {uploading ? 'Processing Resume...' : 'Upload & Parse Resume'}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-full border border-white/10 py-3 hover:bg-white/5 transition"
              >
                Skip & Fill Manually
              </button>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <p className="text-sm text-green-400">
                <span className="font-medium">💡 Why upload a resume?</span>
                <br />
                We'll automatically extract your information to save time. You can review and edit everything in the next step.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Fill Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={inputClass}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Academic/Professional Info */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h3 className="text-lg font-medium mb-4">
                {userProfile.role === 'student' ? 'Academic Information' : 'Professional Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.role === 'student' ? (
                  <>
                    <input
                      type="text"
                      name="branch"
                      placeholder="Branch *"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="batch"
                      placeholder="Batch Year *"
                      value={formData.batch}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="cgpa"
                      placeholder="CGPA"
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      name="currentRole"
                      placeholder="Current Role *"
                      value={formData.currentRole}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="company"
                      placeholder="Company *"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="totalExperience"
                      placeholder="Total Experience"
                      value={formData.totalExperience}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="batch"
                      placeholder="Alumni Batch Year"
                      value={formData.batch}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </>
                )}
                <input
                  type="text"
                  name="domain"
                  placeholder="Domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                <input
                  type="text"
                  name="skills"
                  placeholder="Skills (comma-separated)"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className={`${inputClass} md:col-span-2`}
                />
              </div>
            </div>

            {/* Links & Goals */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h3 className="text-lg font-medium mb-4">Links & Goals</h3>
              <div className="space-y-4">
                <input
                  type="url"
                  name="linkedIn"
                  placeholder="LinkedIn URL"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                <input
                  type="url"
                  name="github"
                  placeholder="GitHub URL"
                  value={formData.github}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                <input
                  type="url"
                  name="portfolioUrl"
                  placeholder="Portfolio URL"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                {userProfile.role === 'student' && (
                  <textarea
                    name="careerGoals"
                    placeholder="Career Goals"
                    value={formData.careerGoals}
                    onChange={handleInputChange}
                    rows="3"
                    className={`${inputClass} resize-none`}
                  />
                )}
                <textarea
                  name="profileSummary"
                  placeholder="Profile Summary"
                  value={formData.profileSummary}
                  onChange={handleInputChange}
                  rows="3"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-white/10 py-3 hover:bg-white/5 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full py-3 font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Completing...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Onboarding;
