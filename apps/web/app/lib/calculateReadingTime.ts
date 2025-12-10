/**
 * Calculate reading time in minutes based on word count
 * Average reading speed: 200-250 words per minute
 */
export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 225; // Average reading speed
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
};

