import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://fdlpzljfgtpinmfczvjx.supabase.co",
  "sb_publishable_H6bPqgxyGSNAVCi2geFOEQ__0W_NiTH",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Android WebViews can leave a browser lock behind after the app closes.
      // Running the operation directly prevents startup from hanging forever.
      lock: async (_name, _acquireTimeout, operation) => operation(),
    },
  },
);
