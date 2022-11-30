import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { getMapTileHost } from "../../../utils"

function Protomaps (props) {
    const { file, onBoundsChange } = props
    const map = useMap()

    useEffect(() => {
        const url = `${getMapTileHost()}/${file}`
        var layer = window.protomaps.leafletLayer({ url })
        layer.addTo(map)
        layer.addInspector(map)
        map.setView([30.058506, -115.725157], 5)
        map.on("moveend", () => onBoundsChange(map))
    }, [map, file, onBoundsChange])
}

export default Protomaps
