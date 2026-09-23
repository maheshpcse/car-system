import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Dealership } from '@/data/studio'
import styles from './LocationsPage.module.scss'

const pin = L.divIcon({
  className: styles.leafletPin,
  html: '<span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const activePin = L.divIcon({
  className: `${styles.leafletPin} ${styles.leafletPinActive}`,
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

function FlyTo({ place }: { place?: Dealership }) {
  const map = useMap()
  useEffect(() => {
    if (!place) return
    map.flyTo([place.latitude, place.longitude], 13, { duration: 0.7 })
  }, [map, place])
  return null
}

interface IndiaShowroomMapProps {
  places: Dealership[]
  selected?: Dealership
  onSelect: (id: string) => void
}

export function IndiaShowroomMap({ places, selected, onSelect }: IndiaShowroomMapProps) {
  const center: [number, number] = selected ? [selected.latitude, selected.longitude] : [22.3511, 78.6677]
  return (
    <div className={styles.map}>
      <MapContainer center={center} zoom={selected ? 12 : 5} scrollWheelZoom className={styles.leaflet} attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo place={selected} />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={place.id === selected?.id ? activePin : pin}
            eventHandlers={{ click: () => onSelect(place.id) }}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
