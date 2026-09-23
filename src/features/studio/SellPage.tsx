import { useEffect, useState, type FormEvent } from 'react'
import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { formatPrice } from '@/core/utils/format'
import { studioService } from '@/services/studioService'
import type { MarketplaceListing } from '@/data/studio'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Textarea, TextInput } from '@/shared/ui/Field'
import styles from './CollectionPage.module.scss'
import sellStyles from './SellPage.module.scss'

const EMPTY = {
  title: '',
  year: String(new Date().getFullYear()),
  askingPrice: '',
  odometerKm: '',
  condition: 'Excellent',
  city: '',
  notes: '',
  contactName: '',
  email: '',
  phone: '',
}

export default function SellPage() {
  useDocumentTitle('Sell a car', 'List a used or vintage car with the studio marketplace.')
  const { notify } = useToast()
  const [form, setForm] = useState(EMPTY)
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void studioService.marketplace().then(setListings)
  }, [])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const created = await studioService.sell({
        title: form.title,
        year: Number(form.year),
        askingPrice: Number(form.askingPrice),
        odometerKm: Number(form.odometerKm),
        condition: form.condition,
        city: form.city,
        notes: form.notes,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
      })
      setListings((current) => [created, ...current])
      setForm(EMPTY)
      notify('Listing received', 'success')
    } catch {
      notify('Could not submit the listing', 'warning')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.banner}>
          <div className={styles.bannerText}>
            <span className="t-eyebrow">Marketplace</span>
            <h1 className="t-title">Sell a car</h1>
            <p className="t-description">Used and vintage consignments go to the studio desk. Contact details stay off the public board.</p>
          </div>
        </header>

        <div className={sellStyles.split}>
          <form className={sellStyles.form} onSubmit={(event) => void onSubmit(event)}>
            <TextInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <div className={sellStyles.row}>
              <TextInput label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
              <TextInput label="Asking price (USD)" type="number" value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: e.target.value })} required />
            </div>
            <div className={sellStyles.row}>
              <TextInput label="Odometer (km)" type="number" value={form.odometerKm} onChange={(e) => setForm({ ...form, odometerKm: e.target.value })} required />
              <TextInput label="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} required />
            </div>
            <TextInput label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} required />
            <div className={sellStyles.row}>
              <TextInput label="Your name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
              <TextInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <TextInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} optional />
            <Button type="submit" disabled={submitting} iconLeft="send">
              {submitting ? 'Sending…' : 'Submit listing'}
            </Button>
          </form>

          <div className={sellStyles.board}>
            <h2 className="t-heading">On the board</h2>
            {listings.map((listing) => (
              <Card key={listing.id} padding="md">
                <h3 className="t-card-title">{listing.title}</h3>
                <p>
                  {listing.year} · {listing.city} · {listing.condition}
                </p>
                <p>
                  {formatPrice(listing.askingPrice)} · {listing.odometerKm.toLocaleString()} km
                </p>
                <p>{listing.notes}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
