import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Please check your .env file."
  );
}

// Custom storage adapter - Hybrid (Chrome Extension + Local Dev)
const chromeStorageAdapter = {
  getItem: (key) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.get([key], (result) =>
          resolve(result[key] || null)
        );
      } else {
        resolve(localStorage.getItem(key));
      }
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.set({ [key]: value }, () => resolve(value));
      } else {
        localStorage.setItem(key, value);
        resolve(value);
      }
    });
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.remove([key], () => resolve());
      } else {
        localStorage.removeItem(key);
        resolve();
      }
    });
  },
};

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for extensions to avoid URL messing up
  },
});
