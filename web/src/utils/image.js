export const CAR_PLACEHOLDERS = [
  '/images/car-placeholder.svg',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80'
];

export function getFallbackCarImage(seed = 0) {
  return CAR_PLACEHOLDERS[Math.abs(seed) % CAR_PLACEHOLDERS.length];
}

export function resolveImage(imageUrl, seed = 0) {
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    return imageUrl;
  }
  return getFallbackCarImage(seed);
}
