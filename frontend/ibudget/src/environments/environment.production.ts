// Production environment configuration
export const environment = {
  production: true,
  apiUrl: 'https://i-budget.site/api',
  wsUrl: 'https://i-budget.site/ws-notifications',
  // OAuth2 redirect URL - Spring Security handles the OAuth flow
  oauth2GoogleUrl: 'https://i-budget.site/oauth2/authorization/google'
};

