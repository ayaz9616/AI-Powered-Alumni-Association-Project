import React, { useState, useEffect } from "react";
import { getSessionRequests, createSessionRequest, voteOnSession, scheduleSession } from "../../services/communityApi";

const CommunityStudentsRequest = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const [requestForm, setRequestForm] = useState({
    topic: "",
    description: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    description: "",
    date: "",
    time: "",
    duration: "",
    meetLink: "",
  });

  const userRole = localStorage.getItem("resumate_user_role");
  const userId = localStorage.getItem("resumate_user_id");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await getSessionRequests();
      setSessions(response.sessions || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STUDENT ACTIONS ---------------- */

  const handleVote = async (sessionId) => {
    try {
      const result = await voteOnSession(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId
            ? { ...s, votes: result.votes, votesList: result.votesList || s.votesList }
            : s
        )
      );
    } catch (error) {
      console.error("Error voting on session:", error);
    }
  };

  const submitRequest = async () => {
    if (!requestForm.topic || !requestForm.description) {
      alert("Please fill in both topic and description");
      return;
    }

    try {
      await createSessionRequest(requestForm.topic, requestForm.description);
      setRequestForm({ topic: "", description: "" });
      setShowRequestModal(false);
      loadSessions();
    } catch (error) {
      console.error("Error creating session request:", error);
      alert("Failed to create session request. Please try again.");
    }
  };

  /* ---------------- ALUMNI ACTIONS ---------------- */

  const openScheduleModal = (session) => {
    setSelectedSession(session);
    setScheduleForm({
      description: "",
      date: "",
      time: "",
      duration: "",
      meetLink: "",
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSession = async () => {
    if (!scheduleForm.description || !scheduleForm.date || !scheduleForm.time || !scheduleForm.duration || !scheduleForm.meetLink) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await scheduleSession(selectedSession.sessionId, scheduleForm);
      setShowScheduleModal(false);
      loadSessions();
      alert("Session scheduled successfully! Students will be notified.");
    } catch (error) {
      console.error("Error scheduling session:", error);
      alert("Failed to schedule session. Please try again.");
    }
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="text-white max-w-5xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Community
          </p>
          <h1 className="text-3xl font-medium">
            Student Proposed Sessions
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            Students propose · Community votes · Alumni host
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-medium text-black hover:bg-green-400 active:scale-[0.97] transition"
        >
          Request Session
        </button>
      </div>

      {/* Session Cards */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p>No session requests yet. Be the first to propose one!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border border-white/10 rounded-xl p-6 bg-neutral-950 hover:border-white/20 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{session.topic}</h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {session.description}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Proposed by {session.proposedByName}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full border ${
                    session.status === "open"
                      ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/20"
                      : "border-green-500/30 text-green-400 bg-green-500/20"
                  }`}
                >
                  {session.status === "open"
                    ? "Open for Voting"
                    : "Scheduled"}
                </span>
              </div>

              <p className="text-sm text-neutral-400 mb-4">
                👍 {session.votes} students interested
              </p>

              {session.status === "scheduled" && session.scheduledDetails && (
                <div className="bg-black/40 rounded-lg p-4 mb-4">
                  <p className="text-xs uppercase text-neutral-500 mb-2">
                    Session Details
                  </p>
                  <p className="text-sm text-neutral-300 mb-2">
                    {session.scheduledDetails.description}
                  </p>
                  <p className="text-xs text-neutral-400 mb-2">
                    {session.scheduledDetails.date} ·{" "}
                    {session.scheduledDetails.time} ·{" "}
                    {session.scheduledDetails.duration}
                  </p>
                  <p className="text-xs text-neutral-500 mb-3">
                    Hosted by {session.scheduledDetails.scheduledByName}
                  </p>
                  <a
                    href={session.scheduledDetails.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-sm text-green-400 hover:underline"
                  >
                    Join Meeting →
                  </a>
                </div>
              )}

              {session.status === "open" && (
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleVote(session.sessionId)}
                    className={`rounded-full border border-white/10 px-4 py-1.5 text-sm hover:bg-white/5 transition ${
                      session.votesList?.includes(userId) ? "bg-green-500/20 text-green-400" : ""
                    }`}
                  >
                    {session.votesList?.includes(userId) ? "Voted" : "Upvote"}
                  </button>

                  {userRole === "alumni" && (
                    <button
                      onClick={() => openScheduleModal(session)}
                      className="rounded-full bg-green-500/20 text-green-400 px-4 py-1.5 text-sm hover:bg-green-500/30 transition"
                    >
                      Take Session (Alumni)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Session Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-medium mb-6">
              Request a Session
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Session Topic"
                value={requestForm.topic}
                onChange={(e) =>
                  setRequestForm({
                    ...requestForm,
                    topic: e.target.value,
                  })
                }
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
              />

              <textarea
                placeholder="Describe what you want to learn"
                value={requestForm.description}
                onChange={(e) =>
                  setRequestForm({
                    ...requestForm,
                    description: e.target.value,
                  })
                }
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 h-24 resize-none focus:outline-none focus:border-green-500"
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={submitRequest}
                  className="flex-1 rounded-full bg-green-500 py-2 text-black font-medium hover:bg-green-400"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 rounded-full border border-white/10 py-2 text-white hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-medium mb-6">
              Schedule Session
            </h2>

            <div className="space-y-4">
              <textarea
                placeholder="Session Description"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 h-24 resize-none focus:outline-none focus:border-green-500"
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    date: e.target.value,
                  })
                }
              />

              <input
                type="time"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    time: e.target.value,
                  })
                }
              />

              <input
                placeholder="Duration (e.g. 45 mins)"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    duration: e.target.value,
                  })
                }
              />

              <input
                placeholder="Meeting Link"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    meetLink: e.target.value,
                  })
                }
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleScheduleSession}
                  className="flex-1 rounded-full bg-green-500 py-2 text-black font-medium hover:bg-green-400"
                >
                  Schedule Session
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 rounded-full border border-white/10 py-2 text-white hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityStudentsRequest;
