const { writeFileSync } = require('fs')
const { getEdges } = require("./util.js")

// TODO - find a better way to store this data
const BLOCKLIST = new Set([
    "Wikivoyage:Cruising Expedition/Structure for cruising articles/Puerto Vallarta",
])

const TARGET = 'public/data/world.json'

const edges = getEdges()
    .filter(({ origin, destination }) => {
        if (BLOCKLIST.has(origin)) return false
        if (BLOCKLIST.has(destination)) return false
        return true
    })
    .map(edge => ({
        origin: {
            title: edge.origin,
            lat: edge.originLat,
            lng: edge.originLng
        },
        destination: {
            title: edge.destination,
            lat: edge.destinationLat,
            lng: edge.destinationLng
        }
    }))

const nodes = {}
for (const edge of edges) {
    for (const node of [edge.origin, edge.destination]) {
        if (nodes[node.title]) continue
        nodes[node.title] = node
    }
}

const formattedResult = {
    nodes: Object.values(nodes),
    edges: edges
}
const resultString = JSON.stringify(formattedResult, null, 4)

writeFileSync(TARGET, resultString)
