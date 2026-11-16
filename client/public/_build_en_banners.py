"""Build sharp EN hero banners from HE PNG masters: inpaint Hebrew, draw English in-place."""
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

pub = Path(__file__).resolve().parent


def load_bgr(path: Path):
    data = np.fromfile(str(path), dtype=np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError(f"failed to read {path}")
    return img


def save_png(path: Path, bgr):
    ok, buf = cv2.imencode(".png", bgr)
    if not ok:
        raise RuntimeError("encode failed")
    buf.tofile(str(path))


def text_mask_from_region(bgr, x0, y0, x1, y1, bright=185, sat_max=70, min_area=20, dilate=7):
    """Mask near-white, low-saturation glyphs (tagline), not neon streaks."""
    h, w = bgr.shape[:2]
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(w, x1), min(h, y1)
    roi = bgr[y0:y1, x0:x1]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    bright_m = gray >= bright
    low_sat = hsv[:, :, 1] <= sat_max
    bw = np.where(bright_m & low_sat, 255, 0).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(bw, connectivity=8)
    clean = np.zeros_like(bw)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            clean[labels == i] = 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate, dilate))
    clean = cv2.dilate(clean, k, iterations=2)
    mask = np.zeros((h, w), np.uint8)
    mask[y0:y1, x0:x1] = clean
    return mask


def draw_centered_lines(bgr, lines, center_xy, font_path, font_size, line_gap=8, fill=(255, 255, 255)):
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    im = Image.fromarray(rgb)
    draw = ImageDraw.Draw(im)
    try:
        font = ImageFont.truetype(font_path, font_size)
    except Exception:
        font = ImageFont.load_default()
    sizes = [draw.textbbox((0, 0), t, font=font) for t in lines]
    widths = [s[2] - s[0] for s in sizes]
    heights = [s[3] - s[1] for s in sizes]
    total_h = sum(heights) + line_gap * (len(lines) - 1)
    cx, cy = center_xy
    y = int(cy - total_h / 2)
    for t, tw, th in zip(lines, widths, heights):
        x = int(cx - tw / 2)
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            draw.text((x + dx, y + dy), t, font=font, fill=(0, 0, 0))
        draw.text((x, y), t, font=font, fill=fill)
        y += th + line_gap
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)


def crop_save(bgr, box, path: Path):
    x, y, ww, hh = box
    c = bgr[y : y + hh, x : x + ww]
    ok, buf = cv2.imencode(".png", c)
    buf.tofile(str(path))


def main():
    font_candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\calibrib.ttf",
    ]
    font_path = next((p for p in font_candidates if Path(p).exists()), font_candidates[0])
    print("font", font_path)

    # ---- DESKTOP: Hebrew tagline is under the divider at y≈432–452 ----
    he_desk = load_bgr(pub / "hero-banner-desktop.png")
    h, w = he_desk.shape[:2]
    print("desk", w, h)
    mask_d = text_mask_from_region(
        he_desk, int(w * 0.25), 420, int(w * 0.75), 470, bright=175, sat_max=80, min_area=15, dilate=9
    )
    print("desk mask pixels", int(mask_d.sum() / 255))
    # Two-pass inpaint for clean removal (no black bar, no Hebrew ghost)
    inpainted_d = cv2.inpaint(he_desk, mask_d, 6, cv2.INPAINT_TELEA)
    inpainted_d = cv2.inpaint(inpainted_d, mask_d, 3, cv2.INPAINT_NS)
    # Same vertical center as HE tagline (~442); EN reads smaller so size up vs HE glyphs
    en_desk = draw_centered_lines(
        inpainted_d,
        ["Custom music videos & personalized songs"],
        center_xy=(w // 2, 442),
        font_path=font_path,
        font_size=40,
    )
    out_d = pub / "hero-banner-desktop-en.png"
    save_png(out_d, en_desk)
    print("wrote", out_d, out_d.stat().st_size)

    # ---- MOBILE: two Hebrew lines ~850–887 and ~927–963 ----
    he_mob = load_bgr(pub / "hero-banner-mobile.png")
    hm, wm = he_mob.shape[:2]
    print("mob", wm, hm)
    mask_m = text_mask_from_region(
        he_mob, 100, 835, wm - 100, 980, bright=170, sat_max=80, min_area=25, dilate=11
    )
    print("mob mask pixels", int(mask_m.sum() / 255))
    inpainted_m = cv2.inpaint(he_mob, mask_m, 7, cv2.INPAINT_TELEA)
    inpainted_m = cv2.inpaint(inpainted_m, mask_m, 4, cv2.INPAINT_NS)
    # Overall center of the two HE lines
    en_mob = draw_centered_lines(
        inpainted_m,
        ["Custom music videos &", "personalized songs"],
        center_xy=(wm // 2, 907),
        font_path=font_path,
        font_size=60,
        line_gap=18,
    )
    out_m = pub / "hero-banner-mobile-en.png"
    save_png(out_m, en_mob)
    print("wrote", out_m, out_m.stat().st_size)

    crop_save(he_desk, (400, 400, 1100, 90), pub / "_verify-he-desk.png")
    crop_save(en_desk, (400, 400, 1100, 90), pub / "_verify-en-desk.png")
    crop_save(he_mob, (50, 820, 924, 220), pub / "_verify-he-mob.png")
    crop_save(en_mob, (50, 820, 924, 220), pub / "_verify-en-mob.png")
    # full-width desk strip including logo+tagline for alignment check
    crop_save(en_desk, (300, 250, 1300, 260), pub / "_verify-en-desk-full.png")
    crop_save(he_desk, (300, 250, 1300, 260), pub / "_verify-he-desk-full.png")
    print("verify crops saved")


if __name__ == "__main__":
    main()
