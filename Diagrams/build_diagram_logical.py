"""
Generate all SE331 Continuous Assessment 2 diagrams for VROMON.
"""

import html
from diagram_base import DrawioDiagram, save_diagram_file, save_master_file

# Common styling definitions
FONT_FAMILY = "Segoe UI, Helvetica, Arial, sans-serif"

def header_banner(d, title, subtitle, width=1700, x=50, y=30):
    val = (
        f"<div style='text-align:left;font-family:{FONT_FAMILY};color:#0F172A;'>"
        f"<div style='font-size:20px;font-weight:bold;color:#1E3A8A;'>{html.escape(title)}</div>"
        f"<div style='font-size:12px;color:#475569;margin-top:4px;'>{html.escape(subtitle)}</div>"
        f"<div style='font-size:11px;color:#64748B;margin-top:2px;'>"
        f"<b>Project:</b> VROMON — Bangladesh Smart Trip Feasibility &amp; Risk-Aware Travel Recommender | "
        f"<b>Course:</b> SE331 Software Engineering Design Capstone Project | "
        f"<b>Semester:</b> Fall 2026 | <b>Institution:</b> Daffodil International University"
        f"</div></div>"
    )
    style = "shape=rectangle;rounded=1;arcSize=4;fillColor=#F8FAFC;strokeColor=#CBD5E1;strokeWidth=1.5;html=1;whiteSpace=wrap;"
    d.add_vertex("header_banner", val, x, y, width, 75, style)

def legend_box(d, items, x, y, width=320, height=130, title="Diagram Legend"):
    item_rows = "".join([f"<div style='margin-bottom:3px;'>{it}</div>" for it in items])
    val = (
        f"<div style='text-align:left;font-family:{FONT_FAMILY};font-size:11px;color:#0F172A;padding:4px;'>"
        f"<div style='font-weight:bold;font-size:12px;color:#1E3A8A;border-bottom:1px solid #CBD5E1;padding-bottom:3px;margin-bottom:5px;'>{title}</div>"
        f"{item_rows}"
        f"</div>"
    )
    style = "shape=rectangle;rounded=1;arcSize=4;fillColor=#FFFFFF;strokeColor=#94A3B8;strokeWidth=1.5;html=1;whiteSpace=wrap;shadow=1;"
    d.add_vertex("legend_box", val, x, y, width, height, style)

# ==============================================================================
# 1. COMPONENT A: LOGICAL ENTITY-RELATIONSHIP DIAGRAM (ERD)
# ==============================================================================

def make_entity_card(name, pk_list, fk_list, attr_list, header_color="#1E3A8A"):
    rows = [
        f"<div style='background-color:{header_color};color:#FFFFFF;padding:7px;font-family:{FONT_FAMILY};font-weight:bold;font-size:12px;text-align:center;letter-spacing:0.5px;'>{html.escape(name)}</div>",
        f"<div style='padding:6px 10px;font-family:{FONT_FAMILY};font-size:11px;line-height:1.45;text-align:left;background-color:#FFFFFF;color:#0F172A;'>"
    ]
    if pk_list:
        for pk in pk_list:
            rows.append(f"<div style='font-weight:bold;color:#1E3A8A;'>&#128273; <u>{html.escape(pk)}</u> <span style='color:#64748B;font-weight:normal;'>[PK]</span></div>")
    if fk_list:
        for fk in fk_list:
            rows.append(f"<div style='color:#0369A1;'>&#128279; <i>{html.escape(fk)}</i> <span style='color:#64748B;font-size:10px;'>[FK]</span></div>")
    if attr_list:
        if pk_list or fk_list:
            rows.append("<hr style='border:none;border-top:1px solid #E2E8F0;margin:4px 0;'/>")
        for a in attr_list:
            rows.append(f"<div>&#8226; {html.escape(a)}</div>")
    rows.append("</div>")
    return "".join(rows)

def build_logical_erd():
    d = DrawioDiagram("Logical ERD (Component A)", "page_logical_erd", width=1800, height=1300)
    
    header_banner(d,
                  "Component A: Entity Relationship Diagram (Logical ERD)",
                  "High-level conceptual/logical data entities, key attributes, relationships, cardinalities, and business rules.")
    
    legend_box(d, [
        "<b>&#128273; PK:</b> Primary Key (Unique Identifier)",
        "<b>&#128279; FK:</b> Foreign Key (Referential link)",
        "<b>1 : N:</b> One-to-Many Relationship (Crow's foot)",
        "<b>1 : 1:</b> One-to-One Mandatory Relationship",
        "<b>M : N:</b> Many-to-Many Relationship"
    ], x=1420, y=30, width=330, height=115)
    
    card_style = "shape=rectangle;rounded=1;arcSize=4;whiteSpace=wrap;html=1;overflow=fill;fillColor=#FFFFFF;strokeColor=#1E3A8A;strokeWidth=1.5;shadow=1;points=[[0,0.15],[0,0.35],[0,0.5],[0,0.65],[0,0.85],[1,0.15],[1,0.35],[1,0.5],[1,0.65],[1,0.85],[0.5,0],[0.5,1]];"
    
    # 1. TRAVEL_QUERY
    tq_html = make_entity_card(
        "TRAVEL_QUERY",
        ["query_id"],
        [],
        [
            "session_token",
            "free_text_wishes",
            "budget_taka",
            "num_travelers",
            "num_days",
            "travel_month",
            "starting_city",
            "is_weekend_holiday",
            "extracted_tags",
            "extracted_mood",
            "query_vector_1536d",
            "created_at"
        ]
    )
    d.add_vertex("e_travel_query", tq_html, 50, 160, 240, 310, card_style)
    
    # 2. RECOMMENDATION_RESULT
    rr_html = make_entity_card(
        "RECOMMENDATION_RESULT",
        ["result_id"],
        ["query_id", "destination_id", "alt_to_dest_id (opt)"],
        [
            "final_score (0-100)",
            "meaning_match_score (30%)",
            "interest_match_score (15%)",
            "budget_fit_score (20%)",
            "time_fit_score (10%)",
            "weather_fit_score (15%)",
            "crowd_fit_score (10%)",
            "total_trip_cost_est",
            "travel_hours_roundtrip",
            "available_hours_at_dest",
            "feasibility_status (Fits/Tight/Over)",
            "rank_position",
            "is_alternative_flag"
        ]
    )
    d.add_vertex("e_rec_result", rr_html, 420, 160, 270, 350, card_style)
    
    # 3. AI_EXPLANATION
    ai_html = make_entity_card(
        "AI_EXPLANATION",
        ["explanation_id"],
        ["result_id"],
        [
            "match_summary_reason",
            "tradeoffs_and_watchouts",
            "generated_by_model",
            "is_fallback_template",
            "created_at"
        ]
    )
    d.add_vertex("e_ai_explanation", ai_html, 420, 580, 270, 180, card_style)
    
    # 4. DESTINATION
    dest_html = make_entity_card(
        "DESTINATION",
        ["destination_id"],
        [],
        [
            "name_en",
            "name_bn",
            "division",
            "district_upazila",
            "latitude (WGS84)",
            "longitude (WGS84)",
            "description",
            "min_hours_needed",
            "cost_tier (Budget/Mod/Prem)",
            "hotel_rate_per_night",
            "food_rate_per_day",
            "semantic_tags",
            "embedding_vector_1536d",
            "is_active"
        ]
    )
    d.add_vertex("e_destination", dest_html, 840, 160, 270, 340, card_style)
    
    # 5. ATTRACTION_POI
    att_html = make_entity_card(
        "ATTRACTION_POI",
        ["attraction_id"],
        ["destination_id"],
        [
            "attraction_name",
            "category",
            "description",
            "entry_fee_bdt",
            "opening_time",
            "closing_time",
            "requires_guide",
            "est_visit_hours"
        ]
    )
    d.add_vertex("e_attraction", att_html, 1260, 160, 250, 220, card_style)
    
    # 6. TRANSPORT_ROUTE
    tr_html = make_entity_card(
        "TRANSPORT_ROUTE",
        ["route_id"],
        ["destination_id"],
        [
            "origin_city",
            "transport_mode (Bus/Train/Launch)",
            "transit_operator_note",
            "fare_per_person_bdt",
            "travel_hours",
            "is_cheapest_option"
        ]
    )
    d.add_vertex("e_transport", tr_html, 1260, 420, 250, 200, card_style)
    
    # 7. MONTHLY_CLIMATE
    mc_html = make_entity_card(
        "MONTHLY_CLIMATE",
        ["climate_id"],
        ["destination_id"],
        [
            "month_num (1-12)",
            "monsoon_severity (1-5)",
            "weather_rating (1-5)",
            "comfort_score (0-100)",
            "weather_advisory_note"
        ]
    )
    d.add_vertex("e_climate", mc_html, 1260, 660, 250, 190, card_style)
    
    # 8. MONTHLY_CROWD
    mcr_html = make_entity_card(
        "MONTHLY_CROWD",
        ["crowd_id"],
        ["destination_id"],
        [
            "month_num (1-12)",
            "base_crowd_level (Low/Med/High)",
            "holiday_crowd_level",
            "crowd_factor_score (0-100)"
        ]
    )
    d.add_vertex("e_crowd", mcr_html, 1260, 890, 250, 180, card_style)
    
    # 9. ITINERARY_PLAN
    itin_html = make_entity_card(
        "ITINERARY_PLAN",
        ["itinerary_id"],
        ["query_id", "destination_id"],
        [
            "trip_title",
            "total_estimated_cost_bdt",
            "transport_cost_bdt",
            "accommodation_cost_bdt",
            "food_cost_bdt",
            "local_activities_cost_bdt",
            "buffer_cost_bdt (10%)",
            "share_token (Unique)",
            "share_url",
            "expires_at (30 days TTL)",
            "created_at"
        ]
    )
    d.add_vertex("e_itinerary", itin_html, 50, 560, 250, 300, card_style)
    
    # 10. ITINERARY_DAY_ACTIVITY
    act_html = make_entity_card(
        "ITINERARY_DAY_ACTIVITY",
        ["activity_id"],
        ["itinerary_id", "attraction_id (opt)"],
        [
            "day_number (1..N)",
            "time_slot (Morn/Aft/Eve)",
            "activity_title",
            "activity_description",
            "estimated_cost_bdt"
        ]
    )
    d.add_vertex("e_activity", act_html, 50, 930, 250, 190, card_style)
    
    # 11. ADMIN_USER
    adm_html = make_entity_card(
        "ADMIN_USER",
        ["admin_id"],
        [],
        [
            "email (Unique)",
            "password_hash",
            "full_name",
            "role (Data Maintainer)",
            "is_active",
            "last_login_at"
        ],
        header_color="#334155"
    )
    d.add_vertex("e_admin", adm_html, 430, 880, 250, 190, card_style)
    
    # 12. DATA_INGESTION_LOG
    log_html = make_entity_card(
        "DATA_INGESTION_LOG",
        ["log_id"],
        ["admin_id"],
        [
            "source_filename",
            "records_count",
            "valid_records_count",
            "invalid_records_count",
            "vector_index_count",
            "ingestion_status",
            "execution_latency_sec",
            "ingested_at"
        ],
        header_color="#334155"
    )
    d.add_vertex("e_ingestion_log", log_html, 790, 880, 260, 220, card_style)
    
    # Edges & Relationships (with Crow's foot notation & descriptive labels)
    edge_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#1E293B;strokeWidth=1.5;fontFamily=Segoe UI;fontSize=10;fontColor=#0F172A;"
    
    # TRAVEL_QUERY (1) -> (0..N) RECOMMENDATION_RESULT
    d.add_edge("rel_tq_rr", "evaluates to (1:N)", "e_travel_query", "e_rec_result",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # DESTINATION (1) -> (0..N) RECOMMENDATION_RESULT
    d.add_edge("rel_dest_rr", "evaluated for (1:N)", "e_destination", "e_rec_result",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # RECOMMENDATION_RESULT (1) -> (1:1) AI_EXPLANATION
    d.add_edge("rel_rr_ai", "explained by (1:1)", "e_rec_result", "e_ai_explanation",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmandOne;endFill=0;")
    
    # DESTINATION (1) -> (1..N) ATTRACTION_POI
    d.add_edge("rel_dest_att", "contains (1:N)", "e_destination", "e_attraction",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # DESTINATION (1) -> (1..N) TRANSPORT_ROUTE
    d.add_edge("rel_dest_tr", "accessible via (1:N)", "e_destination", "e_transport",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # DESTINATION (1) -> (12) MONTHLY_CLIMATE
    d.add_edge("rel_dest_clim", "climate pattern (1:12)", "e_destination", "e_climate",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # DESTINATION (1) -> (12) MONTHLY_CROWD
    d.add_edge("rel_dest_crw", "crowd profile (1:12)", "e_destination", "e_crowd",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # TRAVEL_QUERY (1) -> (0..N) ITINERARY_PLAN
    d.add_edge("rel_tq_itin", "compiles into (1:N)", "e_travel_query", "e_itinerary",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # DESTINATION (1) -> (0..N) ITINERARY_PLAN
    d.add_edge("rel_dest_itin", "target of (1:N)", "e_destination", "e_itinerary",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;",
               waypoints=[(975, 530), (330, 530), (330, 680)])
    
    # ITINERARY_PLAN (1) -> (1..N) ITINERARY_DAY_ACTIVITY
    d.add_edge("rel_itin_act", "composed of (1:N)", "e_itinerary", "e_activity",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # ATTRACTION_POI (0..1) -> (0..N) ITINERARY_DAY_ACTIVITY
    d.add_edge("rel_att_act", "scheduled at (0..1:N)", "e_attraction", "e_activity",
               f"{edge_style}strokeDasharray=3 3;startArrow=ERone;startFill=0;endArrow=ERmany;endFill=0;",
               waypoints=[(1385, 1150), (175, 1150)])
    
    # ADMIN_USER (1) -> (0..N) DATA_INGESTION_LOG
    d.add_edge("rel_adm_log", "triggers (1:N)", "e_admin", "e_ingestion_log",
               f"{edge_style}startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;")
    
    # DATA_INGESTION_LOG (0..N) -> (1..N) DESTINATION
    d.add_edge("rel_log_dest", "updates catalog (M:N)", "e_ingestion_log", "e_destination",
               f"{edge_style}startArrow=ERmany;startFill=0;endArrow=ERmany;endFill=0;")
    
    return d

print("Logical ERD builder created.")
