"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

type ColorMode = "light" | "dark";

export const ColorModeContext = createContext({
  mode: "light" as ColorMode,
  toggleColorMode: () => {},
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("color-mode");
    if (saved === "light" || saved === "dark") {
      setMode(saved);
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setMode("dark");
    }
    setMounted(true);
  }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          if (typeof window !== "undefined") localStorage.setItem("color-mode", next);
          return next;
        });
      },
    }),
    [mode]
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.colorScheme = mode;
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#ff3d7f" },
          secondary: { main: "#00b7ff" },
          background: {
            default: mode === "light" ? "#f4f6fb" : "#0b0d10",
            paper: mode === "light" ? "#ffffff" : "#151a21",
          },
          text: {
            primary: mode === "light" ? "#0b1220" : "#f2f5f9",
            secondary: mode === "light" ? "#5b667a" : "#a9b2c2",
          },
          divider: mode === "light" ? "rgba(15, 23, 42, 0.12)" : "rgba(226, 232, 240, 0.12)",
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: "Poppins, sans-serif",
          h4: { fontWeight: 700 },
          h6: { fontWeight: 700 },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { textTransform: "none", fontWeight: 600 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {mounted ? children : null}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
