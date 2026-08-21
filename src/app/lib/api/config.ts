export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.fantasy-predict.com";

// When true, apiFetch returns mock responses instead of hitting the network so
// the app stays fully usable while backend contracts are still being confirmed.
// Set NEXT_PUBLIC_MOCK_API=false once the backend is ready to switch to real calls.
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_API !== "false";

export const TOKEN_KEY = "fp_token";
export const USER_TYPE_KEY = "fp_user_type";
