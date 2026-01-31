import React, { useState, useEffect } from "react";
import { getPastEvents } from "../../services/communityApi";

const CommunityPastEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getPastEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error("Error loading past events:", error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
          Community
        </p>
        <h1 className="text-3xl font-medium">Past Events</h1>
        <p className="text-sm text-neutral-400 mt-2">
          Browse events that have already taken place
        </p>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p>No past events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-white/10 rounded-xl p-6 bg-neutral-950 opacity-80 hover:opacity-100 hover:border-white/20 transition"
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
                <span>{event.attendees} attended</span>
              </div>

              {/* Host */}
              <div className="text-xs text-neutral-500 mb-3">
                Hosted by <span className="text-neutral-300">{event.hostName}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
                {event.description}
              </p>

              {/* Status */}
              <span className="inline-block rounded-full border border-white/10 px-4 py-1.5 text-xs text-neutral-400">
                Event Completed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPastEvents;
