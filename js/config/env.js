// js/config/env.js
// ⚠️ Not: Tarayıcı tarafındaki her şey görülebilir.
// Supabase 'anon' key public olabilir, ama OpenAI API key kesinlikle burada olmamalı.
// OpenAI için Netlify Function kullan (önerilen).

export const SUPABASE_URL = "https://haowbfhlmhgwjgpgbtyn.supabase.co";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// OpenAI çağrısı (önerilen): Netlify Function proxy
export const OPENAI_PROXY_URL = "/.netlify/functions/openai";

// Model adı (proxy bunu override edebilir)
export const OPENAI_MODEL = "gpt-5.2";
