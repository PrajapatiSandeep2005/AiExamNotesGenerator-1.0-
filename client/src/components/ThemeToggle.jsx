import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("examnotes-theme");
  return savedTheme === "dark" ? "dark" : "light";
};

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("examnotes-theme", theme);
  }, [theme]);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
      className="theme-toggle inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d49a54]/35 bg-[#141516] text-white shadow-sm transition-colors hover:bg-[#211b13]"
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isLight ? <Moon size={20} /> : <Sun size={20} />}
      </motion.span>
    </motion.button>
  );
}

export default ThemeToggle;
