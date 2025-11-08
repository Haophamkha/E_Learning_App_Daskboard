// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hudvyjogqesgdnrzkkbr.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZHZ5am9ncWVzZ2Rucnpra2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTU1OTksImV4cCI6MjA3Nzc3MTU5OX0.7nA5gAm6ATKWdiD1_swCq-Rc2mdrYwY8pp0QtBGJBU8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


