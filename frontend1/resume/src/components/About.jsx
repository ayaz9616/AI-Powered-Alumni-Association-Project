import { motion, useScroll, useTransform } from "framer-motion";

const text =
  "We are building an alumni student mentorship platform that enables structured discovery, intelligent matching, and scheduled mentorship, creating scalable, outcome-oriented guidance within the institute ecosystem.";

export default function About({ sectionRef }) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <motion.h1 className="max-w-6xl mx-auto text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl italic tracking-normal leading-snug md:leading-tight flex flex-wrap justify-center pb-16 pt-20">
      {text.split(" ").map((word, wordIndex, words) => (
        <span key={wordIndex} className="whitespace-nowrap inline-flex">
          {word.split("").map((char, charIndex) => {
            const globalIndex =
              words.slice(0, wordIndex).join(" ").length +
              (wordIndex > 0 ? 1 : 0) +
              charIndex;

            const color = useTransform(
              scrollYProgress,
              [
                globalIndex / text.length,
                (globalIndex + 1) / text.length,
              ],
              ["#484745", "#DDDAD4"]
            );

            return (
              <motion.span key={charIndex} style={{ color }}>
                {char}
              </motion.span>
            );
          })}
          {wordIndex !== words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </motion.h1>
  );
}
