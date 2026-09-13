export type AppRoute = 'home' | 'onboarding' | 'practice' | 'conversation' | 'progress' | 'profile' | 'design-system';

export function getRouteFromPathname(pathname: string): AppRoute {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/onboarding') return 'onboarding';
  if (clean === '/practice') return 'practice';
  if (clean === '/conversation') return 'conversation';
  if (clean === '/progress') return 'progress';
  if (clean === '/profile') return 'profile';
  if (clean === '/design-system') return 'design-system';
  return 'home';
}
