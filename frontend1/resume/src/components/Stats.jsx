const Stats = () => {
  return (
    <section className="w-full bg-black/30 pb-12">
      <div className="mx-auto max-w-7xl flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16 px-4 sm:px-6 lg:px-0">
        {/* Stat 1 */}
        <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:gap-6">
          <div className="text-5xl sm:text-6xl lg:text-7xl font-light text-neutral-300 leading-none">
            01
          </div>
          <div>
            <h4 className="mb-3 text-base sm:text-lg font-medium text-white text-left">
              Unified Alumni & Student Profiles
            </h4>
            <p className="text-sm leading-relaxed text-neutral-400 text-left">
              Structured profiles capturing academic background, skills,
              interests, career paths, and mentorship preferences to enable
              meaningful discovery and informed matching.
            </p>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-white/10" />

        {/* Stat 2 */}
        <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:gap-6">
          <div className="text-5xl sm:text-6xl lg:text-7xl font-light text-neutral-300 leading-none">
            02
          </div>
          <div>
            <h4 className="mb-3 text-base sm:text-lg font-medium text-white text-left">
              Intelligent Mentor–Mentee Matching
            </h4>
            <p className="text-sm leading-relaxed text-neutral-400 text-left">
              Data-driven matching based on profile similarity, goals, and past
              engagement to identify high-potential mentor mentee pairs with
              relevance and intent.
            </p>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-white/10" />

        {/* Stat 3 */}
        <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:gap-6">
          <div className="text-5xl sm:text-6xl lg:text-7xl font-light text-neutral-300 leading-none">
            03
          </div>
          <div>
            <h4 className="mb-3 text-base sm:text-lg font-medium text-white text-left">
              Scheduled & Measurable Mentorship
            </h4>
            <p className="text-sm leading-relaxed text-neutral-400 text-left">
              Time-slot based session scheduling, confirmations, reminders, and
              feedback loops designed to track participation, engagement, and
              mentorship outcomes at an institutional level.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
