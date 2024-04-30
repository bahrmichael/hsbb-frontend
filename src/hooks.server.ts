import { themes } from '$lib/themes';

export const handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme");

  if (!theme || !themes.filter(availableTheme => availableTheme.name === theme)) {
    return await resolve(event);
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('data-theme=""', `data-theme="${theme}"`);
    },
  });
}