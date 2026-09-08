import { useEffect } from 'react'
import { env } from '@/core/config/environment'

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${env.appName}` : env.appName
    if (description) {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (meta) meta.content = description
    }
  }, [title, description])
}
