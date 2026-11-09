from PIL import Image, ImageDraw, ImageFont
import os

assets_dir = r"C:\Users\Dorp\.gemini\antigravity\scratch\minesweeper-xp-source\demo"
os.makedirs(assets_dir, exist_ok=True)

# 1. Hero Banner (1200x500)
hero = Image.new("RGBA", (1200, 500), (10, 14, 26, 255))
draw = ImageDraw.Draw(hero)

# Gradient background
for y in range(500):
    r = int(10 + (25 - 10) * (y / 500))
    g = int(14 + (35 - 14) * (y / 500))
    b = int(26 + (55 - 26) * (y / 500))
    draw.line([(0, y), (1200, y)], fill=(r, g, b, 255))

# Cyberpunk / Neon grid lines
for x in range(0, 1200, 40):
    draw.line([(x, 0), (x, 500)], fill=(0, 240, 255, 18), width=1)
for y in range(0, 500, 40):
    draw.line([(0, y), (1200, y)], fill=(0, 240, 255, 18), width=1)

# Title & Badges
try:
    font_large = ImageFont.truetype("arialbd.ttf", 46)
    font_sub = ImageFont.truetype("arial.ttf", 22)
    font_pill = ImageFont.truetype("arialbd.ttf", 14)
except:
    font_large = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_pill = ImageFont.load_default()

draw.text((60, 60), "💣 MINESWEEPER ULTRA 4K", fill=(0, 229, 255, 255), font=font_large)
draw.text((60, 120), "The Modern Remaster: 4K High-DPI • AI Solver • Shields • Sonar Drone • Cyberpunk & Fluent Themes", fill=(203, 213, 225, 255), font=font_sub)

# Feature Badges
badges = [
    ("4K ULTRA READY", (37, 99, 235)),
    ("SMART AI SOLVER", (22, 163, 74)),
    ("SHIELD DEFENSE", (147, 51, 234)),
    ("SONAR RADAR", (234, 88, 12)),
    ("SYNTH AUDIO", (225, 29, 72)),
    ("PORTABLE EXE", (13, 148, 136)),
]

bx = 60
for text, color in badges:
    draw.rounded_rectangle([bx, 175, bx + 160, 208], radius=6, fill=color)
    draw.text((bx + 14, 183), text, fill=(255, 255, 255, 255), font=font_pill)
    bx += 175

# Mockup Card 1: Windows 11 Fluent Glass Preview
draw.rounded_rectangle([60, 240, 580, 460], radius=12, fill=(22, 27, 34, 230), outline=(255, 255, 255, 40), width=1)
draw.text((80, 255), "💎 Windows 11 Fluent Glass Edition", fill=(241, 245, 249), font=font_sub)
draw.text((80, 290), "• Frosted acrylic backdrop & smooth vector SVG tiles", fill=(148, 163, 184), font=font_pill)
draw.text((80, 315), "• Fullscreen 4K scaling up to 300% without blur", fill=(148, 163, 184), font=font_pill)
draw.text((80, 340), "• Hardware-accelerated canvas victory confetti", fill=(148, 163, 184), font=font_pill)
draw.text((80, 365), "• Screen-shake mine detonation shockwaves", fill=(148, 163, 184), font=font_pill)

# Mockup Card 2: AI & Super Arcade Powers
draw.rounded_rectangle([620, 240, 1140, 460], radius=12, fill=(15, 23, 42, 230), outline=(0, 240, 255, 60), width=1)
draw.text((640, 255), "⚡ Super Arcade Power-ups", fill=(0, 240, 255), font=font_sub)
draw.text((640, 290), "• 🛡️ Defuse Shield: Automatically absorbs fatal mine clicks", fill=(148, 163, 184), font=font_pill)
draw.text((640, 315), "• 📡 Sonar Drone: Sweeps and unlocks guaranteed safe sectors", fill=(148, 163, 184), font=font_pill)
draw.text((640, 340), "• 💡 AI Constraint Solver: Highlights safe tiles in real-time", fill=(148, 163, 184), font=font_pill)
draw.text((640, 365), "• ↩️ Time Machine Undo: Recover from any mistake instantly", fill=(148, 163, 184), font=font_pill)

hero.save(os.path.join(assets_dir, "preview-hero.png"))
print("Saved preview-hero.png")

# 2. Themes Showcase Banner (1000x420)
themes = Image.new("RGBA", (1000, 420), (15, 17, 26, 255))
tdraw = ImageDraw.Draw(themes)

tdraw.text((40, 30), "🎨 6 Retro & Modern Themes Included", fill=(255, 255, 255), font=font_large)

theme_cards = [
    ("Windows 11 Fluent 4K", "Modern Glassmorphism & SVG Icons", (30, 41, 59), (56, 189, 248), 40, 100),
    ("Cyberpunk Neon HUD", "Glowing Synthwave & Matrix Grid", (6, 9, 19), (0, 240, 255), 360, 100),
    ("XP Royale Noir", "Dark Charcoal & Deep Blue Accents", (37, 37, 37), (249, 115, 22), 680, 100),
    ("Classic XP Luna", "Authentic 2001 Windows XP Nostalgia", (236, 233, 216), (22, 96, 232), 40, 250),
    ("Windows 98 Classic", "Iconic Gray Bevels & MS Sans Serif", (192, 192, 192), (0, 0, 128), 360, 250),
    ("Windows 3.1 Retro", "Ultra-Retro 16-color 1992 Aesthetic", (255, 255, 255), (0, 0, 0), 680, 250),
]

for title, desc, bg, border_col, tx, ty in theme_cards:
    tdraw.rounded_rectangle([tx, ty, tx + 280, ty + 120], radius=8, fill=bg, outline=border_col, width=2)
    # Text color contrast
    tcol = (20, 20, 20) if bg[0] > 180 else (255, 255, 255)
    dcol = (80, 80, 80) if bg[0] > 180 else (148, 163, 184)
    tdraw.text((tx + 16, ty + 25), title, fill=tcol, font=font_pill)
    tdraw.text((tx + 16, ty + 55), desc, fill=dcol, font=font_pill)

themes.save(os.path.join(assets_dir, "preview-themes.png"))
print("Saved preview-themes.png")

