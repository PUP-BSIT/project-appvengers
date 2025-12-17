// Polyfill for SockJS in test environment
// SockJS requires 'global' to be defined
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}
