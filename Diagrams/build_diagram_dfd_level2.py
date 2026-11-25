"""
Build Component C: DFD Level 2 Diagram (Process 2.0 Feasibility & Multi-Factor Scoring) for VROMON.
"""

import html
from diagram_base import DrawioDiagram, save_diagram_file
from build_diagram_logical import header_banner, legend_box, FONT_FAMILY
from build_diagram_dfd_level1 import make_proc_html, make_store_html

def formula_callout(d, title, content_html, x, y, width=320, height=180, bg="#F0FDF4", border="#16A34A"):
    val = (
        f"<div style='text-align:left;font-family:{FONT_FAMILY};padding:6px;'>"
        f"<div style='font-size:12px;font-weight:bold;color:#14532D;border-bottom:1px solid #BBF7D0;padding-bottom:3px;margin-bottom:5px;'>{html.escape(title)}</div>"
        f"<div style='font-size:10px;line-height:1.45;color:#0F172A;'>{content_html}</div>"
        f"</div>"
    )
    style = f"shape=rectangle;rounded=1;arcSize=4;fillColor={bg};strokeColor={border};strokeWidth=1.5;html=1;whiteSpace=wrap;shadow=1;"
    d.add_vertex(f"callout_{abs(hash(title))%100000}", val, x, y, width, height, style)

def build_dfd_level2():
    d = DrawioDiagram("DFD Level 2 - Process 2.0 (Component C)", "page_dfd_level2", width=1920, height=1350)
    
    header_banner(d,
                  "Component C: Data Flow Diagram — Level 2 DFD (Process 2.0 Decomposition)",
                  "Detailed internal architecture of Process 2.0: Feasibility Calculation & Multi-Factor Recommendation Engine.")
    
    legend_box(d, [
        "<b>Subprocesses (2.1 - 2.6):</b> Atomic calculation &amp; scoring steps",
        "<b>Data Stores (D1 - D4):</b> Persistent database sources accessed by engine",
        "<b>Formula Callouts:</b> Exact mathematical models for cost, time, and scoring",
        "<b>Interface Boundaries:</b> Strictly balanced with inputs/outputs of Level 1 Process 2.0"
    ], x=1500, y=30, width=370, height=115, title="DFD Level 2 Architecture")
    
    proc_style = "shape=ellipse;perimeter=ellipsePerimeter;whiteSpace=wrap;html=1;fontFamily=Segoe UI;strokeWidth=2;fillColor=#ECFDF5;strokeColor=#059669;shadow=1;"
    store_style = "shape=partialRectangle;top=0;bottom=0;fillColor=#FFFBEB;strokeColor=#D97706;strokeWidth=2;align=center;verticalAlign=middle;whiteSpace=wrap;html=1;fontFamily=Segoe UI;shadow=1;"
    flow_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#1E293B;strokeWidth=1.5;endArrow=block;endFill=1;fontFamily=Segoe UI;fontSize=9.5;fontColor=#0F172A;"
    
    # -------------------------------------------------------------
    # External Interface Boundaries (from Level 1 D4)
    # -------------------------------------------------------------
    d.add_vertex("ds_d4_in", make_store_html("D4", "Trip Queries (Input Constraints)"), 40, 220, 260, 50, store_style)
    d.add_vertex("ds_d4_out", make_store_html("D4", "Recommendation Cache (Scored Results)"), 1580, 800, 280, 50, store_style)
    
    # System Data Stores
    d.add_vertex("ds_d1", make_store_html("D1", "Destinations & Attractions"), 830, 40, 270, 50, store_style)
    d.add_vertex("ds_d2", make_store_html("D2", "Transport Routes & Tariffs"), 420, 40, 250, 50, store_style)
    d.add_vertex("ds_d3", make_store_html("D3", "Monthly Climate & Crowd Matrix"), 1260, 40, 280, 50, store_style)
    
    # -------------------------------------------------------------
    # Subprocesses (2.1 to 2.6)
    # -------------------------------------------------------------
    # 2.1 Calculate Transport Options & Transit Time
    p21_html = make_proc_html("2.1", "Calculate Transport & Travel Time",
                              "Select cheapest transit mode (bus/train/launch) & compute roundtrip fare + transit hours")
    d.add_vertex("proc_21", p21_html, 400, 180, 260, 120, proc_style)
    
    # 2.2 Calculate Available Destination Time & Duration Feasibility
    p22_html = make_proc_html("2.2", "Calculate Time Feasibility",
                              "usable_hours = (days * 12) - travel_hours. Filter if < min_hours_needed & score time fit")
    d.add_vertex("proc_22", p22_html, 770, 180, 260, 120, proc_style)
    
    # 2.3 Calculate Trip Budget Breakdown & Feasibility Status
    p23_html = make_proc_html("2.3", "Calculate Budget & Feasibility",
                              "Total = Transport + Stay + Food + Local + 10%. Classify: Fits / Tight / Over / Discard (>25%)")
    d.add_vertex("proc_23", p23_html, 1150, 180, 270, 120, proc_style)
    
    # 2.4 Evaluate Seasonal Climate & Crowd Index
    p24_html = make_proc_html("2.4", "Evaluate Climate & Crowd Index",
                              "Normalize 1-5 weather rating & crowd density (adjust +1 step for holiday/weekend)")
    d.add_vertex("proc_24", p24_html, 400, 500, 260, 120, proc_style)
    
    # 2.5 Compute Semantic Vector Similarity (AI 2)
    p25_html = make_proc_html("2.5", "Compute Vector & Tag Match (AI 2)",
                              "Cosine similarity on 1536-d vectors (meaning match) + Jaccard tag overlap (interest match)")
    d.add_vertex("proc_25", p25_html, 770, 500, 260, 120, proc_style)
    
    # 2.6 Multi-Factor Weighted Scoring & Alternative Detection
    p26_html = make_proc_html("2.6", "Multi-Factor Scoring & Alternatives",
                              "Apply weights (Meaning 30%, Interest 15%, Budget 20%, Time 10%, Weather 15%, Crowd 10%) & cluster search")
    d.add_vertex("proc_26", p26_html, 1150, 480, 280, 150, proc_style)
    
    # -------------------------------------------------------------
    # Data Flows inside Process 2.0
    # -------------------------------------------------------------
    # D4 -> 2.1 (Query parameters: origin city, travelers count)
    d.add_edge("df_d4_p21", "Origin city & traveler count", "ds_d4_in", "proc_21", flow_style)
    
    # D2 -> 2.1 (Transport routes & fares)
    d.add_edge("df_d2_p21", "Route fares & transit hours", "ds_d2", "proc_21", flow_style)
    
    # 2.1 -> 2.2 (Transit hours)
    d.add_edge("df_p21_p22", "Roundtrip travel hours", "proc_21", "proc_22", flow_style)
    
    # D4 -> 2.2 (Trip duration days)
    d.add_edge("df_d4_p22", "Trip duration (days)", "ds_d4_in", "proc_22", flow_style,
               waypoints=[(170, 220), (170, 140), (740, 140), (740, 210)])
    
    # D1 -> 2.2 (Min hours needed)
    d.add_edge("df_d1_p22", "min_hours_needed per place", "ds_d1", "proc_22", flow_style,
               waypoints=[(900, 90), (900, 180)])
    
    # 2.1 -> 2.3 (Roundtrip transport cost)
    d.add_edge("df_p21_p23", "Roundtrip transport cost", "proc_21", "proc_23", flow_style,
               waypoints=[(530, 300), (530, 340), (1120, 340), (1120, 220)])
    
    # D4 -> 2.3 (Budget cap, travelers, days)
    d.add_edge("df_d4_p23", "Budget cap, travelers, duration", "ds_d4_in", "proc_23", flow_style,
               waypoints=[(170, 220), (170, 120), (1120, 120), (1120, 180)])
    
    # D1 -> 2.3 (Hotel tariff, food rate, POI entry fees)
    d.add_edge("df_d1_p23", "Hotel tariffs, food rates & entry fees", "ds_d1", "proc_23", flow_style,
               waypoints=[(1030, 90), (1030, 140), (1285, 140), (1285, 180)])
    
    # 2.2 -> 2.6 (Time fit score & available hours)
    d.add_edge("df_p22_p26", "Time fit score (10%) & usable hours", "proc_22", "proc_26", flow_style,
               waypoints=[(900, 300), (900, 420), (1130, 420), (1130, 520)])
    
    # 2.3 -> 2.6 (Budget fit score & cost breakdown)
    d.add_edge("df_p23_p26", "Budget score (20%), feasibility status & breakdown", "proc_23", "proc_26", flow_style)
    
    # D4 -> 2.4 (Travel month, holiday flag)
    d.add_edge("df_d4_p24", "Travel month & weekend/holiday flag", "ds_d4_in", "proc_24", flow_style,
               waypoints=[(170, 270), (170, 560), (400, 560)])
    
    # D3 -> 2.4 (Monthly weather rating & crowd level)
    d.add_edge("df_d3_p24", "Monthly climate scores & crowd density matrix", "ds_d3", "proc_24", flow_style,
               waypoints=[(1400, 90), (1400, 400), (370, 400), (370, 520), (400, 520)])
    
    # 2.4 -> 2.6 (Weather fit score & crowd fit score)
    d.add_edge("df_p24_p26", "Weather score (15%) & crowd score (10%)", "proc_24", "proc_26", flow_style,
               waypoints=[(530, 620), (1130, 620), (1130, 580)])
    
    # D4 -> 2.5 (Query vector & extracted tags)
    d.add_edge("df_d4_p25", "Query 1536-d vector & extracted tags", "ds_d4_in", "proc_25", flow_style,
               waypoints=[(210, 270), (210, 530), (770, 530)])
    
    # D1 -> 2.5 (Destination vectors & tags)
    d.add_edge("df_d1_p25", "Destination 1536-d vectors & tags", "ds_d1", "proc_25", flow_style,
               waypoints=[(965, 90), (965, 380), (850, 380), (850, 500)])
    
    # 2.5 -> 2.6 (Meaning match score & interest match score)
    d.add_edge("df_p25_p26", "Meaning score (30%) & Interest score (15%)", "proc_25", "proc_26", flow_style)
    
    # 2.6 -> D4_out (Ranked candidates with score breakdowns & alternatives)
    d.add_edge("df_p26_d4", "Ranked recommendations with 6 subscores & alternatives", "proc_26", "ds_d4_out",
               f"{flow_style}strokeColor=#059669;strokeWidth=2;",
               waypoints=[(1290, 630), (1290, 825), (1580, 825)])
    
    # -------------------------------------------------------------
    # Mathematical Models & Business Rules Callouts
    # -------------------------------------------------------------
    # Callout 1: Budget Feasibility Formulas
    budget_formula_html = (
        "<b>Accommodation:</b> ceil(travelers / 2) &times; (days &minus; 1) &times; hotel_rate<br/>"
        "<b>Food:</b> travelers &times; days &times; daily_food_rate<br/>"
        "<b>Transport:</b> cheapest_fare &times; 2 &times; travelers<br/>"
        "<b>Subtotal:</b> Transport + Stay + Food + Local POI Fees<br/>"
        "<b>Total Cost:</b> Subtotal + 10% Extra Buffer<br/>"
        "<hr style='border:none;border-top:1px solid #BBF7D0;margin:3px 0;'/>"
        "<b>Tiers:</b><br/>"
        "&#8226; <b>Fits:</b> Total &le; Budget (Score = 100)<br/>"
        "&#8226; <b>Tight:</b> Budget &lt; Total &le; 1.10&times;Budget (Score = 70-99)<br/>"
        "&#8226; <b>Over:</b> 1.10&times;Budget &lt; Total &le; 1.25&times;Budget (Score = 0-69)<br/>"
        "&#8226; <b>Discard:</b> Total &gt; 1.25&times;Budget (Excluded)"
    )
    formula_callout(d, "Budget Feasibility Mathematical Model", budget_formula_html, 400, 720, 340, 220)
    
    # Callout 2: Time & Usable Hours Formula
    time_formula_html = (
        "<b>Daily Usable Hours:</b> 12 hours/day<br/>"
        "<b>Gross Available Hours:</b> days &times; 12<br/>"
        "<b>Hours at Destination:</b> Gross &minus; Roundtrip_Travel_Hours<br/>"
        "<hr style='border:none;border-top:1px solid #BBF7D0;margin:3px 0;'/>"
        "<b>Time Rule:</b><br/>"
        "If Available_Hours &lt; min_hours_needed &rarr; <b>Filter Out</b><br/>"
        "Else Time_Fit_Score = min(100, (Available / min_needed) &times; 100)"
    )
    formula_callout(d, "Available Time & Duration Model", time_formula_html, 770, 720, 340, 160)
    
    # Callout 3: 6-Factor Multi-Factor Weights Table
    weights_html = (
        "<table style='width:100%;font-size:9.5px;border-collapse:collapse;color:#0F172A;'>"
        "<tr style='background-color:#DCFCE7;font-weight:bold;'><td>Factor</td><td style='text-align:right;'>Weight</td></tr>"
        "<tr><td>Meaning Match (AI 2 Vector Cosine)</td><td style='text-align:right;font-weight:bold;'>30%</td></tr>"
        "<tr><td>Interest Match (AI 1 Tag Overlap)</td><td style='text-align:right;font-weight:bold;'>15%</td></tr>"
        "<tr><td>Budget Fit (Total vs. Budget Cap)</td><td style='text-align:right;font-weight:bold;'>20%</td></tr>"
        "<tr><td>Time Fit (Available vs. Min Needed)</td><td style='text-align:right;font-weight:bold;'>10%</td></tr>"
        "<tr><td>Weather Fit (Monthly Rating 1-5)</td><td style='text-align:right;font-weight:bold;'>15%</td></tr>"
        "<tr><td>Crowd Fit (Low 100, Med 60, High 20)</td><td style='text-align:right;font-weight:bold;'>10%</td></tr>"
        "<tr style='border-top:1px solid #16A34A;font-weight:bold;'><td>Total Composite Score</td><td style='text-align:right;'>100%</td></tr>"
        "</table>"
        "<div style='margin-top:4px;font-size:9px;color:#166534;'><i>Alternatives triggered if top 3 results are Over Budget or High Crowd.</i></div>"
    )
    formula_callout(d, "Multi-Factor Recommendation Weights", weights_html, 1140, 720, 380, 200)
    
    return d

print("DFD Level 2 builder created.")
