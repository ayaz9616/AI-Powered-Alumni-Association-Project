import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'How do I connect with alumni?',
    answer: 'You can browse alumni profiles, filter by industry or graduation year, and send connection requests directly through the platform. Alumni can also mentor students through scheduled sessions.'
  },
  {
    question: 'Can I post job opportunities?',
    answer: 'Yes! Alumni can post job openings, internships, and referral opportunities. Our AI-powered matching system helps connect the right students to relevant opportunities based on skills and interests.'
  },
  {
    question: 'How does the mentorship program work?',
    answer: 'Students can browse mentor profiles and request mentorship sessions. Alumni set their availability through the calendar system, and sessions can be scheduled directly through the platform with automated reminders.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption, secure authentication, and follow best practices for data protection. Your personal information is never shared without your explicit consent.'
  },
  {
    question: 'How can I get started?',
    answer: 'Simply sign up with your institutional email, complete your profile, and start exploring. Students can search for jobs and mentors, while alumni can post opportunities and offer mentorship.'
  }
];

function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400">
            Everything you need to know about our platform
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-white/10 rounded-xl bg-neutral-950 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-start justify-between p-6 text-left hover:bg-white/5 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-500 text-sm font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                  </div>
                </div>
                <motion.svg
                  animate={{ rotate: openId === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-neutral-500 flex-shrink-0 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </button>

              <AnimatePresence>
                {openId === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pl-20">
                      <p className="text-neutral-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
