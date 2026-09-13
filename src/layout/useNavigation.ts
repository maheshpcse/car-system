import { useEffect, useState } from 'react'
import { DEFAULT_NAV, navigationService, type NavGroup } from '@/services/navigationService'
import { ICON_NAMES, type IconName } from '@/shared/icons/Icon'

const ICONS = new Set<string>(ICON_NAMES)

function sanitize(groups: NavGroup[]): NavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      icon: ICONS.has(item.icon) ? item.icon : ('car' as IconName),
    })),
  }))
}

export function useNavigation() {
  const [groups, setGroups] = useState<NavGroup[]>(DEFAULT_NAV)

  useEffect(() => {
    let active = true
    navigationService.list().then((next) => {
      if (active) setGroups(sanitize(next))
    })
    return () => {
      active = false
    }
  }, [])

  return groups
}
