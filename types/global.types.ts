declare global {
  const log: import('winston').Logger;
  const deps: import('./deps.types').default;
}
export {}