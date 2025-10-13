// Central API configuration to avoid circular imports between API slices
export const DEV_API_URL = "http://192.168.1.75:5000/api";
export const PROD_API_URL = "https://api.yourapp.com/api"; // TODO: replace with real prod URL

// Toggle or compute based on env if needed
export const API_URL = DEV_API_URL;
