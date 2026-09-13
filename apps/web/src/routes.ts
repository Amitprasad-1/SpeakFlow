export type AppRoute =
  | 'reading'
  | 'twisters'
  | 'grammar'
  | 'conversation'
  | 'progress'
  | 'profile'
  | 'home'
  | 'onboarding'
  | 'practice'
  | 'design-system';

export function getRouteFromPathname(pathname: string): AppRoute {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/twisters') return 'twisters';
  if (clean === '/grammar') return 'grammar';
  if (clean === '/reading') return 'reading';
  if (clean === '/conversation') return 'conversation';
  if (clean === '/progress') return 'progress';
  if (clean === '/profile') return 'profile';
  if (clean === '/design-system') return 'design-system';
  return 'reading';
}
