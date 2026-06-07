import { createClient } from "@/lib/supabase/client";

let cache: Record<string, string> | null = null;

export const loadSettings = async (): Promise<Record<string, string>> => {
  if (cache) return cache;

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_all_settings");

  if (error) {
    console.error("loadSettings error:", error);
    return {};
  }

  const map = data as Record<string, string>;
  cache = map;
  return map;
};

export const getSetting = async (key: string): Promise<string | null> => {
  const settings = await loadSettings();
  return settings[key] ?? null;
};

export const updateSetting = async (
  key: string,
  value: string
): Promise<boolean> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("system_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) {
    console.error("updateSetting error:", error);
    return false;
  }

  if (cache) cache[key] = value;
  return true;
};

export const invalidateCache = () => {
  cache = null;
};
