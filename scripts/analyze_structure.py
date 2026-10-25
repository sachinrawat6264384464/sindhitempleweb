import zipfile
import xml.etree.ElementTree as ET
import re

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
print(f"Total paragraphs: {len(paragraphs)}")

# Let's search for headers, bhajans, raags
with open('structure_analysis.txt', 'w', encoding='utf-8') as out:
    for idx, p in enumerate(paragraphs):
        # Let's search for pattern like Raag or Bhajan number or ||
        if re.search(r'Raag\s+|Bhajan\s+\d+|Mangalaacharan|\bRaag\b', p, re.IGNORECASE):
            out.write(f"Index {idx}: {p}\n")

print("Finished writing structure_analysis.txt")
