import { useState, useEffect } from 'react';
import { getUserProfile } from '../lib/authManager';
import { getAllJobs, markJobInterest } from '../services/mentorshipApi';

const inputClass =
  "w-full bg-black text-white caret-green-400 " +
  "border border-white/10 rounded-lg px-4 py-2 text-sm " +
  "placeholder:text-neutral-500 " +
  "transition-all duration-200 " +
  "hover:border-white/20 " +
  "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30";

function StudentJobs() {
  const userProfile = getUserProfile();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    minCGPA: '',
    branch: ''
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await getAllJobs();
      setJobs(response.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredJobs = jobs.filter(job => {
    if (
      filters.search &&
      !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !job.company.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.location &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    if (filters.jobType && job.jobType !== filters.jobType) {
      return false;
    }

    if (job.minCGPA && userProfile.cgpa && userProfile.cgpa < job.minCGPA) {
      return false;
    }

    if (job.eligibleBranches && job.eligibleBranches.length > 0) {
      if (userProfile.branch && !job.eligibleBranches.includes(userProfile.branch)) {
        return false;
      }
      if (
        filters.branch &&
        !job.eligibleBranches.some(b =>
          b.toLowerCase().includes(filters.branch.toLowerCase())
        )
      ) {
        return false;
      }
    }

    if (job.eligibleBatches && job.eligibleBatches.length > 0) {
      if (userProfile.batch && !job.eligibleBatches.includes(userProfile.batch)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="text-white min-h-screen bg-black p-6">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
          Jobs
        </p>
        <h1 className="text-3xl font-medium">Job Opportunities</h1>
        <p className="text-sm text-neutral-400 mt-2">
          Explore job postings from our alumni network
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 p-6 border border-white/10 rounded-xl bg-neutral-950">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search jobs or companies"
            value={filters.search}
            onChange={handleFilterChange}
            className={inputClass}
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={filters.location}
            onChange={handleFilterChange}
            className={inputClass}
          />

          <select
            name="jobType"
            value={filters.jobType}
            onChange={handleFilterChange}
            className={inputClass}
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Loading jobs...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 border border-white/10 rounded-xl bg-neutral-950">
              <p className="text-neutral-500 text-sm">
                {jobs.length === 0
                  ? 'No jobs available at the moment. Check back later!'
                  : 'No jobs match your filters. Try adjusting your search criteria.'}
              </p>
            </div>
          )}

          {filteredJobs.map((job) => (
            <div
              key={job.jobId}
              className="border border-white/10 rounded-xl p-6 bg-neutral-950 hover:border-white/20 transition cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-medium">{job.title}</h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {job.company} • {job.location}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">{job.jobType}</p>

                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-neutral-500">
                    {job.minCGPA && <span>CGPA ≥ {job.minCGPA}</span>}
                    {job.eligibleBatches && job.eligibleBatches.length > 0 && (
                      <span>Batches: {job.eligibleBatches.join(', ')}</span>
                    )}
                    {job.eligibleBranches && job.eligibleBranches.length > 0 && (
                      <span>Branches: {job.eligibleBranches.join(', ')}</span>
                    )}
                    {job.experienceRequired && <span>Exp: {job.experienceRequired}</span>}
                    {job.salary && <span>{job.salary}</span>}
                  </div>

                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-full px-4 py-1.5 text-xs font-medium hover:opacity-90 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-medium">{selectedJob.title}</h2>
                <p className="text-neutral-400 mt-2">
                  {selectedJob.company} • {selectedJob.location}
                </p>
                <p className="text-sm text-neutral-500 mt-1">{selectedJob.jobType}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-neutral-500 hover:text-white transition text-xl"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {selectedJob.description && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-neutral-400 whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-white/10">
                <button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full py-2.5 font-medium hover:opacity-90 transition"
                  onClick={() => {
                    setShowResumeModal(true);
                  }}
                >
                  Apply Now
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 rounded-full border border-white/10 py-2.5 text-white hover:bg-white/5 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      {showResumeModal && selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-medium mb-4">Submit Your Resume</h3>
            <p className="text-sm text-neutral-400 mb-6">
              Upload your resume to complete your application for <span className="text-white font-medium">{selectedJob.title}</span>
            </p>
            
            {/* Toggle between URL and File Upload */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUploadType('url')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm transition ${
                  uploadType === 'url'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-neutral-900 text-neutral-400 border border-white/10 hover:border-white/20'
                }`}
              >
                Enter URL
              </button>
              <button
                onClick={() => setUploadType('file')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm transition ${
                  uploadType === 'file'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-neutral-900 text-neutral-400 border border-white/10 hover:border-white/20'
                }`}
              >
                Upload File
              </button>
            </div>

            {uploadType === 'url' ? (
              <input
                type="url"
                placeholder="https://drive.google.com/... or your resume URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className={inputClass + " mb-6"}
              />
            ) : (
              <div className="mb-6">
                <label className="block w-full">
                  <div className={`${inputClass} cursor-pointer hover:border-green-500/50 flex items-center justify-between`}>
                    <span className={resumeFile ? 'text-white' : 'text-neutral-500'}>
                      {resumeFile ? resumeFile.name : 'Choose PDF file...'}
                    </span>
                    <span className="text-xs text-green-400">Browse</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size must be less than 5MB');
                          return;
                        }
                        setResumeFile(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {resumeFile && (
                  <p className="text-xs text-neutral-500 mt-2">
                    {(resumeFile.size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full py-2.5 font-medium hover:opacity-90 transition disabled:opacity-50"
                disabled={uploading}
                onClick={async () => {
                  if (uploadType === 'url' && !resumeUrl.trim()) {
                    alert('Please provide a resume URL');
                    return;
                  }
                  if (uploadType === 'file' && !resumeFile) {
                    alert('Please select a file');
                    return;
                  }

                  setUploading(true);
                  try {
                    let finalResumeUrl = resumeUrl;

                    if (uploadType === 'file' && resumeFile) {
                      // For now, use a placeholder. In production, upload to cloud storage
                      // This creates a local object URL that won't work across sessions
                      // You should implement proper file upload to S3/Cloudinary/etc.
                      const objectUrl = URL.createObjectURL(resumeFile);
                      finalResumeUrl = `File: ${resumeFile.name} (${(resumeFile.size / 1024).toFixed(2)} KB)`;
                      alert('Note: File upload is for demo. In production, files should be uploaded to cloud storage (S3, Cloudinary, etc.). For now, please use a URL from Google Drive or Dropbox.');
                      setUploading(false);
                      return;
                    }

                    await markJobInterest(selectedJob.jobId, finalResumeUrl);
                    alert('Application submitted successfully! The alumni will review your profile.');
                    setShowResumeModal(false);
                    setResumeUrl('');
                    setResumeFile(null);
                    setSelectedJob(null);
                  } catch (err) {
                    console.error('Application error:', err);
                    const msg = err?.response?.data?.error || err?.message || 'Failed to submit application';
                    const reasons = err?.response?.data?.reasons;
                    alert(reasons && reasons.length > 0 ? `${msg}:\n- ${reasons.join('\n- ')}` : msg);
                  } finally {
                    setUploading(false);
                  }
                }}
              >
                {uploading ? 'Uploading...' : 'Submit Application'}
              </button>
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setResumeUrl('');
                  setResumeFile(null);
                }}
                className="flex-1 rounded-full border border-white/10 py-2.5 text-white hover:bg-white/5 transition"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentJobs;
