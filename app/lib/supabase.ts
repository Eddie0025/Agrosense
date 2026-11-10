/**
 * Supabase Client — Database & Auth Connection
 * Real SDK connected to your Supabase project.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kcxgstmiwixjbojxgveg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1_xIgqsTFyJylPvAGR-GJA_4HjkB0iZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
