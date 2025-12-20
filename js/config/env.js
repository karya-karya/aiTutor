// js/config/env.js
// ⚠️ Not: Tarayıcı tarafındaki her şey görülebilir.
// Supabase 'anon' key public olabilir, ama OpenAI API key kesinlikle burada olmamalı.
// OpenAI için Netlify Function kullan (önerilen).

export const SUPABASE_URL = "https://haowbfhlmhgwjgpgbtyn.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhb3diZmhsbWhnd2pncGdidHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTk0MDgsImV4cCI6MjA4MTM3NTQwOH0.oc2LfHXXTRo8YPXrgpbxV6Ts6jvKNOFaaDR15ay9H0A";

// OpenAI çağrısı (önerilen): Netlify Function proxy
export const OPENAI_PROXY_URL = "/.netlify/functions/openai";

// Model adı (proxy bunu override edebilir)
export const OPENAI_MODEL = "gpt-5.2";
