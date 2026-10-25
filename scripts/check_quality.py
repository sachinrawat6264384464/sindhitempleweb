import sys
sys.path.append('scripts')
from inspect_book import parse_docx
import re
import json

paragraphs = parse_docx('roman_book.docx')
header_re = re.compile(r'^[|.\s]*([0-9]+\s+)?Raag\s+([A-Za-z]+)\s+Bhajan\s*[|.\s]*([0-9]+)?', re.IGNORECASE)

def is_noise(p):
    if re.match(r'^\[\s*\d+\s*\]$', p):
        return True
    if p.strip() in ['Shri Amarapur Vaani', '|| Om Satnam Saakshi ||', 'Anukramnikaa Shri Amarapur Vaani', 'Dar', '|', '||', '.', '..']:
        return True
    return False

all_bhajans = []
current_b = None

for i in range(1970, len(paragraphs)):
    p = paragraphs[i].strip()
    if not p or is_noise(p):
        continue

    m = header_re.match(p)
    if m:
        if current_b and len(current_b['raw_lines']) > 0:
            all_bhajans.append(current_b)
        raag = m.group(2).strip()
        current_b = {
            'raag': raag,
            'header': p,
            'raw_lines': []
        }
    elif current_b:
        current_b['raw_lines'].append(p)

if current_b and len(current_b['raw_lines']) > 0:
    all_bhajans.append(current_b)

line_counts = [len(b['raw_lines']) for b in all_bhajans]
print(f"Total parsed: {len(all_bhajans)}")
print(f"Min lines: {min(line_counts)}, Max lines: {max(line_counts)}, Avg lines: {sum(line_counts)/len(line_counts):.1f}")

short_bhajans = [b for b in all_bhajans if len(b['raw_lines']) < 4]
print(f"Bhajans with < 4 lines: {len(short_bhajans)}")
if short_bhajans:
    for sb in short_bhajans[:5]:
        print("Short:", sb['header'], sb['raw_lines'])
