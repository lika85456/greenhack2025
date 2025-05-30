import { LatLngBoundsExpression, PathOptions } from 'leaflet'
import { Rectangle } from 'react-leaflet'

interface LeafletRectangleProps {
  bounds: LatLngBoundsExpression
  pathOptions: PathOptions
}

export const LeafletRectangle = ({ bounds, pathOptions }: LeafletRectangleProps) => {
  return <Rectangle bounds={bounds} pathOptions={pathOptions} />
}
