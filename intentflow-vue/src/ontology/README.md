# 🧠 Sports Domain & Intent Ontology (SDIO) — Technical Guide

> **Namespace IRI:** `http://intentflow.feg.org/ontology#`  
> **Source Code:** [`ontologyData.js`](./ontologyData.js)  
> **Interactive View:** [`OntologyView.vue`](../views/OntologyView.vue)  
> **For the full root documentation, see:** [`/ONTOLOGY_README.md`](../../../../ONTOLOGY_README.md)

---

## 📌 Quick Summary

The `src/ontology` module contains the formal Semantic Web knowledge graph powering the **IntentFlow AI Engine** for **FEG Innovation Hackathon 2026 (Challenge 1)**.

It provides:
1. **OWL 2 DL Concept Graph**: 18 classes across 5 layers (User Stereotypes, Cognitive Intents, Sports Entities, Actions, and Safety Boundary Conditions).
2. **Telemetry Mapping**: 24 clickstream events lifted from `top_sport_users_event_logs.csv` into formal semantic entities.
3. **Reasoning Graph Edges**: 23 directed relations modeling affinities, taxonomic hierarchies, intent triggers, and churn fatigue.
4. **W3C Turtle Serialization**: Raw Turtle string for RDF/OWL compliance.
5. **Simulated Journey Trace**: Step-by-step trace simulation for live visual graph traversals.

---

## 📂 Module Exports (`ontologyData.js`)

| Export | Type | Description |
|---|---|---|
| `ONTOLOGY_METRICS` | `Object` | High-level metrics: count of classes (18), properties (14), axioms (32), mapped events (24), version (2.4.0) |
| `ONTOLOGY_CATEGORIES`| `Object` | The 5 taxonomic layers (`INTENT`, `ENTITY`, `ACTION`, `SAFETY`, `USER`) with color palettes and glow shaders |
| `ONTOLOGY_NODES` | `Array<Node>` | Array of nodes with IRIs, definitions, description logic axioms, mapped events, and dataset frequencies |
| `ONTOLOGY_EDGES` | `Array<Edge>` | Array of directed edges defining semantic links (subClassOf, triggers, evaluates, locks, safety) |
| `SIMULATED_JOURNEY_TRACE` | `Array<string>`| Sequence of node IDs representing a completed user goal journey |
| `RDF_TURTLE_SAMPLE` | `string` | W3C RDF Turtle serialization of the SDIO core ontology |

---

## 🚀 Interactive UI Integration

This data is rendered reactively in [`OntologyView.vue`](../views/OntologyView.vue) using **D3.js Force Simulation**:
* Accessible at route: `/ontology`
* Features layer filtering, node drag/pinning, live journey trace simulation, node inspector drawer, and OWL/Turtle code viewer modal.

---

## 📸 Screenshots

### Interactive Knowledge Graph (`/ontology`)
![Sports Domain & Intent Ontology D3.js Force Simulation](../../screenshots/ontology1.png)

### Node Inspector Drawer & Axioms
![Ontology Node Inspector Drawer with DL Axioms](../../screenshots/ontology2.png)
