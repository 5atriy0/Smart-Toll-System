import { supabase } from "@/services/supabaseClient";

let cache: Record<string, string> | null = null;

export const loadSettings = async (): Promise<Record<string, string>> => {
  if (cache) return cache;

  const { data, error } = await supabase
    .from("system_settings")
    .select("*");

  if (error) {
    console.error("loadSettings error:", error);
    return {};
  }

  const map: Record<string, string> = {};
  (data as { key: string; value: string }[]).forEach((s) => {
    map[s.key] = s.value;
  });

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
  const { error } = await supabase
    .from("system_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .eq("key", key);

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
