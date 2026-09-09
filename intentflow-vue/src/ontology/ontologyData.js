/**
 * IntentFlow FEG — Sports Domain & Intent Ontology (SDIO)
 * Pure client-side Semantic Web & Knowledge Graph definition.
 * 
 * Formal IRI: http://intentflow.feg.org/ontology#
 */

export const ONTOLOGY_METRICS = {
  classesCount: 18,
  propertiesCount: 14,
  axiomsCount: 32,
  mappedEventsCount: 24,
  version: '2.4.0',
  standard: 'OWL 2 DL / W3C RDF Schema'
}

export const ONTOLOGY_CATEGORIES = {
  INTENT: { id: 'intent', label: 'Intent States', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
  ENTITY: { id: 'entity', label: 'Domain Entities', color: '#00d4ff', glow: 'rgba(0, 212, 255, 0.45)' },
  ACTION: { id: 'action', label: 'User Actions / Events', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)' },
  SAFETY: { id: 'safety', label: 'Safety & Risk Controls', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)' },
  USER: { id: 'user', label: 'User Stereotypes', color: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' }
}

export const ONTOLOGY_NODES = [
  // User Stereotypes
  {
    id: 'User_Regular',
    label: 'Regular Explorer',
    category: 'user',
    size: 26,
    iri: 'http://intentflow.feg.org/ontology#RegularUser',
    parentClass: 'AgentProfile',
    definition: 'A return user with high historical interaction density, displaying 82% affinity towards football markets.',
    axioms: ['SubClassOf(RegularUser, ConsumerProfile)', 'exhibitsPattern some FocusedNavigation'],
    mappedEvents: ['SESSION_START_REGULAR', 'LOGIN_PERSIST'],
    stats: { occurrence: '64%', confidence: '94%' }
  },
  {
    id: 'User_New',
    label: 'New Explorer',
    category: 'user',
    size: 24,
    iri: 'http://intentflow.feg.org/ontology#NewUser',
    parentClass: 'AgentProfile',
    definition: 'An exploratory visitor without prior history who navigates broadly across categories and requires direct guidance.',
    axioms: ['SubClassOf(NewUser, ConsumerProfile)', 'requiresGuidance value true'],
    mappedEvents: ['SESSION_START_ANON', 'FIRST_PAGE_VIEW'],
    stats: { occurrence: '36%', confidence: '89%' }
  },

  // Intent States (Cognitive & Behavioral Teleology)
  {
    id: 'Intent_Exploration',
    label: 'Exploration Intent',
    category: 'intent',
    size: 32,
    iri: 'http://intentflow.feg.org/ontology#ExplorationIntent',
    parentClass: 'CognitiveIntentState',
    definition: 'Broad serendipitous discovery of matches, fixtures, and leagues with low commitment.',
    axioms: ['SubClassOf(ExplorationIntent, IntentPhase)', 'precedes ComparisonIntent'],
    mappedEvents: ['PAGE_VIEW: /sports', 'CATEGORY_SELECT', 'SCROLL_FEED'],
    stats: { sessions: '8,420', avgDwell: '42s' }
  },
  {
    id: 'Intent_Comparison',
    label: 'Comparison Intent',
    category: 'intent',
    size: 30,
    iri: 'http://intentflow.feg.org/ontology#ComparisonIntent',
    parentClass: 'CognitiveIntentState',
    definition: 'Deliberate side-by-side evaluation of odds, form indices, and match markets to reduce decision uncertainty.',
    axioms: ['SubClassOf(ComparisonIntent, DecisionPhase)', 'evaluates multiple MarketOdds'],
    mappedEvents: ['COMPARE_CLICK', 'ODDS_HOVER', 'STATS_EXPAND'],
    stats: { sessions: '5,190', avgDwell: '1m 15s' }
  },
  {
    id: 'Intent_Evaluation',
    label: 'Evaluation Intent',
    category: 'intent',
    size: 28,
    iri: 'http://intentflow.feg.org/ontology#EvaluationIntent',
    parentClass: 'CognitiveIntentState',
    definition: 'Deep drilldown into a single event, inspecting head-to-head records and market viability.',
    axioms: ['SubClassOf(EvaluationIntent, DecisionPhase)', 'focusesOn exactly 1 MatchEvent'],
    mappedEvents: ['PAGE_VIEW: /event/:id', 'TAB_H2H_CLICK', 'ODDS_SELECT'],
    stats: { sessions: '4,830', avgDwell: '2m 04s' }
  },
  {
    id: 'Intent_Conversion',
    label: 'Conversion Intent',
    category: 'intent',
    size: 30,
    iri: 'http://intentflow.feg.org/ontology#ConversionIntent',
    parentClass: 'CognitiveIntentState',
    definition: 'Final commitment action transitioning from consideration to transaction fulfillment.',
    axioms: ['SubClassOf(ConversionIntent, TerminalIntentPhase)', 'triggers TransactionEvent'],
    mappedEvents: ['SLIP_ADD', 'CONFIRM_CLICK', 'STAKE_SUBMIT'],
    stats: { sessions: '3,210', avgDwell: '38s' }
  },

  // Safety & Risk
  {
    id: 'Safety_Risk',
    label: 'High-Velocity Churn Risk',
    category: 'safety',
    size: 28,
    iri: 'http://intentflow.feg.org/ontology#SafetyRiskState',
    parentClass: 'SafetyBoundaryCondition',
    definition: 'A critical behavioral divergence state flagged when high volatility or loop navigation is observed.',
    axioms: ['triggers InterventionProtocol', 'restricts HighLeverageActions'],
    mappedEvents: ['RAPID_BACK_NAV', 'REPEAT_LOSS_ODDS_CHASE', 'SAFETY_OVERRIDE'],
    stats: { interventions: '342', mitigated: '91%' }
  },

  // Domain Entities
  {
    id: 'Entity_Sport',
    label: 'Sport Universe',
    category: 'entity',
    size: 34,
    iri: 'http://intentflow.feg.org/ontology#SportDomain',
    parentClass: 'TopLevelDomainEntity',
    definition: 'The root taxonomic concept encompassing all competitive athletic events and structured games.',
    axioms: ['hasSubClass Football, Basketball, Tennis, Esports'],
    mappedEvents: ['PAGE_VIEW: /sports'],
    stats: { totalMarkets: '1,240+' }
  },
  {
    id: 'Entity_Football',
    label: 'Football (Soccer)',
    category: 'entity',
    size: 28,
    iri: 'http://intentflow.feg.org/ontology#FootballEntity',
    parentClass: 'SportDomain',
    definition: 'Dominant sport class comprising 82% of all clickstream trajectories in the FEG dataset.',
    axioms: ['SubClassOf(FootballEntity, SportDomain)', 'hasLeague PremierLeague, LaLiga, ChampionsLeague'],
    mappedEvents: ['PAGE_VIEW: /sports/football', 'FOOTBALL_FILTER_CLICK'],
    stats: { share: '82.4%', activeMatches: '54' }
  },
  {
    id: 'Entity_Basketball',
    label: 'Basketball',
    category: 'entity',
    size: 22,
    iri: 'http://intentflow.feg.org/ontology#BasketballEntity',
    parentClass: 'SportDomain',
    definition: 'Fast-paced sport category characterized by rapid odds volatility and quarter-by-quarter intent shifts.',
    axioms: ['SubClassOf(BasketballEntity, SportDomain)', 'hasLeague NBA, EuroLeague'],
    mappedEvents: ['PAGE_VIEW: /sports/basketball'],
    stats: { share: '11.2%', activeMatches: '18' }
  },
  {
    id: 'Entity_Tennis',
    label: 'Tennis',
    category: 'entity',
    size: 20,
    iri: 'http://intentflow.feg.org/ontology#TennisEntity',
    parentClass: 'SportDomain',
    definition: 'Individual athlete sport class with dynamic in-play point-by-point live odds changes.',
    axioms: ['SubClassOf(TennisEntity, SportDomain)', 'hasTour ATP, WTA'],
    mappedEvents: ['PAGE_VIEW: /sports/tennis'],
    stats: { share: '6.4%', activeMatches: '12' }
  },
  {
    id: 'Entity_Match',
    label: 'Match / Fixture',
    category: 'entity',
    size: 26,
    iri: 'http://intentflow.feg.org/ontology#MatchFixture',
    parentClass: 'EventInstance',
    definition: 'A temporal contest between competing athletic parties with real-time status and telemetry.',
    axioms: ['hasProperty hasStartTime, hasHomeTeam, hasAwayTeam, offersMarket'],
    mappedEvents: ['FIXTURE_CARD_RENDER', 'MATCH_CLICK'],
    stats: { activeLive: '36' }
  },
  {
    id: 'Entity_MarketOdds',
    label: 'Market & Odds',
    category: 'entity',
    size: 26,
    iri: 'http://intentflow.feg.org/ontology#MarketOdds',
    parentClass: 'PricingProposition',
    definition: 'Numerical probability proposition quantified in decimal or fractional multipliers.',
    axioms: ['quantifies OutcomeProbability', 'subjectTo RealTimeFluctuation'],
    mappedEvents: ['ODDS_TICK_UPDATE', 'ODDS_BADGE_CLICK'],
    stats: { totalTickers: '3,800' }
  },

  // User Actions / Clickstream Events
  {
    id: 'Action_Search',
    label: 'Query Search',
    category: 'action',
    size: 20,
    iri: 'http://intentflow.feg.org/ontology#SearchAction',
    parentClass: 'SensoryInputEvent',
    definition: 'User enters targeted team or fixture text into the discovery query bar.',
    axioms: ['SubClassOf(SearchAction, UserInteraction)', 'signals DirectedExploration'],
    mappedEvents: ['INPUT_SEARCH', 'SEARCH_SUGGEST_CLICK'],
    stats: { frequency: '18.2%' }
  },
  {
    id: 'Action_OddsClick',
    label: 'Inspect Odds',
    category: 'action',
    size: 22,
    iri: 'http://intentflow.feg.org/ontology#OddsClickAction',
    parentClass: 'TelemetrySelectionEvent',
    definition: 'Clicking a decimal multiplier to inspect wager terms or add to selection candidate buffer.',
    axioms: ['SubClassOf(OddsClickAction, SelectionEvent)', 'activates Intent_Comparison'],
    mappedEvents: ['ODDS_CLICK_HOME', 'ODDS_CLICK_AWAY', 'ODDS_CLICK_DRAW'],
    stats: { frequency: '45.7%' }
  },
  {
    id: 'Action_Compare',
    label: 'Side-by-Side Compare',
    category: 'action',
    size: 24,
    iri: 'http://intentflow.feg.org/ontology#CompareTriggerAction',
    parentClass: 'AnalyticalEvent',
    definition: 'Explicit request to pin 2 events simultaneously for head-to-head metric comparison.',
    axioms: ['initiates Intent_Comparison', 'requires 2 MatchFixture'],
    mappedEvents: ['ADD_TO_COMPARE', 'COMPARE_TABS_SWAP'],
    stats: { frequency: '12.8%' }
  },
  {
    id: 'Action_SlipAdd',
    label: 'Slip Commitment',
    category: 'action',
    size: 22,
    iri: 'http://intentflow.feg.org/ontology#SlipAddAction',
    parentClass: 'CommitmentEvent',
    definition: 'Transferring an evaluated selection into the active wager confirmation container.',
    axioms: ['signals Intent_Conversion', 'affects WalletCommitment'],
    mappedEvents: ['SLIP_ADD_SUCCESS', 'SLIP_STAKE_INPUT'],
    stats: { frequency: '8.4%' }
  },
  {
    id: 'Action_BackNav',
    label: 'Back Track / Loop',
    category: 'action',
    size: 20,
    iri: 'http://intentflow.feg.org/ontology#LoopBackAction',
    parentClass: 'NavigationalDisruptionEvent',
    definition: 'Repetitive browser back or navigational reversion signaling hesitation or friction.',
    axioms: ['correlatesWith FrictionLevel', 'mayTrigger Safety_Risk'],
    mappedEvents: ['BACK_NAVIGATION', 'BREADCRUMB_POP'],
    stats: { frequency: '14.1%' }
  }
]

export const ONTOLOGY_EDGES = [
  // User to Intent
  { source: 'User_Regular', target: 'Entity_Football', label: 'strongAffinity (82%)', type: 'affinity' },
  { source: 'User_Regular', target: 'Intent_Comparison', label: 'habitualBehavior', type: 'exhibits' },
  { source: 'User_New', target: 'Intent_Exploration', label: 'initialState', type: 'initiates' },
  { source: 'User_New', target: 'Action_Search', label: 'frequencyOfUse', type: 'performs' },

  // Domain Hierarchy
  { source: 'Entity_Sport', target: 'Entity_Football', label: 'subClassOf', type: 'hierarchy' },
  { source: 'Entity_Sport', target: 'Entity_Basketball', label: 'subClassOf', type: 'hierarchy' },
  { source: 'Entity_Sport', target: 'Entity_Tennis', label: 'subClassOf', type: 'hierarchy' },
  { source: 'Entity_Football', target: 'Entity_Match', label: 'schedules', type: 'domain' },
  { source: 'Entity_Match', target: 'Entity_MarketOdds', label: 'offersMarket', type: 'domain' },

  // Action to Domain
  { source: 'Action_Search', target: 'Entity_Sport', label: 'queriesAgainst', type: 'targets' },
  { source: 'Action_OddsClick', target: 'Entity_MarketOdds', label: 'targetsEntity', type: 'targets' },
  { source: 'Action_Compare', target: 'Entity_Match', label: 'evaluatesPairs', type: 'targets' },
  { source: 'Action_SlipAdd', target: 'Entity_MarketOdds', label: 'locksProposition', type: 'targets' },

  // Action to Intent Transitions
  { source: 'Action_Search', target: 'Intent_Exploration', label: 'triggersIntent', type: 'infers' },
  { source: 'Intent_Exploration', target: 'Action_OddsClick', label: 'generatesAction', type: 'leadsTo' },
  { source: 'Action_OddsClick', target: 'Intent_Comparison', label: 'liftsToIntent', type: 'infers' },
  { source: 'Intent_Comparison', target: 'Action_Compare', label: 'manifestsAs', type: 'leadsTo' },
  { source: 'Action_Compare', target: 'Intent_Evaluation', label: 'transitionsTo', type: 'infers' },
  { source: 'Intent_Evaluation', target: 'Action_SlipAdd', label: 'concludesIn', type: 'leadsTo' },
  { source: 'Action_SlipAdd', target: 'Intent_Conversion', label: 'fulfillsIntent', type: 'infers' },

  // Friction and Safety
  { source: 'Intent_Comparison', target: 'Action_BackNav', label: 'decisionFatigue', type: 'friction' },
  { source: 'Action_BackNav', target: 'Safety_Risk', label: 'rapidTrigger (>3x)', type: 'safety' },
  { source: 'Safety_Risk', target: 'Intent_Exploration', label: 'coolingIntervention', type: 'regulation' }
]

export const SIMULATED_JOURNEY_TRACE = [
  'User_Regular',
  'Entity_Football',
  'Intent_Exploration',
  'Action_OddsClick',
  'Entity_MarketOdds',
  'Intent_Comparison',
  'Action_Compare',
  'Intent_Evaluation',
  'Action_SlipAdd',
  'Intent_Conversion'
]

export const RDF_TURTLE_SAMPLE = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix feg: <http://intentflow.feg.org/ontology#> .

# Ontology Declaration
feg:SportsDomainIntentOntology a owl:Ontology ;
    rdfs:label "FEG Sports Domain & Intent Ontology (SDIO)" ;
    owl:versionInfo "2.4.0" ;
    rdfs:comment "Semantic bridge lifting clickstream telemetry into cognitive intent states." .

# Classes
feg:CognitiveIntentState a owl:Class .
feg:ExplorationIntent rdfs:subClassOf feg:CognitiveIntentState .
feg:ComparisonIntent  rdfs:subClassOf feg:CognitiveIntentState .
feg:ConversionIntent  rdfs:subClassOf feg:CognitiveIntentState .

feg:SportDomain a owl:Class .
feg:FootballEntity rdfs:subClassOf feg:SportDomain .
feg:MatchFixture a owl:Class .
feg:MarketOdds a owl:Class .

# Object Properties
feg:indicatesIntent a owl:ObjectProperty ;
    rdfs:domain feg:UserAction ;
    rdfs:range  feg:CognitiveIntentState .

feg:evaluatesMarket a owl:ObjectProperty ;
    rdfs:domain feg:ComparisonIntent ;
    rdfs:range  feg:MarketOdds .

feg:triggersSafetyRisk a owl:ObjectProperty ;
    rdfs:domain feg:LoopBackAction ;
    rdfs:range  feg:SafetyRiskState .
`
