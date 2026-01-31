import { useState, useEffect } from 'react';
import { getUserProfile } from '../lib/authManager';
import { getAlumniProfile, updateAlumniProfile } from '../services/mentorshipApi';

const inputClass =
  "w-full bg-black text-white caret-green-400 " +
  "border border-white/10 rounded-lg px-4 py-2 text-sm " +
  "placeholder:text-neutral-500 " +
  "transition-all duration-200 " +
  "hover:border-white/20 " +
  "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30";

function AlumniProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentRole: '',
    company: '',
    domain: '',
    batch: '',
    totalExperience: '',
    domainsOfExpertise: '',
    mentorshipPreferences: '',
    linkedIn: '',
    github: '',
    portfolioUrl: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = getUserProfile();
      const response = await getAlumniProfile(user.userId);
      if (response.profile) {
        setProfile(response.profile);
        setFormData({
          name: response.profile.name || '',
          email: response.profile.email || '',
          phone: response.profile.phone || '',
          currentRole: response.profile.currentRole || '',
          company: response.profile.company || '',
          domain: response.profile.domain || '',
          batch: response.profile.batch || '',
          totalExperience: response.profile.totalExperience || '',
          domainsOfExpertise: Array.isArray(response.profile.domainsOfExpertise) 
            ? response.profile.domainsOfExpertise.join(', ') 
            : '',
          mentorshipPreferences: response.profile.mentorshipPreferences || '',
          linkedIn: response.profile.linkedIn || '',
          github: response.profile.github || '',
          portfolioUrl: response.profile.portfolioUrl || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const user = getUserProfile();
      const updateData = {
        ...formData,
        domainsOfExpertise: formData.domainsOfExpertise.split(',').map(d => d.trim()).filter(d => d)
      };
      
      await updateAlumniProfile(user.userId, updateData);
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-medium mb-4">No Profile Found</h2>
          <p className="text-neutral-400 mb-6">
            Please complete the onboarding process to create your profile.
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 transition"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Profile
          </p>
          <h1 className="text-3xl font-medium">Alumni Profile</h1>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.97] transition"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                loadProfile();
              }}
              className="rounded-full border border-white/10 px-6 py-2.5 text-sm hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h2 className="text-lg font-medium mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h2 className="text-lg font-medium mb-4">Professional Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="currentRole"
                    placeholder="Current Role"
                    value={formData.currentRole}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    name="company"
                    placeholder="Company"
                    value={formData.company}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="domain"
                    placeholder="Domain (e.g., Software, Finance)"
                    value={formData.domain}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    name="batch"
                    placeholder="Batch Year"
                    value={formData.batch}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    name="totalExperience"
                    placeholder="Experience (e.g., 5 years)"
                    value={formData.totalExperience}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <input
                  type="text"
                  name="domainsOfExpertise"
                  placeholder="Domains of Expertise (comma-separated)"
                  value={formData.domainsOfExpertise}
                  onChange={handleChange}
                  className={inputClass}
                />
                <textarea
                  name="mentorshipPreferences"
                  placeholder="Mentorship Preferences"
                  value={formData.mentorshipPreferences}
                  onChange={handleChange}
                  className={`${inputClass} h-24 resize-none`}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h2 className="text-lg font-medium mb-4">Social Links</h2>
              <div className="space-y-4">
                <input
                  type="url"
                  name="linkedIn"
                  placeholder="LinkedIn URL"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  type="url"
                  name="github"
                  placeholder="GitHub URL"
                  value={formData.github}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  type="url"
                  name="portfolioUrl"
                  placeholder="Portfolio URL"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Personal Info Display */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h2 className="text-lg font-medium mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Name</p>
                  <p className="text-white">{profile.name || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Email</p>
                    <p className="text-white">{profile.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Phone</p>
                    <p className="text-white">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info Display */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h2 className="text-lg font-medium mb-4">Professional Information</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Current Role</p>
                    <p className="text-white">{profile.currentRole || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Company</p>
                    <p className="text-white">{profile.company || 'Not provided'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Domain</p>
                    <p className="text-white">{profile.domain || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Batch</p>
                    <p className="text-white">{profile.batch || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Experience</p>
                    <p className="text-white">{profile.totalExperience || 'Not provided'}</p>
                  </div>
                </div>
                {profile.domainsOfExpertise && profile.domainsOfExpertise.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Domains of Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.domainsOfExpertise.map((domain, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.mentorshipPreferences && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Mentorship Preferences</p>
                    <p className="text-white">{profile.mentorshipPreferences}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Display */}
            <div className="border border-white/10 rounded-xl p-6 bg-neutral-950">
              <h2 className="text-lg font-medium mb-4">Social Links</h2>
              <div className="space-y-3">
                {profile.linkedIn && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">LinkedIn</p>
                    <a
                      href={profile.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition"
                    >
                      {profile.linkedIn}
                    </a>
                  </div>
                )}
                {profile.github && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">GitHub</p>
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition"
                    >
                      {profile.github}
                    </a>
                  </div>
                )}
                {profile.portfolioUrl && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Portfolio</p>
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition"
                    >
                      {profile.portfolioUrl}
                    </a>
                  </div>
                )}
                {!profile.linkedIn && !profile.github && !profile.portfolioUrl && (
                  <p className="text-neutral-500 text-sm">No social links added</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlumniProfile;
