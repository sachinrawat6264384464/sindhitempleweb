import sys
sys.path.append('scripts')
from inspect_book import parse_docx
import re
import json

paragraphs = parse_docx('roman_book.docx')

# Let's inspect paragraphs 1970 to 2105 (Raag Bhairav bhajans 1 to 12)
bhajans = []
current_bhajan = None

# Pattern for header: || Raag Bhairav Bhajan || 1 ||.
header_re = re.compile(r'^[|.\s]*([0-9]+\s+)?Raag\s+([A-Za-z]+)\s+Bhajan\s*[|.\s]*([0-9]+)?', re.IGNORECASE)

for i in range(1970, 2105):
    p = paragraphs[i]
    # Check if page marker like [  25  ] or header
    if re.match(r'^\[\s*\d+\s*\]$', p) or p in ['Shri Amarapur Vaani', '|| Om Satnam Saakshi ||', 'Anukramnikaa Shri Amarapur Vaani', 'Dar', '|']:
        continue
    
    m = header_re.match(p)
    if m:
        if current_bhajan:
            bhajans.append(current_bhajan)
        raag = m.group(2)
        num = m.group(3) if m.group(3) else str(len(bhajans) + 1)
        current_bhajan = {
            'raag': raag,
            'header': p,
            'lines': []
        }
    elif current_bhajan:
        current_bhajan['lines'].append(p)

if current_bhajan:
    bhajans.append(current_bhajan)

print(f"Parsed {len(bhajans)} bhajans from Raag Bhairav section:")
for b in bhajans:
    print(f"--- {b['header']} ---")
    print(f"First 2 lines: {b['lines'][:2]}")
    print(f"Total lines: {len(b['lines'])}")
