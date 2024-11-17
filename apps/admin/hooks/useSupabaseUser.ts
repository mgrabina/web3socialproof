import { useEffect, useState } from "react";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client"; // Adjust to your Supabase client setup
import { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
  const [user, setUser] = useState<User | undefined>(); // Replace `any` with Supabase user type if available
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createSupabaseClientForClientSide(); // Initialize the Supabase client
      setLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user ?? undefined);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
