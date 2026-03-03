import json

def load_charmap(filepath: str) -> tuple[dict, dict]:
    """
    Loading the structured Character Mapping to get a decoder and encoder to hex and back
    """
    decode_map = {}
    encode_map = {}

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()

            # Skip comments and blank lines
            if not line or line.startswith("//"):
                continue

            # Handle lines like: 'A' = BB
            if '=' in line:
                parts = line.split('=')
                if len(parts) != 2:
                    continue

                left = parts[0].strip()
                right = parts[1].strip().split()[0]  # Only take the first byte if there are multiple

                # Extract character between quotes, e.g., 'A'
                if left.startswith("'") and left.endswith("'"):
                    char = left[1:-1]
                else:
                    continue  # Skip things like VERSION = ...

                try:
                    byte = int(right, 16)
                    decode_map[byte] = char
                    encode_map[char] = byte
                except ValueError:
                    continue  # Skip invalid hex values
    with open("data/TextMaps/text_decoder.json", "w") as f:
        json.dump(decode_map, f)

    with open("data/TextMaps/text_encoder.json", "w") as f:
        json.dump(encode_map, f)

    return decode_map, encode_map

d_map, e_map = load_charmap('.\data\TextMaps\charmap.txt')


