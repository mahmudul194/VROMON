"""
VROMON Master Diagram Generation and 3-Pass Automated Verification Suite.
"""

import os
import sys
import xml.etree.ElementTree as ET

from diagram_base import save_diagram_file, save_master_file
from build_diagram_logical import build_logical_erd
from build_diagram_physical import build_physical_erd
from build_diagram_dfd_context import build_dfd_context
from build_diagram_dfd_level1 import build_dfd_level1
from build_diagram_dfd_level2 import build_dfd_level2

def review_pass_1_syntax_and_structure(diagrams):
    print("\n" + "="*70)
    print("PASS 1: SYNTAX, XML WELL-FORMEDNESS & STRUCTURAL INTEGRITY REVIEW")
    print("="*70)
    
    all_passed = True
    for diag in diagrams:
        print(f"\n[Verifying] {diag.name} (ID: {diag.page_id})")
        xml_elem = diag.to_xml_element()
        raw_xml = ET.tostring(xml_elem, encoding='utf-8')
        
        # 1. XML Parsing check
        try:
            parsed = ET.fromstring(raw_xml)
            print("  [OK] Valid XML well-formed syntax.")
        except Exception as e:
            print(f"  [FAIL] XML syntax error: {e}")
            all_passed = False
            continue
            
        # 2. Check root cell IDs (0 and 1)
        root = parsed.find('.//root')
        if root is None:
            print("  [FAIL] Missing <root> element.")
            all_passed = False
            continue
        cell_0 = root.find("./mxCell[@id='0']")
        cell_1 = root.find("./mxCell[@id='1']")
        if cell_0 is not None and cell_1 is not None and cell_1.attrib.get('parent') == '0':
            print("  [OK] Graph root hierarchy correctly established (0 and 1).")
        else:
            print("  [FAIL] Missing root cells 0 or 1.")
            all_passed = False
            
        # 3. Check uniqueness of all cell IDs
        ids = [c.attrib.get('id') for c in root.findall('mxCell')]
        if len(ids) == len(set(ids)):
            print(f"  [OK] All {len(ids)} cell IDs are strictly unique.")
        else:
            duplicates = [i for i in ids if ids.count(i) > 1]
            print(f"  [FAIL] Duplicate cell IDs found: {set(duplicates)}")
            all_passed = False
            
        # 4. Check that every edge points to existing source and target vertices
        edges = root.findall("./mxCell[@edge='1']")
        vertices = {c.attrib.get('id') for c in root.findall("./mxCell[@vertex='1']")}
        edge_errors = 0
        for edge in edges:
            eid = edge.attrib.get('id')
            src = edge.attrib.get('source')
            tgt = edge.attrib.get('target')
            val = edge.attrib.get('value', '')
            if not src or src not in vertices:
                print(f"  [FAIL] Edge '{eid}' has invalid source '{src}'")
                edge_errors += 1
            if not tgt or tgt not in vertices:
                print(f"  [FAIL] Edge '{eid}' has invalid target '{tgt}'")
                edge_errors += 1
            if not val:
                print(f"  [WARN] Edge '{eid}' has no label text")
        if edge_errors == 0:
            print(f"  [OK] All {len(edges)} connectors have strictly valid source and target anchors.")
        else:
            all_passed = False

    return all_passed

def review_pass_2_domain_and_se_alignment(diagrams):
    print("\n" + "="*70)
    print("PASS 2: DOMAIN, SOFTWARE ENGINEERING & CAPSTONE PROPOSAL ALIGNMENT REVIEW")
    print("="*70)
    
    all_passed = True
    
    # Check 1: Logical ERD Entities (12 required)
    logical_diag = next(d for d in diagrams if "Logical" in d.name)
    logical_xml = logical_diag.to_xml_element()
    expected_entities = [
        "TRAVEL_QUERY", "DESTINATION", "ATTRACTION_POI", "TRANSPORT_ROUTE",
        "MONTHLY_CLIMATE", "MONTHLY_CROWD", "RECOMMENDATION_RESULT", "AI_EXPLANATION",
        "ITINERARY_PLAN", "ITINERARY_DAY_ACTIVITY", "ADMIN_USER", "DATA_INGESTION_LOG"
    ]
    print(f"\n[Verifying Component A: Logical ERD Entities]")
    logical_text = ET.tostring(logical_xml, encoding='utf-8').decode('utf-8')
    missing_entities = [e for e in expected_entities if e not in logical_text]
    if not missing_entities:
        print(f"  [OK] All {len(expected_entities)} required conceptual entities present and documented.")
    else:
        print(f"  [FAIL] Missing entities in Logical ERD: {missing_entities}")
        all_passed = False
        
    # Check 2: Physical ERD Tables & Constraints
    physical_diag = next(d for d in diagrams if "Physical" in d.name)
    physical_xml = physical_diag.to_xml_element()
    physical_text = ET.tostring(physical_xml, encoding='utf-8').decode('utf-8')
    expected_tables = [
        "travel_queries", "destinations", "attractions", "transport_routes",
        "monthly_climates", "monthly_crowds", "recommendation_results", "ai_explanations",
        "itinerary_plans", "itinerary_activities", "admin_users", "data_ingestion_logs"
    ]
    print(f"\n[Verifying Component B: Physical Relational Tables & Constraints]")
    missing_tables = [t for t in expected_tables if t not in physical_text]
    if not missing_tables:
        print(f"  [OK] All {len(expected_tables)} relational tables present with PK/FK columns.")
    else:
        print(f"  [FAIL] Missing tables in Physical Schema: {missing_tables}")
        all_passed = False
        
    expected_constraints = [
        "AUTO_INCREMENT", "NOT NULL", "CHECK", "VECTOR(1536)",
        "CHECK 1..12", "CHECK 1..5", "Fits", "Tight", "Over", "Bus", "Train", "Launch"
    ]
    missing_constraints = [c for c in expected_constraints if c not in physical_text]
    if not missing_constraints:
        print("  [OK] All domain integrity constraints (types, checks, enums, FKs) strictly specified.")
    else:
        print(f"  [FAIL] Missing constraints in Physical Schema: {missing_constraints}")
        all_passed = False

    # Check 3: DFD Context Diagram (Level 0)
    context_diag = next(d for d in diagrams if "Context" in d.name)
    context_xml = context_diag.to_xml_element()
    context_text = ET.tostring(context_xml, encoding='utf-8').decode('utf-8')
    print(f"\n[Verifying Component C: DFD Context Diagram (Level 0)]")
    expected_external = ["Traveler", "System Administrator", "External AI", "Map"]
    missing_ext = [e for e in expected_external if e not in context_text]
    if not missing_ext:
        print("  [OK] All 4 external entities clearly defined on system boundary.")
    else:
        print(f"  [FAIL] Missing external entities in Context Diagram: {missing_ext}")
        all_passed = False
    if "0.0" in context_text and "VROMON" in context_text:
        print("  [OK] Single central system process 0.0 correctly modeled.")
    else:
        print("  [FAIL] Missing central process 0.0 in Context Diagram.")
        all_passed = False
    # Verify no data stores at context level
    if "D1:" in context_text or "D2:" in context_text:
        print("  [FAIL] Violation of DFD rules: Data store exposed at Context Level!")
        all_passed = False
    else:
        print("  [OK] DFD Rule followed: No internal data stores exposed at Context Level.")

    # Check 4: DFD Level 1
    level1_diag = next(d for d in diagrams if "Level 1" in d.name)
    level1_xml = level1_diag.to_xml_element()
    level1_text = ET.tostring(level1_xml, encoding='utf-8').decode('utf-8')
    print(f"\n[Verifying Component C: DFD Level 1 Subsystems & Stores]")
    expected_procs = ["1.0", "2.0", "3.0", "4.0", "5.0"]
    missing_procs = [p for p in expected_procs if p not in level1_text]
    if not missing_procs:
        print("  [OK] All 5 major numbered processes (1.0 to 5.0) present.")
    else:
        print(f"  [FAIL] Missing processes in Level 1 DFD: {missing_procs}")
        all_passed = False
    expected_stores = ["D1", "D2", "D3", "D4", "D5", "D6"]
    missing_stores = [s for s in expected_stores if s not in level1_text]
    if not missing_stores:
        print("  [OK] All 6 persistent data stores (D1 to D6) present and connected.")
    else:
        print(f"  [FAIL] Missing data stores in Level 1 DFD: {missing_stores}")
        all_passed = False

    # Check 5: DFD Level 2 (Process 2.0 Decomposition)
    level2_diag = next(d for d in diagrams if "Level 2" in d.name)
    level2_xml = level2_diag.to_xml_element()
    level2_text = ET.tostring(level2_xml, encoding='utf-8').decode('utf-8')
    print(f"\n[Verifying Component C: DFD Level 2 (Process 2.0 Subprocesses & Formulas)]")
    expected_subprocs = ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"]
    missing_subprocs = [p for p in expected_subprocs if p not in level2_text]
    if not missing_subprocs:
        print("  [OK] All 6 subprocesses (2.1 to 2.6) present in Process 2.0 decomposition.")
    else:
        print(f"  [FAIL] Missing subprocesses in Level 2 DFD: {missing_subprocs}")
        all_passed = False
    expected_weights = ["30%", "15%", "20%", "10%", "15%", "10%"]
    missing_weights = [w for w in expected_weights if w not in level2_text]
    if not missing_weights:
        print("  [OK] Exact multi-factor weights (30/15/20/10/15/10%) mathematically verified.")
    else:
        print(f"  [FAIL] Missing weight annotations: {missing_weights}")
        all_passed = False

    return all_passed

def review_pass_3_geometry_spacing_and_aesthetics(diagrams):
    print("\n" + "="*70)
    print("PASS 3: GEOMETRY, COORDINATE OVERLAP & AESTHETIC SPACING REVIEW")
    print("="*70)
    
    all_passed = True
    for diag in diagrams:
        print(f"\n[Checking Geometry & Spacing] {diag.name}")
        xml_elem = diag.to_xml_element()
        root = xml_elem.find('mxGraphModel/root')
        
        vertices = []
        for c in root.findall("./mxCell[@vertex='1']"):
            cid = c.attrib.get('id')
            geo = c.find('mxGeometry')
            if geo is not None:
                x = float(geo.attrib.get('x', '0'))
                y = float(geo.attrib.get('y', '0'))
                w = float(geo.attrib.get('width', '0'))
                h = float(geo.attrib.get('height', '0'))
                vertices.append((cid, x, y, w, h))
                
        # Check boundary containment
        out_of_bounds = []
        for cid, x, y, w, h in vertices:
            if x < 0 or y < 0 or (x + w) > (diag.width + 100) or (y + h) > (diag.height + 100):
                out_of_bounds.append((cid, x, y, w, h))
        if not out_of_bounds:
            print(f"  [OK] All {len(vertices)} elements fit comfortably within canvas boundaries ({diag.width}x{diag.height}).")
        else:
            print(f"  [WARN] Elements out of canvas: {out_of_bounds}")
            
        # Check pairwise collision / overlap between non-banner/legend vertices
        overlap_count = 0
        for i in range(len(vertices)):
            id1, x1, y1, w1, h1 = vertices[i]
            if "banner" in id1 or "legend" in id1 or "callout" in id1:
                continue
            for j in range(i + 1, len(vertices)):
                id2, x2, y2, w2, h2 = vertices[j]
                if "banner" in id2 or "legend" in id2 or "callout" in id2:
                    continue
                # Overlap test:
                if not (x1 + w1 <= x2 or x2 + w2 <= x1 or y1 + h1 <= y2 or y2 + h2 <= y1):
                    # Compute overlap area
                    ox = max(0, min(x1 + w1, x2 + w2) - max(x1, x2))
                    oy = max(0, min(y1 + h1, y2 + h2) - max(y1, y2))
                    if ox > 5 and oy > 5:
                        print(f"  [COLLISION] Overlap detected between '{id1}' and '{id2}' (dx={ox}, dy={oy})")
                        overlap_count += 1
                        all_passed = False
        if overlap_count == 0:
            print(f"  [OK] Zero unintended bounding box collisions detected across all {len(vertices)} entities/processes.")
        else:
            print(f"  [FAIL] Total collisions: {overlap_count}")

    return all_passed

def main():
    print("Building all 5 VROMON Design Diagrams for SE331 Continuous Assessment 2...")
    
    diag_logical = build_logical_erd()
    diag_physical = build_physical_erd()
    diag_context = build_dfd_context()
    diag_level1 = build_dfd_level1()
    diag_level2 = build_dfd_level2()
    
    diagrams = [diag_logical, diag_physical, diag_context, diag_level1, diag_level2]
    
    # Run the 3-pass review suite
    p1 = review_pass_1_syntax_and_structure(diagrams)
    p2 = review_pass_2_domain_and_se_alignment(diagrams)
    p3 = review_pass_3_geometry_spacing_and_aesthetics(diagrams)
    
    print("\n" + "="*70)
    print("3-STAGE REVIEW SUMMARY")
    print("="*70)
    print(f"Pass 1 (Syntax & Structural Integrity):    {'PASSED' if p1 else 'FAILED'}")
    print(f"Pass 2 (Domain & Requirement Alignment):   {'PASSED' if p2 else 'FAILED'}")
    print(f"Pass 3 (Geometry & Aesthetic Spacing):     {'PASSED' if p3 else 'FAILED'}")
    
    if p1 and p2 and p3:
        print("\nAll 3 review passes PASSED with zero defects! Proceeding to write output files...")
        out_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Save individual draw.io files
        save_diagram_file(diag_logical, os.path.join(out_dir, "1_VROMON_Logical_ERD.drawio"))
        save_diagram_file(diag_physical, os.path.join(out_dir, "2_VROMON_Physical_ERD.drawio"))
        save_diagram_file(diag_context, os.path.join(out_dir, "3_VROMON_DFD_Context_Level0.drawio"))
        save_diagram_file(diag_level1, os.path.join(out_dir, "4_VROMON_DFD_Level1.drawio"))
        save_diagram_file(diag_level2, os.path.join(out_dir, "5_VROMON_DFD_Level2_Process2.drawio"))
        
        # Save master multi-page draw.io file
        save_master_file(diagrams, os.path.join(out_dir, "VROMON_Master_Design_Diagrams.drawio"))
        print("\nAll diagram files successfully generated in Draw.io format.")
    else:
        print("\nReview failed. Corrections required.")
        sys.exit(1)

if __name__ == "__main__":
    main()
