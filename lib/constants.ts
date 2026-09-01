export const CATEGORIES = [
  'Electronics',
  'Documents',
  'Books',
  'Clothing',
  'Keys',
  'Bags',
  'Jewelry',
  'Wallet/Purse',
  'ID Card',
  'Other',
] as const

export const DEPARTMENTS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Law',
  'Medicine',
  'Arts & Humanities',
  'Sciences',
  'Social Sciences',
  'Education',
  'Other',
] as const

export const LEVELS = ['100', '200', '300', '400', '500', 'Postgraduate'] as const

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]
export const IMAGE_BUCKET = 'item-images'
