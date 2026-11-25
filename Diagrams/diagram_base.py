"""
VROMON - AI Travel Destination Recommender
SE331 Continuous Assessment 2 Diagram Generator and Automated 3-Pass Reviewer
Generates draw.io XML files for:
  1. Component A: Logical ERD
  2. Component B: Physical ERD / Relational Schema
  3. Component C: DFD Context Diagram (Level 0)
  4. Component C: DFD Level 1
  5. Component C: DFD Level 2 (Process 2.0 Feasibility & Multi-Factor Scoring)
  6. Master multi-page draw.io file with all 5 diagrams
"""

import os
import sys
import html
import xml.etree.ElementTree as ET

# -------------------------------------------------------------
# XML Helper Classes for Draw.io
# -------------------------------------------------------------

class DrawioDiagram:
    def __init__(self, name, page_id=None, width=1920, height=1200):
        self.name = name
        self.page_id = page_id or f"page_{abs(hash(name)) % 10000000}"
        self.width = width
        self.height = height
        self.cells = []
        self.cell_ids = set()
        
        # Add root cells (0 and 1)
        self.add_cell(id="0")
        self.add_cell(id="1", parent="0")

    def add_cell(self, **attribs):
        cid = attribs.get("id")
        if cid in self.cell_ids:
            raise ValueError(f"Duplicate cell id: {cid}")
        self.cell_ids.add(cid)
        self.cells.append(attribs)
        return cid

    def add_vertex(self, cid, value, x, y, w, h, style, parent="1"):
        return self.add_cell(
            id=cid,
            value=value,
            style=style,
            parent=parent,
            vertex="1",
            geometry={"x": str(x), "y": str(y), "width": str(w), "height": str(h), "as": "geometry"}
        )

    def add_edge(self, cid, value, source, target, style, waypoints=None, parent="1"):
        geo = {"relative": "1", "as": "geometry"}
        if waypoints:
            geo["waypoints"] = waypoints
        return self.add_cell(
            id=cid,
            value=value,
            style=style,
            parent=parent,
            edge="1",
            source=source,
            target=target,
            geometry=geo
        )

    def to_xml_element(self):
        diagram = ET.Element('diagram', id=self.page_id, name=self.name)
        model = ET.SubElement(diagram, 'mxGraphModel',
                              dx='1600', dy='1000', grid='1', gridSize='10',
                              guides='1', tooltips='1', connect='1', arrows='1',
                              fold='1', page='1', pageScale='1',
                              pageWidth=str(self.width), pageHeight=str(self.height),
                              background='#FFFFFF', math='0', shadow='0')
        root = ET.SubElement(model, 'root')
        for c in self.cells:
            cell_attrib = {}
            geo_dict = None
            for k, v in c.items():
                if k == "geometry":
                    geo_dict = v
                else:
                    cell_attrib[k] = v
            cell_elem = ET.SubElement(root, 'mxCell', **cell_attrib)
            if geo_dict:
                geo_attrib = {
                    'x': geo_dict.get('x', '0'),
                    'y': geo_dict.get('y', '0'),
                    'width': geo_dict.get('width', '0'),
                    'height': geo_dict.get('height', '0'),
                    'as': geo_dict.get('as', 'geometry')
                }
                geo_elem = ET.SubElement(cell_elem, 'mxGeometry', **geo_attrib)
                if geo_dict.get('relative'):
                    geo_elem.set('relative', geo_dict['relative'])
                if 'waypoints' in geo_dict:
                    points_elem = ET.SubElement(geo_elem, 'Array', **{'as': 'points'})
                    for wx, wy in geo_dict['waypoints']:
                        ET.SubElement(points_elem, 'mxPoint', x=str(wx), y=str(wy))
        return diagram

def save_diagram_file(diagram, filepath):
    mxfile = ET.Element('mxfile', host='app.diagrams.net', agent='Antigravity SE331', version='24.7.17')
    mxfile.append(diagram.to_xml_element())
    tree = ET.ElementTree(mxfile)
    ET.indent(tree, space="  ", level=0)
    tree.write(filepath, encoding='utf-8', xml_declaration=True)
    print(f"Saved: {filepath}")

def save_master_file(diagrams, filepath):
    mxfile = ET.Element('mxfile', host='app.diagrams.net', agent='Antigravity SE331', version='24.7.17')
    for d in diagrams:
        mxfile.append(d.to_xml_element())
    tree = ET.ElementTree(mxfile)
    ET.indent(tree, space="  ", level=0)
    tree.write(filepath, encoding='utf-8', xml_declaration=True)
    print(f"Saved Master File: {filepath}")

print("Helper classes defined successfully.")
