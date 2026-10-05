import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ranpxutvysqmzuhecyut.supabase.co'
const supabaseAnonKey = 'sb_publishable_EXONgIxs6DaSalaX11kSKQ_UGFtDqXq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)