def load_charmap(filepath):
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

    return decode_map, encode_map

d_map, e_map = load_charmap('charmap.txt')
