export const API = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.foodieapp.com',
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT ?? '10000', 10),
  MOCK_DELAY_MIN: parseInt(process.env.EXPO_PUBLIC_MOCK_DELAY_MIN ?? '500', 10),
  MOCK_DELAY_MAX: parseInt(process.env.EXPO_PUBLIC_MOCK_DELAY_MAX ?? '1500', 10),
  ENABLE_MOCK: process.env.EXPO_PUBLIC_ENABLE_MOCK_API === 'true',
  ENABLE_FAILURES: process.env.EXPO_PUBLIC_ENABLE_MOCK_FAILURES === 'true',
  FAILURE_RATE: 0.05, // 5% failure rate when enabled
  RETRY_COUNT: 3,
  RETRY_DELAY_MS: 1000,
} as const;
