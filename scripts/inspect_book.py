import zipfile
import xml.etree.ElementTree as ET
import sys
import json

def parse_docx(filename):
    with zipfile.ZipFile(filename) as z:
        xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    paragraphs = []
    for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
        text = ''.join(texts).strip()
        if text:
            paragraphs.append(text)
    return paragraphs

paragraphs = parse_docx('roman_book.docx')
with open('extracted_sample.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total non-empty paragraphs: {len(paragraphs)}\n\n")
    for i, p in enumerate(paragraphs[:300]):
        f.write(f"{i+1}: {p}\n")

print(f"Total paragraphs: {len(paragraphs)}. First 300 written to extracted_sample.txt")
