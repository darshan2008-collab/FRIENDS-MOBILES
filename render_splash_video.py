import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio

WIDTH = 1080
HEIGHT = 1920
FPS = 60
TOTAL_SECONDS = 3.5
TOTAL_FRAMES = int(FPS * TOTAL_SECONDS)

# Color Palette (Ultra-Clean Studio Aesthetic)
BG_COLOR = (248, 249, 251)
TEXT_DARK = (24, 27, 34)
ORANGE_PRIMARY = (255, 85, 0)
ORANGE_GLOW = (255, 120, 30)

# Load Logo
LOGO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'logo.png')
orig_logo = Image.open(LOGO_PATH).convert('RGBA')

# Pre-render clean circular cropped logo
logo_dim = 200
logo_cropped = orig_logo.resize((logo_dim, logo_dim), Image.Resampling.LANCZOS)
mask = Image.new('L', (logo_dim, logo_dim), 0)
draw_mask = ImageDraw.Draw(mask)
draw_mask.ellipse((0, 0, logo_dim - 1, logo_dim - 1), fill=255)
logo_circular = Image.new('RGBA', (logo_dim, logo_dim), (0, 0, 0, 0))
logo_circular.paste(logo_cropped, (0, 0), mask)

# Fonts
font_path = "C:/Windows/Fonts/segoeuib.ttf"
if not os.path.exists(font_path):
    font_path = "C:/Windows/Fonts/arialbd.ttf"

font_title = ImageFont.truetype(font_path, 72)
font_sub = ImageFont.truetype(font_path, 72)

# Output paths
artifact_dir = r"C:\Users\ELCOT\.gemini\antigravity-ide\brain\212308cb-5dba-460a-b10b-3657195b3505"
os.makedirs(artifact_dir, exist_ok=True)
output_artifact_mp4 = os.path.join(artifact_dir, "friends_mobile_splash.mp4")
output_public_mp4 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "friends_mobile_splash.mp4")

# Precompute static background gradient
bg_img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
bg_draw = ImageDraw.Draw(bg_img)
# Soft center studio lighting radial gradient
for r in range(700, 0, -10):
    alpha = int((1.0 - (r / 700.0)) * 25)
    c = 255
    bg_draw.ellipse(
        (WIDTH // 2 - r, HEIGHT // 2 - r, WIDTH // 2 + r, HEIGHT // 2 + r),
        fill=(min(255, BG_COLOR[0] + alpha), min(255, BG_COLOR[1] + alpha), min(255, BG_COLOR[2] + alpha))
    )

def ease_out_back(t):
    c1 = 1.70158
    c3 = c1 + 1.0
    return 1.0 + c3 * math.pow(t - 1.0, 3) + c1 * math.pow(t - 1.0, 2)

def ease_out_cubic(t):
    return 1.0 - math.pow(1.0 - t, 3)

def ease_in_out_sine(t):
    return -(math.cos(math.pi * t) - 1.0) / 2.0

writer = imageio.get_writer(output_artifact_mp4, fps=FPS, codec='libx264', quality=9, pixelformat='yuv420p')

print(f"Rendering {TOTAL_FRAMES} frames into {output_artifact_mp4}...")

CENTER_Y = HEIGHT // 2 - 40
TARGET_LOGO_X = WIDTH // 2 - 250
TARGET_TEXT_X = WIDTH // 2 - 120

for frame_idx in range(TOTAL_FRAMES):
    time_s = frame_idx / FPS
    frame = bg_img.copy()
    
    # Base canvas for composition
    comp = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    comp_draw = ImageDraw.Draw(comp)

    # -------------------------------------------------------------
    # Stage 1: Logo Elastic Bounce In (0s -> 0.7s, frames 0 -> 42)
    # -------------------------------------------------------------
    if frame_idx < 42:
        progress = frame_idx / 42.0
        scale = max(0.01, min(1.08, ease_out_back(progress)))
        logo_x = WIDTH // 2
        logo_y = CENTER_Y
        text_alpha = 0.0
        text_offset_x = 40
        loader_progress = 0.0
    # -------------------------------------------------------------
    # Stage 2: Logo shifts left & "Friends Mobile" reveals (0.7s -> 1.3s, frames 42 -> 78)
    # -------------------------------------------------------------
    elif frame_idx < 78:
        shift_progress = (frame_idx - 42) / 36.0
        shift_eased = ease_out_cubic(shift_progress)
        logo_x = int((WIDTH // 2) + (TARGET_LOGO_X - (WIDTH // 2)) * shift_eased)
        logo_y = CENTER_Y
        scale = 1.0
        text_alpha = min(1.0, shift_progress * 1.2)
        text_offset_x = int((1.0 - shift_eased) * 35)
        loader_progress = max(0.0, (shift_progress - 0.5) * 2.0)
    # -------------------------------------------------------------
    # Stage 3: Fully Revealed + Infinite Glowing Loader Sweep (1.3s -> 3.5s)
    # -------------------------------------------------------------
    else:
        logo_x = TARGET_LOGO_X
        logo_y = CENTER_Y
        scale = 1.0
        text_alpha = 1.0
        text_offset_x = 0
        loader_progress = 1.0

    # 1. Draw Ground Contact Drop Shadow for Logo
    shadow_w = int(logo_dim * scale * 0.85)
    shadow_h = int(24 * scale)
    shadow_y = CENTER_Y + int(logo_dim * scale * 0.52)
    if shadow_w > 0 and shadow_h > 0:
        shadow_img = Image.new('RGBA', (shadow_w + 30, shadow_h + 20), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow_img)
        s_draw.ellipse((15, 10, shadow_w + 15, shadow_h + 10), fill=(0, 0, 0, int(45 * min(1.0, scale))))
        shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(8))
        comp.paste(shadow_img, (logo_x - shadow_w // 2 - 15, shadow_y - shadow_h // 2 - 10), shadow_img)

    # 2. Draw Logo Badge with Scale
    cur_dim = max(4, int(logo_dim * scale))
    scaled_logo = logo_circular.resize((cur_dim, cur_dim), Image.Resampling.LANCZOS)
    
    # Draw soft ambient glow around logo badge
    if scale > 0.4:
        glow_size = cur_dim + 24
        glow_img = Image.new('RGBA', (glow_size, glow_size), (0, 0, 0, 0))
        g_draw = ImageDraw.Draw(glow_img)
        g_draw.ellipse((0, 0, glow_size - 1, glow_size - 1), fill=(255, 85, 0, int(35 * min(1.0, scale))))
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(6))
        comp.paste(glow_img, (logo_x - glow_size // 2, logo_y - glow_size // 2), glow_img)

    comp.paste(scaled_logo, (logo_x - cur_dim // 2, logo_y - cur_dim // 2), scaled_logo)

    # 3. Draw Brand Typography: "Friends" (Black) + "Mobile" (Orange)
    if text_alpha > 0.01:
        text_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        t_draw = ImageDraw.Draw(text_layer)
        
        tx = TARGET_TEXT_X + text_offset_x
        ty = CENTER_Y - 45
        
        # Word 1: "Friends "
        word1 = "Friends "
        t_draw.text((tx, ty), word1, font=font_title, fill=(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2], int(255 * text_alpha)))
        
        bbox1 = t_draw.textbbox((tx, ty), word1, font=font_title)
        w1 = bbox1[2] - bbox1[0]
        
        # Word 2: "Mobile" (Orange with subtle glow)
        word2 = "Mobile"
        t_draw.text((tx + w1, ty), word2, font=font_sub, fill=(ORANGE_PRIMARY[0], ORANGE_PRIMARY[1], ORANGE_PRIMARY[2], int(255 * text_alpha)))
        
        comp = Image.alpha_composite(comp, text_layer)

    # 4. Minimalist Glowing Orange Circular Loader Ring Directly Underneath
    if loader_progress > 0.01:
        loader_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        l_draw = ImageDraw.Draw(loader_layer)
        
        loader_cx = WIDTH // 2
        loader_cy = CENTER_Y + 140
        ring_radius = 28
        ring_width = 4
        
        # Soft background track
        track_alpha = int(45 * loader_progress)
        l_draw.ellipse(
            (loader_cx - ring_radius, loader_cy - ring_radius, loader_cx + ring_radius, loader_cy + ring_radius),
            outline=(255, 85, 0, track_alpha),
            width=ring_width
        )
        
        # Animated 360 spinning glowing arc
        spin_speed = 360.0 * 1.5  # 1.5 rotations per second
        start_angle = (time_s * spin_speed) % 360.0
        arc_sweep = 120.0  # 120 degrees arc length
        end_angle = start_angle + arc_sweep
        
        arc_alpha = int(255 * loader_progress)
        l_draw.arc(
            (loader_cx - ring_radius, loader_cy - ring_radius, loader_cx + ring_radius, loader_cy + ring_radius),
            start=start_angle,
            end=end_angle,
            fill=(ORANGE_PRIMARY[0], ORANGE_PRIMARY[1], ORANGE_PRIMARY[2], arc_alpha),
            width=ring_width
        )
        
        # Glowing head spark dot on the moving tip of the arc
        tip_rad = math.radians(end_angle)
        spark_x = loader_cx + ring_radius * math.cos(tip_rad)
        spark_y = loader_cy + ring_radius * math.sin(tip_rad)
        spark_r = 5
        l_draw.ellipse(
            (spark_x - spark_r, spark_y - spark_r, spark_x + spark_r, spark_y + spark_r),
            fill=(255, 255, 255, arc_alpha),
            outline=(ORANGE_GLOW[0], ORANGE_GLOW[1], ORANGE_GLOW[2], arc_alpha)
        )
        
        comp = Image.alpha_composite(comp, loader_layer)

    # Composite comp onto frame
    final_frame = Image.alpha_composite(frame.convert('RGBA'), comp).convert('RGB')
    writer.append_data(np.array(final_frame))
    
    if frame_idx % 30 == 0 or frame_idx == TOTAL_FRAMES - 1:
        print(f"Rendered frame {frame_idx + 1}/{TOTAL_FRAMES} ({(frame_idx + 1) / TOTAL_FRAMES * 100:.1f}%)")

writer.close()
print("Video rendering complete!")

# Also copy to public directory
import shutil
shutil.copyfile(output_artifact_mp4, output_public_mp4)
print(f"Copied to public: {output_public_mp4}")
