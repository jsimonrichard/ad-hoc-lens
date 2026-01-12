import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

// Function to get CSS variable value
function getCSSVariable(variable: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

// Create custom theme using Tailwind colors
export function createCustomTheme() {
  const isDark = document.documentElement.classList.contains("dark");

  // Get color values from CSS variables
  const card = getCSSVariable("--color-card");
  const cardForeground = getCSSVariable("--color-card-foreground");
  const primary = getCSSVariable("--color-primary");
  const muted = getCSSVariable("--color-muted");
  const mutedForeground = getCSSVariable("--color-muted-foreground");
  const foreground = getCSSVariable("--color-foreground");

  // Complementary colors from chart palette
  const chart1 = getCSSVariable("--color-chart-1");
  const chart2 = getCSSVariable("--color-chart-2");
  const chart3 = getCSSVariable("--color-chart-3");
  const chart4 = getCSSVariable("--color-chart-4");
  const chart5 = getCSSVariable("--color-chart-5");
  const ring = getCSSVariable("--color-ring");

  return createTheme({
    theme: isDark ? "dark" : "light",
    settings: {
      background: card,
      foreground: cardForeground,
      caret: primary,
      selection: `${primary}26`, // 15% opacity
      selectionMatch: `${primary}26`,
      lineHighlight: `${muted}4d`, // 30% opacity
      gutterBackground: muted,
      gutterForeground: mutedForeground,
    },
    styles: [
      // Comments - muted gray
      { tag: t.comment, color: mutedForeground },

      // Keywords (SELECT, FROM, WHERE, etc.) - primary color
      { tag: t.keyword, color: primary },

      // Strings - chart-2 (complementary green)
      { tag: [t.string, t.special(t.brace)], color: chart2 },

      // Numbers - chart-1 (lighter complementary)
      { tag: t.number, color: chart1 },

      // Booleans and null - chart-3
      { tag: t.bool, color: chart3 },
      { tag: t.null, color: chart3 },

      // Operators - ring color (neutral gray)
      { tag: t.operator, color: ring },

      // Functions - chart-4 (darker complementary)
      { tag: t.function(t.variableName), color: chart4 },

      // Type names and class names - chart-5 (darkest complementary)
      { tag: t.typeName, color: chart5 },
      { tag: t.className, color: chart5 },
      { tag: t.definition(t.typeName), color: chart5 },

      // Variables and identifiers - foreground (default text color)
      { tag: t.variableName, color: foreground },
      { tag: t.attributeName, color: foreground },
      { tag: t.tagName, color: foreground },
    ],
  });
}
