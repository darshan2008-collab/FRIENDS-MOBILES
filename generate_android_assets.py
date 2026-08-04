import os
import math
from PIL import Image, ImageDraw, ImageFilter

def cubic_bezier(p0, p1, p2, p3, steps=120):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3*u**2*t * p1[0] + 3*u*t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3*u**2*t * p1[1] + 3*u*t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts

def render_logo(size=1024, emblem_scale=1.0):
    """
    Renders FRIENDS MOBILE emblem on a transparent canvas of size x size.
    emblem_scale controls the relative size of the emblem within the canvas.
    """
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Base viewBox is 0 0 100 100
    # Center emblem at (size/2, size/2)
    center = size / 2.0
    scale = (size / 100.0) * emblem_scale
    offset_x = center - (50 * scale)
    offset_y = center - (50 * scale)

    # 1. Main Orange Circle (#FF5500)
    cx = 50 * scale + offset_x
    cy = 50 * scale + offset_y
    r = 46 * scale
    stroke_w = max(1, int(2.5 * scale))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill='#FF5500', outline='#000000', width=stroke_w)
    
    # 2. Top Black Dot (#000000)
    td_cx = 50 * scale + offset_x
    td_cy = 23 * scale + offset_y
    td_r = 9 * scale
    draw.ellipse([td_cx - td_r, td_cy - td_r, td_cx + td_r, td_cy + td_r], fill='#000000')
    
    # 3. Bottom 'U' Emblem (#000000)
    path_pts = []
    # M 24 41
    path_pts.append((24 * scale + offset_x, 41 * scale + offset_y))
    # H 39
    path_pts.append((39 * scale + offset_x, 41 * scale + offset_y))
    # V 58
    path_pts.append((39 * scale + offset_x, 58 * scale + offset_y))
    # C 39 65 44 71 50 71
    path_pts.extend(cubic_bezier(
        (39*scale + offset_x, 58*scale + offset_y),
        (39*scale + offset_x, 65*scale + offset_y),
        (44*scale + offset_x, 71*scale + offset_y),
        (50*scale + offset_x, 71*scale + offset_y)
    ))
    # C 56 71 61 65 61 58
    path_pts.extend(cubic_bezier(
        (50*scale + offset_x, 71*scale + offset_y),
        (56*scale + offset_x, 71*scale + offset_y),
        (61*scale + offset_x, 65*scale + offset_y),
        (61*scale + offset_x, 58*scale + offset_y)
    ))
    # V 41
    path_pts.append((61 * scale + offset_x, 41 * scale + offset_y))
    # H 76
    path_pts.append((76 * scale + offset_x, 41 * scale + offset_y))
    # V 58
    path_pts.append((76 * scale + offset_x, 58 * scale + offset_y))
    # C 76 73 65 86 50 86
    path_pts.extend(cubic_bezier(
        (76*scale + offset_x, 58*scale + offset_y),
        (76*scale + offset_x, 73*scale + offset_y),
        (65*scale + offset_x, 86*scale + offset_y),
        (50*scale + offset_x, 86*scale + offset_y)
    ))
    # C 35 86 24 73 24 58
    path_pts.extend(cubic_bezier(
        (50*scale + offset_x, 86*scale + offset_y),
        (35*scale + offset_x, 86*scale + offset_y),
        (24*scale + offset_x, 73*scale + offset_y),
        (24*scale + offset_x, 58*scale + offset_y)
    ))
    
    draw.polygon(path_pts, fill='#000000')
    return img

def create_square_icon(target_size=192):
    # Render at 1024 super-resolution
    canvas_size = 1024
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # White rounded rectangle background
    corner_radius = int(canvas_size * 0.22)
    padding = int(canvas_size * 0.04)
    card_rect = [padding, padding, canvas_size - padding, canvas_size - padding]
    draw.rounded_rectangle(card_rect, radius=corner_radius, fill='#FFFFFF', outline='#E2E8F0', width=int(canvas_size * 0.01))
    
    # Render logo in center
    logo_img = render_logo(size=canvas_size, emblem_scale=0.72)
    img.alpha_composite(logo_img)
    
    return img.resize((target_size, target_size), Image.LANCZOS)

def create_round_icon(target_size=192):
    canvas_size = 1024
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    padding = int(canvas_size * 0.04)
    draw.ellipse([padding, padding, canvas_size - padding, canvas_size - padding], fill='#FFFFFF', outline='#E2E8F0', width=int(canvas_size * 0.01))
    
    logo_img = render_logo(size=canvas_size, emblem_scale=0.70)
    img.alpha_composite(logo_img)
    
    return img.resize((target_size, target_size), Image.LANCZOS)

def create_foreground_icon(target_size=432):
    canvas_size = 1024
    # Adaptive foreground canvas uses central 60% for emblem
    logo_img = render_logo(size=canvas_size, emblem_scale=0.55)
    return logo_img.resize((target_size, target_size), Image.LANCZOS)

def create_splash_screen(width, height):
    # Dark modern atmosphere splash screen (#0F172A)
    canvas_w = max(width, 1024)
    canvas_h = max(height, 1024)
    img = Image.new('RGBA', (canvas_w, canvas_h), '#0F172A')
    
    # Center emblem
    emblem_dim = int(min(canvas_w, canvas_h) * 0.35)
    logo_img = render_logo(size=emblem_dim, emblem_scale=0.88)
    
    pos_x = (canvas_w - emblem_dim) // 2
    pos_y = (canvas_h - emblem_dim) // 2 - int(canvas_h * 0.03)
    img.alpha_composite(logo_img, (pos_x, pos_y))
    
    return img.resize((width, height), Image.LANCZOS)

def main():
    res_base = r'd:\FRIENDS MOBILE\android\app\src\main\res'
    
    densities = {
        'mipmap-mdpi': (48, 108),
        'mipmap-hdpi': (72, 162),
        'mipmap-xhdpi': (96, 216),
        'mipmap-xxhdpi': (144, 324),
        'mipmap-xxxhdpi': (192, 432)
    }
    
    for folder, (ic_size, fg_size) in densities.items():
        folder_path = os.path.join(res_base, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        sq = create_square_icon(ic_size)
        sq.save(os.path.join(folder_path, 'ic_launcher.png'))
        
        rd = create_round_icon(ic_size)
        rd.save(os.path.join(folder_path, 'ic_launcher_round.png'))
        
        fg = create_foreground_icon(fg_size)
        fg.save(os.path.join(folder_path, 'ic_launcher_foreground.png'))
        print(f"Generated icons for {folder}: square={ic_size}x{ic_size}, fg={fg_size}x{fg_size}")
        
    # Generate Splash screens
    splash_dirs = {
        'drawable': (480, 320),
        'drawable-land-hdpi': (800, 480),
        'drawable-land-mdpi': (480, 320),
        'drawable-land-xhdpi': (1280, 720),
        'drawable-land-xxhdpi': (1600, 960),
        'drawable-land-xxxhdpi': (1920, 1280),
        'drawable-port-hdpi': (480, 800),
        'drawable-port-mdpi': (320, 480),
        'drawable-port-xhdpi': (720, 1280),
        'drawable-port-xxhdpi': (960, 1600),
        'drawable-port-xxxhdpi': (1280, 1920)
    }
    
    for s_folder, (w, h) in splash_dirs.items():
        s_path = os.path.join(res_base, s_folder)
        os.makedirs(s_path, exist_ok=True)
        splash_img = create_splash_screen(w, h)
        splash_img.save(os.path.join(s_path, 'splash.png'))
        print(f"Generated splash for {s_folder}: {w}x{h}")

if __name__ == '__main__':
    main()
