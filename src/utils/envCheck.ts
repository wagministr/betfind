/**
 * Environment variables validation utilities
 * This file contains functions to check required environment variables
 * and provide helpful error messages when they are missing
 */

export interface EnvCheckResult {
  isValid: boolean;
  message: string;
}

/**
 * Validates basic required environment variables 
 * @returns Object with validation result
 */
export function validateBasicEnv(): EnvCheckResult {
  const requiredVars = [
    'OPENAI_API_KEY',
    'API_FOOTBALL_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return {
      isValid: false,
      message: `Missing required environment variables: ${missingVars.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    message: 'All required environment variables are present'
  };
}

/**
 * Validates environment variables and exits the process if any are missing
 * For use in scripts that need to fail immediately when env vars are missing
 */
export function validateEnvOrExit(): void {
  const result = validateBasicEnv();
  
  if (!result.isValid) {
    console.error(`❌ ${result.message}`);
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
}

/**
 * Specifically check for API keys needed for the application
 * @returns Object with validation result and error message
 */
export function checkAPIKeys(): EnvCheckResult {
  const requiredAPIKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'OPENAI_API_MODEL',
    'CRON_SECRET'
  ];
  
  const missingVars = requiredAPIKeys.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return {
      isValid: false,
      message: `Missing required environment variables: ${missingVars.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    message: 'All required API keys are present'
  };
}

/**
 * Validate that provided API keys have correct format
 * @returns Object with validation result and error message
 */
export function validateAPIKeyFormats(): EnvCheckResult {
  let invalidKeys: string[] = [];
  let message = 'All API keys have valid formats';
  
  // Check Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    invalidKeys.push('NEXT_PUBLIC_SUPABASE_URL');
    message = 'Supabase URL must start with https://';
  }
  
  // Check OpenAI API key format (typically starts with "sk-")
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith('sk-')) {
    invalidKeys.push('OPENAI_API_KEY');
    message = 'OpenAI API key must start with "sk-"';
  }
  
  if (invalidKeys.length > 0) {
    return {
      isValid: false,
      message
    };
  }
  
  return {
    isValid: true,
    message
  };
}

/**
 * Complete environment check that returns a result rather than exiting
 * Use this in components or API routes where you want to handle the error
 */
export function validateEnv(): EnvCheckResult {
  // В клиентских компонентах некоторые переменные окружения могут быть недоступны
  // Поэтому проверяем только те, которые должны быть доступны в браузере
  if (typeof window !== 'undefined') {
    // Браузерная среда - проверяем только public переменные
    const requiredClientVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const missingVars = requiredClientVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return {
        isValid: false,
        message: `Missing required environment variables: ${missingVars.join(', ')}`
      };
    }
    
    return {
      isValid: true,
      message: 'All required environment variables are present'
    };
  }
  
  // Серверная среда - проверяем все ключи API
  const apiKeysResult = checkAPIKeys();
  
  if (!apiKeysResult.isValid) {
    return apiKeysResult;
  }
  
  // If API keys are present, check their format
  const formatResult = validateAPIKeyFormats();
  
  if (!formatResult.isValid) {
    return formatResult;
  }
  
  // All good!
  return {
    isValid: true,
    message: 'All environment variables are valid'
  };
}