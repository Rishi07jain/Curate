import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

// The exact status messages from the PRD, cycled with a cross-fade.
const STATUS_MESSAGES = [
  "Parsing Job Description & extracting tech stacks...",
  "Detecting industry vertical and domain context...",
  "Scanning Reddit threads & Glassdoor employee reports...",
  "Synthesizing domain-aligned projects in Jake's LaTeX format...",
  "Compiling live LaTeX workspace...",
];

// Decorative badges that float up during the "scan" — purely cosmetic,
// not tied to real extracted data (we don't have that yet while loading).
const FLOATING_BADGES = ["React", "Node.js", "AWS", "PostgreSQL", "FinTech", "Kafka"];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through status messages every 2.2s
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-12 py-24">
      {/* ---- Paper stack + magnifying glass ---- */}
      {/* `perspective` on the parent is what makes child rotateY/rotateX
          transforms look 3D instead of flat. Framer Motion just animates
          the CSS transform values for us. */}
      <div className="relative w-80 h-56" style={{ perspective: "1000px" }}>
        {/* Stack of 4 "paper" rectangles, each offset and gently rotating */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 glass-card border-white/10"
            style={{
              transformStyle: "preserve-3d",
              zIndex: 4 - i,
            }}
            initial={{ rotateY: -8, y: i * 6, x: i * 3 }}
            animate={{
              rotateY: [-8, 8, -8],
              rotateX: [2, -2, 2],
            }}
            transition={{
              duration: 4 + i * 0.5, // slightly different speed per sheet = organic feel
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Fake "text lines" so it reads as a document, not a blank card */}
            <div className="p-5 space-y-2 opacity-40">
              <div className="h-2 w-2/3 bg-white/40 rounded" />
              <div className="h-1.5 w-full bg-white/20 rounded" />
              <div className="h-1.5 w-5/6 bg-white/20 rounded" />
              <div className="h-1.5 w-full bg-white/20 rounded" />
            </div>
          </motion.div>
        ))}

        {/* Magnifying glass sweeping left-to-right across the stack */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-amber"
          initial={{ x: -20 }}
          animate={{ x: 260 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{
            filter: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.7))",
          }}
        >
          <Search size={36} strokeWidth={2.5} />
        </motion.div>

        {/* Floating tech badges — staggered fade/rise, looping */}
        {FLOATING_BADGES.map((badge, i) => (
          <motion.div
            key={badge}
            className="absolute text-xs font-mono px-2 py-1 rounded-md bg-teal/10 border border-teal/30 text-teal"
            style={{
              left: `${15 + ((i * 37) % 70)}%`,
              top: `${20 + ((i * 23) % 60)}%`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: [10, -20, -30] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6, // stagger so they don't all pop at once
              ease: "easeOut",
            }}
          >
            {badge}
          </motion.div>
        ))}
      </div>

      {/* ---- Cycling status text ---- */}
      {/* AnimatePresence lets an element animate OUT before the next one
          animates IN — without it, React would just swap the text instantly. */}
      <div className="h-6 relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-white/60 font-mono text-center"
          >
            {STATUS_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}