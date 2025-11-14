# Frontend Environment Configuration

## Overview
Sensitive configuration data (API URLs, webhook URLs, etc.) is managed through Angular's environment system, NOT hardcoded in the codebase.

## Environment Files

### Development (`src/environments/environment.ts`)
Used when running `npm start` or `ng serve`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
  n8nWebhookUrl: 'https://n8n-j3he.onrender.com/webhook/YOUR-WEBHOOK-ID/chat'
};
```

### Production (`src/environments/environment.production.ts`)
Used when running `npm run build`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://i-budget.site/api',
  n8nWebhookUrl: 'https://n8n-j3he.onrender.com/webhook/YOUR-WEBHOOK-ID/chat'
};
```

## How It Works

1. **Environment Import**: Services import from `src/environments/environment`:
   ```typescript
   import { environment } from '../environments/environment';
   ```

2. **Build-Time Replacement**: Angular CLI automatically replaces `environment.ts` with `environment.production.ts` during production builds

3. **Runtime Injection**: `main.ts` exposes environment values to global scope for use in `index.html` scripts:
   ```typescript
   window.n8nWebhookUrl = environment.n8nWebhookUrl;
   ```

## Configuration Values

### API URL (`apiUrl`)
- **Development**: `http://localhost:8081/api` - Local backend server
- **Production**: `https://i-budget.site/api` - Production backend

### n8n Webhook URL (`n8nWebhookUrl`)
- Contains sensitive webhook ID
- Used by the n8n chat widget in `index.html`
- Different webhook IDs can be used for dev/prod environments

## Adding New Configuration

1. Add to both `environment.ts` and `environment.production.ts`:
   ```typescript
   export const environment = {
     // ... existing config
     newConfigKey: 'value'
   };
   ```

2. Use in services:
   ```typescript
   import { environment } from '../environments/environment';
   const value = environment.newConfigKey;
   ```

3. For use in `index.html` scripts, expose via `main.ts`:
   ```typescript
   window.newConfigKey = environment.newConfigKey;
   ```

## Security Best Practices

✅ **DO**:
- Store all sensitive IDs, URLs, and keys in environment files
- Use different values for development and production
- Document configuration in this file
- Commit environment files with placeholder values

❌ **DON'T**:
- Hardcode sensitive data in HTML, TypeScript, or configuration files
- Commit actual production secrets (use placeholders like `YOUR-WEBHOOK-ID`)
- Expose sensitive data in client-side code if possible

## Migration from Hardcoded Values

If you find hardcoded sensitive data:
1. Move the value to both environment files
2. Update code to import from `environment`
3. For HTML scripts, expose via `main.ts` window object
4. Test both development and production builds

## Example: Current Setup

**Before (Hardcoded)**:
```html
<!-- index.html -->
<script>
  createChat({
    webhookUrl: 'https://n8n-j3he.onrender.com/webhook/e28117bf-8896-4a38-8002-07819dbf1e86/chat'
  });
</script>
```

**After (Environment-Based)**:
```typescript
// main.ts
window.n8nWebhookUrl = environment.n8nWebhookUrl;
```

```html
<!-- index.html -->
<script>
  createChat({
    webhookUrl: window.n8nWebhookUrl
  });
</script>
```
