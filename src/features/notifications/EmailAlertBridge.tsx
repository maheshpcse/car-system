import { useEffect, useRef } from 'react'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { useToast } from '@/shared/feedback/ToastProvider'
import { useNotifications } from './NotificationsProvider'

export function EmailAlertBridge() {
  const { items } = useNotifications()
  const { emailAlerts } = usePreferences()
  const { notify } = useToast()
  const primed = useRef(false)
  const seen = useRef(new Set<string>())

  useEffect(() => {
    if (!primed.current) {
      items.forEach((item) => seen.current.add(item.id))
      primed.current = true
      return
    }
    if (!emailAlerts.address) return
    items.forEach((item) => {
      if (seen.current.has(item.id) || item.read) return
      seen.current.add(item.id)
      const car = item.kind === 'vehicle' && emailAlerts.carUpdates
      const offer = item.kind === 'offer' && emailAlerts.offers
      const site = (item.kind === 'info' || item.kind === 'system' || !item.kind) && emailAlerts.siteNews
      if (car || offer || site) {
        notify(`Emailed “${item.title}” to ${emailAlerts.address}`, 'success')
      }
    })
  }, [items, emailAlerts, notify])

  return null
}
