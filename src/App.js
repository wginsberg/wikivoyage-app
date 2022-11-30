import { useRef, useState, useEffect, useCallback } from 'react';
import { MapContainer, FeatureGroup } from 'react-leaflet'
import Protomaps from './components/Map/Protomaps/index.js'
import MarkerSet from './components/Map/MarkerSet/index.js'
import PolylineSet from './components/Map/PolylineSet/index.js'
import Header from './components/Header/index.js'
import Footer from './components/Footer/index.js'

function App() {
  const [{ nodes, edges }, setData] = useState({ nodes: [], edges: [] })
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hoverIndex, setHoverIndex] = useState(-1)
  const [mapBounds, setMapBounds] = useState("0,0,0,0")

  const [sw_lng, sw_lat, ne_lng, ne_lat] = mapBounds.split(",")
  const visibleNodes = nodes.filter(({ lat, lng }) => {
    return sw_lng < lng && ne_lng > lng && sw_lat < lat && ne_lat > lat
  }).slice(0, 1000)
  const visibleEdges = edges.filter(({ origin, destination }) => {
    return (sw_lng < origin.lng && ne_lng > origin.lng && sw_lat < origin.lat && ne_lat > origin.lat) ||
      (sw_lng < destination.lng && ne_lng > destination.lng && sw_lat < destination.lat && ne_lat > destination.lat)
  }).slice(0, 1000)

  useEffect(() => {
    fetch("data/world.json")
      .then(res => res.json())
      .then(setData)
  }, [])

  const mapRef = useRef()
  const featureGroupRef = useRef()

  const updateVisibleNodes = useCallback(map => {
    if (!map) return
    setMapBounds(map.getBounds().toBBoxString())
  }, [setMapBounds])

  const activeNode = visibleNodes[activeIndex]
  const hoverNode = visibleNodes[hoverIndex]

  const activeEdges = activeNode
    ? visibleEdges.filter(({ origin, destination }) => 
        origin.title === activeNode.title || destination.title === activeNode.title
      )
    : []
  const inactiveEdges = activeNode
    ? visibleEdges.filter(({ origin, destination }) => 
        origin.title !== activeNode.title && destination.title !== activeNode.title
      )
    : visibleEdges

    // Zoom active node and edges into view
    useEffect(() => {
      const map = mapRef.current
      if (!map) return

      // scroll to top to make header link visible
      window.scrollTo({ top: 0 });

      // center map on selected node
      if (activeNode) map.setView(activeNode)

      // zoom to fit connected nodes
      const bounds = featureGroupRef.current?.getBounds()
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50]})
    }, [activeNode])

    // event handlers

    const handleNodeClick = ({ latlng: {lat, lng} }) => {
      const nodeIndex = visibleNodes.findIndex(node => node.lat === lat && node.lng === lng)
      setActiveIndex(nodeIndex)
    }

    const handleFooterClick = (title) => {
      const nodeIndex = visibleNodes.findIndex(node => node.title === title)
      setActiveIndex(nodeIndex)
    }
  
    const handleFooterHover = (title) => {
      const index = visibleNodes.findIndex(node => node.title === title)
      setHoverIndex(index)
    }
  
    const handleMarkerHover = (e) => {
      const { lat, lng } = e?.latlng || {}
      const nodeIndex = visibleNodes.findIndex(node => node.lat === lat && node.lng === lng)
      const node = visibleNodes[nodeIndex]
      const isConnected = node && activeEdges.find(({ origin, destination }) => 
        (origin.lat === node.lat && origin.lng === node.lng) ||
        (destination.lat === node.lat && destination.lng === node.lng)
      )
      if (isConnected) {
        setHoverIndex(nodeIndex)
      } else {
        setHoverIndex(-1)
      }
    }

  return (
    <div className="App">
      <Header node={activeNode} />
      <MapContainer id="map" ref={mapRef} maxZoom={12}>
        <span className="loading">loading...</span>
        <Protomaps file="protomaps_vector_planet_odbl_z10.pmtiles" onBoundsChange={updateVisibleNodes} />
        <PolylineSet edges={inactiveEdges} />
        <FeatureGroup ref={featureGroupRef}>
          <PolylineSet edges={activeEdges} active={true} />
        </FeatureGroup>
        <MarkerSet
          nodes={visibleNodes}
          activeIndex={activeIndex}
          hoverIndex={hoverIndex}
          onClick={handleNodeClick}
          onMouseOver={handleMarkerHover}
          onMouseOut={() => handleMarkerHover({})}
        />
      </MapContainer>
      <Footer
        activeNode={activeNode}
        activeEdges={activeEdges}
        hoverNode={hoverNode}
        onClick={handleFooterClick}
        onMouseEnter={handleFooterHover}
        onMouseLeave={handleFooterHover}
      />
    </div>
  );
}

export default App;
