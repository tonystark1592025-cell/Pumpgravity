export function checkAIEnabled(): boolean {
  return process.env.ENABLE_AI === 'true'
}

export function checkGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0
}

export function getAIStatus(): {
  enabled: boolean
  configured: boolean
  message: string
} {
  const enabled = checkAIEnabled()
  const configured = checkGeminiConfigured()
  
  if (!enabled) {
    return {
      enabled: false,
      configured,
      message: 'AI chatbot is currently under development'
    }
  }
  
  if (!configured) {
    return {
      enabled: true,
      configured: false,
      message: 'AI service is not properly configured'
    }
  }
  
  return {
    enabled: true,
    configured: true,
    message: 'AI service is ready'
  }
}