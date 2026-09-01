export type Role = 'student' | 'admin'
export type ItemType = 'lost' | 'found'
export type ItemStatus = 'active' | 'recovered'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  department: string | null
  level: string | null
  role: Role
  created_at: string
}

export interface Item {
  id: string
  user_id: string
  type: ItemType
  title: string
  category: string
  description: string
  location: string
  date_occurred: string
  image_url: string | null
  status: ItemStatus
  created_at: string
  updated_at: string
}

// Item joined with the poster's public contact info (for detail page).
export interface ItemWithPoster extends Item {
  poster: Pick<Profile, 'full_name' | 'email' | 'phone'> | null
}
