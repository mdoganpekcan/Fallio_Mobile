export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    avatar_url: string | null
                    birth_date: string
                    zodiac_sign: string
                    gender: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name: string
                    avatar_url?: string | null
                    birth_date: string
                    zodiac_sign: string
                    gender: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    avatar_url?: string | null
                    birth_date?: string
                    zodiac_sign?: string
                    gender?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            user_wallet: {
                Row: {
                    id: string
                    user_id: string
                    credits: number
                    diamonds: number
                    subscription_type: string | null
                    subscription_valid_until: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    credits?: number
                    diamonds?: number
                    subscription_type?: string | null
                    subscription_valid_until?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    credits?: number
                    diamonds?: number
                    subscription_type?: string | null
                    subscription_valid_until?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            fortune_tellers: {
                Row: {
                    id: string
                    name: string
                    avatar_url: string | null
                    bio: string | null
                    expertise: string[]
                    price: number
                    rating: number
                    total_ratings: number
                    is_online: boolean
                    is_recommended: boolean
                    is_active: boolean
                    is_ai: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    avatar_url?: string | null
                    bio?: string | null
                    expertise: string[]
                    price: number
                    rating?: number
                    total_ratings?: number
                    is_online?: boolean
                    is_recommended?: boolean
                    is_active?: boolean
                    is_ai?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    avatar_url?: string | null
                    bio?: string | null
                    expertise?: string[]
                    price?: number
                    rating?: number
                    total_ratings?: number
                    is_online?: boolean
                    is_recommended?: boolean
                    is_active?: boolean
                    is_ai?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            fortunes: {
                Row: {
                    id: string
                    user_id: string
                    teller_id: string | null
                    type: string
                    status: string
                    images: string[] | null
                    user_note: string | null
                    response: string | null
                    selected_cards: number[] | null
                    selected_color: string | null
                    category: string | null
                    credits_cost: number
                    is_read: boolean
                    user_rating: number | null
                    created_at: string
                    completed_at: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    teller_id?: string | null
                    type: string
                    status?: string
                    images?: string[] | null
                    user_note?: string | null
                    response?: string | null
                    selected_cards?: number[] | null
                    selected_color?: string | null
                    category?: string | null
                    credits_cost: number
                    is_read?: boolean
                    user_rating?: number | null
                    created_at?: string
                    completed_at?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    teller_id?: string | null
                    type?: string
                    status?: string
                    images?: string[] | null
                    user_note?: string | null
                    response?: string | null
                    selected_cards?: number[] | null
                    selected_color?: string | null
                    category?: string | null
                    credits_cost?: number
                    is_read?: boolean
                    user_rating?: number | null
                    created_at?: string
                    completed_at?: string | null
                    metadata?: Json | null
                }
            }
            fortune_responses: {
                Row: {
                    id: string
                    fortune_id: string
                    fortune_teller_id: string
                    text: string
                    rating: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    fortune_id: string
                    fortune_teller_id: string
                    text: string
                    rating?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    fortune_id?: string
                    fortune_teller_id?: string
                    text?: string
                    rating?: number | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
