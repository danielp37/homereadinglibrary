import * as fs from 'fs';
import * as path from 'path';

export interface PlaywrightConfig {
  baseUrl?: string;
  role?: 'admin' | 'volunteer';
  username?: string;
  password?: string;
  loginUrl?: string;
  usernameSelector?: string;
  passwordSelector?: string;
  nextSelector?: string;
  submitSelector?: string;
  postLoginConfirmSelector?: string;
  useLocalStack?: boolean;
}

/**
 * Load Playwright configuration with priority: env vars → config file → defaults
 *
 * Config file location (in order of precedence):
 * 1. .env.local (treated as JSON at root of ClientApp)
 * 2. config/credentials.local.json
 * 3. playwright/config/credentials.local.json (relative to this file)
 *
 * Environment variables take precedence over all config files:
 * - BAGGY_E2E_BASE_URL
 * - BAGGY_E2E_ROLE
 * - BAGGY_E2E_USERNAME
 * - BAGGY_E2E_PASSWORD
 * - BAGGY_E2E_LOGIN_URL
 * - BAGGY_E2E_USERNAME_SELECTOR
 * - BAGGY_E2E_PASSWORD_SELECTOR
 * - BAGGY_E2E_NEXT_SELECTOR
 * - BAGGY_E2E_SUBMIT_SELECTOR
 * - BAGGY_E2E_POST_LOGIN_CONFIRM_SELECTOR
 * - BAGGY_E2E_USE_LOCAL_STACK
 * - PLAYWRIGHT_BASE_URL
 */
export function loadConfig(): PlaywrightConfig {
  const config: PlaywrightConfig = {};

  // Try to load config file (in order of precedence)
  const configFiles = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), 'config', 'credentials.local.json'),
    path.join(__dirname, 'credentials.local.json'),
  ];

  for (const configFile of configFiles) {
    if (fs.existsSync(configFile)) {
      try {
        const content = fs.readFileSync(configFile, 'utf-8');
        const fileConfig = JSON.parse(content) as PlaywrightConfig;
        Object.assign(config, fileConfig);
        console.log(`[Playwright Config] Loaded from: ${configFile}`);
        break;
      } catch (error) {
        console.error(`[Playwright Config] Failed to parse ${configFile}: ${error}`);
      }
    }
  }

  // Environment variables override config file values
  if (process.env.BAGGY_E2E_BASE_URL) {
    config.baseUrl = process.env.BAGGY_E2E_BASE_URL;
  }
  if (process.env.PLAYWRIGHT_BASE_URL && !process.env.BAGGY_E2E_BASE_URL) {
    config.baseUrl = process.env.PLAYWRIGHT_BASE_URL;
  }
  if (process.env.BAGGY_E2E_ROLE) {
    config.role = process.env.BAGGY_E2E_ROLE as 'admin' | 'volunteer';
  }
  if (process.env.BAGGY_E2E_USERNAME) {
    config.username = process.env.BAGGY_E2E_USERNAME;
  }
  if (process.env.BAGGY_E2E_PASSWORD) {
    config.password = process.env.BAGGY_E2E_PASSWORD;
  }
  if (process.env.BAGGY_E2E_LOGIN_URL) {
    config.loginUrl = process.env.BAGGY_E2E_LOGIN_URL;
  }
  if (process.env.BAGGY_E2E_USERNAME_SELECTOR) {
    config.usernameSelector = process.env.BAGGY_E2E_USERNAME_SELECTOR;
  }
  if (process.env.BAGGY_E2E_PASSWORD_SELECTOR) {
    config.passwordSelector = process.env.BAGGY_E2E_PASSWORD_SELECTOR;
  }
  if (process.env.BAGGY_E2E_NEXT_SELECTOR) {
    config.nextSelector = process.env.BAGGY_E2E_NEXT_SELECTOR;
  }
  if (process.env.BAGGY_E2E_SUBMIT_SELECTOR) {
    config.submitSelector = process.env.BAGGY_E2E_SUBMIT_SELECTOR;
  }
  if (process.env.BAGGY_E2E_POST_LOGIN_CONFIRM_SELECTOR) {
    config.postLoginConfirmSelector = process.env.BAGGY_E2E_POST_LOGIN_CONFIRM_SELECTOR;
  }
  if (process.env.BAGGY_E2E_USE_LOCAL_STACK) {
    config.useLocalStack = process.env.BAGGY_E2E_USE_LOCAL_STACK !== 'false';
  }

  return config;
}

/**
 * Get a config value with fallback to default
 */
export function getConfigValue<T>(config: PlaywrightConfig, key: keyof PlaywrightConfig, defaultValue: T): T {
  const value = config[key];
  return value !== undefined ? (value as T) : defaultValue;
}
