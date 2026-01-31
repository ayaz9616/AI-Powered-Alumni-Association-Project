import { useState, useEffect } from 'react';
import { getUserProfile } from '../lib/authManager';
import {
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  matchStudentsToJob,
  referStudents,
  getMyReferrals,
  updateReferralStatus
} from '../services/mentorshipApi';

const CGPA_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9];
const BRANCHES = ['CSE', 'MNC', 'MAE', 'ECE', 'EEE', 'ME', 'CE'];
const BATCH_YEARS = [2025, 2026, 2027, 2028, 2029];

const inputClass =
  "w-full bg-black text-white caret-green-400 " +
  "border border-white/10 rounded-lg px-4 py-2 text-sm " +
  "placeholder:text-neutral-500 " +
  "transition-all duration-200 " +
  "hover:border-white/20 " +
  "focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30";

function AlumniJobs() {
  const userProfile = getUserProfile();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchedStudents, setMatchedStudents] = useState([]);
  const [matchingStudents, setMatchingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [referralNotes, setReferralNotes] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [showReferralsSection, setShowReferralsSection] = useState(false);
  const [showJobReferralsModal, setShowJobReferralsModal] = useState(false);
  const [jobPendingReferrals, setJobPendingReferrals] = useState([]);
  
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    description: '',
    responsibilities: '',
    requirements: '',
    requiredSkills: '',
    experienceRequired: '',
    salary: '',
    minCGPA: null,
    eligibleBranches: [],
    eligibleBatches: [],
    jobLink: '',
    applicationDeadline: ''
  });

  useEffect(() => {
    loadJobs();
    loadPendingReferrals();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await getMyJobs('active');
      setJobs(response.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadPendingReferrals = async () => {
    setLoadingReferrals(true);
    try {
      const response = await getMyReferrals('pending');
      setPendingReferrals(response.referrals || []);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const toggleArrayItem = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      company: '',
      location: '',
      jobType: 'Full-time',
      description: '',
      responsibilities: '',
      requirements: '',
      requiredSkills: '',
      experienceRequired: '',
      salary: '',
      minCGPA: null,
      eligibleBranches: [],
      eligibleBatches: [],
      jobLink: '',
      applicationDeadline: ''
    });
    setEditingJobId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditModal = (job) => {
    setForm({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      description: job.description || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
      experienceRequired: job.experienceRequired || '',
      salary: job.salary || '',
      minCGPA: job.minCGPA || null,
      eligibleBranches: job.eligibleBranches || [],
      eligibleBatches: job.eligibleBatches || [],
      jobLink: job.jobLink || '',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : ''
    });
    setEditingJobId(job.jobId);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (!form.title || !form.company || !form.description) {
        alert('Please fill in all required fields (Title, Company, Description)');
        return;
      }

      const jobData = {
        ...form,
        responsibilities: form.responsibilities.split('\n').map(r => r.trim()).filter(r => r),
        requirements: form.requirements.split('\n').map(r => r.trim()).filter(r => r),
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        minCGPA: form.minCGPA ? parseFloat(form.minCGPA) : undefined
      };

      if (editingJobId) {
        await updateJob(editingJobId, jobData);
      } else {
        await createJob(jobData);
      }

      setShowForm(false);
      resetForm();
      loadJobs();
    } catch (err) {
      console.error('Failed to save job:', err);
      alert(err.message || 'Failed to save job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job permanently?')) return;
    
    try {
      await deleteJob(jobId);
      loadJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
      alert('Failed to delete job');
    }
  };

  const handleMatchStudents = async (job) => {
    setSelectedJob(job);
    setMatchingStudents(true);
    setShowMatchModal(true);

    try {
      // Fetch ALL students without strict filtering, sorted by relevance/match score
      const filterData = {
        minCGPA: undefined, // Show all students regardless of CGPA
        branches: [], // Show all branches
        batches: [], // Show all batches
        requiredSkills: job.requiredSkills, // Use job skills for relevance ranking
        limit: 200 // Increased limit to show more students
      };
      const response = await matchStudentsToJob(job.jobId, filterData);
      // Students are already sorted by match score from backend
      setMatchedStudents(response.matches || []);
    } catch (err) {
      console.error('Failed to match students:', err);
      setMatchedStudents([]);
    } finally {
      setMatchingStudents(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(matchedStudents.map(m => m.studentId));
  };

  const deselectAllStudents = () => {
    setSelectedStudents([]);
  };

  const handleReferStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    try {
      // Send student IDs with match score and reasons
      const studentDataArray = selectedStudents.map(studentId => {
        const match = matchedStudents.find(m => m.studentId === studentId);
        return {
          studentId,
          matchScore: match?.matchScore || 0,
          matchReasons: match?.matchReason ? [match.matchReason] : []
        };
      });
      
      await referStudents(selectedJob.jobId, studentDataArray, referralNotes);
      alert(`Successfully added ${selectedStudents.length} student(s) to pending referrals!`);
      setSelectedStudents([]);
      setReferralNotes('');
      setShowMatchModal(false);
      loadPendingReferrals(); // Reload pending referrals
    } catch (err) {
      console.error('Failed to refer students:', err);
      alert(err.message || 'Failed to refer students');
    }
  };


  const handleMarkAsReferred = async (referralId) => {
    if (!window.confirm('Mark this student as referred?')) return;
    
    try {
      await updateReferralStatus(referralId, 'referred', 'Marked as referred by alumni');
      alert('Student marked as referred!');
      loadPendingReferrals();
      // If we're viewing job-specific referrals, reload those too
      if (showJobReferralsModal && selectedJob) {
        handleViewJobReferrals(selectedJob);
      }
    } catch (err) {
      console.error('Failed to update referral:', err);
      alert(err.message || 'Failed to update referral');
    }
  };

  const handleViewJobReferrals = async (job) => {
    setSelectedJob(job);
    setShowJobReferralsModal(true);
    setLoadingReferrals(true);
    
    try {
      // Reload all pending referrals to get the latest data
      const response = await getMyReferrals('pending');
      const allReferrals = response.referrals || [];
      setPendingReferrals(allReferrals);
      
      // Filter pending referrals for this specific job
      const jobReferrals = allReferrals.filter(ref => ref.jobId === job.jobId);
      setJobPendingReferrals(jobReferrals);
    } catch (err) {
      console.error('Failed to load job referrals:', err);
      setJobPendingReferrals([]);
    } finally {
      setLoadingReferrals(false);
    }
  };

  return (
    <div className="text-white min-h-screen bg-black p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Jobs
          </p>
          <h1 className="text-3xl font-medium">Manage Job Posts</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.97] transition"
        >
          Post New Job
        </button>
      </div>

      {/* Loading State */}
      {loadingJobs && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-neutral-500 mt-4">Loading jobs...</p>
        </div>
      )}

      {/* Pending Referrals Section */}
      {pendingReferrals.length > 0 && (
        <div className="mb-8">
          <div 
            onClick={() => setShowReferralsSection(!showReferralsSection)}
            className="flex justify-between items-center cursor-pointer group mb-4"
          >
            <h2 className="text-xl font-medium flex items-center gap-2">
              Pending Referrals (All Jobs)
              <span className="text-sm text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                {pendingReferrals.length}
              </span>
            </h2>
            <span className="text-neutral-500 group-hover:text-white transition">
              {showReferralsSection ? '▾' : '▸'}
            </span>
          </div>

          {showReferralsSection && (
            <div className="space-y-3">
              {pendingReferrals.map((referral) => (
                <div
                  key={referral.referralId}
                  className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5 hover:border-yellow-500/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{referral.student?.name || 'Unknown'}</h4>
                        {referral.matchScore > 0 && (
                          <span className="text-xs text-green-400">
                            {Math.round(referral.matchScore)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 mt-1">
                        {referral.job?.title || 'Unknown Job'} • {referral.job?.company || 'Unknown Company'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {referral.student?.branch || 'N/A'} • Batch {referral.student?.batch || 'N/A'} • CGPA: {referral.student?.cgpa || 'N/A'}
                      </p>
                      {referral.alumniNotes && (
                        <p className="text-xs text-neutral-400 mt-2 italic">Note: {referral.alumniNotes}</p>
                      )}
                      {referral.student?.skills && referral.student.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {referral.student.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-neutral-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleMarkAsReferred(referral.referralId)}
                      className="ml-4 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs hover:bg-green-500/30 active:scale-95 transition whitespace-nowrap"
                    >
                      Mark as Referred
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Jobs List */}
      {!loadingJobs && (
        <div className="space-y-6">
          {jobs.length === 0 && (
            <div className="text-center py-12 border border-white/10 rounded-xl bg-neutral-950">
              <p className="text-neutral-500 text-sm">
                No jobs posted yet. Click "Post New Job" to get started.
              </p>
            </div>
          )}

          {jobs.map((job) => (
            <div
              key={job.jobId}
              className="border border-white/10 rounded-xl p-6 bg-neutral-950 hover:border-white/20 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-medium">{job.title}</h3>
                  <p className="text-sm text-neutral-400 mt-1">{job.company} • {job.location}</p>
                  <p className="text-xs text-neutral-500 mt-2">{job.jobType}</p>

                  {/* Job Details */}
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-neutral-500">
                    {job.minCGPA && <span>CGPA &gt;= {job.minCGPA}</span>}
                    {job.eligibleBatches && job.eligibleBatches.length > 0 && (
                      <span>Batches: {job.eligibleBatches.join(', ')}</span>
                    )}
                    {job.eligibleBranches && job.eligibleBranches.length > 0 && (
                      <span>Branches: {job.eligibleBranches.join(', ')}</span>
                    )}
                    {job.experienceRequired && <span>Exp: {job.experienceRequired}</span>}
                  </div>

                  {/* Skills */}
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

                  {/* Stats */}
                  <div className="flex gap-4 mt-4 text-xs text-neutral-500">
                    <span>{job.viewCount || 0} views</span>
                    <span>{job.referralCount || 0} referrals</span>
                  </div>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    job.status === 'active'
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-white/10 text-neutral-400 border border-white/10"
                  }`}
                >
                  {job.status === 'active' ? 'Open' : 'Closed'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 flex-wrap">
                <button
                  onClick={() => handleMatchStudents(job)}
                  className="rounded-full bg-green-500/20 border border-green-500/40 px-4 py-1.5 text-xs text-green-400 hover:bg-green-500/30 transition"
                >
                  View All Students & Refer
                </button>

                <button
                  onClick={() => handleViewJobReferrals(job)}
                  className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-4 py-1.5 text-xs text-yellow-400 hover:bg-yellow-500/30 transition"
                >
                  View Pending Referrals
                </button>

                <button
                  onClick={() => openEditModal(job)}
                  className="rounded-full border border-white/10 px-4 py-1.5 text-xs hover:bg-white/5 transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteJob(job.jobId)}
                  className="rounded-full border border-red-500/30 text-red-400 px-4 py-1.5 text-xs hover:bg-red-500/10 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            <h2 className="text-2xl font-medium mb-6">
              {editingJobId ? "Edit Job" : "Post New Job"}
            </h2>

            <div className="space-y-4">
              {/* Basic Info */}
              <input
                placeholder="Job Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Company *"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className={inputClass}
                />

                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={form.jobType}
                  onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                  className={inputClass}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>

                <input
                  placeholder="Experience Required (e.g., 2-5 years)"
                  value={form.experienceRequired}
                  onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
                  className={inputClass}
                />
              </div>

              <input
                placeholder="Salary Range (optional)"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className={inputClass}
              />

              <textarea
                placeholder="Job Description *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} h-24 resize-none`}
              />

              <textarea
                placeholder="Responsibilities (one per line)"
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                className={`${inputClass} h-20 resize-none`}
              />

              <textarea
                placeholder="Requirements (one per line)"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                className={`${inputClass} h-20 resize-none`}
              />

              <input
                placeholder="Required Skills (comma-separated)"
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                className={inputClass}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="url"
                  placeholder="Job Link (optional)"
                  value={form.jobLink}
                  onChange={(e) => setForm({ ...form, jobLink: e.target.value })}
                  className={inputClass}
                />

                <input
                  type="date"
                  placeholder="Application Deadline"
                  value={form.applicationDeadline}
                  onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* CGPA */}
              <div>
                <p className="text-xs uppercase text-neutral-500 mb-2">
                  Minimum CGPA
                </p>
                <div className="flex flex-wrap gap-2">
                  {CGPA_OPTIONS.map((cgpa) => (
                    <button
                      key={cgpa}
                      onClick={() =>
                        setForm({
                          ...form,
                          minCGPA: form.minCGPA === cgpa ? null : cgpa,
                        })
                      }
                      className={`px-4 py-1.5 rounded-full text-xs border transition ${
                        form.minCGPA === cgpa
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "border-white/10 text-neutral-400 hover:border-green-500/30 hover:text-white"
                      }`}
                    >
                      â‰¥ {cgpa}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batches */}
              <div>
                <p className="text-xs uppercase text-neutral-500 mb-2">
                  Eligible Batches
                </p>
                <div className="flex flex-wrap gap-2">
                  {BATCH_YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => toggleArrayItem("eligibleBatches", year)}
                      className={`px-4 py-1.5 rounded-full text-xs border transition ${
                        form.eligibleBatches.includes(year)
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "border-white/10 text-neutral-400 hover:border-green-500/30 hover:text-white"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branches */}
              <div>
                <p className="text-xs uppercase text-neutral-500 mb-2">
                  Eligible Branches
                </p>
                <div className="flex flex-wrap gap-2">
                  {BRANCHES.map((branch) => (
                    <button
                      key={branch}
                      onClick={() => toggleArrayItem("eligibleBranches", branch)}
                      className={`px-4 py-1.5 rounded-full text-xs border transition ${
                        form.eligibleBranches.includes(branch)
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "border-white/10 text-neutral-400 hover:border-green-500/30 hover:text-white"
                      }`}
                    >
                      {branch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full py-2.5 font-medium hover:opacity-90 transition"
                >
                  {editingJobId ? "Save Changes" : "Post Job"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-full border border-white/10 py-2.5 text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Students Modal */}
      {showMatchModal && selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-medium">Match Students</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {selectedJob.title} at {selectedJob.company}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  setSelectedStudents([]);
                  setReferralNotes('');
                }}
                className="text-neutral-500 hover:text-white transition"
              >
                âœ•
              </button>
            </div>

            {/* Matched Students */}
            {matchingStudents ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-neutral-500 mt-4">Finding matching students...</p>
              </div>
            ) : matchedStudents.length === 0 ? (
              <div className="text-center py-12 border border-white/10 rounded-xl bg-black">
                <p className="text-neutral-500">No matching students found</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-neutral-400">
                    {matchedStudents.length} students available • {selectedStudents.length} selected
                    <span className="text-neutral-600 ml-2">(All students shown, sorted by relevance)</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllStudents}
                      className="text-xs px-3 py-1 rounded-full border border-green-500/30 text-green-400 hover:bg-green-500/10 transition"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllStudents}
                      className="text-xs px-3 py-1 rounded-full border border-white/10 text-neutral-400 hover:bg-white/5 transition"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {matchedStudents.map((match) => (
                    <div
                      key={match.studentId}
                      className={`border rounded-lg p-4 transition cursor-pointer ${
                        selectedStudents.includes(match.studentId)
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-white/10 bg-black hover:border-white/20"
                      }`}
                      onClick={() => toggleStudentSelection(match.studentId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{match.student?.name || 'Unknown'}</h4>
                            <span className="text-xs text-green-400">
                              {Math.round(match.matchScore || 0)}% match
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">
                            {match.student?.branch || 'N/A'} • Batch {match.student?.batch || 'N/A'} • CGPA: {match.student?.cgpa || 'N/A'}
                          </p>
                          {match.student?.skills && match.student.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {match.student.skills.slice(0, 5).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-neutral-400"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          {match.matchReason && (
                            <p className="text-xs text-neutral-500 mt-2">{match.matchReason}</p>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(match.studentId)}
                          onChange={() => {}}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Referral Notes */}
                <textarea
                  placeholder="Add a note for the referral (optional)"
                  value={referralNotes}
                  onChange={(e) => setReferralNotes(e.target.value)}
                  className={`${inputClass} h-20 resize-none mb-4`}
                />

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReferStudents}
                    disabled={selectedStudents.length === 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full py-2.5 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Refer {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={() => {
                      setShowMatchModal(false);
                      setSelectedStudents([]);
                      setReferralNotes('');
                    }}
                    className="flex-1 rounded-full border border-white/10 py-2.5 text-white hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Job-Specific Pending Referrals Modal */}
      {showJobReferralsModal && selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-medium">Pending Referrals</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {selectedJob.title} at {selectedJob.company}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowJobReferralsModal(false);
                  setJobPendingReferrals([]);
                }}
                className="text-neutral-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {loadingReferrals ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-neutral-500 mt-4">Loading referrals...</p>
              </div>
            ) : jobPendingReferrals.length === 0 ? (
              <div className="text-center py-12 border border-white/10 rounded-xl bg-black">
                <p className="text-neutral-500">No pending referrals for this job</p>
                <p className="text-xs text-neutral-600 mt-2">Students you refer will appear here until marked as referred</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobPendingReferrals.map((referral) => (
                  <div
                    key={referral.referralId}
                    className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5 hover:border-yellow-500/50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{referral.student?.name || 'Unknown'}</h4>
                          {referral.matchScore > 0 && (
                            <span className="text-xs text-green-400">
                              {Math.round(referral.matchScore)}% match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-400 mt-1">
                          {referral.student?.email || 'No email'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {referral.student?.branch || 'N/A'} • Batch {referral.student?.batch || 'N/A'} • CGPA: {referral.student?.cgpa || 'N/A'}
                        </p>
                        {referral.alumniNotes && (
                          <p className="text-xs text-neutral-400 mt-2 italic">Note: {referral.alumniNotes}</p>
                        )}
                        {referral.student?.skills && referral.student.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {referral.student.skills.slice(0, 8).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-neutral-400"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleMarkAsReferred(referral.referralId)}
                        className="ml-4 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs hover:bg-green-500/30 active:scale-95 transition whitespace-nowrap"
                      >
                        Mark as Referred
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowJobReferralsModal(false);
                  setJobPendingReferrals([]);
                }}
                className="w-full rounded-full border border-white/10 py-2.5 text-white hover:bg-white/5 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumniJobs;
