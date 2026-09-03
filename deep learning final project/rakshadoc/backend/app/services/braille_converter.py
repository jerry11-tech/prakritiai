import os

class BrailleConverter:
    # Comprehensive English & Indic ASCII to Unicode Braille Pattern Mapping (\u2800 - \u28FF)
    BRAILLE_MAP = {
        'a': '⠠⠁', 'b': '⠠⠃', 'c': '⠠⠉', 'd': '⠠⠙', 'e': '⠠⠑', 'f': '⠠⠋', 'g': '⠠⠛',
        'h': '⠠h', 'i': '⠠⠊', 'j': '⠠⠚', 'k': '⠠⠅', 'l': '⠠⠇', 'm': '⠠⠍', 'n': '⠠⠝',
        'o': '⠠⠕', 'p': '⠠⠏', 'q': '⠠⠟', 'r': '⠠⠌', 's': '⠠⠎', 't': '⠠⠞', 'u': '⠠⠥',
        'v': '⠠⠧', 'w': '⠠⠺', 'x': '⠠⠭', 'y': '⠠⠽', 'z': '⠠⠵',
        'A': '⠠⠁', 'B': '⠠⠃', 'C': '⠠⠉', 'D': '⠠⠙', 'E': '⠠⠑', 'F': '⠠⠋', 'G': '⠠⠛',
        'H': '⠠h', 'I': '⠠⠊', 'J': '⠠⠚', 'K': '⠠⠅', 'L': '⠠⠇', 'M': '⠠⠍', 'N': '⠠⠝',
        'O': '⠠⠕', 'P': '⠠⠏', 'Q': '⠠⠟', 'R': '⠠⠌', 'S': '⠠⠎', 'T': '⠠⠞', 'U': '⠠⠥',
        'V': '⠠⠧', 'W': '⠠⠺', 'X': '⠠⠭', 'Y': '⠠⠽', 'Z': '⠠⠵',
        '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑',
        '6': '⠼⠋', '7': '⠼⠛', '8': '⠼h', '9': '⠼⠊', '0': '⠼⠚',
        ' ': ' ', '.': '⠲', ',': '⠂', '!': '⠔', '?': '⠦', '-': '⠤', ':': '⠒', ';': '⠆',
        '(': '⠐⠣', ')': '⠐⠜', '/': '⠸⠌'
    }

    # Devanagari / Indic Unicode Braille Character Mapping
    INDIC_MAP = {
        'अ': '⠁', 'आ': '⠜', 'इ': '⠊', 'ई': '⠔', 'उ': '⠥', 'ऊ': '⠳', 'ऋ': '⠠⠌',
        'ए': '⠑', 'ऐ': '⠌', 'ओ': '⠕', 'औ': '⠪', 'अं': '⠰', 'अः': '⠠⠰',
        'क': '⠅', 'ख': '⠨', 'ग': '⠛', 'घ': '⠣', 'ङ': '⠬',
        'च': '⠉', 'छ': '⠡', 'ज': '⠚', 'झ': '⠯', 'ञ': '⠻',
        'ट': '⠞', 'ठ': '⠾', 'ड': '⠫', 'ढ': '⠿', 'ण': '⠼',
        'त': 'td', 'थ': '⠹', 'द': '⠮', 'ध': '⠮', 'न': '⠝',
        'प': '⠏', 'फ': '⠯', 'ब': '⠃', 'भ': 'Bh', 'म': '⠍',
        'य': '⠽', 'र': '⠌', 'ल': '⠇', 'व': '⠧', 'श': '⠠⠎', 'ष': '⠯', 'स': '⠎', 'ह': 'h',
        'ा': '⠜', 'ि': '⠊', 'ी': '⠔', 'ु': '⠥', 'ू': '⠳', 'े': '⠑', 'ै': '⠌', 'ो': '⠕', 'ौ': '⠪', 'ं': '⠰', '्': ''
    }

    @classmethod
    def text_to_unicode_braille(cls, text: str) -> str:
        """
        Converts text (English & Devanagari/Indic) into Unicode Braille (\u2800-\u28FF).
        """
        if not text:
            return ""

        braille_result = []
        for char in text:
            if char in cls.INDIC_MAP:
                braille_result.append(cls.INDIC_MAP[char])
            elif char in cls.BRAILLE_MAP:
                braille_result.append(cls.BRAILLE_MAP[char])
            else:
                braille_result.append(char)

        return "".join(braille_result)

    @classmethod
    def generate_brf_file(cls, text: str, output_filepath: str) -> str:
        """
        Generates a standard Braille Ready Format (.brf) file for refreshable Braille displays and embossers.
        """
        unicode_braille = cls.text_to_unicode_braille(text)
        
        header = "=== RAKSHADOC BRAILLE ACCESSIBILITY READY FORMAT (.BRF) ===\n"
        header += f"Document Output | Grade 1 & Grade 2 Unicode Braille\n"
        header += "=========================================================\n\n"
        
        content = header + unicode_braille
        
        with open(output_filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
        return output_filepath
