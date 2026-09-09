<template>
  <div class="page-layout ontology-page">
    <Navbar />

    <main class="ontology-main">
      <!-- Top Header & Metrics Bar -->
      <header class="ontology-header">
        <div class="header-left">
          <div class="ontology-pill">
            <span class="pill-spark">🧠</span>
            FEG KNOWLEDGE GRAPH · ONTOLOGY ENGINE v2.4
          </div>
          <h1 class="ontology-title">Sports Domain & Intent Ontology</h1>
          <p class="ontology-subtitle">
            Formal semantic model lifting low-level user clickstream telemetry into cognitive intent states, domain entities, and safety boundaries.
          </p>
        </div>

        <!-- Metric Badges -->
        <div class="metrics-strip">
          <div class="metric-chip">
            <span class="mc-num text-purple">{{ ONTOLOGY_METRICS.classesCount }}</span>
            <span class="mc-lbl">Classes</span>
          </div>
          <div class="metric-chip">
            <span class="mc-num text-cyan">{{ ONTOLOGY_METRICS.propertiesCount }}</span>
            <span class="mc-lbl">Properties</span>
          </div>
          <div class="metric-chip">
            <span class="mc-num text-amber">{{ ONTOLOGY_METRICS.axiomsCount }}</span>
            <span class="mc-lbl">Axioms</span>
          </div>
          <div class="metric-chip">
            <span class="mc-num text-emerald">{{ ONTOLOGY_METRICS.mappedEventsCount }}</span>
            <span class="mc-lbl">Mapped Events</span>
          </div>
        </div>
      </header>

      <!-- Action Toolbar -->
      <div class="toolbar-panel card">
        <div class="filter-group">
          <span class="filter-label">Filter Layer:</span>
          <button 
            v-for="(cat, key) in filterOptions" 
            :key="key"
            class="filter-btn"
            :class="{ active: selectedCategory === cat.id }"
            @click="setCategory(cat.id)"
          >
            <span class="dot" :style="{ backgroundColor: cat.color || '#e6edf3' }"></span>
            {{ cat.label }}
          </button>
        </div>

        <div class="toolbar-actions">
          <!-- Search input -->
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search concepts or events..." 
              @input="onSearch"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''; onSearch()">✕</button>
          </div>

          <!-- Trace Animation Button -->
          <button 
            class="btn-trace" 
            :class="{ 'btn-trace--active': isTracing }"
            @click="toggleJourneyTrace"
            title="Simulate a live user session mapping clicks into semantic intent"
          >
            <span class="trace-icon">{{ isTracing ? '⏹' : '▶' }}</span>
            {{ isTracing ? 'Tracing Intent Journey...' : 'Simulate Intent Trace' }}
          </button>

          <!-- Zoom controls -->
          <div class="zoom-controls">
            <button class="icon-btn" @click="zoomIn" title="Zoom In">+</button>
            <button class="icon-btn" @click="zoomOut" title="Zoom Out">−</button>
            <button class="icon-btn" @click="resetZoom" title="Reset View">⊙</button>
          </div>

          <!-- Export / View Turtle Modal Button -->
          <button class="btn-secondary" @click="showTurtleModal = true">
            <span>‹/›</span> OWL / Turtle
          </button>
        </div>
      </div>

      <!-- Graph Visualization & Inspector Container -->
      <div class="graph-workspace">
        <div class="svg-container" ref="chartContainer">
          <svg ref="svgRef" class="ontology-svg"></svg>

          <!-- Graph Overlay Legend -->
          <div class="graph-legend card">
            <div class="legend-title">Taxonomy Legend</div>
            <div class="legend-items">
              <div v-for="cat in ONTOLOGY_CATEGORIES" :key="cat.id" class="legend-row">
                <span class="legend-color" :style="{ backgroundColor: cat.color }"></span>
                <span class="legend-text">{{ cat.label }}</span>
              </div>
            </div>
            <div class="legend-hint">💡 Drag nodes to rearrange · Click to inspect axioms</div>
          </div>

          <!-- Live Trace Indicator Pill -->
          <transition name="fade">
            <div v-if="isTracing" class="trace-status-pill">
              <span class="pulsing-radar"></span>
              <span>Active Trace: <strong class="trace-node-name">{{ currentTraceNodeLabel }}</strong></span>
            </div>
          </transition>
        </div>

        <!-- Node Details Inspector Drawer -->
        <transition name="slide-panel">
          <aside v-if="selectedNode" class="node-inspector card">
            <div class="inspector-header">
              <div class="inspector-badge" :style="{ backgroundColor: getNodeCategoryColor(selectedNode.category) }">
                {{ selectedNode.category.toUpperCase() }}
              </div>
              <button class="close-btn" @click="selectedNode = null">✕</button>
            </div>

            <h2 class="inspector-title">{{ selectedNode.label }}</h2>
            <div class="inspector-iri" :title="selectedNode.iri">
              <code>{{ selectedNode.iri }}</code>
            </div>

            <p class="inspector-def">{{ selectedNode.definition }}</p>

            <div class="inspector-section">
              <h4 class="section-label">ONTOLOGICAL AXIOMS</h4>
              <ul class="axiom-list">
                <li v-for="(ax, i) in selectedNode.axioms" :key="i">
                  <code>{{ ax }}</code>
                </li>
              </ul>
            </div>

            <div class="inspector-section" v-if="selectedNode.mappedEvents?.length">
              <h4 class="section-label">MAPPED CLICKSTREAM TELEMETRY</h4>
              <div class="telemetry-tags">
                <span v-for="ev in selectedNode.mappedEvents" :key="ev" class="telemetry-tag">
                  ⚡ {{ ev }}
                </span>
              </div>
            </div>

            <div class="inspector-section" v-if="selectedNode.stats">
              <h4 class="section-label">SESSION REASONING STATS</h4>
              <div class="stats-grid">
                <div v-for="(val, key) in selectedNode.stats" :key="key" class="stat-card">
                  <div class="stat-val">{{ val }}</div>
                  <div class="stat-key">{{ formatStatKey(key) }}</div>
                </div>
              </div>
            </div>

            <div class="inspector-section">
              <h4 class="section-label">CONNECTED RELATIONS</h4>
              <div class="relations-list">
                <div 
                  v-for="(rel, idx) in getNodeRelations(selectedNode.id)" 
                  :key="idx" 
                  class="rel-item"
                  @click="focusNode(rel.targetId)"
                >
                  <span class="rel-predicate">{{ rel.label }}</span>
                  <span class="rel-arrow">→</span>
                  <span class="rel-target">{{ rel.targetLabel }}</span>
                </div>
              </div>
            </div>
          </aside>
        </transition>
      </div>
    </main>

    <!-- RDF Turtle / JSON-LD Modal -->
    <div v-if="showTurtleModal" class="modal-backdrop" @click.self="showTurtleModal = false">
      <div class="modal-card card">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">📜</span>
            <h3 class="modal-title">W3C OWL 2 DL Schema Specification</h3>
          </div>
          <button class="close-btn" @click="showTurtleModal = false">✕</button>
        </div>
        <p class="modal-desc">
          Formal RDF Turtle serialization describing the FEG sports entity domain, telemetry lifting axioms, and cognitive intent states.
        </p>
        <div class="code-container">
          <pre><code>{{ RDF_TURTLE_SAMPLE }}</code></pre>
        </div>
        <div class="modal-footer">
          <button class="btn-copy" @click="copyRdf">
            {{ copied ? '✓ Copied to Clipboard' : '📋 Copy RDF Turtle' }}
          </button>
          <button class="btn-secondary" @click="showTurtleModal = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as d3 from 'd3'
import Navbar from '@/components/Navbar.vue'
import {
  ONTOLOGY_METRICS,
  ONTOLOGY_CATEGORIES,
  ONTOLOGY_NODES,
  ONTOLOGY_EDGES,
  SIMULATED_JOURNEY_TRACE,
  RDF_TURTLE_SAMPLE
} from '@/ontology/ontologyData.js'

// State
const svgRef = ref(null)
const chartContainer = ref(null)
const selectedCategory = ref('all')
const searchQuery = ref('')
const selectedNode = ref(null)
const showTurtleModal = ref(false)
const copied = ref(false)
const isTracing = ref(false)
const currentTraceNodeLabel = ref('')

let traceTimer = null
let traceIndex = 0
let simulation = null
let svg = null
let gMain = null
let zoomBehavior = null
let nodeElements = null
let linkElements = null
let labelElements = null

const filterOptions = computed(() => {
  return [
    { id: 'all', label: 'All Layers', color: '#e6edf3' },
    ...Object.values(ONTOLOGY_CATEGORIES)
  ]
})

function getNodeCategoryColor(catId) {
  return ONTOLOGY_CATEGORIES[catId?.toUpperCase()]?.color || '#00d4ff'
}

function formatStatKey(key) {
  return key.replace(/([A-Z])/g, ' $1').toLowerCase()
}

function getNodeRelations(nodeId) {
  const rels = []
  ONTOLOGY_EDGES.forEach(edge => {
    const sId = typeof edge.source === 'object' ? edge.source.id : edge.source
    const tId = typeof edge.target === 'object' ? edge.target.id : edge.target
    if (sId === nodeId) {
      const targetNode = ONTOLOGY_NODES.find(n => n.id === tId)
      rels.push({
        label: edge.label,
        targetId: tId,
        targetLabel: targetNode ? targetNode.label : tId
      })
    }
  })
  return rels
}

function focusNode(nodeId) {
  const node = ONTOLOGY_NODES.find(n => n.id === nodeId)
  if (node) {
    selectedNode.value = node
    highlightNode(nodeId)
  }
}

function highlightNode(nodeId) {
  if (!nodeElements) return

  nodeElements.select('circle')
    .transition().duration(250)
    .attr('stroke', d => d.id === nodeId ? '#ffffff' : (ONTOLOGY_CATEGORIES[d.category.toUpperCase()]?.color || '#00d4ff'))
    .attr('stroke-width', d => d.id === nodeId ? 4 : 2)
    .attr('r', d => d.id === nodeId ? d.size + 6 : d.size)

  // Highlight connected edges
  linkElements
    .transition().duration(250)
    .attr('stroke', d => {
      const sId = typeof d.source === 'object' ? d.source.id : d.source
      const tId = typeof d.target === 'object' ? d.target.id : d.target
      return (sId === nodeId || tId === nodeId) ? '#00d4ff' : 'rgba(255, 255, 255, 0.15)'
    })
    .attr('stroke-width', d => {
      const sId = typeof d.source === 'object' ? d.source.id : d.source
      const tId = typeof d.target === 'object' ? d.target.id : d.target
      return (sId === nodeId || tId === nodeId) ? 2.5 : 1.2
    })
}

function onSearch() {
  if (!searchQuery.value.trim()) {
    resetVisualHighlights()
    return
  }
  const q = searchQuery.value.toLowerCase().trim()
  const match = ONTOLOGY_NODES.find(n => 
    n.label.toLowerCase().includes(q) || 
    n.definition.toLowerCase().includes(q) ||
    n.mappedEvents?.some(e => e.toLowerCase().includes(q))
  )

  if (match) {
    selectedNode.value = match
    highlightNode(match.id)
  }
}

function setCategory(catId) {
  selectedCategory.value = catId
  if (!nodeElements) return

  if (catId === 'all') {
    nodeElements.transition().duration(300).style('opacity', 1)
    linkElements.transition().duration(300).style('opacity', 0.8)
    labelElements.transition().duration(300).style('opacity', 1)
  } else {
    nodeElements.transition().duration(300).style('opacity', d => d.category === catId ? 1 : 0.15)
    labelElements.transition().duration(300).style('opacity', d => d.category === catId ? 1 : 0.15)
    linkElements.transition().duration(300).style('opacity', d => {
      const s = typeof d.source === 'object' ? d.source : ONTOLOGY_NODES.find(n => n.id === d.source)
      const t = typeof d.target === 'object' ? d.target : ONTOLOGY_NODES.find(n => n.id === d.target)
      return (s?.category === catId || t?.category === catId) ? 0.8 : 0.05
    })
  }
}

function resetVisualHighlights() {
  if (!nodeElements) return
  nodeElements.select('circle')
    .transition().duration(250)
    .attr('stroke', d => ONTOLOGY_CATEGORIES[d.category.toUpperCase()]?.color || '#00d4ff')
    .attr('stroke-width', 2)
    .attr('r', d => d.size)

  linkElements
    .transition().duration(250)
    .attr('stroke', 'rgba(255, 255, 255, 0.15)')
    .attr('stroke-width', 1.2)
}

function toggleJourneyTrace() {
  if (isTracing.value) {
    stopJourneyTrace()
  } else {
    startJourneyTrace()
  }
}

function startJourneyTrace() {
  isTracing.value = true
  traceIndex = 0
  runTraceStep()
  traceTimer = setInterval(runTraceStep, 1400)
}

function stopJourneyTrace() {
  isTracing.value = false
  if (traceTimer) {
    clearInterval(traceTimer)
    traceTimer = null
  }
  currentTraceNodeLabel.value = ''
  resetVisualHighlights()
}

function runTraceStep() {
  if (traceIndex >= SIMULATED_JOURNEY_TRACE.length) {
    traceIndex = 0 // Loop or finish
  }
  const targetId = SIMULATED_JOURNEY_TRACE[traceIndex]
  const node = ONTOLOGY_NODES.find(n => n.id === targetId)

  if (node) {
    selectedNode.value = node
    currentTraceNodeLabel.value = `${node.label} (${node.category.toUpperCase()})`
    highlightNode(node.id)

    // Pulse animation
    if (nodeElements) {
      nodeElements.filter(d => d.id === targetId)
        .select('circle')
        .transition().duration(300)
        .attr('r', node.size + 14)
        .attr('stroke', '#00d4ff')
        .attr('stroke-width', 5)
        .transition().duration(400)
        .attr('r', node.size + 4)
        .attr('stroke-width', 3)
    }
  }

  traceIndex++
}

function zoomIn() {
  if (svg && zoomBehavior) {
    svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3)
  }
}

function zoomOut() {
  if (svg && zoomBehavior) {
    svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7)
  }
}

function resetZoom() {
  if (svg && zoomBehavior && chartContainer.value) {
    const width = chartContainer.value.clientWidth
    const height = chartContainer.value.clientHeight
    svg.transition().duration(400).call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    )
  }
}

function copyRdf() {
  navigator.clipboard.writeText(RDF_TURTLE_SAMPLE).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

// Build Force Graph
function initGraph() {
  if (!svgRef.value || !chartContainer.value) return

  const width = chartContainer.value.clientWidth || 900
  const height = chartContainer.value.clientHeight || 650

  // Clear existing
  d3.select(svgRef.value).selectAll('*').remove()

  svg = d3.select(svgRef.value)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [0, 0, width, height])

  // Zoom Setup
  zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      gMain.attr('transform', event.transform)
    })

  svg.call(zoomBehavior)

  // Defs for filters and arrowheads
  const defs = svg.append('defs')

  // Glow filters
  Object.values(ONTOLOGY_CATEGORIES).forEach(cat => {
    const filter = defs.append('filter')
      .attr('id', `glow-${cat.id}`)
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%')

    filter.append('feGaussianBlur')
      .attr('stdDeviation', 5)
      .attr('result', 'coloredBlur')

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
  })

  // Arrow markers
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 22)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-4L8,0L0,4')
    .attr('fill', 'rgba(255, 255, 255, 0.4)')

  gMain = svg.append('g').attr('class', 'g-main')

  // Deep clone data for simulation
  const nodes = ONTOLOGY_NODES.map(d => ({ ...d }))
  const links = ONTOLOGY_EDGES.map(d => ({ ...d }))

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(110))
    .force('charge', d3.forceManyBody().strength(-380))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(d => d.size + 24))

  // Render Links
  const linkGroup = gMain.append('g').attr('class', 'links')
  linkElements = linkGroup.selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', 'rgba(255, 255, 255, 0.15)')
    .attr('stroke-width', 1.2)
    .attr('marker-end', 'url(#arrow)')

  // Render Link Labels
  const edgeLabelGroup = gMain.append('g').attr('class', 'edge-labels')
  const edgeLabels = edgeLabelGroup.selectAll('text')
    .data(links)
    .enter()
    .append('text')
    .attr('class', 'edge-text')
    .attr('text-anchor', 'middle')
    .attr('font-size', '9px')
    .attr('fill', '#8b949e')
    .text(d => d.label)

  // Render Nodes Group
  const nodeGroup = gMain.append('g').attr('class', 'nodes')
  nodeElements = nodeGroup.selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node-item')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    )
    .on('click', (event, d) => {
      event.stopPropagation()
      selectedNode.value = d
      highlightNode(d.id)
    })

  // Node Outer Glow Ring
  nodeElements.append('circle')
    .attr('class', 'node-halo')
    .attr('r', d => d.size + 3)
    .attr('fill', 'none')
    .attr('stroke', d => ONTOLOGY_CATEGORIES[d.category.toUpperCase()]?.color || '#00d4ff')
    .attr('stroke-opacity', 0.25)
    .attr('stroke-width', 3)

  // Node Core Circle
  nodeElements.append('circle')
    .attr('class', 'node-circle')
    .attr('r', d => d.size)
    .attr('fill', d => {
      const cat = ONTOLOGY_CATEGORIES[d.category.toUpperCase()]
      return '#161b22'
    })
    .attr('stroke', d => ONTOLOGY_CATEGORIES[d.category.toUpperCase()]?.color || '#00d4ff')
    .attr('stroke-width', 2)
    .attr('filter', d => `url(#glow-${d.category})`)

  // Node Category Glyph/Icon
  nodeElements.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('font-size', d => `${Math.max(10, d.size * 0.55)}px`)
    .attr('fill', '#e6edf3')
    .text(d => {
      switch (d.category) {
        case 'intent': return '🎯'
        case 'entity': return '⚽'
        case 'action': return '⚡'
        case 'safety': return '🛡️'
        case 'user': return '👤'
        default: return '●'
      }
    })

  // Node Labels below
  labelElements = gMain.append('g').attr('class', 'node-labels')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', d => d.size + 14)
    .attr('font-size', '11px')
    .attr('font-weight', '500')
    .attr('fill', '#e6edf3')
    .text(d => d.label)

  // Simulation tick update
  simulation.on('tick', () => {
    linkElements
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    edgeLabels
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2 - 3)

    nodeElements
      .attr('transform', d => `translate(${d.x},${d.y})`)

    labelElements
      .attr('x', d => d.x)
      .attr('y', d => d.y)
  })

  // Drag handlers
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  // Click background to deselect
  svg.on('click', () => {
    selectedNode.value = null
    resetVisualHighlights()
  })

  // Select default node (Exploration Intent)
  const defaultNode = nodes.find(n => n.id === 'Intent_Exploration')
  if (defaultNode) {
    selectedNode.value = defaultNode
    highlightNode(defaultNode.id)
  }
}

onMounted(() => {
  initGraph()
  window.addEventListener('resize', initGraph)
})

onUnmounted(() => {
  stopJourneyTrace()
  window.removeEventListener('resize', initGraph)
  if (simulation) simulation.stop()
})
</script>

<style scoped>
.ontology-page {
  min-height: 100vh;
  background-color: var(--bg-base);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}

.ontology-main {
  flex: 1;
  padding: var(--sp-4) var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

/* Header */
.ontology-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--sp-4);
}

.ontology-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 4px 12px;
  border-radius: var(--r-full);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: var(--sp-2);
}

.ontology-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ontology-subtitle {
  color: var(--text-secondary);
  font-size: 0.88rem;
  max-width: 720px;
  margin: var(--sp-1) 0 0;
  line-height: 1.45;
}

/* Metrics Strip */
.metrics-strip {
  display: flex;
  gap: var(--sp-3);
}

.metric-chip {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  padding: 8px 16px;
  border-radius: var(--r-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 84px;
}

.mc-num {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1.1;
}

.mc-lbl {
  font-size: 0.68rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.text-purple { color: #c084fc; }
.text-cyan { color: #38bdf8; }
.text-amber { color: #fbbf24; }
.text-emerald { color: #34d399; }

/* Toolbar */
.toolbar-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-lg);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 5px 12px;
  border-radius: var(--r-full);
  font-size: 0.78rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.filter-btn.active {
  background: rgba(0, 212, 255, 0.12);
  color: #00d4ff;
  border-color: #00d4ff;
  font-weight: 600;
}

.filter-btn .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  padding: 6px 28px 6px 30px;
  border-radius: var(--r-md);
  font-size: 0.8rem;
  outline: none;
  width: 210px;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: var(--color-primary);
}

.search-icon {
  position: absolute;
  left: 8px;
  font-size: 0.75rem;
  opacity: 0.6;
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-trace {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: var(--r-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(124, 58, 237, 0.35);
}

.btn-trace:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-trace--active {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.4);
}

.zoom-controls {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--r-md);
  overflow: hidden;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  padding: 6px 14px;
  border-radius: var(--r-md);
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* Workspace */
.graph-workspace {
  position: relative;
  display: flex;
  height: 680px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.svg-container {
  flex: 1;
  position: relative;
  background: radial-gradient(circle at 50% 50%, #161f2f 0%, #0d1117 80%);
}

.ontology-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Legend */
.graph-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-default);
  border-radius: var(--r-md);
  padding: 10px 14px;
  z-index: 10;
  max-width: 250px;
}

.legend-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-hint {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 8px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 6px;
}

/* Trace Radar */
.trace-status-pill {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(124, 58, 237, 0.25);
  border: 1px solid #7c3aed;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: var(--r-full);
  font-size: 0.82rem;
  backdrop-filter: blur(8px);
  z-index: 10;
}

.pulsing-radar {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #a855f7;
  box-shadow: 0 0 10px #a855f7;
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

/* Inspector Drawer */
.node-inspector {
  width: 380px;
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(14px);
  border-left: 1px solid var(--border-default);
  padding: var(--sp-5);
  overflow-y: auto;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inspector-badge {
  font-size: 0.68rem;
  font-weight: 800;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: var(--r-sm);
  letter-spacing: 0.05em;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 2px 6px;
}

.close-btn:hover {
  color: var(--text-primary);
}

.inspector-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.inspector-iri code {
  font-size: 0.68rem;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.08);
  padding: 3px 6px;
  border-radius: var(--r-sm);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-def {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

.section-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.axiom-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.axiom-list code {
  font-size: 0.72rem;
  color: #e6edf3;
  background: rgba(255, 255, 255, 0.04);
  padding: 3px 8px;
  border-radius: var(--r-sm);
  display: block;
  border-left: 2px solid #a855f7;
}

.telemetry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.telemetry-tag {
  font-size: 0.7rem;
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 3px 8px;
  border-radius: var(--r-full);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  padding: 8px 10px;
  border-radius: var(--r-md);
  text-align: center;
}

.stat-val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #00d4ff;
}

.stat-key {
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.relations-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  padding: 6px 10px;
  border-radius: var(--r-md);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rel-item:hover {
  background: rgba(0, 212, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.3);
}

.rel-predicate {
  color: #c084fc;
  font-weight: 500;
}

.rel-arrow {
  color: var(--text-muted);
}

.rel-target {
  color: #e6edf3;
  font-weight: 600;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-lg);
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  padding: var(--sp-5);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  font-size: 1.4rem;
}

.modal-title {
  margin: 0;
  font-size: 1.15rem;
}

.modal-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 8px 0 16px;
}

.code-container {
  background: #0d1117;
  border: 1px solid var(--border-default);
  border-radius: var(--r-md);
  padding: 14px;
  overflow-y: auto;
  flex: 1;
}

.code-container pre {
  margin: 0;
}

.code-container code {
  font-family: 'Fira Code', monospace, Consolas;
  font-size: 0.78rem;
  color: #58a6ff;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn-copy {
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: var(--r-md);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

/* Animations */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s ease;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
