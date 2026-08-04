import os
from PIL import Image, ImageDraw

LOGO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'logo.png')

def get_logo_image(size, emblem_scale=1.0):
    logo = Image.open(LOGO_PATH).convert('RGBA')
    target_dim = int(size * emblem_scale)
    resized_logo = logo.resize((target_dim, target_dim), Image.Resampling.LANCZOS)
    
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pos = (size - target_dim) // 2
    canvas.alpha_composite(resized_logo, (pos, pos))
    return canvas

def create_square_icon(target_size=192):
    canvas_size = 1024
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    corner_radius = int(canvas_size * 0.22)
    padding = int(canvas_size * 0.04)
    card_rect = [padding, padding, canvas_size - padding, canvas_size - padding]
    draw.rounded_rectangle(card_rect, radius=corner_radius, fill='#FFFFFF', outline='#E2E8F0', width=int(canvas_size * 0.01))
    
    logo_img = get_logo_image(size=canvas_size, emblem_scale=0.78)
    img.alpha_composite(logo_img)
    return img.resize((target_size, target_size), Image.Resampling.LANCZOS)

def create_round_icon(target_size=192):
    canvas_size = 1024
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    padding = int(canvas_size * 0.04)
    draw.ellipse([padding, padding, canvas_size - padding, canvas_size - padding], fill='#FFFFFF', outline='#E2E8F0', width=int(canvas_size * 0.01))
    
    logo_img = get_logo_image(size=canvas_size, emblem_scale=0.78)
    img.alpha_composite(logo_img)
    return img.resize((target_size, target_size), Image.Resampling.LANCZOS)

def create_foreground_icon(target_size=432):
    canvas_size = 1024
    logo_img = get_logo_image(size=canvas_size, emblem_scale=0.62)
    return logo_img.resize((target_size, target_size), Image.Resampling.LANCZOS)

def create_splash_screen(width, height):
    canvas_w = max(width, 1024)
    canvas_h = max(height, 1024)
    img = Image.new('RGBA', (canvas_w, canvas_h), '#0F172A')
    
    emblem_dim = int(min(canvas_w, canvas_h) * 0.38)
    logo_img = get_logo_image(size=emblem_dim, emblem_scale=1.0)
    
    pos_x = (canvas_w - emblem_dim) // 2
    pos_y = (canvas_h - emblem_dim) // 2 - int(canvas_h * 0.03)
    img.alpha_composite(logo_img, (pos_x, pos_y))
    return img.resize((width, height), Image.Resampling.LANCZOS)

def main():
    res_base = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'android', 'app', 'src', 'main', 'res')
    
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
