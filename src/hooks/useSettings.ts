import { useState, useCallback, useEffect } from 'react';
import type { UserSettings, DimensionKey, TagColor } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_SETTINGS } from '../utils/constants';
import { getCachedSettings, setCachedSettings } from '../utils/sync';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    return getCachedSettings() || DEFAULT_SETTINGS;
  });

  // Load from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('setting_key, setting_value');

        if (error) throw error;
        if (data && data.length > 0) {
          const loaded: Partial<UserSettings> = {};
          for (const row of data) {
            if (row.setting_key === 'tags') loaded.tags = row.setting_value;
            if (row.setting_key === 'classifications') loaded.classifications = row.setting_value;
            if (row.setting_key === 'tag_colors') loaded.tagColors = row.setting_value;
            if (row.setting_key === 'active_dimensions') loaded.activeDimensions = row.setting_value;
          }
          const merged = { ...DEFAULT_SETTINGS, ...loaded };
          setSettings(merged);
          setCachedSettings(merged);
        }
      } catch (e) {
        console.warn('Settings load failed:', e);
      }
    })();
  }, []);

  const saveSetting = useCallback(async (key: string, value: unknown) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });
        if (error) console.error('Save setting error:', error);
      } catch (e) {
        console.warn('Save setting failed:', e);
      }
    }
  }, []);

  const updateTags = useCallback(async (tags: string[]) => {
    setSettings(prev => {
      const next = { ...prev, tags };
      setCachedSettings(next);
      return next;
    });
    await saveSetting('tags', tags);
  }, [saveSetting]);

  const updateClassifications = useCallback(async (classifications: string[]) => {
    setSettings(prev => {
      const next = { ...prev, classifications };
      setCachedSettings(next);
      return next;
    });
    await saveSetting('classifications', classifications);
  }, [saveSetting]);

  const updateTagColor = useCallback(async (tag: string, color: TagColor) => {
    setSettings(prev => {
      const next = {
        ...prev,
        tagColors: { ...prev.tagColors, [tag]: color },
      };
      setCachedSettings(next);
      saveSetting('tag_colors', next.tagColors);
      return next;
    });
  }, [saveSetting]);

  const updateActiveDimensions = useCallback(async (dims: DimensionKey[]) => {
    setSettings(prev => {
      const next = { ...prev, activeDimensions: dims };
      setCachedSettings(next);
      return next;
    });
    await saveSetting('active_dimensions', dims);
  }, [saveSetting]);

  const toggleDimension = useCallback((key: DimensionKey) => {
    setSettings(prev => {
      const active = prev.activeDimensions.includes(key)
        ? prev.activeDimensions.filter(d => d !== key)
        : [...prev.activeDimensions, key];
      const next = { ...prev, activeDimensions: active };
      setCachedSettings(next);
      saveSetting('active_dimensions', active);
      return next;
    });
  }, [saveSetting]);

  return {
    settings,
    updateTags,
    updateClassifications,
    updateTagColor,
    updateActiveDimensions,
    toggleDimension,
  };
}
