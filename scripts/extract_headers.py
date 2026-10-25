import zipfile
import xml.etree.ElementTree as ET
import re
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

# Let's find all bhajan headers after index
# Patterns like: || Raag Bhairav Bhajan || 1 ||. or | Raag Raamkali Bhajan || 1 || 13 ||
bhajan_header_pattern = re.compile(r'^[|.\s]*([0-9]+\s+)?Raag\s+([A-Za-z\s]+?)\s+Bhajan\s*[|.\s]*([0-9]+)?', re.IGNORECASE)

found_headers = []
for idx in range(1950, len(paragraphs)):
    p = paragraphs[idx]
    if 'Raag' in p and 'Bhajan' in p:
        found_headers.append((idx, p))

print(f"Total bhajan header matches found after index: {len(found_headers)}")
with open('bhajan_headers.txt', 'w', encoding='utf-8') as f:
    for idx, text in found_headers[:100]:
        f.write(f"Index {idx}: {text}\n")
