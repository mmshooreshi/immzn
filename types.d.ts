export interface UserProfile {
  phone: string
  name: string
  avatarUrl: string
  teamId: string
  teammates?: UserProfile[]
}
