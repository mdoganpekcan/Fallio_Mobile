import { supabase } from './supabase';

export const storageService = {
  async uploadFile(
    bucket: string,
    filePath: string,
    fileUri: string,
    contentType?: string
  ): Promise<string> {
    console.log('[Storage] Uploading file to bucket:', bucket);
    
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: contentType || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Storage] Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log('[Storage] File uploaded successfully:', publicUrl);
    return publicUrl;
  },

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    console.log('[Storage] Deleting file from bucket:', bucket);
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('[Storage] Delete error:', error);
      throw error;
    }

    console.log('[Storage] File deleted successfully');
  },

  async getPublicUrl(bucket: string, filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async listFiles(bucket: string, path?: string): Promise<any[]> {
    console.log('[Storage] Listing files in bucket:', bucket);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      console.error('[Storage] List error:', error);
      throw error;
    }

    return data || [];
  },
};
