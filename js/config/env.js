// js/config/env.js
// Note: Everything on the browser side is visible.
// The Supabase ‘anon’ key can be public, but the OpenAI API key should definitely not be there.
// Use Netlify Function for OpenAI (recommended).

export const SUPABASE_URL = "https://haowbfhlmhgwjgpgbtyn.supabase.co";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// OpenAI call (recommended): Netlify Function proxy
export const OPENAI_PROXY_URL = "/.netlify/functions/openai";

// Model name (proxy can override this)
export const OPENAI_MODEL = "gpt-5.2";
