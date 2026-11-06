// Site-wide color schemes, defined in app/globals.css as [data-theme="…"].
export const siteThemes = ["default", "midnight", "matcha", "sunset"] as const;
export type SiteTheme = (typeof siteThemes)[number];

export const SITE_THEME_KEY = "site-theme";

// Runs before paint (inlined in the layout) so a saved theme never flashes.
export const siteThemeScript = `try{var t=localStorage.getItem("${SITE_THEME_KEY}");if(t&&t!=="default")document.documentElement.dataset.theme=t}catch(e){}`;

export function setSiteTheme(name: SiteTheme) {
  const root = document.documentElement;
  if (name === "default") delete root.dataset.theme;
  else root.dataset.theme = name;
  try {
    localStorage.setItem(SITE_THEME_KEY, name);
  } catch {}
}
