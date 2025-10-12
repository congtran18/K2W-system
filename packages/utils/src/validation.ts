/**
 * Validation utilities for K2W system
 */

export const validateKeyword = (keyword: string): { isValid: boolean; error?: string } => {
  if (!keyword || keyword.trim().length === 0) {
    return { isValid: false, error: 'Keyword cannot be empty' };
  }
  
  if (keyword.length > 100) {
    return { isValid: false, error: 'Keyword too long (max 100 characters)' };
  }
  
  return { isValid: true };
};

export const validateProjectId = (projectId: string): { isValid: boolean; error?: string } => {
  if (!projectId || projectId.trim().length === 0) {
    return { isValid: false, error: 'Project ID cannot be empty' };
  }
  
  return { isValid: true };
};

export const validateLanguage = (language: string): { isValid: boolean; error?: string } => {
  const supportedLanguages = ['en', 'vi', 'zh', 'ja', 'es', 'fr', 'de'];
  
  if (!supportedLanguages.includes(language)) {
    return { isValid: false, error: `Language '${language}' not supported` };
  }
  
  return { isValid: true };
};

export const validateRegion = (region: string): { isValid: boolean; error?: string } => {
  const supportedRegions = ['US', 'VN', 'CN', 'JP', 'ES', 'FR', 'DE', 'GB', 'AU'];
  
  if (!supportedRegions.includes(region)) {
    return { isValid: false, error: `Region '${region}' not supported` };
  }
  
  return { isValid: true };
};