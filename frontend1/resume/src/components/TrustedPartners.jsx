import { motion } from "framer-motion";

const companies = [
  {
    name: "Google",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Amazon",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    name: "Microsoft",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  },
  {
    name: "Meta",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png",
  },
  {
    name: "Netflix",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  },
  {
    name: "Adobe",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png",
  },
  {
    name: "Salesforce",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
  },
  {
    name: "IBM",
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  },
];

export default function TrustedPartners() {
  return (
    <section className="relative mx-4 mt-6 rounded-xl md:rounded-2xl overflow-hidden bg-black">
      <div className="absolute inset-0 bg-black/80" />
      
      <div className="relative px-6 sm:px-8 md:px-20 py-16 z-10">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center text-lg sm:text-xl md:text-2xl font-medium text-white/90"
        >
          Where learning turns into careers
        </motion.h2>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-black/80 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-black/80 to-transparent" />

          <div className="flex w-max animate-marquee gap-16">
            {[...Array(2)].map((_, loopIndex) => (
              <div className="flex items-center gap-16" key={loopIndex}>
                {companies.map((company, i) => (
                  <motion.div
                    key={`${loopIndex}-${i}`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-center w-32 h-16 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
                  >
                    <img
                      src={company.logoSrc}
                      alt={company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
}
