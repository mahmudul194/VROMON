"""
Build Component C: DFD Level 1 Diagram for VROMON.
Refined to strictly follow SE331 rules:
  - Action-based process names (Verb + Noun)
  - Numbered process labels (1.0 to 5.0)
  - Standard DFD notations (Gane & Sarson / DeMarco)
  - Every process has meaningful input and output
  - Information moves between processes via data stores (D1 - D6)
  - No external entity connected directly to a data store
  - High-readability white halo labels on all data-flow arrows
"""

import html
from diagram_base import DrawioDiagram, save_diagram_file
from build_diagram_logical import header_banner, legend_box, FONT_FAMILY

def make_proc_card(num, action_name, description, width=270, height=130):
    val = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};height:100%;box-sizing:border-box;'>"
        f"<div style='background-color:#059669;color:#FFFFFF;font-weight:bold;font-size:13px;padding:5px 8px;border-top-left-radius:8px;border-top-right-radius:8px;letter-spacing:0.5px;'>"
        f"Process {html.escape(num)}"
        f"</div>"
        f"<div style='padding:8px 10px;background-color:#ECFDF5;border-bottom-left-radius:8px;border-bottom-right-radius:8px;'>"
        f"<div style='font-size:12px;font-weight:bold;color:#064E3B;margin-bottom:4px;'>{html.escape(action_name)}</div>"
        f"<div style='font-size:10px;line-height:1.35;color:#047857;'>{html.escape(description)}</div>"
        f"</div>"
        f"</div>"
    )
    return val

def make_store_card(did, name):
    val = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};padding:4px 6px;'>"
        f"<span style='background-color:#D97706;color:#FFFFFF;font-weight:bold;font-size:11px;padding:2px 6px;border-radius:4px;'>{html.escape(did)}</span> "
        f"<span style='font-size:11px;color:#78350F;font-weight:bold;margin-left:4px;'>{html.escape(name)}</span>"
        f"</div>"
    )
    return val

def make_entity_card(icon, name, role):
    val = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};padding:8px;'>"
        f"<div style='font-size:20px;margin-bottom:2px;'>{icon}</div>"
        f"<div style='font-size:12px;font-weight:bold;color:#0F172A;'>{html.escape(name)}</div>"
        f"<div style='font-size:9.5px;color:#475569;margin-top:2px;'>{html.escape(role)}</div>"
        f"</div>"
    )
    return val

def build_dfd_level1():
    d = DrawioDiagram("DFD Level 1 (Component C)", "page_dfd_level1", width=1980, height=1350)
    
    header_banner(d,
                  "Component C: Data Flow Diagram — Level 1 DFD (System Decomposition)",
                  "Decomposition of VROMON into 5 core action-based processes, 6 persistent data stores, and verified external interfaces.")
    
    legend_box(d, [
        "<b>Processes (1.0 - 5.0):</b> Action-based processes (Gane &amp; Sarson notation)",
        "<b>Data Stores (D1 - D6):</b> Persistent relational/vector repositories",
        "<b>External Entities:</b> User, Admin, External AI API, Map Tile CDN",
        "<b>Data Flows:</b> Directed solid arrows with white halo label backgrounds",
        "<b>Integrity Rule:</b> Entities NEVER connect directly to data stores"
    ], x=1540, y=30, width=390, height=115, title="DFD Level 1 Standards")
    
    # Process styling (Two-tier Gane & Sarson container)
    proc_style = "shape=rectangle;rounded=1;arcSize=8;whiteSpace=wrap;html=1;overflow=fill;fillColor=#ECFDF5;strokeColor=#059669;strokeWidth=2;shadow=1;points=[[0,0.2],[0,0.35],[0,0.5],[0,0.65],[0,0.8],[1,0.2],[1,0.35],[1,0.5],[1,0.65],[1,0.8],[0.5,0],[0.5,1]];"
    
    # Data Store styling (Standard open-ended rectangle: parallel horizontal bars)
    store_style = "shape=partialRectangle;top=0;bottom=0;left=1;right=0;fillColor=#FEF3C7;strokeColor=#D97706;strokeWidth=2.5;align=center;verticalAlign=middle;whiteSpace=wrap;html=1;fontFamily=Segoe UI;shadow=1;points=[[0,0.5],[1,0.5],[0.5,0],[0.5,1]];"
    
    # External Entity styling
    entity_style = "shape=rectangle;rounded=1;arcSize=6;whiteSpace=wrap;html=1;fontFamily=Segoe UI;strokeWidth=2;shadow=1;points=[[0,0.25],[0,0.5],[0,0.75],[1,0.25],[1,0.5],[1,0.75],[0.5,0],[0.5,1]];"
    
    # High-legibility Data Flow styling (with white label background)
    flow_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#1E293B;strokeWidth=1.5;endArrow=block;endFill=1;fontFamily=Segoe UI;fontSize=9.5;fontColor=#0F172A;labelBackgroundColor=#FFFFFF;labelBorderColor=#CBD5E1;spacing=3;"
    
    # -------------------------------------------------------------
    # 1. External Entities
    # -------------------------------------------------------------
    # Traveler / User
    d.add_vertex("ent_user",
                 make_entity_card("&#129491;&#8205;&#9794;&#65039;", "Traveler / End User", "Tourist, student, trip planner"),
                 40, 220, 180, 95,
                 f"{entity_style}fillColor=#EFF6FF;strokeColor=#2563EB;")
    
    # System Administrator
    d.add_vertex("ent_admin",
                 make_entity_card("&#128187;", "System Administrator", "Tourism data maintainer"),
                 40, 810, 180, 95,
                 f"{entity_style}fillColor=#F8FAFC;strokeColor=#475569;")
    
    # External AI / LLM API
    d.add_vertex("ent_ai",
                 make_entity_card("&#129302;", "External AI API", "Gemini 1.5 / Embedding Models"),
                 1740, 220, 190, 95,
                 f"{entity_style}fillColor=#FAF5FF;strokeColor=#9333EA;")
    
    # Map Tile Service
    d.add_vertex("ent_map",
                 make_entity_card("&#128506;&#65039;", "Map Tile Service", "OpenStreetMap / Leaflet CDN"),
                 1740, 520, 190, 95,
                 f"{entity_style}fillColor=#FFFBEB;strokeColor=#D97706;")
    
    # -------------------------------------------------------------
    # 2. Data Stores (D1 to D6)
    # -------------------------------------------------------------
    d.add_vertex("ds_d4", make_store_card("D4", "Trip Queries &amp; Recs Cache"), 370, 45, 270, 50, store_style)
    d.add_vertex("ds_d2", make_store_card("D2", "Transport Routes &amp; Tariffs"), 830, 45, 270, 50, store_style)
    d.add_vertex("ds_d3", make_store_card("D3", "Monthly Climate &amp; Crowd Matrix"), 1260, 45, 290, 50, store_style)
    d.add_vertex("ds_d5", make_store_card("D5", "Saved Shared Plans &amp; Itineraries"), 370, 620, 280, 50, store_style)
    d.add_vertex("ds_d1", make_store_card("D1", "Destinations &amp; Attractions Catalog"), 1260, 410, 290, 50, store_style)
    d.add_vertex("ds_d6", make_store_card("D6", "Admin &amp; Data Ingestion Logs"), 830, 835, 270, 50, store_style)
    
    # -------------------------------------------------------------
    # 3. Processes (1.0 to 5.0) - Action-Based Names
    # -------------------------------------------------------------
    # 1.0 Capture & Parse Travel Intent
    p1_val = make_proc_card("1.0", "Capture &amp; Parse Travel Intent",
                            "Receive user text wishes, invoke AI 1 for tag/mood extraction &amp; build query vector")
    d.add_vertex("proc_1", p1_val, 370, 210, 270, 125, proc_style)
    
    # 2.0 Evaluate Feasibility & Multi-Factor Scores
    p2_val = make_proc_card("2.0", "Evaluate Feasibility &amp; Score Destinations",
                            "Execute deterministic cost, time, weather &amp; crowd calculators; compute vector match &amp; rank")
    d.add_vertex("proc_2", p2_val, 820, 195, 290, 145, proc_style)
    
    # 3.0 Synthesize AI Explanations & Generate Itinerary
    p3_val = make_proc_card("3.0", "Synthesize Explanations &amp; Itinerary",
                            "Generate RAG reasoning on verified facts; build day-by-day plan using attractions")
    d.add_vertex("proc_3", p3_val, 1260, 205, 280, 135, proc_style)
    
    # 4.0 Manage Comparisons, Budget Slider & Sharing
    p4_val = make_proc_card("4.0", "Manage Comparisons, Slider &amp; Sharing",
                            "Handle side-by-side comparison, instant slider updates, PDF export &amp; 30-day share links")
    d.add_vertex("proc_4", p4_val, 370, 415, 280, 135, proc_style)
    
    # 5.0 Ingest Dataset & Maintain Catalog
    p5_val = make_proc_card("5.0", "Ingest Dataset &amp; Maintain Catalog",
                            "Validate JSON schema, coordinate boundaries &amp; tariffs; compute vector embeddings &amp; log audit")
    d.add_vertex("proc_5", p5_val, 370, 795, 280, 125, proc_style)
    
    # -------------------------------------------------------------
    # 4. Data Flows (Every arrow clearly labeled, no entity connects to store)
    # -------------------------------------------------------------
    
    # [Flow 1] Traveler -> 1.0
    d.add_edge("df_u_p1",
               "Travel wishes, budget cap, travelers, duration, month &amp; starting city",
               "ent_user", "proc_1",
               flow_style)
    
    # [Flow 2 & 3] 1.0 <-> AI API
    d.add_edge("df_p1_ai_req",
               "Unstructured wish text prompt",
               "proc_1", "ent_ai",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(505, 170), (1600, 170), (1600, 240), (1740, 240)])
    
    d.add_edge("df_p1_ai_res",
               "Extracted semantic tags, mood &amp; 1536-d query vector",
               "ent_ai", "proc_1",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(1740, 270), (1630, 270), (1630, 140), (530, 140), (530, 210)])
    
    # [Flow 4] 1.0 -> D4 (Write parsed query session)
    d.add_edge("df_p1_d4",
               "Store parsed search session &amp; vector",
               "proc_1", "ds_d4",
               flow_style)
    
    # [Flow 5] D4 -> 2.0 (Read query parameters)
    d.add_edge("df_d4_p2",
               "Query parameters &amp; budget constraint",
               "ds_d4", "proc_2",
               flow_style,
               waypoints=[(505, 95), (505, 125), (880, 125), (880, 195)])
    
    # [Flow 6] D1 -> 2.0 (Read destination catalog)
    d.add_edge("df_d1_p2",
               "Candidate destinations, tariffs &amp; min hours",
               "ds_d1", "proc_2",
               flow_style,
               waypoints=[(1260, 430), (1140, 430), (1140, 300), (1110, 300)])
    
    # [Flow 7] D2 -> 2.0 (Read transit fares and hours)
    d.add_edge("df_d2_p2",
               "Inter-district transit fares &amp; travel hours",
               "ds_d2", "proc_2",
               flow_style)
    
    # [Flow 8] D3 -> 2.0 (Read monthly climate & crowd)
    d.add_edge("df_d3_p2",
               "Monthly climate rating &amp; crowd level matrix",
               "ds_d3", "proc_2",
               flow_style,
               waypoints=[(1260, 70), (1030, 70), (1030, 195)])
    
    # [Flow 9] 2.0 -> D4 (Write scored & ranked candidates)
    d.add_edge("df_p2_d4",
               "Ranked recommendations with 6 subscores &amp; alternatives",
               "proc_2", "ds_d4",
               f"{flow_style}strokeColor=#059669;",
               waypoints=[(910, 195), (910, 145), (640, 145), (640, 95)])
    
    # [Flow 10] D4 -> 3.0 (Read top candidates for RAG)
    d.add_edge("df_d4_p3",
               "Top scored candidates &amp; verified metrics",
               "ds_d4", "proc_3",
               flow_style,
               waypoints=[(640, 65), (1180, 65), (1180, 230), (1260, 230)])
    
    # [Flow 11] D1 -> 3.0 (Read attractions for itinerary)
    d.add_edge("df_d1_p3",
               "Attractions, landmarks &amp; operating hours",
               "ds_d1", "proc_3",
               flow_style,
               waypoints=[(1400, 410), (1400, 340)])
    
    # [Flow 12 & 13] 3.0 <-> AI API
    d.add_edge("df_p3_ai_req",
               "RAG prompt (stored facts &amp; calculated numbers)",
               "proc_3", "ent_ai",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(1540, 240), (1740, 240)])
    
    d.add_edge("df_p3_ai_res",
               "Natural language reasons &amp; daily itinerary text",
               "ent_ai", "proc_3",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(1740, 275), (1600, 275), (1600, 295), (1540, 295)])
    
    # [Flow 14] 3.0 -> Traveler (Return recommendation & itinerary)
    d.add_edge("df_p3_user",
               "Ranked places, feasibility status, score breakdown &amp; daily plan",
               "proc_3", "ent_user",
               f"{flow_style}strokeColor=#2563EB;strokeWidth=2;",
               waypoints=[(1260, 310), (1160, 310), (1160, 370), (240, 370), (240, 280), (220, 280)])
    
    # [Flow 15] 3.0 -> D5 (Persist initial itinerary plan)
    d.add_edge("df_p3_d5",
               "Initial generated itinerary plan &amp; cost breakdown",
               "proc_3", "ds_d5",
               flow_style,
               waypoints=[(1330, 340), (1330, 645), (650, 645)])
    
    # [Flow 16] Traveler -> 4.0 (Comparison & slider requests)
    d.add_edge("df_user_p4",
               "Comparison selection, budget slider adjustments &amp; share trigger",
               "ent_user", "proc_4",
               flow_style,
               waypoints=[(130, 315), (130, 450), (370, 450)])
    
    # [Flow 17] 4.0 -> Traveler (Return comparison matrix & share URL)
    d.add_edge("df_p4_user",
               "Side-by-side comparison matrix, recalculated costs &amp; share URL/PDF",
               "proc_4", "ent_user",
               f"{flow_style}strokeColor=#2563EB;",
               waypoints=[(370, 480), (110, 480), (110, 315)])
    
    # [Flow 18] D4 -> 4.0 (Read cached scores for comparison & slider)
    d.add_edge("df_d4_p4",
               "Cached scores &amp; metrics for slider recalculation",
               "ds_d4", "proc_4",
               flow_style,
               waypoints=[(370, 75), (320, 75), (320, 435), (370, 435)])
    
    # [Flow 19] 4.0 -> D5 (Save public share link)
    d.add_edge("df_p4_d5",
               "Persist public share token (30-day TTL)",
               "proc_4", "ds_d5",
               flow_style)
    
    # [Flow 20] D5 -> 4.0 (Fetch shared plan)
    d.add_edge("df_d5_p4",
               "Retrieve saved itinerary for public view",
               "ds_d5", "proc_4",
               flow_style,
               waypoints=[(530, 620), (530, 550)])
    
    # [Flow 21 & 22] 4.0 <-> Map Service
    d.add_edge("df_p4_map_req",
               "Destination WGS84 coordinates &amp; zoom levels",
               "proc_4", "ent_map",
               f"{flow_style}strokeColor=#D97706;",
               waypoints=[(650, 500), (1500, 500), (1500, 545), (1740, 545)])
    
    d.add_edge("df_p4_map_res",
               "Interactive map tiles, route lines &amp; overlays",
               "ent_map", "proc_4",
               f"{flow_style}strokeColor=#D97706;",
               waypoints=[(1740, 575), (1480, 575), (1480, 525), (650, 525)])
    
    # [Flow 23] Admin -> 5.0 (Upload dataset)
    d.add_edge("df_adm_p5",
               "JSON dataset upload, manual edits &amp; schema triggers",
               "ent_admin", "proc_5",
               flow_style)
    
    # [Flow 24] 5.0 -> Admin (Validation feedback)
    d.add_edge("df_p5_adm",
               "Validation summary, error report &amp; diff preview",
               "proc_5", "ent_admin",
               f"{flow_style}strokeColor=#475569;",
               waypoints=[(370, 880), (220, 880)])
    
    # [Flow 25 & 26] 5.0 <-> AI API (Embedding generation)
    d.add_edge("df_p5_ai_req",
               "Destination text descriptions for embedding",
               "proc_5", "ent_ai",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(650, 830), (1660, 830), (1660, 290), (1740, 290)])
    
    d.add_edge("df_p5_ai_res",
               "1536-d dense text embeddings",
               "ent_ai", "proc_5",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(1835, 315), (1835, 870), (650, 870)])
    
    # [Flow 27] 5.0 -> D1 (Upsert destinations & POIs)
    d.add_edge("df_p5_d1",
               "Upsert verified destinations &amp; POIs",
               "proc_5", "ds_d1",
               flow_style,
               waypoints=[(650, 810), (1200, 810), (1200, 440), (1260, 440)])
    
    # [Flow 28] 5.0 -> D2 (Upsert transport routes)
    d.add_edge("df_p5_d2",
               "Upsert transit routes &amp; tariffs",
               "proc_5", "ds_d2",
               flow_style,
               waypoints=[(650, 785), (800, 785), (800, 75), (830, 75)])
    
    # [Flow 29] 5.0 -> D3 (Upsert monthly matrix)
    d.add_edge("df_p5_d3",
               "Upsert monthly climate &amp; crowd records",
               "proc_5", "ds_d3",
               flow_style,
               waypoints=[(650, 765), (1220, 765), (1220, 75), (1260, 75)])
    
    # [Flow 30] 5.0 -> D6 (Write audit logs)
    d.add_edge("df_p5_d6",
               "Record ingestion audit logs &amp; latency metrics",
               "proc_5", "ds_d6",
               flow_style)
    
    return d

# Aliases for compatibility
make_proc_html = make_proc_card
make_store_html = make_store_card

print("Refined DFD Level 1 builder created.")
