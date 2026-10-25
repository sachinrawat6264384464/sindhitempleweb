import sys
sys.path.append('scripts')
from inspect_book import parse_docx
import re
import json

paragraphs = parse_docx('roman_book.docx')
print(f"Total paragraphs in document: {len(paragraphs)}")

# Pattern for bhajan header
# Examples:
# || Raag Bhairav Bhajan || 1 ||.
# | Raag Raamkali Bhajan || 1 || 13 ||
# || 4 Raag Aasaa Bhajan 96. ||.
header_re = re.compile(r'^[|.\s]*([0-9]+\s+)?Raag\s+([A-Za-z]+)\s+Bhajan\s*[|.\s]*([0-9]+)?', re.IGNORECASE)

# Ignorable header/footer/page lines in docx
def is_noise(p):
    if re.match(r'^\[\s*\d+\s*\]$', p): # e.g. [  25  ]
        return True
    if p.strip() in ['Shri Amarapur Vaani', '|| Om Satnam Saakshi ||', 'Anukramnikaa Shri Amarapur Vaani', 'Dar', '|', '||', '.', '..']:
        return True
    return False

all_bhajans = []
current_b = None

# Bhajan start index is around 1970
for i in range(1970, len(paragraphs)):
    p = paragraphs[i].strip()
    if not p:
        continue
    if is_noise(p):
        continue

    m = header_re.match(p)
    if m:
        if current_b and len(current_b['raw_lines']) > 0:
            all_bhajans.append(current_b)
        raag = m.group(2).strip()
        num_str = m.group(3) if m.group(3) else str(len(all_bhajans) + 1)
        current_b = {
            'raag': raag,
            'header': p,
            'raw_lines': []
        }
    elif current_b:
        current_b['raw_lines'].append(p)

if current_b and len(current_b['raw_lines']) > 0:
    all_bhajans.append(current_b)

print(f"Total parsed bhajans: {len(all_bhajans)}")

# Let's inspect by Raag
raag_counts = {}
for b in all_bhajans:
    r = b['raag']
    raag_counts[r] = raag_counts.get(r, 0) + 1

print("\nBhajans parsed per Raag:")
for r, c in sorted(raag_counts.items(), key=lambda x: -x[1]):
    print(f"  {r}: {c}")

with open('parsed_summary.json', 'w', encoding='utf-8') as f:
    json.dump({
        'total': len(all_bhajans),
        'raags': raag_counts,
        'first_3': all_bhajans[:3]
    }, f, indent=2, ensure_ascii=False)
