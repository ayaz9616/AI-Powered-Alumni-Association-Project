import React, { useState, useEffect } from "react";
import { Bell, BellOff, MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { getUpcomingEvents, joinEvent, createEvent, addEventComment } from "../../services/communityApi";

const CommunityUpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "",
    location: "Online",
    meetLink: "",
  });
  const [reminders, setReminders] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const userRole = localStorage.getItem("resumate_user_role");
  const userId = localStorage.getItem("resumate_user_id");

  useEffect(() => {
    loadEvents();
    loadReminders();
    checkReminders();
    
    // Check reminders every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getUpcomingEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = () => {
    const saved = localStorage.getItem('event_reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  };

  const saveReminders = (newReminders) => {
    localStorage.setItem('event_reminders', JSON.stringify(newReminders));
    setReminders(newReminders);
  };

  const toggleReminder = (event) => {
    const newReminders = { ...reminders };
    
    if (newReminders[event.eventId]) {
      delete newReminders[event.eventId];
      toast.success('Reminder removed', {
        icon: '🔕',
      });
    } else {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const reminderTime = new Date(eventDateTime.getTime() - 30 * 60000); // 30 min before
      
      newReminders[event.eventId] = {
        eventId: event.eventId,
        title: event.title,
        date: event.date,
        time: event.time,
        reminderTime: reminderTime.toISOString(),
        notified: false
      };
      
      toast.success(
        `Reminder set for ${event.title}\n30 minutes before event`,
        {
          icon: '🔔',
          duration: 3000,
        }
      );
    }
    
    saveReminders(newReminders);
  };

  const checkReminders = () => {
    const saved = localStorage.getItem('event_reminders');
    if (!saved) return;
    
    const currentReminders = JSON.parse(saved);
    const now = new Date();
    let updated = false;
    
    Object.keys(currentReminders).forEach(eventId => {
      const reminder = currentReminders[eventId];
      const reminderTime = new Date(reminder.reminderTime);
      
      if (!reminder.notified && now >= reminderTime) {
        // Show notification
        toast(
          `📅 Upcoming Event: ${reminder.title}\n⏰ Starts at ${reminder.time}`,
          {
            icon: '🔔',
            duration: 8000,
            style: {
              background: '#22c55e',
              color: '#000',
              fontWeight: '500',
            },
          }
        );
        
        // Mark as notified
        currentReminders[eventId].notified = true;
        updated = true;
      }
    });
    
    if (updated) {
      saveReminders(currentReminders);
    }
  };

  const toggleComments = (eventId) => {
    setExpandedComments(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const handleAddComment = async (event) => {
    const comment = commentText[event.eventId]?.trim();
    if (!comment) return;

    try {
      await addEventComment(event.eventId, comment);
      setCommentText(prev => ({ ...prev, [event.eventId]: "" }));
      loadEvents(); // Refresh to show new comment
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await joinEvent(eventId);
      loadEvents();
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Failed to join event. Please try again.");
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.time || !eventForm.location) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      await createEvent(eventForm);
      setEventForm({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "",
        location: "Online",
        meetLink: "",
      });
      setShowCreateModal(false);
      loadEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setCreating(false);
    }
  };

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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Community
          </p>
          <h1 className="text-3xl font-medium">Upcoming Events</h1>
          <p className="text-sm text-neutral-400 mt-2">
            Discover and join events hosted by the community
          </p>
        </div>
        
        {userRole === "alumni" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-medium text-black hover:bg-green-400 active:scale-[0.97] transition"
          >
            Create Event
          </button>
        )}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p>No upcoming events. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-white/10 rounded-xl p-6 bg-neutral-950 hover:border-white/20 transition"
            >
              {/* Title */}
              <h3 className="text-lg font-medium mb-2">{event.title}</h3>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400 mb-4">
                <span>
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>{event.time}</span>
                <span>{event.location}</span>
                <span>{event.attendees} interested</span>
              </div>

              {/* Host */}
              <div className="text-xs text-neutral-500 mb-3">
                Hosted by <span className="text-neutral-300">{event.hostName}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
                {event.description}
              </p>

              {/* Meet Link */}
              {event.meetLink && (
                <a
                  href={event.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mb-4 text-sm text-green-400 hover:underline"
                >
                  Join Meeting →
                </a>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleJoinEvent(event.eventId)}
                  className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                    event.attendeesList?.includes(userId)
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {event.attendeesList?.includes(userId) ? "Joined" : "Join Event"}
                </button>
                
                {userRole === "student" && (
                  <button
                    onClick={() => toggleReminder(event)}
                    className={`rounded-full p-2 text-sm transition ${
                      reminders[event.eventId]
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : "border border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                    title={reminders[event.eventId] ? "Remove reminder" : "Set reminder (30 min before)"}
                  >
                    {reminders[event.eventId] ? (
                      <Bell size={18} fill="currentColor" />
                    ) : (
                      <BellOff size={18} />
                    )}
                  </button>
                )}
                
                <button 
                  onClick={() => toggleComments(event.eventId)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 transition flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  <span>{event.comments?.length || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[event.eventId] && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium mb-3 text-neutral-300">Discussion</h4>
                  
                  {/* Comment List */}
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {event.comments && event.comments.length > 0 ? (
                      event.comments.map((comment) => (
                        <div key={comment.commentId} className="bg-black/40 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-neutral-300">
                              {comment.userName}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              comment.userRole === 'alumni' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {comment.userRole}
                            </span>
                            <span className="text-xs text-neutral-500 ml-auto">
                              {new Date(comment.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-300">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-500 text-center py-4">
                        No comments yet. Start the discussion!
                      </p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText[event.eventId] || ""}
                      onChange={(e) => setCommentText(prev => ({
                        ...prev,
                        [event.eventId]: e.target.value
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(event);
                        }
                      }}
                      className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
                    />
                    <button
                      onClick={() => handleAddComment(event)}
                      disabled={!commentText[event.eventId]?.trim()}
                      className="rounded-lg bg-green-500 px-3 py-2 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-6">Create Event</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
              />

              <textarea
                placeholder="Event Description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 h-32 resize-none focus:outline-none focus:border-green-500"
              />

              <input
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500"
              />

              <input
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500"
              />

              <input
                placeholder="Duration (e.g., 2 hours)"
                value={eventForm.duration}
                onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
              />

              <input
                placeholder="Location"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
              />

              <input
                placeholder="Meeting Link (optional)"
                value={eventForm.meetLink}
                onChange={(e) => setEventForm({ ...eventForm, meetLink: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-green-500"
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateEvent}
                  disabled={creating}
                  className="flex-1 rounded-full bg-green-500 py-2 text-black font-medium hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Event"}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
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

export default CommunityUpcomingEvents;
