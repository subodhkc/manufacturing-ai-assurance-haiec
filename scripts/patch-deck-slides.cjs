'use strict';
/**
 * Sprint 14.5 T7 — narrow wording corrections inside the shipped deck's
 * image slides (no source assets exist — slides are flat PNGs embedded in
 * the PDF). Patches four slides' embedded text regions with accurate
 * language, preserving the visual design, then rebuilds the PDF.
 *
 * Corrections (truth-in-marketing, same architecture story):
 *   p03 title    "The Architecture of Absolute Trust"
 *              → "The Architecture of Cryptographically Bound Assurance"
 *   p03 subtitle "The Unassailable Chain of Custody"
 *              → "The Verifiable Chain of Custody"
 *   p03 label    "SHA-256 Truth Digests" → "Deterministic Integrity Digests"
 *   p05 body     "tamper-proof" → "tamper-evident"
 *   p05 table    "Absolute – tampering invalidates hash"
 *              → "Strong – tampering invalidates hash"
 *   p09 title    "Pillar 3: SHA-256 Truth Digests"
 *              → "Pillar 3: Deterministic Integrity Digests"
 *   p14 subtitle "cryptographically signed origin … zero LLM hallucination"
 *              → "authenticated evidence … deterministic, not generative"
 *   p14 step 1   "V2 Payload-Bound Attestation"
 *              → "Authenticated Evidence Ingest"
 *   p14 step 3   "SHA-256 Truth Digest" → "Deterministic Integrity Digest"
 *
 * Requires: python + pillow, pypdf. Run: node scripts/patch-deck-slides.cjs
 * Output: dashboard/deck/haiec-cryptographic-assurance.pdf (regenerated)
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const ROOT = path.resolve(__dirname, '..');
const DECK = path.join(ROOT, 'dashboard', 'deck', 'haiec-cryptographic-assurance.pdf');
const WORK = path.join(ROOT, 'dashboard', 'deck', '.slide-work');

const PY = String.raw`
import sys, json
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader
from pypdf import PdfWriter
import io, os

DECK = ${JSON.stringify(DECK.replace(/\\/g, '\\\\'))}
WORK = ${JSON.stringify(WORK.replace(/\\/g, '\\\\'))}
os.makedirs(WORK, exist_ok=True)
F_BOLD = r'C:\Windows\Fonts\arialbd.ttf'
F_REG  = r'C:\Windows\Fonts\arial.ttf'

reader = PdfReader(DECK)
imgs = {}
for i, p in enumerate(reader.pages):
    for j, im in enumerate(p.images):
        imgs[i + 1] = Image.open(io.BytesIO(im.data)).convert('RGB')

def cover(im, box, pad=6):
    # Fill box with the modal background color sampled just above the box.
    x0, y0, x1, y1 = box
    sx = (x0 + x1) // 2
    bg = im.getpixel((sx, max(0, y0 - pad - 4)))
    d = ImageDraw.Draw(im)
    d.rectangle([x0 - pad, y0 - pad, x1 + pad, y1 + pad], fill=bg)
    return bg, d

def fit(draw, text, box, font_path, max_size, color):
    x0, y0, x1, y1 = box
    size = max_size
    while size > 8:
        f = ImageFont.truetype(font_path, size)
        bb = draw.textbbox((0, 0), text, font=f)
        if bb[2] - bb[0] <= (x1 - x0) and bb[3] - bb[1] <= (y1 - y0):
            return f
        size -= 1
    return ImageFont.truetype(font_path, 8)

def put_center(im, box, text, font_path, max_size, color):
    _, d = cover(im, box)
    f = fit(d, text, box, font_path, max_size, color)
    bb = d.textbbox((0, 0), text, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text((box[0] + (box[2] - box[0] - tw) / 2, box[1] + (box[3] - box[1] - th) / 2 - bb[1]),
           text, font=f, fill=color)

def put_left(im, box, text, font_path, max_size, color):
    _, d = cover(im, box)
    f = fit(d, text, box, font_path, max_size, color)
    bb = d.textbbox((0, 0), text, font=f)
    d.text((box[0], box[1] + (box[3] - box[1] - (bb[3] - bb[1])) / 2 - bb[1]),
           text, font=f, fill=color)

INK = (28, 30, 32)
WHITE = (235, 240, 245)

# ---- p03 (1-based slide 3) ----
im = imgs[3]
put_center(im, (330, 58, 1054, 92), 'The Architecture of Cryptographically Bound Assurance', F_BOLD, 40, INK)
put_center(im, (424, 103, 952, 136), 'The Verifiable Chain of Custody', F_BOLD, 26, INK)
# bottom-right label: one cover box, two drawn lines
bg, d = cover(im, (1000, 668, 1230, 732), pad=4)
d.text((1035, 672), 'Deterministic', font=ImageFont.truetype(F_BOLD, 20), fill=INK)
d.text((1028, 699), 'Integrity Digests', font=ImageFont.truetype(F_BOLD, 17), fill=INK)

# ---- p05 ----
im = imgs[5]
put_left(im, (245, 100, 1295, 140),
         'Only V2 secures the entire canonical payload. This makes it tamper-evident and the only', F_REG, 22, INK)
put_center(im, (745, 570, 1245, 618), 'Strong - tampering invalidates hash', F_BOLD, 20, INK)

# ---- p09 ----
im = imgs[9]
put_center(im, (335, 46, 1041, 103), 'Pillar 3: Deterministic Integrity Digests', F_BOLD, 40, INK)

# ---- p14 (dark blueprint) ----
im = imgs[14]
put_center(im, (120, 428, 1255, 528),
           'From authenticated evidence to a mathematically frozen conclusion - deterministic, not generative.', F_REG, 30, WHITE)
put_left(im, (88, 688, 372, 762), 'Authenticated Evidence Ingest', F_BOLD, 26, WHITE)
put_center(im, (1005, 688, 1245, 762), 'Deterministic Integrity Digest', F_BOLD, 24, WHITE)

for n, im in imgs.items():
    im.save(os.path.join(WORK, 'p%02d.png' % n), 'PNG')

# Rebuild PDF via PIL multi-page save — no extra dependency. JPEG keeps
# the byte size near the original embedded-DCT deck.
out = os.path.join(WORK, 'rebuilt.pdf')
pages = [imgs[n].convert('RGB') for n in sorted(imgs)]
pages[0].save(out, 'PDF', save_all=True, append_images=pages[1:], resolution=144.0, quality=92)
print('rebuilt:', out, os.path.getsize(out))
`;

fs.writeFileSync(path.join(WORK, 'patch.py'), PY);
fs.mkdirSync(WORK, { recursive: true });
execFileSync('python', [path.join(WORK, 'patch.py')], { stdio: 'inherit' });
