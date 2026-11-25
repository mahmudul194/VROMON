"""
Build Component C: DFD Context Diagram (Level 0) for VROMON.
"""

import html
from diagram_base import DrawioDiagram, save_diagram_file
from build_diagram_logical import header_banner, legend_box, FONT_FAMILY

def build_dfd_context():
    d = DrawioDiagram("DFD Context Diagram (Level 0)", "page_dfd_context", width=1800, height=1200)
    
    header_banner(d,
                  "Component C: Data Flow Diagram — Context Diagram (Level 0)",
                  "System boundary overview: entire software treated as single central process interacting with external entities.")
    
    legend_box(d, [
        "<b>External Entity:</b> Blue/Purple rectangles representing human actors or external APIs",
        "<b>System Process:</b> Emerald rounded container (0.0 VROMON System)",
        "<b>Data Flows:</b> Directed solid arrows with detailed descriptive labels",
        "<b>Rule:</b> No data stores are exposed at the Context Level (pure system boundary)"
    ], x=1420, y=30, width=330, height=115, title="DFD Context Notation")
    
    entity_style = "shape=rectangle;rounded=1;arcSize=6;whiteSpace=wrap;html=1;fontFamily=Segoe UI;fontSize=12;fontStyle=1;align=center;verticalAlign=middle;strokeWidth=2;shadow=1;"
    process_style = "shape=ellipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;fontFamily=Segoe UI;strokeWidth=2.5;fillColor=#ECFDF5;strokeColor=#059669;shadow=1;"
    flow_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#1E293B;strokeWidth=1.5;endArrow=block;endFill=1;fontFamily=Segoe UI;fontSize=10;fontColor=#0F172A;"
    
    # Central Process 0.0
    proc_html = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};padding:10px;'>"
        f"<div style='font-size:16px;font-weight:bold;color:#047857;'>0.0</div>"
        f"<div style='font-size:14px;font-weight:bold;color:#0F172A;margin-top:4px;'>VROMON</div>"
        f"<div style='font-size:11px;color:#334155;margin-top:2px;'>Bangladesh Smart Trip Feasibility &amp;<br/>Risk-Aware Travel Recommender System</div>"
        f"</div>"
    )
    d.add_vertex("proc_0", proc_html, 680, 420, 380, 220, process_style)
    
    # External Entity 1: Traveler / End User
    user_html = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};padding:8px;'>"
        f"<div style='font-size:18px;'>&#129491;&#8205;&#9794;&#65039;</div>"
        f"<div style='font-size:13px;font-weight:bold;color:#1E3A8A;'>Traveler / End User</div>"
        f"<div style='font-size:10px;color:#475569;'>Tourists, students, budget explorers</div>"
        f"</div>"
    )
    d.add_vertex("ent_user", user_html, 80, 220, 230, 110,
                 f"{entity_style}fillColor=#EFF6FF;strokeColor=#2563EB;")
    
    # External Entity 2: System Administrator
    admin_html = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};padding:8px;'>"
        f"<div style='font-size:18px;'>&#128187;</div>"
        f"<div style='font-size:13px;font-weight:bold;color:#0F172A;'>System Administrator</div>"
        f"<div style='font-size:10px;color:#475569;'>Data maintainer &amp; curator</div>"
        f"</div>"
    )
    d.add_vertex("ent_admin", admin_html, 80, 720, 230, 110,
                 f"{entity_style}fillColor=#F8FAFC;strokeColor=#475569;")
    
    # External Entity 3: External AI / LLM Provider (Gemini / Claude API)
    ai_html = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};padding:8px;'>"
        f"<div style='font-size:18px;'>&#129302;</div>"
        f"<div style='font-size:13px;font-weight:bold;color:#6B21A8;'>External AI / LLM API</div>"
        f"<div style='font-size:10px;color:#581C87;'>Gemini / OpenAI Embedding &amp; Generation</div>"
        f"</div>"
    )
    d.add_vertex("ent_ai", ai_html, 1420, 220, 260, 110,
                 f"{entity_style}fillColor=#FAF5FF;strokeColor=#9333EA;")
    
    # External Entity 4: Map & Geocoding Service (OpenStreetMap / Leaflet)
    map_html = (
        f"<div style='text-align:center;font-family:{FONT_FAMILY};padding:8px;'>"
        f"<div style='font-size:18px;'>&#128506;&#65039;</div>"
        f"<div style='font-size:13px;font-weight:bold;color:#92400E;'>Map &amp; Tile Service</div>"
        f"<div style='font-size:10px;color:#78350F;'>OpenStreetMap / Leaflet Tile CDN</div>"
        f"</div>"
    )
    d.add_vertex("ent_map", map_html, 1420, 720, 260, 110,
                 f"{entity_style}fillColor=#FFFBEB;strokeColor=#D97706;")
    
    # Data Flows: User -> System
    d.add_edge("df_user_in_1",
               "1. Travel Wishes &amp; Constraints (Text, budget, party size, month, city)",
               "ent_user", "proc_0",
               f"{flow_style}",
               waypoints=[(310, 250), (520, 250), (520, 480)])
    
    d.add_edge("df_user_in_2",
               "2. Destination Comparison Selection &amp; What-If Budget Slider Values",
               "ent_user", "proc_0",
               f"{flow_style}",
               waypoints=[(310, 290), (480, 290), (480, 520)])
    
    d.add_edge("df_user_in_3",
               "3. Plan Export &amp; Share Request (PDF / 30-day link)",
               "ent_user", "proc_0",
               f"{flow_style}",
               waypoints=[(310, 320), (440, 320), (440, 560)])
    
    # Data Flows: System -> User
    d.add_edge("df_user_out_1",
               "1. Ranked Destination Recommendations &amp; Feasibility Status (Fits/Tight/Over)",
               "proc_0", "ent_user",
               f"{flow_style}strokeColor=#2563EB;",
               waypoints=[(690, 450), (400, 450), (400, 230), (310, 230)])
    
    d.add_edge("df_user_out_2",
               "2. Score Breakdown, Explainable Reasons &amp; Seasonal Risk Notes",
               "proc_0", "ent_user",
               f"{flow_style}strokeColor=#2563EB;",
               waypoints=[(720, 430), (360, 430), (360, 270), (310, 270)])
    
    d.add_edge("df_user_out_3",
               "3. Side-by-Side Comparison Matrix, Detailed Cost Chart &amp; Alternatives",
               "proc_0", "ent_user",
               f"{flow_style}strokeColor=#2563EB;",
               waypoints=[(760, 420), (330, 420), (330, 305), (310, 305)])
    
    d.add_edge("df_user_out_4",
               "4. Customized Day-by-Day Itinerary, Downloadable PDF &amp; Share URL",
               "proc_0", "ent_user",
               f"{flow_style}strokeColor=#2563EB;",
               waypoints=[(700, 600), (440, 600), (440, 340), (310, 340)])
    
    # Data Flows: Admin -> System
    d.add_edge("df_adm_in_1",
               "1. Ingestion Dataset JSON (Destinations, transit routes, climate &amp; crowd matrix)",
               "ent_admin", "proc_0",
               f"{flow_style}",
               waypoints=[(310, 750), (520, 750), (520, 580)])
    
    d.add_edge("df_adm_in_2",
               "2. Destination Attribute Edits, Route Updates &amp; Validation Triggers",
               "ent_admin", "proc_0",
               f"{flow_style}",
               waypoints=[(310, 785), (470, 785), (470, 620)])
    
    # Data Flows: System -> Admin
    d.add_edge("df_adm_out_1",
               "1. Schema Validation Report, Coordinate Bounds Check &amp; Diff Preview",
               "proc_0", "ent_admin",
               f"{flow_style}strokeColor=#475569;",
               waypoints=[(780, 630), (420, 630), (420, 800), (310, 800)])
    
    d.add_edge("df_adm_out_2",
               "2. Vector Index Sync Confirmation &amp; Ingestion Audit Logs",
               "proc_0", "ent_admin",
               f"{flow_style}strokeColor=#475569;",
               waypoints=[(730, 640), (380, 640), (380, 825), (310, 825)])
    
    # Data Flows: System -> External AI
    d.add_edge("df_ai_out_1",
               "1. Unstructured User Travel Wishes &amp; Intent Extraction Prompts",
               "proc_0", "ent_ai",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(1030, 460), (1220, 460), (1220, 240), (1420, 240)])
    
    d.add_edge("df_ai_out_2",
               "2. Verified Destination Metrics &amp; Stored POIs for RAG Context",
               "proc_0", "ent_ai",
               f"{flow_style}strokeColor=#9333EA;",
               waypoints=[(1040, 490), (1260, 490), (1260, 280), (1420, 280)])
    
    # Data Flows: External AI -> System
    d.add_edge("df_ai_in_1",
               "1. Extracted Travel Tags, Mood Classification &amp; 1536-d Intent Vector",
               "ent_ai", "proc_0",
               f"{flow_style}",
               waypoints=[(1420, 260), (1240, 260), (1240, 440), (1010, 440)])
    
    d.add_edge("df_ai_in_2",
               "2. Natural Language Feasibility Explanations, Trade-offs &amp; Itinerary Text",
               "ent_ai", "proc_0",
               f"{flow_style}",
               waypoints=[(1420, 310), (1290, 310), (1290, 520), (1050, 520)])
    
    # Data Flows: System -> Map Service
    d.add_edge("df_map_out",
               "1. Destination Coordinates (WGS84 Lat/Lng) &amp; Display Zoom Levels",
               "proc_0", "ent_map",
               f"{flow_style}strokeColor=#D97706;",
               waypoints=[(1040, 560), (1240, 560), (1240, 750), (1420, 750)])
    
    # Data Flows: Map Service -> System
    d.add_edge("df_map_in",
               "1. Interactive Map Tiles, Regional Cluster Overlays &amp; Road Geometries",
               "ent_map", "proc_0",
               f"{flow_style}",
               waypoints=[(1420, 780), (1210, 780), (1210, 600), (1010, 600)])
    
    return d

print("DFD Context Diagram builder created.")
