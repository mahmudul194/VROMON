"""
Build Component B: Relational Database Schema / Physical ERD for VROMON.
"""

import html
from diagram_base import DrawioDiagram, save_diagram_file
from build_diagram_logical import header_banner, legend_box, FONT_FAMILY

def make_table_card(table_name, columns, header_color="#0F172A"):
    rows = [
        f"<div style='background-color:{header_color};color:#FFFFFF;padding:6px;font-family:{FONT_FAMILY};font-weight:bold;font-size:12px;text-align:center;'>{html.escape(table_name)}</div>",
        f"<div style='padding:6px 8px;font-family:Consolas, monospace;font-size:10.5px;line-height:1.45;text-align:left;background-color:#FFFFFF;color:#0F172A;'>"
    ]
    for col in columns:
        c_name = col.get("name")
        c_type = col.get("type")
        c_key = col.get("key", "")
        c_extra = col.get("extra", "")
        
        prefix = "&#8226; "
        color_style = "color:#0F172A;"
        key_badge = ""
        
        if c_key == "PK":
            prefix = "&#128273; "
            color_style = "color:#B45309;font-weight:bold;"
            key_badge = "<span style='color:#B45309;font-weight:bold;'>[PK]</span> "
        elif c_key == "FK":
            prefix = "&#128279; "
            color_style = "color:#1D4ED8;font-weight:bold;"
            key_badge = f"<span style='color:#1D4ED8;'>[FK: {html.escape(col.get('ref', ''))}]</span> "
        elif c_key == "PK/FK":
            prefix = "&#128273;&#128279; "
            color_style = "color:#7C3AED;font-weight:bold;"
            key_badge = f"<span style='color:#7C3AED;'>[PK/FK: {html.escape(col.get('ref', ''))}]</span> "

        extra_str = f" <span style='color:#64748B;'>({html.escape(c_extra)})</span>" if c_extra else ""
        rows.append(
            f"<div style='{color_style}white-space:nowrap;'>"
            f"{prefix}<b>{html.escape(c_name)}</b>: <i>{html.escape(c_type)}</i> {key_badge}{extra_str}"
            f"</div>"
        )
    rows.append("</div>")
    return "".join(rows)

def build_physical_erd():
    d = DrawioDiagram("Physical ERD / Schema (Component B)", "page_physical_erd", width=1900, height=1350)
    
    header_banner(d,
                  "Component B: Relational Database Schema / Physical ERD",
                  "Physical relational tables, SQL data types, Primary/Foreign Keys, referential integrity constraints, and domain checks.")
    
    legend_box(d, [
        "<b>&#128273; [PK]:</b> Primary Key (NOT NULL, UNIQUE)",
        "<b>&#128279; [FK]:</b> Foreign Key with referenced table &amp; column",
        "<b>Constraints:</b> NOT NULL, CHECK, DEFAULT, UNIQUE",
        "<b>Connectors:</b> Solid Crow's Foot indicates 1:N Foreign Key relationship",
        "<b>Data Types:</b> BIGINT, INT, VARCHAR, DECIMAL, TEXT, JSON, VECTOR(1536)"
    ], x=1500, y=30, width=350, height=115, title="Schema &amp; Constraint Legend")
    
    card_style = "shape=rectangle;rounded=1;arcSize=4;whiteSpace=wrap;html=1;overflow=fill;fillColor=#FFFFFF;strokeColor=#334155;strokeWidth=1.5;shadow=1;points=[[0,0.15],[0,0.35],[0,0.5],[0,0.65],[0,0.85],[1,0.15],[1,0.35],[1,0.5],[1,0.65],[1,0.85],[0.5,0],[0.5,1]];"
    
    # 1. travel_queries
    tq_cols = [
        {"name": "query_id", "type": "BIGINT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "session_token", "type": "VARCHAR(64)", "extra": "NOT NULL, UNIQUE"},
        {"name": "free_text_wishes", "type": "TEXT", "extra": "NOT NULL"},
        {"name": "budget_taka", "type": "DECIMAL(10,2)", "extra": "NOT NULL, CHECK >= 1000"},
        {"name": "num_travelers", "type": "INT", "extra": "NOT NULL, CHECK >= 1"},
        {"name": "num_days", "type": "INT", "extra": "NOT NULL, CHECK 1..30"},
        {"name": "travel_month", "type": "INT", "extra": "NOT NULL, CHECK 1..12"},
        {"name": "starting_city", "type": "VARCHAR(50)", "extra": "NOT NULL"},
        {"name": "is_weekend_holiday", "type": "BOOLEAN", "extra": "NOT NULL, DEFAULT FALSE"},
        {"name": "extracted_tags", "type": "JSON", "extra": "NULL"},
        {"name": "extracted_mood", "type": "VARCHAR(100)", "extra": "NULL"},
        {"name": "query_vector", "type": "VECTOR(1536)", "extra": "NULL"},
        {"name": "created_at", "type": "TIMESTAMP", "extra": "NOT NULL, DEFAULT NOW()"}
    ]
    d.add_vertex("tbl_travel_queries", make_table_card("travel_queries", tq_cols), 40, 160, 270, 310, card_style)
    
    # 2. destinations
    dest_cols = [
        {"name": "destination_id", "type": "INT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "name_en", "type": "VARCHAR(100)", "extra": "NOT NULL, UNIQUE"},
        {"name": "name_bn", "type": "VARCHAR(100)", "extra": "NOT NULL"},
        {"name": "division", "type": "VARCHAR(50)", "extra": "NOT NULL"},
        {"name": "district_upazila", "type": "VARCHAR(100)", "extra": "NOT NULL"},
        {"name": "latitude", "type": "DECIMAL(9,6)", "extra": "NOT NULL, CHECK -90..90"},
        {"name": "longitude", "type": "DECIMAL(9,6)", "extra": "NOT NULL, CHECK -180..180"},
        {"name": "description", "type": "TEXT", "extra": "NOT NULL"},
        {"name": "min_hours_needed", "type": "INT", "extra": "NOT NULL, CHECK > 0"},
        {"name": "cost_tier", "type": "VARCHAR(20)", "extra": "NOT NULL, IN ('Budget','Mod','Prem')"},
        {"name": "hotel_rate_per_night", "type": "DECIMAL(10,2)", "extra": "NOT NULL, CHECK >= 0"},
        {"name": "food_rate_per_day", "type": "DECIMAL(10,2)", "extra": "NOT NULL, CHECK >= 0"},
        {"name": "semantic_tags", "type": "JSON", "extra": "NOT NULL"},
        {"name": "embedding_vector", "type": "VECTOR(1536)", "extra": "NOT NULL"},
        {"name": "is_active", "type": "BOOLEAN", "extra": "NOT NULL, DEFAULT TRUE"},
        {"name": "updated_at", "type": "TIMESTAMP", "extra": "NOT NULL, DEFAULT NOW()"}
    ]
    d.add_vertex("tbl_destinations", make_table_card("destinations", dest_cols), 850, 160, 320, 370, card_style)
    
    # 3. recommendation_results
    rr_cols = [
        {"name": "result_id", "type": "BIGINT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "query_id", "type": "BIGINT", "key": "FK", "ref": "travel_queries.query_id"},
        {"name": "destination_id", "type": "INT", "key": "FK", "ref": "destinations.destination_id"},
        {"name": "alt_to_dest_id", "type": "INT", "key": "FK", "ref": "destinations.destination_id (NULL)"},
        {"name": "final_score", "type": "DECIMAL(5,2)", "extra": "NOT NULL, CHECK 0..100"},
        {"name": "meaning_match_score", "type": "DECIMAL(5,2)", "extra": "NOT NULL (30%)"},
        {"name": "interest_match_score", "type": "DECIMAL(5,2)", "extra": "NOT NULL (15%)"},
        {"name": "budget_fit_score", "type": "DECIMAL(5,2)", "extra": "NOT NULL (20%)"},
        {"name": "time_fit_score", "type": "DECIMAL(5,2)", "extra": "NOT NULL (10%)"},
        {"name": "weather_fit_score", "type": "DECIMAL(5,2)", "extra": "NOT NULL (15%)"},
        {"name": "crowd_fit_score", "type": "DECIMAL(5,2)", "extra": "NOT NULL (10%)"},
        {"name": "total_trip_cost_est", "type": "DECIMAL(10,2)", "extra": "NOT NULL"},
        {"name": "travel_hours_roundtrip", "type": "DECIMAL(4,2)", "extra": "NOT NULL"},
        {"name": "available_hours_at_dest", "type": "DECIMAL(5,2)", "extra": "NOT NULL"},
        {"name": "feasibility_status", "type": "VARCHAR(20)", "extra": "NOT NULL, IN ('Fits','Tight','Over')"},
        {"name": "rank_position", "type": "INT", "extra": "NOT NULL"},
        {"name": "is_alternative_flag", "type": "BOOLEAN", "extra": "NOT NULL, DEFAULT FALSE"}
    ]
    d.add_vertex("tbl_recommendation_results", make_table_card("recommendation_results", rr_cols), 430, 160, 320, 390, card_style)
    
    # 4. ai_explanations
    ai_cols = [
        {"name": "explanation_id", "type": "BIGINT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "result_id", "type": "BIGINT", "key": "FK", "ref": "recommendation_results.result_id", "extra": "UNIQUE"},
        {"name": "match_summary_reason", "type": "TEXT", "extra": "NOT NULL"},
        {"name": "tradeoffs_and_watchouts", "type": "TEXT", "extra": "NULL"},
        {"name": "generated_by_model", "type": "VARCHAR(50)", "extra": "NOT NULL, DEFAULT 'Gemini'"},
        {"name": "is_fallback_template", "type": "BOOLEAN", "extra": "NOT NULL, DEFAULT FALSE"},
        {"name": "created_at", "type": "TIMESTAMP", "extra": "NOT NULL, DEFAULT NOW()"}
    ]
    d.add_vertex("tbl_ai_explanations", make_table_card("ai_explanations", ai_cols), 430, 600, 320, 180, card_style)
    
    # 5. attractions
    att_cols = [
        {"name": "attraction_id", "type": "INT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "destination_id", "type": "INT", "key": "FK", "ref": "destinations.destination_id"},
        {"name": "attraction_name", "type": "VARCHAR(150)", "extra": "NOT NULL"},
        {"name": "category", "type": "VARCHAR(50)", "extra": "NOT NULL"},
        {"name": "description", "type": "TEXT", "extra": "NULL"},
        {"name": "entry_fee_bdt", "type": "DECIMAL(8,2)", "extra": "NOT NULL, DEFAULT 0.00"},
        {"name": "opening_time", "type": "TIME", "extra": "NULL"},
        {"name": "closing_time", "type": "TIME", "extra": "NULL"},
        {"name": "requires_guide", "type": "BOOLEAN", "extra": "NOT NULL, DEFAULT FALSE"},
        {"name": "est_visit_hours", "type": "DECIMAL(4,2)", "extra": "NOT NULL, DEFAULT 2.0"}
    ]
    d.add_vertex("tbl_attractions", make_table_card("attractions", att_cols), 1270, 160, 280, 240, card_style)
    
    # 6. transport_routes
    tr_cols = [
        {"name": "route_id", "type": "INT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "destination_id", "type": "INT", "key": "FK", "ref": "destinations.destination_id"},
        {"name": "origin_city", "type": "VARCHAR(50)", "extra": "NOT NULL"},
        {"name": "transport_mode", "type": "VARCHAR(20)", "extra": "NOT NULL, IN ('Bus','Train','Launch')"},
        {"name": "transit_operator_note", "type": "VARCHAR(150)", "extra": "NULL"},
        {"name": "fare_per_person_bdt", "type": "DECIMAL(8,2)", "extra": "NOT NULL, CHECK > 0"},
        {"name": "travel_hours", "type": "DECIMAL(4,2)", "extra": "NOT NULL, CHECK > 0"},
        {"name": "is_cheapest_option", "type": "BOOLEAN", "extra": "NOT NULL, DEFAULT FALSE"}
    ]
    d.add_vertex("tbl_transport_routes", make_table_card("transport_routes", tr_cols), 1270, 440, 280, 210, card_style)
    
    # 7. monthly_climates
    clim_cols = [
        {"name": "climate_id", "type": "INT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "destination_id", "type": "INT", "key": "FK", "ref": "destinations.destination_id"},
        {"name": "month_num", "type": "INT", "extra": "NOT NULL, CHECK 1..12"},
        {"name": "monsoon_severity", "type": "INT", "extra": "NOT NULL, CHECK 1..5"},
        {"name": "weather_rating", "type": "INT", "extra": "NOT NULL, CHECK 1..5"},
        {"name": "comfort_score", "type": "INT", "extra": "NOT NULL, CHECK 0..100"},
        {"name": "weather_advisory_note", "type": "VARCHAR(255)", "extra": "NULL"}
    ]
    d.add_vertex("tbl_monthly_climates", make_table_card("monthly_climates", clim_cols), 1270, 690, 280, 190, card_style)
    
    # 8. monthly_crowds
    crw_cols = [
        {"name": "crowd_id", "type": "INT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "destination_id", "type": "INT", "key": "FK", "ref": "destinations.destination_id"},
        {"name": "month_num", "type": "INT", "extra": "NOT NULL, CHECK 1..12"},
        {"name": "base_crowd_level", "type": "VARCHAR(10)", "extra": "NOT NULL, IN ('Low','Med','High')"},
        {"name": "holiday_crowd_level", "type": "VARCHAR(10)", "extra": "NOT NULL, IN ('Low','Med','High')"},
        {"name": "crowd_factor_score", "type": "INT", "extra": "NOT NULL, CHECK 0..100"}
    ]
    d.add_vertex("tbl_monthly_crowds", make_table_card("monthly_crowds", crw_cols), 1270, 920, 280, 180, card_style)
    
    # 9. itinerary_plans
    itin_cols = [
        {"name": "itinerary_id", "type": "BIGINT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "query_id", "type": "BIGINT", "key": "FK", "ref": "travel_queries.query_id"},
        {"name": "destination_id", "type": "INT", "key": "FK", "ref": "destinations.destination_id"},
        {"name": "trip_title", "type": "VARCHAR(150)", "extra": "NOT NULL"},
        {"name": "total_estimated_cost_bdt", "type": "DECIMAL(10,2)", "extra": "NOT NULL"},
        {"name": "transport_cost_bdt", "type": "DECIMAL(10,2)", "extra": "NOT NULL"},
        {"name": "accommodation_cost_bdt", "type": "DECIMAL(10,2)", "extra": "NOT NULL"},
        {"name": "food_cost_bdt", "type": "DECIMAL(10,2)", "extra": "NOT NULL"},
        {"name": "local_activities_cost_bdt", "type": "DECIMAL(10,2)", "extra": "NOT NULL"},
        {"name": "buffer_cost_bdt", "type": "DECIMAL(10,2)", "extra": "NOT NULL (10%)"},
        {"name": "share_token", "type": "VARCHAR(32)", "extra": "NOT NULL, UNIQUE"},
        {"name": "share_url", "type": "VARCHAR(255)", "extra": "NOT NULL"},
        {"name": "expires_at", "type": "TIMESTAMP", "extra": "NOT NULL (30d TTL)"},
        {"name": "created_at", "type": "TIMESTAMP", "extra": "NOT NULL, DEFAULT NOW()"}
    ]
    d.add_vertex("tbl_itinerary_plans", make_table_card("itinerary_plans", itin_cols), 40, 520, 280, 330, card_style)
    
    # 10. itinerary_activities
    act_cols = [
        {"name": "activity_id", "type": "BIGINT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "itinerary_id", "type": "BIGINT", "key": "FK", "ref": "itinerary_plans.itinerary_id"},
        {"name": "day_number", "type": "INT", "extra": "NOT NULL, CHECK 1..30"},
        {"name": "time_slot", "type": "VARCHAR(20)", "extra": "NOT NULL, IN ('Morn','Aft','Eve')"},
        {"name": "activity_title", "type": "VARCHAR(150)", "extra": "NOT NULL"},
        {"name": "activity_description", "type": "TEXT", "extra": "NOT NULL"},
        {"name": "attraction_id", "type": "INT", "key": "FK", "ref": "attractions.attraction_id (NULL)"},
        {"name": "estimated_cost_bdt", "type": "DECIMAL(8,2)", "extra": "NOT NULL, DEFAULT 0.00"}
    ]
    d.add_vertex("tbl_itinerary_activities", make_table_card("itinerary_activities", act_cols), 40, 900, 280, 220, card_style)
    
    # 11. admin_users
    adm_cols = [
        {"name": "admin_id", "type": "INT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "email", "type": "VARCHAR(100)", "extra": "NOT NULL, UNIQUE"},
        {"name": "password_hash", "type": "VARCHAR(255)", "extra": "NOT NULL"},
        {"name": "full_name", "type": "VARCHAR(100)", "extra": "NOT NULL"},
        {"name": "role", "type": "VARCHAR(30)", "extra": "NOT NULL, DEFAULT 'Data Maintainer'"},
        {"name": "is_active", "type": "BOOLEAN", "extra": "NOT NULL, DEFAULT TRUE"},
        {"name": "last_login_at", "type": "TIMESTAMP", "extra": "NULL"},
        {"name": "created_at", "type": "TIMESTAMP", "extra": "NOT NULL, DEFAULT NOW()"}
    ]
    d.add_vertex("tbl_admin_users", make_table_card("admin_users", adm_cols, header_color="#334155"), 430, 840, 270, 200, card_style)
    
    # 12. data_ingestion_logs
    log_cols = [
        {"name": "log_id", "type": "BIGINT", "key": "PK", "extra": "AUTO_INCREMENT"},
        {"name": "admin_id", "type": "INT", "key": "FK", "ref": "admin_users.admin_id"},
        {"name": "source_filename", "type": "VARCHAR(150)", "extra": "NOT NULL"},
        {"name": "records_count", "type": "INT", "extra": "NOT NULL"},
        {"name": "valid_records_count", "type": "INT", "extra": "NOT NULL"},
        {"name": "invalid_records_count", "type": "INT", "extra": "NOT NULL"},
        {"name": "vector_index_count", "type": "INT", "extra": "NOT NULL"},
        {"name": "ingestion_status", "type": "VARCHAR(20)", "extra": "NOT NULL, IN ('Completed','Failed','Partial')"},
        {"name": "execution_latency_sec", "type": "DECIMAL(6,2)", "extra": "NOT NULL"},
        {"name": "ingested_at", "type": "TIMESTAMP", "extra": "NOT NULL, DEFAULT NOW()"}
    ]
    d.add_vertex("tbl_data_ingestion_logs", make_table_card("data_ingestion_logs", log_cols, header_color="#334155"), 780, 840, 310, 230, card_style)
    
    # FK Connectors
    fk_edge_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;fontFamily=Segoe UI;fontSize=9;fontColor=#1E3A8A;startArrow=ERmandOne;startFill=0;endArrow=ERmany;endFill=0;"
    
    # travel_queries -> recommendation_results (query_id)
    d.add_edge("fk_tq_rr", "FK: query_id", "tbl_travel_queries", "tbl_recommendation_results", fk_edge_style)
    
    # destinations -> recommendation_results (destination_id)
    d.add_edge("fk_dest_rr", "FK: destination_id", "tbl_destinations", "tbl_recommendation_results", fk_edge_style)
    
    # recommendation_results -> ai_explanations (result_id)
    d.add_edge("fk_rr_ai", "FK: result_id (1:1)", "tbl_recommendation_results", "tbl_ai_explanations",
               "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;fontFamily=Segoe UI;fontSize=9;fontColor=#1E3A8A;startArrow=ERmandOne;startFill=0;endArrow=ERmandOne;endFill=0;")
    
    # destinations -> attractions (destination_id)
    d.add_edge("fk_dest_att", "FK: destination_id", "tbl_destinations", "tbl_attractions", fk_edge_style)
    
    # destinations -> transport_routes (destination_id)
    d.add_edge("fk_dest_tr", "FK: destination_id", "tbl_destinations", "tbl_transport_routes", fk_edge_style)
    
    # destinations -> monthly_climates (destination_id)
    d.add_edge("fk_dest_clim", "FK: destination_id", "tbl_destinations", "tbl_monthly_climates", fk_edge_style)
    
    # destinations -> monthly_crowds (destination_id)
    d.add_edge("fk_dest_crw", "FK: destination_id", "tbl_destinations", "tbl_monthly_crowds", fk_edge_style)
    
    # travel_queries -> itinerary_plans (query_id)
    d.add_edge("fk_tq_itin", "FK: query_id", "tbl_travel_queries", "tbl_itinerary_plans", fk_edge_style)
    
    # destinations -> itinerary_plans (destination_id)
    d.add_edge("fk_dest_itin", "FK: destination_id", "tbl_destinations", "tbl_itinerary_plans", fk_edge_style,
               waypoints=[(1010, 560), (350, 560), (350, 680)])
    
    # itinerary_plans -> itinerary_activities (itinerary_id)
    d.add_edge("fk_itin_act", "FK: itinerary_id", "tbl_itinerary_plans", "tbl_itinerary_activities", fk_edge_style)
    
    # attractions -> itinerary_activities (attraction_id)
    d.add_edge("fk_att_act", "FK: attraction_id", "tbl_attractions", "tbl_itinerary_activities",
               "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#64748B;strokeDasharray=3 3;strokeWidth=1.5;fontFamily=Segoe UI;fontSize=9;fontColor=#475569;startArrow=ERone;startFill=0;endArrow=ERmany;endFill=0;",
               waypoints=[(1410, 1160), (180, 1160)])
    
    # admin_users -> data_ingestion_logs (admin_id)
    d.add_edge("fk_adm_log", "FK: admin_id", "tbl_admin_users", "tbl_data_ingestion_logs", fk_edge_style)
    
    return d

print("Physical ERD builder created.")
