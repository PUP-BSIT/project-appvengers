// Development environment configuration
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
  wsUrl: 'http://localhost:8081/ws-notifications',
  // OAuth2 redirect URL - Spring Security handles the OAuth flow
  oauth2GoogleUrl: 'http://localhost:8081/oauth2/authorization/google'
};

