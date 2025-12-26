import * as ImageManipulator from 'expo-image-manipulator';

export const imageService = {
  /**
   * Compresses and resizes an image to be suitable for upload.
   * @param uri The URI of the image to compress.
   * @param options Configuration options for compression.
   * @returns The manipulated image result.
   */
  compressImage: async (
    uri: string,
    options: {
      maxWidth?: number;
      compress?: number;
    } = {}
  ) => {
    const { maxWidth = 1080, compress = 0.7 } = options;

    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: compress, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result;
    } catch (error) {
      console.error('Image compression error:', error);
      throw error;
    }
  },
};
