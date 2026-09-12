import type { User } from '@/models/user'
import { apiClient } from './apiClient'

export const profileService = {
  async me() {
    const result = await apiClient.request<User>('/users/me')
    return result.data
  },
  async update(patch: Partial<Pick<User, 'name' | 'location' | 'title'>>) {
    const result = await apiClient.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return result.data
  },
}
