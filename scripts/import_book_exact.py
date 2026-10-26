"""
Shri Amarapur Vaani - Exact Hindi & Phonetic Hinglish Importer
Parses original Devanagari text directly from conversion checkpoint,
properly distinguishes Tek (Refrain) from numbered verses,
generates accurate Hinglish transliterations, and exports content.
"""

import os
import sys
import re
import json
import unicodedata

# Import the transliterator from sindhi to hinenglish pipeline
sys.path.append(r'd:\sindhi to hinenglish')
from pipeline.transliterator import DevanagariHinglishTransliterator

# Canonical 25 Raags from Shri Amarapur Vaani
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

def map_raag_to_category_id(h_text: str) -> str:
    h = h_text.lower()
    if 'भैरव' in h or 'bhairav' in h:
        if 'भैरवी' in h or 'भेरवी' in h or 'bhairvi' in h or 'bhervi' in h:
            return 'raag-bhairvi'
        return 'raag-bhairav'
    if 'भैरवी' in h or 'भेरवी' in h or 'bhairvi' in h or 'bhervi' in h: return 'raag-bhairvi'
    if 'रामकली' in h or 'raamkali' in h or 'ramkali' in h: return 'raag-raamkali'
    if 'प्रभाती' in h or 'prabhaati' in h or 'prabhati' in h: return 'raag-prabhaati'
    if 'आसा' in h or 'aasaa' in h or 'asa' in h: return 'raag-aasaa'
    if 'विहाग' in h or 'vihaag' in h or 'vihag' in h: return 'raag-vihaag'
    if 'धनाश्री' in h or 'dhanaashri' in h or 'dhanashri' in h: return 'raag-dhanaashri'
    if 'तोड़ी' in h or 'टोड़ी' in h or 'tori' in h or 'todi' in h: return 'raag-tori'
    if 'ज़िला' in h or 'जिला' in h or 'zilaa' in h or 'zila' in h: return 'raag-zilaa'
    if 'बसंत' in h or 'बसन्त' in h or 'basant' in h: return 'raag-basant'
    if 'तिलंग' in h or 'tilang' in h: return 'raag-tilang'
    if 'हुसैनी' in h or 'हुसेनी' in h or 'huseni' in h or 'husaini' in h: return 'raag-huseni'
    if 'कोहियारी' in h or 'कोझारी' in h or 'कोह्लारी' in h or 'koh' in h: return 'raag-kohiyaari'
    if 'सोरठ' in h or 'sorath' in h: return 'raag-sorath'
    if 'खंभात' in h or 'खम्भाट' in h or 'khambhaat' in h: return 'raag-khambhaat'
    if 'मारू' in h or 'maaru' in h or 'maru' in h: return 'raag-maaru'
    if 'सारंग' in h or 'saarang' in h: return 'raag-saarang'
    if 'पूरब' in h or 'purab' in h: return 'raag-purab'
    if 'कामोद' in h or 'कामोल' in h or 'kaamol' in h: return 'raag-kaamol'
    if 'कल्याण' in h or 'kalyaan' in h: return 'raag-kalyaan'
    if 'कानसो' in h or 'कंसो' in h or 'kanso' in h: return 'raag-kanso'
    if 'पहाड़ी' in h or 'pahaari' in h or 'pahari' in h: return 'raag-pahaari'
    if 'पीलू' in h or 'पीला' in h or 'pilaa' in h: return 'raag-pilaa'
    if 'मांझ' in h or 'maanjh' in h or 'माझ' in h: return 'raag-maanjh'
    if 'जोग' in h or 'jog' in h: return 'raag-jog'
    return 'raag-bhairav'

def is_header_or_noise(line: str) -> bool:
    l = line.strip()
    if not l: return True
    if re.search(r'^(?:[।॥\|\.\s]*)(?:ॐ|ओ३म्|35|3०|३०|3|३)?\s*सत्?‌?नाम\s*साक्षी[।॥\|\.\s]*$', l):
        return True
    if l in ['श्री अमरापुर वाणी', 'अमरापुर वाणी', '॥ श्री अमरापुर वाणी ॥']:
        return True
    if re.match(r'^(?:राग\s+[^\d]+भजन\s+)?श्री\s+अमरापुर\s+वाणी$', l):
        return True
    if re.match(r'^\d+$', l):
        return True
    if len(l) <= 2 and not any(c in l for c in '०१२३४५६७८९'):
        return True
    return False

def is_bhajan_heading(line: str) -> bool:
    l = line.strip()
    return bool(re.search(r'राग\s+[^\d\n]+भजन', l) or (re.search(r'॥\s*राग\s+', l) and re.search(r'\d|[०-९]', l)))

def clean_hindi_line(line: str) -> str:
    l = line.strip()
    # Normalize unicode
    l = unicodedata.normalize('NFC', l)
    # Fix common OCR artifacts
    l = re.sub(r'॥।\$॥।|।\$।।', '॥१॥', l)
    l = re.sub(r'॥।8॥।', '॥१॥', l)
    l = re.sub(r'।।३े।।', '॥३॥', l)
    l = re.sub(r'।।\s*४।॥।', '॥४॥', l)
    # Normalize danda patterns
    l = re.sub(r'।।+|॥+', '॥', l)
    l = re.sub(r'([^\s])॥', r'\1 ॥', l)
    l = re.sub(r'([^\s])।', r'\1 ।', l)
    # Clean whitespace
    l = re.sub(r'[ \t]+', ' ', l).strip()
    return l

def parse_bhajan_parts(lines: list[str]):
    tek_lines = []
    verses = []
    current_verse_lines = []
    found_tek_end = False
    
    verse_marker_pat = re.compile(r'[।॥\|][।॥\|\.\s]*([०-९\d\$])')
    
    for raw_l in lines:
        cleaned = clean_hindi_line(raw_l)
        if not cleaned:
            continue
            
        if not found_tek_end:
            tek_lines.append(cleaned)
            if 'टेक' in cleaned:
                found_tek_end = True
        else:
            current_verse_lines.append(cleaned)
            if verse_marker_pat.search(cleaned):
                verses.append(current_verse_lines)
                current_verse_lines = []
                
    if current_verse_lines:
        verses.append(current_verse_lines)
        
    return tek_lines, verses

def slugify(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r'[^a-z0-9\s-]', '', t)
    t = re.sub(r'[\s-]+', '-', t).strip('-')
    return t[:80]

def main():
    checkpoint_path = r'd:\sindhi to hinenglish\.cache\conversion_checkpoint.json'
    if not os.path.exists(checkpoint_path):
        print(f"Error: checkpoint file not found at {checkpoint_path}")
        return

    print("Loading conversion checkpoint...")
    with open(checkpoint_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    completed = data.get('completed_pages', {})
    print(f"Loaded {len(completed)} pages.")

    transliterator = DevanagariHinglishTransliterator()

    # 1. Segment raw stream into bhajans
    raw_bhajans = []
    current_bhajan = None

    for p_idx in range(25, len(completed)):
        p = completed.get(str(p_idx), {})
        orig = p.get('original_text', '')
        for line in orig.split('\n'):
            l = line.strip()
            if not l or is_header_or_noise(l):
                continue
            
            if is_bhajan_heading(l):
                if current_bhajan:
                    raw_bhajans.append(current_bhajan)
                current_bhajan = {
                    'start_page': p_idx,
                    'heading': l,
                    'lines': []
                }
            elif current_bhajan:
                current_bhajan['lines'].append(l)

    if current_bhajan:
        raw_bhajans.append(current_bhajan)

    print(f"Segmented {len(raw_bhajans)} bhajans from book.")

    output_dir = r'd:\sindhi website\content\bhajans'
    os.makedirs(output_dir, exist_ok=True)

    imported_count = 0
    categories_map = {c['id']: c for c in CATEGORIES_DEF}
    category_counts = {c['id']: 0 for c in CATEGORIES_DEF}

    used_slugs = set()

    for idx, raw_b in enumerate(raw_bhajans):
        heading = raw_b['heading']
        cat_id = map_raag_to_category_id(heading)
        cat_obj = categories_map.get(cat_id, CATEGORIES_DEF[0])
        category_counts[cat_id] += 1
        order_in_cat = category_counts[cat_id]

        tek_lines, verses_lines = parse_bhajan_parts(raw_b['lines'])
        if not tek_lines and not verses_lines:
            continue

        # Extract title from the first line of Tek or first verse
        first_line_raw = tek_lines[0] if tek_lines else (verses_lines[0][0] if verses_lines else heading)
        # Clean title for display (strip dandas, tek markers, punctuation)
        clean_title = re.sub(r'(?:॥|।।|।)?\s*टेक\s*(?:॥|।।|।)?', '', first_line_raw)
        clean_title = re.sub(r'[।॥\|\.\d०-९]+$', '', clean_title).strip()
        if not clean_title:
            clean_title = f"{cat_obj['name']} भजन {order_in_cat}"

        roman_title = transliterator.transliterate_line(clean_title)
        if not roman_title:
            roman_title = f"{cat_obj['romanName']} Bhajan {order_in_cat}"

        # Generate slug
        base_slug = slugify(roman_title)
        if not base_slug:
            base_slug = f"{cat_obj['slug']}-bhajan-{order_in_cat}"
        slug = base_slug
        slug_counter = 1
        while slug in used_slugs:
            slug = f"{base_slug}-{slug_counter}"
            slug_counter += 1
        used_slugs.add(slug)

        # Transliterate Tek
        roman_tek = [transliterator.transliterate_line(l) for l in tek_lines]

        # Transliterate Verses
        structured_verses = []
        roman_verses_lines = []
        for v_idx, v_lines in enumerate(verses_lines):
            r_v_lines = [transliterator.transliterate_line(l) for l in v_lines]
            roman_verses_lines.append(r_v_lines)
            structured_verses.append({
                "verseNumber": v_idx + 1,
                "lines": v_lines,
                "romanLines": r_v_lines
            })

        # Assemble full lyrics stanzas (where lyrics[0] is Tek, followed by verses)
        full_lyrics = [tek_lines] + verses_lines if tek_lines else verses_lines
        full_roman_lyrics = [roman_tek] + roman_verses_lines if roman_tek else roman_verses_lines

        bhajan_id = f"bhajan-{idx+1:04d}"

        bhajan_record = {
            "id": bhajan_id,
            "slug": slug,
            "categoryId": cat_id,
            "categoryName": cat_obj["name"],
            "romanCategoryName": cat_obj["romanName"],
            "title": clean_title,
            "romanTitle": roman_title,
            "firstLine": roman_tek[0] if roman_tek else (full_roman_lyrics[0][0] if full_roman_lyrics else roman_title),
            "heading": heading,
            "tek": tek_lines,
            "romanTek": roman_tek,
            "verses": structured_verses,
            "lyrics": full_lyrics,
            "romanLyrics": full_roman_lyrics,
            "alternateSpellings": [
                clean_title,
                roman_title,
                f"{cat_obj['name']} भजन {order_in_cat}",
                f"{cat_obj['romanName']} Bhajan {order_in_cat}"
            ],
            "tags": [
                "shri-amarapur-vaani",
                "sadguru-swami-teunram",
                cat_obj["slug"],
                "devotional-bhajan"
            ],
            "displayOrder": order_in_cat,
            "overallOrder": idx + 1,
            "startPage": raw_b["start_page"],
            "isDemo": False,
            "source": "Shri Amarapur Vaani (Hindi Edition) — Sadguru Swami Teunram Ji Maharaj",
            "updatedAt": "2026-10-26"
        }

        file_path = os.path.join(output_dir, f"{slug}.json")
        with open(file_path, 'w', encoding='utf-8') as f_out:
            json.dump(bhajan_record, f_out, ensure_ascii=False, indent=2)

        imported_count += 1

    print(f"Successfully exported {imported_count} bhajans to {output_dir}")

    # Export canonical categories.json
    categories_json_path = r'd:\sindhi website\content\categories.json'
    categories_export = []
    for c in CATEGORIES_DEF:
        categories_export.append({
            "id": c["id"],
            "slug": c["slug"],
            "name": c["name"],
            "romanName": c["romanName"],
            "description": c["description"],
            "displayOrder": c["displayOrder"],
            "bhajanCount": category_counts[c["id"]],
            "updatedAt": "2026-10-26"
        })
    with open(categories_json_path, 'w', encoding='utf-8') as f_cat:
        json.dump(categories_export, f_cat, ensure_ascii=False, indent=2)
    print(f"Updated categories.json with accurate counts.")

if __name__ == '__main__':
    main()
