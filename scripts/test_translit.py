import sys
sys.path.append('scripts')
from inspect_book import parse_docx
import re
import json

# Comprehensive Roman to Devanagari transliterator
def roman_to_devanagari(text):
    if not text:
        return ""
    
    # Common word replacements for high accuracy on devotional terms
    word_map = {
        'guru': 'गुरु', 'sadguru': 'सद्गुरु', 'satguru': 'सतगुरु', 'dayal': 'दयाल',
        'pratipal': 'प्रतिपाल', 'prabhu': 'प्रभु', 'paar': 'पार', 'taaro': 'तारो',
        'hari': 'हरि', 'daas': 'दास', 'main': 'मैं', 'tumhaaro': 'तुम्हारो',
        'tek': 'टेक', 'adol': 'अडोल', 'abol': 'अबोल', 'amol': 'अमोल',
        'saaro': 'सारो', 'akaal': 'अकाल', 'sarvakaal': 'सर्वकाल', 'kathin': 'कठिन',
        'kaal': 'काल', 'sarv': 'सर्व', 'saar': 'सार', 'sataar': 'सतार',
        'agam': 'अगम', 'apaaro': 'अपारो', 'nirhankaar': 'निरहंकार', 'nirvikaar': 'निर्विकार',
        'naam': 'नाम', 'de': 'दे', 'ubaaro': 'उबारो', 'jiv': 'जीव', 'pind': 'पिंड',
        'brahmand': 'ब्रह्मांड', 'tav': 'तव', 'pasaaro': 'पसारो', 'param': 'परम',
        'chand': 'चंद', 'he': 'हे', 'akhand': 'अखंड', 'naath': 'नाथ',
        'mohi': 'मोहि', 'sudhaaron': 'सुधारो', 'vishwapal': 'विश्वपाल', 'tum': 'तुम',
        'gopal': 'गोपाल', 'hun': 'हूँ', 'baal': 'बाल', 'thaaro': 'थारो',
        'kahe': 'कहे', 'teun': 'तेऊँ', 'taap': 'ताप', 'tin': 'तिन',
        'paap': 'पाप', 'sab': 'सब', 'nivaaro': 'निवारो', 'bhakti': 'भक्ति',
        'jnyaan': 'ज्ञान', 'daan': 'दान', 'dehi': 'देही', 'din': 'दीन',
        'ke': 'के', 'ji': 'जी', 'abuddh': 'अबुध', 'vaam': 'वाम',
        'dhaam': 'धाम', 'sut': 'सुत', 'n': 'न', 'mangun': 'माँगूँ',
        'nahin': 'नहीं', 'ratan': 'रतन', 'laal': 'लाल', 'abhay': 'अभय',
        'haro': 'हरो', 'riddhi': 'ऋद्धि', 'siddhi': 'सिद्धि', 'maal': 'माल',
        'saadh': 'साध', 'sangti': 'संगति', 'sev': 'सेव', 'tor': 'तोड़',
        'jagat': 'जगत', 'jaal': 'जाल', 'raaj': 'राज', 'taaj': 'ताज',
        'naahin': 'नाहीं', 'vishay': 'विषय', 'sukh': 'सुख', 'vishaal': 'विशाल',
        'dharm': 'धर्म', 'dayaa': 'दया', 'dhir': 'धीर', 'karo': 'करो',
        'ur': 'उर', 'ujaal': 'उजाल', 'svarg': 'स्वर्ग', 'pad': 'पद',
        'kahat': 'कहत', 'nazar': 'नज़र', 'dhare': 'धरे', 'kar': 'कर',
        'nihaal': 'निहाल', 'shri': 'श्री', 'om': 'ॐ', 'satnam': 'सतनाम',
        'saakshi': 'साक्षी', 'prem': 'प्रेम', 'prakash': 'प्रकाश', 'raag': 'राग',
        'bhairav': 'भैरव', 'bhajan': 'भजन', 'doha': 'दोहा', 'chhand': 'छंद',
        'sant': 'संत', 'satsang': 'सत्संग', 'raam': 'राम', 'shiv': 'शिव',
        'aarti': 'आरती', 'vandana': 'वंदना', 'prarthana': 'प्रार्थना', 'dhun': 'धुन'
    }

    words = text.split(' ')
    trans_words = []
    for w in words:
        clean_w = re.sub(r'[^a-zA-Z]', '', w).lower()
        punct_prefix = re.match(r'^[^a-zA-Z]*', w).group(0)
        punct_suffix = re.search(r'[^a-zA-Z]*$', w).group(0)
        if clean_w in word_map:
            trans_words.append(punct_prefix + word_map[clean_w] + punct_suffix)
        else:
            # Simple phonetic fallback for other words
            # Let's do basic character transliteration
            t = clean_w
            t = t.replace('sh', 'श').replace('ch', 'च').replace('th', 'थ').replace('dh', 'ध')
            t = t.replace('kh', 'ख').replace('gh', 'घ').replace('bh', 'भ').replace('jh', 'झ')
            t = t.replace('ph', 'फ').replace('aa', 'ा').replace('ee', 'ी').replace('ii', 'ी')
            t = t.replace('oo', 'ू').replace('uu', 'ू').replace('ai', 'ै').replace('au', 'ौ')
            t = t.replace('k', 'क').replace('g', 'ग').replace('j', 'ज').replace('t', 'त')
            t = t.replace('d', 'द').replace('n', 'न').replace('p', 'प').replace('b', 'ब')
            t = t.replace('m', 'म').replace('y', 'य').replace('r', 'र').replace('l', 'ल')
            t = t.replace('v', 'व').replace('s', 'स').replace('h', 'ह')
            t = t.replace('a', '').replace('i', 'ि').replace('u', 'ु').replace('e', 'े').replace('o', 'ो')
            trans_words.append(punct_prefix + (t if t else clean_w) + punct_suffix)
            
    return ' '.join(trans_words)

# Test transliteration on line 1
sample = "Guru Dayal Pratipal Prabhu Paar Taaro. Prabhu Paar Taaro Hari Daas Main Tumhaaro (Tek)."
print("Original:", sample)
print("Devanagari:", roman_to_devanagari(sample))
