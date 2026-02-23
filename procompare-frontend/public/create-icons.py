#!/usr/bin/env python3
"""
Generate PWA icons for ProConnectSA
Creates icon-192.png and icon-512.png with the ProConnectSA "P" logo
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL/Pillow not installed. Installing...")
    import subprocess
    subprocess.check_call(["pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

import os

# ProConnectSA brand colors
BRAND_BLUE = (37, 99, 235)  # #2563eb
WHITE = (255, 255, 255)

def generate_icon(size):
    """Generate an icon with ProConnectSA branding"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), BRAND_BLUE)
    draw = ImageDraw.Draw(img)
    
    # Calculate font size (60% of icon size)
    font_size = int(size * 0.6)
    
    # Try to use a bold font, fallback to default
    font = None
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",  # macOS
        "C:/Windows/Fonts/arialbd.ttf",  # Windows
    ]
    
    for font_path in font_paths:
        try:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, font_size)
                break
        except:
            continue
    
    if font is None:
        # Fallback to default font
        try:
            font = ImageFont.load_default()
        except:
            # Last resort - use built-in font
            font = ImageFont.load_default()
    
    # Get text bounding box to center it
    bbox = draw.textbbox((0, 0), 'P', font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Calculate position to center the text
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - bbox[1]
    
    # Draw white "P" with subtle shadow for depth
    # Shadow (slightly offset)
    shadow_offset = max(1, int(size * 0.01))
    draw.text((x + shadow_offset, y + shadow_offset), 'P', fill=(0, 0, 0, 50), font=font)
    # Main text
    draw.text((x, y), 'P', fill=WHITE, font=font)
    
    return img

if __name__ == "__main__":
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("🎨 Generating ProConnectSA PWA icons...")
    print(f"📂 Working directory: {script_dir}")
    
    # Generate icons
    icon192 = generate_icon(192)
    icon512 = generate_icon(512)
    
    # Save icons
    icon192_path = os.path.join(script_dir, 'icon-192.png')
    icon512_path = os.path.join(script_dir, 'icon-512.png')
    
    icon192.save(icon192_path, 'PNG')
    icon512.save(icon512_path, 'PNG')
    
    print("✅ Icons generated successfully!")
    print(f"📁 {icon192_path} (192x192)")
    print(f"📁 {icon512_path} (512x512)")
    print("\n✨ Icons are ready for your PWA!")
