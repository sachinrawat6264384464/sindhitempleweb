import json
import os
import re
import sys
import io
import unicodedata
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.append(r'd:\sindhi to hinenglish')
from pipeline.transliterator import DevanagariHinglishTransliterator

# 25 Canonical Raags
CANONICAL_RAAGS = [
    {"num": 1, "id": "raag-bhairav", "slug": "raag-bhairav", "name": "राग भैरव", "romanName": "Raag Bhairav", "expected": 12, "description": "Early morning devotional compositions invoking divine protection, humility, and prayer."},
    {"num": 2, "id": "raag-raamkali", "slug": "raag-raamkali", "name": "राग रामकली", "romanName": "Raag Raamkali", "expected": 20, "description": "Morning meditative compositions centered on Guru kripa, wisdom, and inner awakening."},
    {"num": 3, "id": "raag-prabhaati", "slug": "raag-prabhaati", "name": "राग प्रभाती", "romanName": "Raag Prabhaati", "expected": 30, "description": "Dawn awakening hymns encouraging spiritual seekers to rise for early morning simran."},
    {"num": 4, "id": "raag-aasaa", "slug": "raag-aasaa", "name": "राग आसा", "romanName": "Raag Aasaa", "expected": 96, "description": "Verses of spiritual hope, longing for the divine presence, and steadfast devotion."},
    {"num": 5, "id": "raag-vihaag", "slug": "raag-vihaag", "name": "राग विहाग", "romanName": "Raag Vihaag", "expected": 22, "description": "Late evening and night contemplative hymns of peace, introspection, and quiet surrender."},
    {"num": 6, "id": "raag-dhanaashri", "slug": "raag-dhanaashri", "name": "राग धनाश्री", "romanName": "Raag Dhanaashri", "expected": 12, "description": "Joyful expressions of gratitude, celebration of grace, and peaceful spiritual contentment."},
    {"num": 7, "id": "raag-tori", "slug": "raag-tori", "name": "राग तोड़ी", "romanName": "Raag Tori", "expected": 23, "description": "Earnest supplications expressing deep emotional longing and heartfelt humility."},
    {"num": 8, "id": "raag-bhairvi", "slug": "raag-bhairvi", "name": "राग भैरवी", "romanName": "Raag Bhairvi", "expected": 98, "description": "Classical devotional adoration, universal prayer, and evening congregational bhajans."},
    {"num": 9, "id": "raag-zilaa", "slug": "raag-zilaa", "name": "राग ज़िला", "romanName": "Raag Zilaa", "expected": 30, "description": "Lively folk-flavored devotional songs celebrating the divine name with rhythm and joy."},
    {"num": 10, "id": "raag-basant", "slug": "raag-basant", "name": "राग बसंत", "romanName": "Raag Basant", "expected": 20, "description": "Spring hymns celebrating spiritual blossoming, love for the True Master, and inner joy."},
    {"num": 11, "id": "raag-tilang", "slug": "raag-tilang", "name": "राग तिलंग", "romanName": "Raag Tilang", "expected": 98, "description": "Soul-stirring poetry of separation (viraha), love, and deep attachment to the Lord."},
    {"num": 12, "id": "raag-huseni", "slug": "raag-huseni", "name": "राग हुसैनी", "romanName": "Raag Huseni", "expected": 18, "description": "Sufi-influenced devotional verses on detachment (vairagya), transience of life, and truth."},
    {"num": 13, "id": "raag-kohiyaari", "slug": "raag-kohiyaari", "name": "राग कोहियारी", "romanName": "Raag Kohiyaari", "expected": 51, "description": "Traditional mountain and desert melodies of mystical surrender and spiritual searching."},
    {"num": 14, "id": "raag-sorath", "slug": "raag-sorath", "name": "राग सोरठ", "romanName": "Raag Sorath", "expected": 18, "description": "Heartfelt nighttime praise, humility, and seeking the refuge of the supreme protector."},
    {"num": 15, "id": "raag-khambhaat", "slug": "raag-khambhaat", "name": "राग खंभात", "romanName": "Raag Khambhaat", "expected": 22, "description": "Spiritual counsel urging the human soul to awaken from slumber and remember God."},
    {"num": 16, "id": "raag-maaru", "slug": "raag-maaru", "name": "राग मारू", "romanName": "Raag Maaru", "expected": 7, "description": "Heroic devotional verses inspiring courage on the spiritual path and truthful living."},
    {"num": 17, "id": "raag-saarang", "slug": "raag-saarang", "name": "राग सारंग", "romanName": "Raag Saarang", "expected": 13, "description": "Midday hymns offering cooling spiritual relief through the nectar of the holy Name."},
    {"num": 18, "id": "raag-purab", "slug": "raag-purab", "name": "राग पूरब", "romanName": "Raag Purab", "expected": 7, "description": "Classic eastern devotional hymns honoring the glory and sanctity of the holy preceptor."},
    {"num": 19, "id": "raag-kaamol", "slug": "raag-kaamol", "name": "राग कामोल", "romanName": "Raag Kaamol", "expected": 9, "description": "Intense devotion, loving surrender, and prayer for divine vision."},
    {"num": 20, "id": "raag-kalyaan", "slug": "raag-kalyaan", "name": "राग कल्याण", "romanName": "Raag Kalyaan", "expected": 23, "description": "Auspicious evening hymns invoking peace, blessings, and spiritual well-being."},
    {"num": 21, "id": "raag-kanso", "slug": "raag-kanso", "name": "राग कंसो", "romanName": "Raag Kanso", "expected": 18, "description": "Devotional adulations capturing divine sweetness, divine play (leela), and love."},
    {"num": 22, "id": "raag-pahaari", "slug": "raag-pahaari", "name": "राग पहाड़ी", "romanName": "Raag Pahaari", "expected": 74, "description": "Folk hymns inspired by natural beauty, simple devotion, and heartfelt sing-alongs."},
    {"num": 23, "id": "raag-pilaa", "slug": "raag-pilaa", "name": "राग पीला", "romanName": "Raag Pilaa", "expected": 90, "description": "Tender and poignant prayers celebrating unconditional divine mercy and sweet refuge."},
    {"num": 24, "id": "raag-maanjh", "slug": "raag-maanjh", "name": "राग मांझ", "romanName": "Raag Maanjh", "expected": 17, "description": "Authentic Sindhi Maanjh verses of profound love and yearning for the divine presence."},
    {"num": 25, "id": "raag-jog", "slug": "raag-jog", "name": "राग जोग", "romanName": "Raag Jog", "expected": 91, "description": "High yogic realization, oneness with the Supreme Soul, and liberation from illusion."}
]

RAAGS_MAP = {r["id"]: r for r in CANONICAL_RAAGS}

def detect_raag_id(heading: str):
    h = heading.lower()
    if 'भैरवी' in h or 'भेरवी' in h: return 'raag-bhairvi'
    if 'भैरव' in h: return 'raag-bhairav'
    if 'रामकली' in h: return 'raag-raamkali'
    if 'प्रभाती' in h: return 'raag-prabhaati'
    if 'आसा' in h: return 'raag-aasaa'
    if 'विहाग' in h: return 'raag-vihaag'
    if 'धनाश्री' in h: return 'raag-dhanaashri'
    if 'तोड़ी' in h or 'टोड़ी' in h: return 'raag-tori'
    if 'ज़िला' in h or 'जिला' in h: return 'raag-zilaa'
    if 'बसंत' in h or 'बसन्त' in h: return 'raag-basant'
    if 'तिलंग' in h: return 'raag-tilang'
    if 'हुसैनी' in h or 'हुसेनी' in h: return 'raag-huseni'
    if any(k in h for k in ['कोहियारी', 'कोदह्यारी', 'कोद्यारी', 'कोह्लारी', 'कोझारी', 'कोह्यारी', 'कोहाारी', 'कोह']):
        return 'raag-kohiyaari'
    if 'सोरठ' in h: return 'raag-sorath'
    if 'खंभात' in h or 'खम्भाट' in h: return 'raag-khambhaat'
    if 'मारू' in h: return 'raag-maaru'
    if 'सारंग' in h: return 'raag-saarang'
    if 'पूरब' in h: return 'raag-purab'
    if 'कामोद' in h or 'कामोल' in h: return 'raag-kaamol'
    if 'कल्याण' in h: return 'raag-kalyaan'
    if 'कानसो' in h or 'कंसो' in h: return 'raag-kanso'
    if 'पहाड़ी' in h: return 'raag-pahaari'
    if 'पीलू' in h or 'पीला' in h: return 'raag-pilaa'
    if 'मांझ' in h or 'माझ' in h or 'मॉझ' in h or 'माँझ' in h: return 'raag-maanjh'
    if 'जोग' in h: return 'raag-jog'
    return 'raag-bhairav'

def clean_hindi_text(line: str) -> str:
    if not line: return ""
    l = unicodedata.normalize('NFC', line.strip())
    # Clean OCR noise numbers and symbols
    l = re.sub(r'॥।\$॥।|।\$।।', '॥१॥', l)
    l = re.sub(r'॥।8॥।', '॥१॥', l)
    l = re.sub(r'।।३े।।', '॥३॥', l)
    l = re.sub(r'।।\s*४।॥।', '॥४॥', l)
    l = re.sub(r'\$', '१', l)
    l = re.sub(r'₹', '१', l)
    # Fix OCR attached colons
    l = re.sub(r'(?<!अन्तः)0?3:[589]0?', ' ॥३॥', l)
    # Normalize danda patterns
    l = re.sub(r'।।+|॥+', '॥', l)
    l = re.sub(r'[।॥\|\.\s]*([०-९\d])\s*[।॥\|\.\s]*$', r' ॥\1॥', l)
    l = re.sub(r'([^\s])॥', r'\1 ॥', l)
    l = re.sub(r'([^\s])।', r'\1 ।', l)
    l = re.sub(r'[ \t]+', ' ', l).strip()
    return l

def clean_title_hindi(raw_line: str) -> str:
    t = clean_hindi_text(raw_line)
    t = re.sub(r'(?:॥|।।|।)?\s*टेक\s*(?:॥|।।|।)?', '', t)
    t = re.sub(r'[।॥\|\.\d०-९]+$', '', t).strip()
    return t

def slugify(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r'[^a-z0-9\s-]', '', t)
    t = re.sub(r'[\s-]+', '-', t).strip('-')
    return t[:75]

def rebuild_all():
    print("=== STARTING MASTER REBUILD & VERIFICATION ===")
    
    transliterator = DevanagariHinglishTransliterator()
    
    # Load original Hindi data
    with open('amrapur_vani_hindi.json', 'r', encoding='utf-8') as f:
        raw_hindi_data = json.load(f)
    print(f"Loaded {len(raw_hindi_data)} bhajans from amrapur_vani_hindi.json")

    # 1. Clean, Categorize, and Verify
    category_buckets = {r['id']: [] for r in CANONICAL_RAAGS}
    
    for idx, b in enumerate(raw_hindi_data):
        heading = b.get('heading', '')
        cat_id = detect_raag_id(heading)
        category_buckets[cat_id].append(b)

    # Verify counts
    print("\nVerifying Raag Bhajan Counts:")
    for r in CANONICAL_RAAGS:
        cid = r['id']
        actual = len(category_buckets[cid])
        print(f"  {r['num']:2d}. {r['name']:<12} ({r['romanName']:<15}): {actual:3d} (expected {r['expected']:3d})")
        if actual != r['expected']:
            raise ValueError(f"FATAL: Raag count mismatch for {cid}: actual {actual} != expected {r['expected']}")

    print("\nAll 25 Raag counts match canonical definition 100%!")

    # 2. Build ordered bhajans list
    ordered_bhajans = []
    overall_order = 1
    
    for r in CANONICAL_RAAGS:
        cid = r['id']
        bhajans_in_cat = category_buckets[cid]
        for order_in_cat, b in enumerate(bhajans_in_cat, start=1):
            b_copy = dict(b)
            b_copy['cat_meta'] = r
            b_copy['orderInCategory'] = order_in_cat
            b_copy['overallOrder'] = overall_order
            ordered_bhajans.append(b_copy)
            overall_order += 1

    print(f"Total sequential bhajans prepared: {len(ordered_bhajans)}")

    # 3. Process each bhajan with clean Hindi and Hinglish
    hindi_final_list = []
    hinglish_final_list = []
    website_bhajans_list = []
    used_slugs = set()

    for b in ordered_bhajans:
        overall_num = b['overallOrder']
        order_in_cat = b['orderInCategory']
        cat = b['cat_meta']
        cat_id = cat['id']
        heading = b.get('heading', f"।। {cat['name']} भजन ।। {order_in_cat} ।।")
        page = b.get('pageInBook', 0)

        # 1. Clean Tek lines
        raw_tek = b.get('tek', [])
        clean_tek_hindi = [clean_hindi_text(line) for line in raw_tek if line.strip()]
        
        # 2. Clean Verses lines
        raw_verses = b.get('verses', [])
        clean_verses_hindi = []
        verses_lines_only_hindi = []

        for v_idx, v in enumerate(raw_verses, start=1):
            v_lines = v.get('lines', [])
            cleaned_lines = [clean_hindi_text(l) for l in v_lines if l.strip()]
            if cleaned_lines:
                clean_verses_hindi.append({
                    "verseNumber": v_idx,
                    "lines": cleaned_lines
                })
                verses_lines_only_hindi.append(cleaned_lines)

        # 3. Derive Titles
        first_line_candidate = clean_tek_hindi[0] if clean_tek_hindi else (
            verses_lines_only_hindi[0][0] if verses_lines_only_hindi else heading
        )
        hindi_title = clean_title_hindi(first_line_candidate)
        if not hindi_title:
            hindi_title = f"{cat['name']} भजन {order_in_cat}"

        roman_title = transliterator.transliterate_line(hindi_title)
        # Strip trailing punctuation from roman title
        roman_title = re.sub(r'[\.।\|\(\)]+$', '', roman_title).strip()
        if not roman_title:
            roman_title = f"{cat['romanName']} Bhajan {order_in_cat}"

        # 4. Generate unique slug
        base_slug = slugify(roman_title)
        if not base_slug or len(base_slug) < 3:
            base_slug = f"{cat['slug']}-bhajan-{order_in_cat}"
        slug = base_slug
        slug_counter = 1
        while slug in used_slugs:
            slug = f"{base_slug}-{slug_counter}"
            slug_counter += 1
        used_slugs.add(slug)

        # 5. Transliterate Tek and Verses to Hinglish
        clean_tek_roman = [transliterator.transliterate_line(l) for l in clean_tek_hindi]
        
        clean_verses_hinglish = []
        verses_lines_only_roman = []
        combined_verses = []

        for v_idx, v_hi in enumerate(clean_verses_hindi, start=1):
            hi_lines = v_hi['lines']
            ro_lines = [transliterator.transliterate_line(l) for l in hi_lines]
            clean_verses_hinglish.append({
                "verseNumber": v_idx,
                "lines": ro_lines
            })
            verses_lines_only_roman.append(ro_lines)
            combined_verses.append({
                "verseNumber": v_idx,
                "lines": hi_lines,
                "romanLines": ro_lines
            })

        # CRITICAL USER REQUIREMENT:
        # "to smaji se esme tak ko lyrices me nhi daahsma"
        # Tek is in `tek` and `romanTek`.
        # `lyrics` MUST contain ONLY the verse stanzas (`verses_lines_only_hindi`).
        # `romanLyrics` MUST contain ONLY the verse stanzas (`verses_lines_only_roman`).
        
        bhajan_id = f"bhajan-{overall_num:04d}"

        # Hindi Book Entry
        hindi_entry = {
            "id": bhajan_id,
            "order": overall_num,
            "orderInCategory": order_in_cat,
            "slug": slug,
            "categoryId": cat_id,
            "categoryName": cat["name"],
            "title": hindi_title,
            "firstLine": clean_tek_hindi[0] if clean_tek_hindi else (verses_lines_only_hindi[0][0] if verses_lines_only_hindi else hindi_title),
            "heading": heading,
            "pageInBook": page,
            "tek": clean_tek_hindi,
            "verses": clean_verses_hindi,
            "lyrics": verses_lines_only_hindi
        }

        # Hinglish Book Entry
        hinglish_entry = {
            "id": bhajan_id,
            "order": overall_num,
            "orderInCategory": order_in_cat,
            "slug": slug,
            "categoryId": cat_id,
            "romanCategoryName": cat["romanName"],
            "romanTitle": roman_title,
            "firstLine": clean_tek_roman[0] if clean_tek_roman else (verses_lines_only_roman[0][0] if verses_lines_only_roman else roman_title),
            "heading": transliterator.transliterate_line(heading),
            "pageInBook": page,
            "romanTek": clean_tek_roman,
            "verses": clean_verses_hinglish,
            "romanLyrics": verses_lines_only_roman
        }

        # Website Bhajan Entry
        website_entry = {
            "id": bhajan_id,
            "slug": slug,
            "categoryId": cat_id,
            "categoryName": cat["name"],
            "romanCategoryName": cat["romanName"],
            "title": hindi_title,
            "romanTitle": roman_title,
            "firstLine": clean_tek_roman[0] if clean_tek_roman else (verses_lines_only_roman[0][0] if verses_lines_only_roman else roman_title),
            "heading": heading,
            "tek": clean_tek_hindi,
            "romanTek": clean_tek_roman,
            "verses": combined_verses,
            "lyrics": verses_lines_only_hindi,
            "romanLyrics": verses_lines_only_roman,
            "alternateSpellings": [
                hindi_title,
                roman_title,
                f"{cat['name']} भजन {order_in_cat}",
                f"{cat['romanName']} Bhajan {order_in_cat}"
            ],
            "tags": [
                "shri-amarapur-vaani",
                "sadguru-swami-teunram",
                cat["slug"],
                "bhajan"
            ],
            "displayOrder": order_in_cat,
            "overallOrder": overall_num,
            "isDemo": False,
            "source": f"Shri Amarapur Vaani (Hindi Edition), Page {page}" if page else "Shri Amarapur Vaani",
            "updatedAt": "2026-10-26"
        }

        hindi_final_list.append(hindi_entry)
        hinglish_final_list.append(hinglish_entry)
        website_bhajans_list.append(website_entry)

    print(f"\nProcessed {len(hindi_final_list)} Hindi bhajans and {len(hinglish_final_list)} Hinglish bhajans.")

    # 4. Write master JSON files
    targets = [
        ('amrapur_vani_hindi.json', hindi_final_list),
        ('amrapur_vani_hinglish.json', hinglish_final_list),
        (os.path.join('content', 'amrapur_vani_hindi.json'), hindi_final_list),
        (os.path.join('content', 'amrapur_vani_hinglish.json'), hinglish_final_list)
    ]
    for path_str, data in targets:
        with open(path_str, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved: {path_str}")

    # 5. Write categories.json
    categories_export = []
    for r in CANONICAL_RAAGS:
        categories_export.append({
            "id": r["id"],
            "slug": r["slug"],
            "name": r["name"],
            "romanName": r["romanName"],
            "description": r["description"],
            "displayOrder": r["num"],
            "bhajanCount": r["expected"],
            "updatedAt": "2026-10-26"
        })
    cat_path = os.path.join('content', 'categories.json')
    with open(cat_path, 'w', encoding='utf-8') as f:
        json.dump(categories_export, f, ensure_ascii=False, indent=2)
    print(f"Saved: {cat_path}")

    # 6. Write all 919 individual bhajan files in content/bhajans/
    bhajans_dir = Path('content/bhajans')
    bhajans_dir.mkdir(parents=True, exist_ok=True)

    # Clean old files to prevent stale slugs
    for old_file in bhajans_dir.glob('*.json'):
        try:
            old_file.unlink()
        except Exception:
            pass

    for wb in website_bhajans_list:
        file_path = bhajans_dir / f"{wb['slug']}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(wb, f, ensure_ascii=False, indent=2)

    print(f"Exported {len(website_bhajans_list)} clean bhajan files into content/bhajans/")

    # 7. Generate public/search-index.json
    search_index = []
    for wb in website_bhajans_list:
        l_parts = wb["tek"] + [line for stanza in wb["lyrics"] for line in stanza]
        r_parts = wb["romanTek"] + [line for stanza in wb["romanLyrics"] for line in stanza]
        search_index.append({
            "id": wb["id"],
            "slug": wb["slug"],
            "categoryId": wb["categoryId"],
            "categoryName": wb["categoryName"],
            "title": wb["title"],
            "romanTitle": wb["romanTitle"],
            "firstLine": wb["firstLine"],
            "lyrics": " ".join(l_parts),
            "romanLyrics": " ".join(r_parts),
            "tags": wb["tags"],
            "displayOrder": wb["displayOrder"]
        })
    search_index_path = os.path.join('public', 'search-index.json')
    with open(search_index_path, 'w', encoding='utf-8') as f:
        json.dump(search_index, f, ensure_ascii=False, indent=2)
    print(f"Saved: {search_index_path} with {len(search_index)} items")

    print("\n=== REBUILD & VERIFICATION COMPLETE SUCCESSFULLY ===")

if __name__ == '__main__':
    rebuild_all()
