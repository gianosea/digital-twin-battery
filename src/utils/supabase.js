import { createClient } from '@supabase/supabase-js';

// Ganti string di bawah dengan URL dan Anon Key dari project Supabase kamu
const supabaseUrl = 'https://nvflozhmoudefwomwgaj.supabase.co'; 
const supabaseKey = 'sb_publishable_JE6ntmYFNCiduCYdJlhm9A_UqpLu_04'; 

export const supabase = createClient(supabaseUrl, supabaseKey);