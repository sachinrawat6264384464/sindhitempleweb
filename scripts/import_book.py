import sys
sys.path.append('scripts')
from inspect_book import parse_docx
import os
import re
import json

print("Parsing roman_book.docx...")
paragraphs = parse_docx('roman_book.docx')

# 25 Canonical Raags
CATEGORIES_DEF = [
    {"id": "raag-bhairav", "slug": "raag-bhairav", "name": "राग भैरव", "romanName": "Raag Bhairav", "description": "Early morning devotional compositions invoking divine protection, humility, and prayer.", "displayOrder": 1},
    {"id": "raag-raamkali", "slug": "raag-raamkali", "name": "राग रामकली", "romanName": "Raag Raamkali", "description": "Morning meditative compositions centered on Guru kripa, wisdom, and inner awakening.", "displayOrder": 2},
    {"id": "raag-prabhaati", "slug": "raag-prabhaati", "name": "राग प्रभाती", "romanName": "Raag Prabhaati", "description": "Dawn awakening hymns encouraging spiritual seekers to rise for early morning simran.", "displayOrder": 3},
    {"id": "raag-aasaa", "slug": "raag-aasaa", "name": "राग आसा", "romanName": "Raag Aasaa", "description": "Verses of spiritual hope, longing for the divine presence, and steadfast devotion.", "displayOrder": 4},
    {"id": "raag-vihaag", "slug": "raag-vihaag", "name": "राग विहाग", "romanName": "Raag Vihaag", "description": "Late evening and night contemplative hymns of peace, introspection, and quiet surrender.", "displayOrder": 5},
    {"id": "raag-dhanaashri", "slug": "raag-dhanaashri", "name": "राग धनाश्री", "romanName": "Raag Dhanaashri", "description": "Joyful expressions of gratitude, celebration of grace, and peaceful spiritual contentment.", "displayOrder": 6},
    {"id": "raag-tori", "slug": "raag-tori", "name": "राग तोड़ी", "romanName": "Raag Tori", "description": "Earnest supplications expressing deep emotional longing and heartfelt humility.", "displayOrder": 7},
    {"id": "raag-bhairvi", "slug": "raag-bhairvi", "name": "राग भैरवी", "romanName": "Raag Bhairvi", "description": "Classical devotional adoration, universal prayer, and evening congregational bhajans.", "displayOrder": 8},
    {"id": "raag-zilaa", "slug": "raag-zilaa", "name": "राग ज़िला", "romanName": "Raag Zilaa", "description": "Lively folk-flavored devotional songs celebrating the divine name with rhythm and joy.", "displayOrder": 9},
    {"id": "raag-basant", "slug": "raag-basant", "name": "राग बसंत", "romanName": "Raag Basant", "description": "Spring hymns celebrating spiritual blossoming, love for the True Master, and inner joy.", "displayOrder": 10},
    {"id": "raag-tilang", "slug": "raag-tilang", "name": "राग तिलंग", "romanName": "Raag Tilang", "description": "Soul-stirring poetry of separation (viraha), love, and deep attachment to the Lord.", "displayOrder": 11},
    {"id": "raag-huseni", "slug": "raag-huseni", "name": "राग हुसैनी", "romanName": "Raag Huseni", "description": "Sufi-influenced devotional verses on detachment (vairagya), transience of life, and truth.", "displayOrder": 12},
    {"id": "raag-kohiyaari", "slug": "raag-kohiyaari", "name": "राग कोहियारी", "romanName": "Raag Kohiyaari", "description": "Traditional mountain and desert melodies of mystical surrender and spiritual searching.", "displayOrder": 13},
    {"id": "raag-sorath", "slug": "raag-sorath", "name": "राग सोरठ", "romanName": "Raag Sorath", "description": "Heartfelt nighttime praise, humility, and seeking the refuge of the supreme protector.", "displayOrder": 14},
    {"id": "raag-khambhaat", "slug": "raag-khambhaat", "name": "राग खंभात", "romanName": "Raag Khambhaat", "description": "Spiritual counsel urging the human soul to awaken from slumber and remember God.", "displayOrder": 15},
    {"id": "raag-maaru", "slug": "raag-maaru", "name": "राग मारू", "romanName": "Raag Maaru", "description": "Heroic devotional verses inspiring courage on the spiritual path and truthful living.", "displayOrder": 16},
    {"id": "raag-saarang", "slug": "raag-saarang", "name": "राग सारंग", "romanName": "Raag Saarang", "description": "Midday hymns offering cooling spiritual relief through the nectar of the holy Name.", "displayOrder": 17},
    {"id": "raag-purab", "slug": "raag-purab", "name": "राग पूरब", "romanName": "Raag Purab", "description": "Classic eastern devotional hymns honoring the glory and sanctity of the holy preceptor.", "displayOrder": 18},
    {"id": "raag-kaamol", "slug": "raag-kaamol", "name": "राग कामोद", "romanName": "Raag Kaamol", "description": "Intense devotion, loving surrender, and prayer for divine vision.", "displayOrder": 19},
    {"id": "raag-kalyaan", "slug": "raag-kalyaan", "name": "राग कल्याण", "romanName": "Raag Kalyaan", "description": "Auspicious evening hymns invoking peace, blessings, and spiritual well-being.", "displayOrder": 20},
    {"id": "raag-kanso", "slug": "raag-kanso", "name": "राग कानसो", "romanName": "Raag Kanso", "description": "Devotional adulations capturing divine sweetness, divine play (leela), and love.", "displayOrder": 21},
    {"id": "raag-pahaari", "slug": "raag-pahaari", "name": "राग पहाड़ी", "romanName": "Raag Pahaari", "description": "Folk hymns inspired by natural beauty, simple devotion, and heartfelt sing-alongs.", "displayOrder": 22},
    {"id": "raag-pilaa", "slug": "raag-pilaa", "name": "राग पीलू", "romanName": "Raag Pilaa", "description": "Tender and poignant prayers celebrating unconditional divine mercy and sweet refuge.", "displayOrder": 23},
    {"id": "raag-maanjh", "slug": "raag-maanjh", "name": "राग मांझ", "romanName": "Raag Maanjh", "description": "Authentic Sindhi Maanjh verses of profound love and yearning for the divine presence.", "displayOrder": 24},
    {"id": "raag-jog", "slug": "raag-jog", "name": "राग जोग", "romanName": "Raag Jog", "description": "High yogic realization, oneness with the Supreme Soul, and liberation from illusion.", "displayOrder": 25}
]

# Map extracted raag strings to category ID
def map_raag_to_cat(r_str):
    r_lower = r_str.lower()
    if 'bhairav' in r_lower: return 'raag-bhairav'
    if 'raamkali' in r_lower or 'ramkali' in r_lower: return 'raag-raamkali'
    if 'prabhaati' in r_lower or 'prabhati' in r_lower: return 'raag-prabhaati'
    if 'aasaa' in r_lower or 'asa' in r_lower: return 'raag-aasaa'
    if 'vihaag' in r_lower or 'vihag' in r_lower: return 'raag-vihaag'
    if 'dhanaashri' in r_lower or 'dhanashri' in r_lower: return 'raag-dhanaashri'
    if 'tori' in r_lower or 'todi' in r_lower: return 'raag-tori'
    if 'bhervi' in r_lower or 'bhairavi' in r_lower: return 'raag-bhairvi'
    if 'zilaa' in r_lower or 'zila' in r_lower: return 'raag-zilaa'
    if 'basant' in r_lower: return 'raag-basant'
    if 'tilang' in r_lower: return 'raag-tilang'
    if 'huseni' in r_lower or 'husaini' in r_lower: return 'raag-huseni'
    if 'koh' in r_lower or 'kod' in r_lower: return 'raag-kohiyaari'
    if 'sorath' in r_lower: return 'raag-sorath'
    if 'khambhaat' in r_lower or 'khambhat' in r_lower: return 'raag-khambhaat'
    if 'maaru' in r_lower or 'maru' in r_lower: return 'raag-maaru'
    if 'saarang' in r_lower or 'sarang' in r_lower: return 'raag-saarang'
    if 'purab' in r_lower: return 'raag-purab'
    if 'kaamol' in r_lower or 'kamol' in r_lower: return 'raag-kaamol'
    if 'kalyaan' in r_lower or 'kalyan' in r_lower: return 'raag-kalyaan'
    if 'kanso' in r_lower: return 'raag-kanso'
    if 'pahaari' in r_lower or 'pahari' in r_lower: return 'raag-pahaari'
    if 'pilaa' in r_lower or 'pilu' in r_lower: return 'raag-pilaa'
    if 'maanjh' in r_lower or 'majh' in r_lower: return 'raag-maanjh'
    if 'jog' in r_lower: return 'raag-jog'
    return 'raag-bhairav'

# Transliteration dictionary for words commonly appearing in Amarapur Vaani
VOCAB = {
    'shri': 'श्री', 'om': 'ॐ', 'satnam': 'सतनाम', 'saakshi': 'साक्षी',
    'prem': 'प्रेम', 'prakash': 'प्रकाश', 'guru': 'गुरु', 'sadguru': 'सद्गुरु',
    'satguru': 'सतगुरु', 'swami': 'स्वामी', 'svaami': 'स्वामी', 'teunram': 'तेऊँराम',
    'teunraam': 'तेऊँराम', 'sarvaanand': 'सर्वानंद', 'bhagwan': 'भगवान',
    'hari': 'हरि', 'raam': 'राम', 'ram': 'राम', 'krishna': 'कृष्ण', 'shiva': 'शिव',
    'prabhu': 'प्रभु', 'naath': 'नाथ', 'dayal': 'दयाल', 'dayaa': 'दया',
    'bhakti': 'भक्ति', 'jnyaan': 'ज्ञान', 'gyan': 'ज्ञान', 'vairaagy': 'वैराग्य',
    'naam': 'नाम', 'simran': 'सिमरन', 'sumiran': 'सुमिरन', 'dhyan': 'ध्यान',
    'dhyaan': 'ध्यान', 'satsang': 'सत्संग', 'sant': 'संत', 'charan': 'चरण',
    'charnan': 'चरनन', 'charnau': 'चरणौ', 'paar': 'पार', 'taaro': 'तारो',
    'daas': 'दास', 'main': 'मैं', 'tumhaaro': 'तुम्हारो', 'tek': 'टेक',
    'man': 'मन', 'tan': 'तन', 'dhan': 'धन', 'sukh': 'सुख', 'dukh': 'दुःख',
    'duhkh': 'दुःख', 'shanti': 'शांति', 'shaanti': 'शांति', 'anand': 'आनंद',
    'aanand': 'आनंद', 'kripaa': 'कृपा', 'kirpa': 'कृपा', 'kripa': 'कृपा',
    'aarti': 'आरती', 'puja': 'पूजा', 'vandana': 'वंदना', 'aridaas': 'अरदास',
    'prarthana': 'प्रार्थना', 'praarthanaa': 'प्रार्थना', 'amrit': 'अमृत',
    'doha': 'दोहा', 'chhand': 'छंद', 'rag': 'राग', 'raag': 'राग',
    'bhajan': 'भजन', 'vaani': 'वाणी', 'baani': 'बानी', 'amarapur': 'अमरापुर',
    'mukt': 'मुक्त', 'mukti': 'मुक्ति', 'moksh': 'मोक्ष', 'chet': 'चेत',
    'jaag': 'जाग', 'jaago': 'जागो', 'nirmal': 'निर्मल', 'paavan': 'पावन',
    'pavitr': 'पवित्र', 'pratipal': 'प्रतिपाल', 'sarv': 'सर्व', 'akaal': 'अकाल',
    'avinaashi': 'अविनाशी', 'gopal': 'गोपाल', 'govind': 'गोविंद', 'narayan': 'नारायण',
    'dehi': 'देही', 'daan': 'दान', 'din': 'दीन', 'deen': 'दीन', 'ji': 'जी',
    'kahe': 'कहे', 'kahat': 'कहत', 'teun': 'तेऊँ', 'sadaa': 'सदा', 'karo': 'करो'
}

def to_devanagari_word(w):
    clean = re.sub(r'[^a-zA-Z]', '', w).lower()
    prefix = re.match(r'^[^a-zA-Z]*', w).group(0)
    suffix = re.search(r'[^a-zA-Z]*$', w).group(0)
    if not clean:
        return w
    if clean in VOCAB:
        return prefix + VOCAB[clean] + suffix
    
    # Phonetic character transliteration rule
    res = clean
    res = res.replace('sh', 'श').replace('ch', 'च').replace('th', 'थ').replace('dh', 'ध')
    res = res.replace('kh', 'ख').replace('gh', 'घ').replace('bh', 'भ').replace('jh', 'झ')
    res = res.replace('ph', 'फ').replace('aa', 'ा').replace('ee', 'ी').replace('ii', 'ी')
    res = res.replace('oo', 'ू').replace('uu', 'ू').replace('ai', 'ै').replace('au', 'ौ')
    res = res.replace('k', 'क').replace('g', 'ग').replace('j', 'ज').replace('t', 'त')
    res = res.replace('d', 'द').replace('n', 'न').replace('p', 'प').replace('b', 'ब')
    res = res.replace('m', 'म').replace('y', 'य').replace('r', 'र').replace('l', 'ल')
    res = res.replace('v', 'व').replace('s', 'स').replace('h', 'ह')
    res = res.replace('a', '').replace('i', 'ि').replace('u', 'ु').replace('e', 'े').replace('o', 'ो')
    return prefix + (res if res else clean) + suffix

def to_devanagari_text(text):
    return ' '.join(to_devanagari_word(w) for w in text.split(' '))

def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s).strip('-')
    return s[:60]

# Parse raw document into bhajan blocks
header_re = re.compile(r'^[|.\s]*([0-9]+\s+)?Raag\s+([A-Za-z]+)\s+Bhajan\s*[|.\s]*([0-9]+)?', re.IGNORECASE)

def is_noise(p):
    if re.match(r'^\[\s*\d+\s*\]$', p): return True
    if p.strip() in ['Shri Amarapur Vaani', '|| Om Satnam Saakshi ||', 'Anukramnikaa Shri Amarapur Vaani', 'Dar', '|', '||', '.', '..']: return True
    return False

parsed_raw_bhajans = []
cur = None

for i in range(1970, len(paragraphs)):
    p = paragraphs[i].strip()
    if not p or is_noise(p):
        continue
    m = header_re.match(p)
    if m:
        if cur and len(cur['lines']) > 0:
            parsed_raw_bhajans.append(cur)
        raag_name = m.group(2).strip()
        num_val = m.group(3) if m.group(3) else str(len(parsed_raw_bhajans) + 1)
        cur = {
            'raag': raag_name,
            'header': p,
            'num': num_val,
            'lines': []
        }
    elif cur:
        cur['lines'].append(p)

if cur and len(cur['lines']) > 0:
    parsed_raw_bhajans.append(cur)

print(f"Total raw bhajans found: {len(parsed_raw_bhajans)}")

# Clear old content/bhajans/
bhajans_dir = os.path.join(os.getcwd(), 'content', 'bhajans')
for f in os.listdir(bhajans_dir):
    if f.endswith('.json'):
        os.remove(os.path.join(bhajans_dir, f))

# Let's save categories.json
categories_file = os.path.join(os.getcwd(), 'content', 'categories.json')
cat_data = []
for c in CATEGORIES_DEF:
    cat_data.append({
        "id": c["id"],
        "slug": c["slug"],
        "name": c["name"],
        "romanName": c["romanName"],
        "description": c["description"],
        "displayOrder": c["displayOrder"],
        "updatedAt": "2026-10-25"
    })
with open(categories_file, 'w', encoding='utf-8') as f:
    json.dump(cat_data, f, indent=2, ensure_ascii=False)
print("Updated content/categories.json with 25 classical Raag categories.")

# Process and write bhajans
seen_slugs = set()
written_count = 0

for b_idx, b in enumerate(parsed_raw_bhajans):
    lines = b['lines']
    if not lines:
        continue
    
    # Title from first line
    first_line_clean = re.sub(r'\s*\([^)]*\)', '', lines[0]).strip().rstrip('.|,;')
    if not first_line_clean:
        first_line_clean = f"Bhajan {b['num']}"
    
    roman_title = first_line_clean
    devanagari_title = to_devanagari_text(roman_title)
    
    cat_id = map_raag_to_cat(b['raag'])
    
    # Create unique slug
    base_slug = slugify(roman_title)
    if not base_slug:
        base_slug = f"bhajan-{b_idx+1}"
    slug = base_slug
    collision_counter = 1
    while slug in seen_slugs:
        slug = f"{base_slug}-{b_idx+1}"
        if slug in seen_slugs:
            slug = f"{base_slug}-{b_idx+1}-{collision_counter}"
            collision_counter += 1
    seen_slugs.add(slug)
    
    # Build stanzas: group lines by 2 (couplets/strophes) or stanza markers
    roman_stanzas = []
    current_stanza = []
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue
        current_stanza.append(cleaned_line)
        # End of stanza usually marked by (Tek) or || n ||
        if '(tek)' in cleaned_line.lower() or re.search(r'\|\|\s*\d+[\s.]*\|\|', cleaned_line) or len(current_stanza) >= 2:
            roman_stanzas.append(current_stanza)
            current_stanza = []
    if current_stanza:
        roman_stanzas.append(current_stanza)
    
    # If no stanzas were formed, put all in 1
    if not roman_stanzas:
        roman_stanzas = [lines]
    
    # Generate devanagari stanzas
    devanagari_stanzas = []
    for st in roman_stanzas:
        dev_st = [to_devanagari_text(l) for l in st]
        devanagari_stanzas.append(dev_st)
        
    first_line_full = lines[0]
    if len(lines) > 1 and '(tek)' in lines[1].lower():
        first_line_full += " " + lines[1]
    
    # Tags
    tags = [cat_id.replace('raag-', ''), 'teunram', 'amarapur-vaani', 'bhajan']
    if 'naam' in first_line_full.lower(): tags.append('naam-simran')
    if 'guru' in first_line_full.lower(): tags.append('guru-bhakti')
    if 'prabhu' in first_line_full.lower() or 'dayal' in first_line_full.lower(): tags.append('prarthana')
    if 'aarti' in first_line_full.lower(): tags.append('aarti')
    
    bhajan_json = {
        "id": f"bhajan-{b_idx+1:04d}",
        "slug": slug,
        "categoryId": cat_id,
        "title": devanagari_title,
        "romanTitle": roman_title,
        "firstLine": first_line_full,
        "lyrics": devanagari_stanzas,
        "romanLyrics": roman_stanzas,
        "alternateSpellings": [b['header'], roman_title, devanagari_title],
        "tags": list(set(tags)),
        "displayOrder": b_idx + 1,
        "isDemo": False,
        "source": "Shri Amarapur Vaani — Sadguru Swami Teunram Ji Maharaj",
        "updatedAt": "2026-10-25"
    }
    
    file_path = os.path.join(bhajans_dir, f"{slug}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(bhajan_json, f, indent=2, ensure_ascii=False)
    written_count += 1

print(f"Successfully wrote {written_count} real bhajans into content/bhajans/!")
