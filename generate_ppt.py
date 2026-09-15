"""
SkillBridge AI — PowerPoint Generator
Creates a professional 16-slide presentation matching the website design.
Colors: Blue #2563eb, Cyan #06b6d4, Dark #0f172a, White #ffffff
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.oxml.ns import qn
from pptx.oxml import parse_xml
from pptx.enum.dml import MSO_THEME_COLOR
import copy
from lxml import etree
import io

# ── Color palette ──────────────────────────────────────────────────
BLUE       = RGBColor(0x25, 0x63, 0xEB)   # #2563eb
BLUE_DARK  = RGBColor(0x1D, 0x4E, 0xD8)   # #1d4ed8
CYAN       = RGBColor(0x06, 0xB6, 0xD4)   # #06b6d4
DARK       = RGBColor(0x0F, 0x17, 0x2A)   # #0f172a
DARK2      = RGBColor(0x1E, 0x3A, 0x8A)   # #1e3a8a
SLATE      = RGBColor(0x64, 0x74, 0x8B)   # #64748b
SLATE_LIGHT= RGBColor(0xF1, 0xF5, 0xF9)   # #f1f5f9
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
GREEN      = RGBColor(0x05, 0x96, 0x69)   # #059669
AMBER      = RGBColor(0xF5, 0x9E, 0x0B)   # #f59e0b
RED        = RGBColor(0xDC, 0x26, 0x26)   # #dc2626
PURPLE     = RGBColor(0x7C, 0x3A, 0xED)   # #7c3aed
BG         = RGBColor(0xF8, 0xFA, 0xFC)   # #f8fafc
CARD_BG    = RGBColor(0xFF, 0xFF, 0xFF)

# ── Slide dimensions (16:9) ────────────────────────────────────────
W = Inches(13.33)
H = Inches(7.5)

prs = Presentation()
prs.slide_width  = W
prs.slide_height = H

BLANK = prs.slide_layouts[6]   # completely blank


# ══════════════════════════════════════════════════════════════════
# Helper functions
# ══════════════════════════════════════════════════════════════════

def add_rect(slide, x, y, w, h, fill_rgb, alpha=None, radius=None):
    shape = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.line.fill.background()
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_rgb
    return shape


def add_rounded_rect(slide, x, y, w, h, fill_rgb, radius_pt=8):
    """Add a rounded rectangle using freeform / adjustedValue approach."""
    shape = slide.shapes.add_shape(
        5,  # MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE = 5
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.line.fill.background()
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_rgb
    # Adjust corner radius
    adj = shape.adjustments
    if len(adj) > 0:
        # value 0.05 gives a gentle radius
        shape.adjustments[0] = 0.05
    return shape


def add_text(slide, text, x, y, w, h,
             font_size=18, bold=False, color=DARK,
             align=PP_ALIGN.LEFT, italic=False, wrap=True):
    txb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf  = txb.text_frame
    tf.word_wrap = wrap
    p   = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size    = Pt(font_size)
    run.font.bold    = bold
    run.font.italic  = italic
    run.font.color.rgb = color
    run.font.name    = "Calibri"
    return txb


def add_multiline(slide, lines, x, y, w, h, base_size=14,
                  default_color=DARK, default_bold=False, align=PP_ALIGN.LEFT):
    """lines = list of (text, size, bold, color, italic) tuples"""
    txb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf  = txb.text_frame
    tf.word_wrap = True
    first = True
    for (txt, sz, bld, clr, itl) in lines:
        if first:
            p = tf.paragraphs[0]
            first = False
        else:
            p = tf.add_paragraph()
        p.alignment = align
        run = p.add_run()
        run.text = txt
        run.font.size      = Pt(sz)
        run.font.bold      = bld
        run.font.italic    = itl
        run.font.color.rgb = clr
        run.font.name      = "Calibri"
    return txb


def add_gradient_rect(slide, x, y, w, h):
    """Blue→Cyan gradient rect using XML hack."""
    shape = slide.shapes.add_shape(1, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.line.fill.background()
    # Apply gradient via XML
    sp = shape._element
    spPr = sp.find(qn('p:spPr'))
    # Remove existing solidFill
    for old in spPr.findall(qn('a:solidFill')):
        spPr.remove(old)
    gradFill = etree.fromstring("""
    <a:gradFill xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" rotWithShape="1">
      <a:gsLst>
        <a:gs pos="0">
          <a:srgbClr val="1E3A8A"/>
        </a:gs>
        <a:gs pos="50000">
          <a:srgbClr val="2563EB"/>
        </a:gs>
        <a:gs pos="100000">
          <a:srgbClr val="0E7490"/>
        </a:gs>
      </a:gsLst>
      <a:lin ang="5400000" scaled="0"/>
    </a:gradFill>
    """)
    # Insert gradient fill
    ln = spPr.find(qn('a:ln'))
    if ln is not None:
        spPr.insert(list(spPr).index(ln), gradFill)
    else:
        spPr.append(gradFill)
    return shape


def add_pill(slide, text, x, y, color_fill, text_color=WHITE, font_size=11):
    shape = slide.shapes.add_shape(5, Inches(x), Inches(y), Inches(1.5), Inches(0.32))
    shape.line.fill.background()
    shape.fill.solid()
    shape.fill.fore_color.rgb = color_fill
    if len(shape.adjustments) > 0:
        shape.adjustments[0] = 0.5
    tf = shape.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = text
    run.font.size = Pt(font_size)
    run.font.bold = True
    run.font.color.rgb = text_color
    run.font.name = "Calibri"
    return shape


def add_progress_bar(slide, x, y, w, pct, color=BLUE, label="", value_label=""):
    # Background bar
    bg = slide.shapes.add_shape(5, Inches(x), Inches(y), Inches(w), Inches(0.12))
    bg.line.fill.background()
    bg.fill.solid()
    bg.fill.fore_color.rgb = SLATE_LIGHT
    if len(bg.adjustments) > 0: bg.adjustments[0] = 0.5

    # Filled portion
    filled_w = max(w * pct / 100, 0.05)
    bar = slide.shapes.add_shape(5, Inches(x), Inches(y), Inches(filled_w), Inches(0.12))
    bar.line.fill.background()
    bar.fill.solid()
    bar.fill.fore_color.rgb = color
    if len(bar.adjustments) > 0: bar.adjustments[0] = 0.5

    # Label
    if label:
        add_text(slide, label, x, y - 0.2, 3, 0.2, font_size=10, color=SLATE)
    if value_label:
        add_text(slide, value_label, x + w - 0.6, y - 0.2, 0.6, 0.2,
                 font_size=10, bold=True, color=DARK, align=PP_ALIGN.RIGHT)


def add_card(slide, x, y, w, h, shadow=True):
    """White card with subtle border"""
    shape = slide.shapes.add_shape(5, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = WHITE
    shape.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
    shape.line.width = Pt(0.5)
    if len(shape.adjustments) > 0:
        shape.adjustments[0] = 0.04
    return shape


def slide_number(slide, n, total=16):
    add_text(slide, f"{n} / {total}", 12.8, 7.15, 0.5, 0.25,
             font_size=9, color=SLATE, align=PP_ALIGN.RIGHT)


def add_logo(slide, x=0.2, y=0.1):
    # Blue square logo
    logo = slide.shapes.add_shape(5, Inches(x), Inches(y), Inches(0.38), Inches(0.38))
    logo.fill.solid()
    logo.fill.fore_color.rgb = BLUE
    logo.line.fill.background()
    if len(logo.adjustments) > 0: logo.adjustments[0] = 0.15
    add_text(slide, "S", x + 0.08, y + 0.03, 0.25, 0.3,
             font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, "SkillBridge AI", x + 0.45, y + 0.05, 1.6, 0.3,
             font_size=11, bold=True, color=DARK)


# ══════════════════════════════════════════════════════════════════
# SLIDE 1 — Title / Hero
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = RGBColor(0xF8, 0xFA, 0xFC)

# Full gradient left panel
add_gradient_rect(slide, 0, 0, 6.5, 7.5)

# Right bg
add_rect(slide, 6.5, 0, 6.83, 7.5, BG)

# Logo (white version on dark bg)
logo_bg = slide.shapes.add_shape(5, Inches(0.35), Inches(0.28), Inches(0.45), Inches(0.45))
logo_bg.fill.solid(); logo_bg.fill.fore_color.rgb = WHITE
logo_bg.line.fill.background()
if len(logo_bg.adjustments) > 0: logo_bg.adjustments[0] = 0.15
add_text(slide, "S", 0.42, 0.3, 0.3, 0.38, font_size=16, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
add_text(slide, "SkillBridge AI", 0.85, 0.33, 2.5, 0.35, font_size=13, bold=True, color=WHITE)

# AI status badge
badge = slide.shapes.add_shape(5, Inches(0.35), Inches(1.15), Inches(2.5), Inches(0.32))
badge.fill.solid(); badge.fill.fore_color.rgb = RGBColor(0x06, 0x4E, 0x3B)
badge.line.fill.background()
if len(badge.adjustments) > 0: badge.adjustments[0] = 0.5
add_text(slide, "● AI Career Engine — Online", 0.4, 1.17, 2.4, 0.28,
         font_size=10, bold=True, color=RGBColor(0x6E, 0xE7, 0xB7))

# Main title
add_text(slide, "SkillBridge", 0.35, 1.65, 6, 1.1,
         font_size=58, bold=True, color=WHITE)
add_text(slide, "AI", 3.6, 1.65, 2.5, 1.1,
         font_size=58, bold=True, color=CYAN)

add_text(slide, '"Your Skills. Your Future."', 0.35, 2.75, 5.8, 0.6,
         font_size=22, bold=True, color=RGBColor(0xBA, 0xD8, 0xF8), italic=True)

add_text(slide,
         "Discover your career path, identify skill gaps, build\n"
         "a personalized roadmap, and connect with opportunities\n— powered by AI.",
         0.35, 3.4, 5.8, 1.2, font_size=15, color=RGBColor(0xBF, 0xDB, 0xFE))

# CTA buttons
btn1 = slide.shapes.add_shape(5, Inches(0.35), Inches(4.75), Inches(2.3), Inches(0.5))
btn1.fill.solid(); btn1.fill.fore_color.rgb = CYAN
btn1.line.fill.background()
if len(btn1.adjustments) > 0: btn1.adjustments[0] = 0.3
add_text(slide, "🔍  Analyze My Skills", 0.36, 4.8, 2.28, 0.4,
         font_size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

btn2 = slide.shapes.add_shape(5, Inches(2.8), Inches(4.75), Inches(2.1), Inches(0.5))
btn2.fill.solid(); btn2.fill.fore_color.rgb = RGBColor(0xFF, 0xFF, 0xFF, )
btn2.line.color.rgb = WHITE; btn2.line.width = Pt(1.5)
if len(btn2.adjustments) > 0: btn2.adjustments[0] = 0.3
add_text(slide, "🚀  Explore Careers", 2.81, 4.8, 2.08, 0.4,
         font_size=13, bold=True, color=DARK, align=PP_ALIGN.CENTER)

# Demo badge
add_text(slide, "🎯  Try Demo — One Click", 0.35, 5.45, 4, 0.3,
         font_size=11, color=RGBColor(0x93, 0xC5, 0xFD))

# Right: Bridge visual
bridge_steps = [
    ("🎓", "Student Skills",   BLUE,   6.7),
    ("🤖", "AI Analysis",      PURPLE, 7.2),
    ("📊", "Skill Gap",        CYAN,   7.7),
    ("🗺️", "Learning Roadmap", GREEN,  8.2),
    ("🚀", "Career Opportunity",AMBER, 8.7),
]

for i, (icon, label, col, bx) in enumerate(bridge_steps):
    card = slide.shapes.add_shape(5, Inches(bx - 0.1), Inches(1.1 + i * 1.15),
                                   Inches(4.6), Inches(0.72))
    card.fill.solid(); card.fill.fore_color.rgb = WHITE
    card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); card.line.width = Pt(0.75)
    if len(card.adjustments) > 0: card.adjustments[0] = 0.07

    # Left accent bar
    acc = slide.shapes.add_shape(1, Inches(bx - 0.1), Inches(1.1 + i * 1.15),
                                   Inches(0.06), Inches(0.72))
    acc.fill.solid(); acc.fill.fore_color.rgb = col
    acc.line.fill.background()

    add_text(slide, icon,  bx + 0.15, 1.2 + i * 1.15, 0.4, 0.52, font_size=20, align=PP_ALIGN.CENTER)
    add_text(slide, label, bx + 0.55, 1.28 + i * 1.15, 3.5, 0.35, font_size=13, bold=True, color=DARK)

    # Dot indicator
    dot = slide.shapes.add_shape(5, Inches(bx + 3.8), Inches(1.38 + i * 1.15),
                                   Inches(0.14), Inches(0.14))
    dot.fill.solid(); dot.fill.fore_color.rgb = col
    dot.line.fill.background()
    if len(dot.adjustments) > 0: dot.adjustments[0] = 0.5

    # Connector arrow between steps
    if i < 4:
        add_text(slide, "↓", bx + 2.0, 1.82 + i * 1.15, 0.5, 0.3,
                 font_size=13, color=RGBColor(0xCB, 0xD5, 0xE1), align=PP_ALIGN.CENTER)

slide_number(slide, 1)


# ══════════════════════════════════════════════════════════════════
# SLIDE 2 — The Problem
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "THE PROBLEM", 0.2, 0.72, 4, 0.28, font_size=11,
         bold=True, color=BLUE)
add_text(slide, "Students don't lack potential.\nThey lack direction.",
         0.2, 0.98, 9, 1.0, font_size=30, bold=True, color=DARK)

problems = [
    ("🧭", "Career Confusion",   "Which career actually fits my skills?",   BLUE),
    ("📚", "Generic Learning",   "What should I learn next?",                PURPLE),
    ("🔍", "Hidden Skill Gaps",  "What skills am I missing?",                CYAN),
    ("🔌", "Opportunity Gap",    "Which internships or jobs match me?",       GREEN),
]

for i, (icon, title, desc, col) in enumerate(problems):
    cx = 0.25 + i * 3.27
    card = slide.shapes.add_shape(5, Inches(cx), Inches(2.25),
                                   Inches(3.05), Inches(3.5))
    card.fill.solid(); card.fill.fore_color.rgb = WHITE
    card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); card.line.width = Pt(0.75)
    if len(card.adjustments) > 0: card.adjustments[0] = 0.06

    # Top accent
    top = slide.shapes.add_shape(1, Inches(cx), Inches(2.25), Inches(3.05), Inches(0.08))
    top.fill.solid(); top.fill.fore_color.rgb = col
    top.line.fill.background()

    add_text(slide, icon,  cx + 0.2, 2.45, 0.6, 0.55, font_size=28)
    add_text(slide, title, cx + 0.2, 3.1,  2.7, 0.5,
             font_size=15, bold=True, color=DARK)
    add_text(slide, f'"{desc}"', cx + 0.2, 3.65, 2.7, 1.6,
             font_size=13, color=SLATE, italic=True)

    # Number badge
    num_bg = slide.shapes.add_shape(5, Inches(cx + 2.55), Inches(2.35),
                                     Inches(0.3), Inches(0.3))
    num_bg.fill.solid(); num_bg.fill.fore_color.rgb = col
    num_bg.line.fill.background()
    if len(num_bg.adjustments) > 0: num_bg.adjustments[0] = 0.5
    add_text(slide, str(i + 1), cx + 2.56, 2.35, 0.28, 0.3,
             font_size=10, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

slide_number(slide, 2)


# ══════════════════════════════════════════════════════════════════
# SLIDE 3 — How It Works
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = WHITE

add_logo(slide)
add_text(slide, "HOW IT WORKS", 0.2, 0.72, 5, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "From Student to Career — in 5 Steps",
         0.2, 0.98, 10, 0.6, font_size=26, bold=True, color=DARK)

steps = [
    ("01", "👤", "Build Profile",
     "Add skills, projects, certificates & career goal"),
    ("02", "🤖", "AI Skill Analysis",
     "AI engine analyzes your profile vs. industry requirements"),
    ("03", "📊", "Detect Skill Gaps",
     "See exactly which skills you need to become job-ready"),
    ("04", "🗺️", "Generate Roadmap",
     "Step-by-step personalized learning path with resources"),
    ("05", "💼", "Match Opportunities",
     "Discover internships & jobs matched to your profile"),
]

colors = [BLUE, PURPLE, CYAN, GREEN, AMBER]

for i, (num, icon, title, desc) in enumerate(steps):
    cx = 0.3 + i * 2.6
    col = colors[i]

    # Card
    card = slide.shapes.add_shape(5, Inches(cx), Inches(1.85),
                                   Inches(2.4), Inches(4.5))
    card.fill.solid(); card.fill.fore_color.rgb = WHITE
    card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); card.line.width = Pt(0.75)
    if len(card.adjustments) > 0: card.adjustments[0] = 0.05

    # Colored top stripe
    stripe = slide.shapes.add_shape(1, Inches(cx), Inches(1.85), Inches(2.4), Inches(0.07))
    stripe.fill.solid(); stripe.fill.fore_color.rgb = col
    stripe.line.fill.background()

    # Step number circle
    circ = slide.shapes.add_shape(5, Inches(cx + 0.85), Inches(2.1),
                                   Inches(0.7), Inches(0.7))
    circ.fill.solid(); circ.fill.fore_color.rgb = col
    circ.line.fill.background()
    if len(circ.adjustments) > 0: circ.adjustments[0] = 0.5
    add_text(slide, num, cx + 0.86, 2.14, 0.68, 0.62,
             font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    add_text(slide, icon, cx + 0.9, 2.95, 0.6, 0.55, font_size=26, align=PP_ALIGN.CENTER)
    add_text(slide, title, cx + 0.15, 3.6, 2.1, 0.5,
             font_size=13, bold=True, color=DARK, align=PP_ALIGN.CENTER)
    add_text(slide, desc, cx + 0.15, 4.2, 2.1, 1.8,
             font_size=10.5, color=SLATE, align=PP_ALIGN.CENTER)

    # Arrow between steps
    if i < 4:
        add_text(slide, "→", cx + 2.28, 3.8, 0.4, 0.4,
                 font_size=16, color=RGBColor(0xCB, 0xD5, 0xE1), align=PP_ALIGN.CENTER)

slide_number(slide, 3)


# ══════════════════════════════════════════════════════════════════
# SLIDE 4 — Career Analyzer (Form)
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "AI CAREER ANALYZER", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Tell Us About Yourself — AI Does the Rest",
         0.2, 0.98, 10, 0.55, font_size=24, bold=True, color=DARK)

# Left form panel
form_card = slide.shapes.add_shape(5, Inches(0.25), Inches(1.7),
                                    Inches(8.2), Inches(5.4))
form_card.fill.solid(); form_card.fill.fore_color.rgb = WHITE
form_card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); form_card.line.width = Pt(0.75)
if len(form_card.adjustments) > 0: form_card.adjustments[0] = 0.05

fields_left = [
    ("Full Name", "Ananya Sharma", 0.55, 1.92),
    ("Education", "B.Tech Computer Science", 0.55, 2.72),
    ("University", "VIT University", 4.5, 1.92),
    ("Year", "3rd Year", 4.5, 2.72),
]
for label, val, fx, fy in fields_left:
    add_text(slide, label, fx, fy, 3.5, 0.22, font_size=10, bold=True, color=SLATE)
    field_bg = slide.shapes.add_shape(5, Inches(fx), Inches(fy + 0.24),
                                       Inches(3.5), Inches(0.38))
    field_bg.fill.solid(); field_bg.fill.fore_color.rgb = BG
    field_bg.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); field_bg.line.width = Pt(0.75)
    if len(field_bg.adjustments) > 0: field_bg.adjustments[0] = 0.3
    add_text(slide, val, fx + 0.1, fy + 0.27, 3.3, 0.32, font_size=11, color=DARK)

# Skills section
add_text(slide, "⚡  Your Skills  (select all that apply)", 0.55, 3.58, 7.5, 0.28,
         font_size=11, bold=True, color=SLATE)

skill_tags = [
    ("✓ Python", BLUE, WHITE), ("✓ Excel", BLUE, WHITE), ("✓ Statistics", BLUE, WHITE),
    ("SQL", SLATE_LIGHT, SLATE), ("Power BI", SLATE_LIGHT, SLATE),
    ("Machine Learning", SLATE_LIGHT, SLATE), ("Data Visualization", SLATE_LIGHT, SLATE),
    ("Git", SLATE_LIGHT, SLATE), ("Figma", SLATE_LIGHT, SLATE),
]
tx, ty = 0.55, 3.92
for i, (tag, bg, fg) in enumerate(skill_tags):
    tw = 1.2 if len(tag) < 10 else 1.7
    if tx + tw > 8.2: tx = 0.55; ty += 0.45
    tp = slide.shapes.add_shape(5, Inches(tx), Inches(ty), Inches(tw), Inches(0.32))
    tp.fill.solid(); tp.fill.fore_color.rgb = bg
    tp.line.fill.background()
    if len(tp.adjustments) > 0: tp.adjustments[0] = 0.5
    add_text(slide, tag, tx + 0.05, ty + 0.04, tw - 0.1, 0.26,
             font_size=10, bold=(bg == BLUE), color=fg, align=PP_ALIGN.CENTER)
    tx += tw + 0.15

# Target career
add_text(slide, "🎯  Target Career", 0.55, 4.98, 3, 0.28, font_size=11, bold=True, color=SLATE)
career_bg = slide.shapes.add_shape(5, Inches(0.55), Inches(5.3), Inches(3.5), Inches(0.44))
career_bg.fill.solid(); career_bg.fill.fore_color.rgb = RGBColor(0xEF, 0xF6, 0xFF)
career_bg.line.color.rgb = BLUE; career_bg.line.width = Pt(1.2)
if len(career_bg.adjustments) > 0: career_bg.adjustments[0] = 0.3
add_text(slide, "✓  Data Analyst", 0.65, 5.35, 3.3, 0.35, font_size=12, bold=True, color=BLUE)

# Analyze button
btn = slide.shapes.add_shape(5, Inches(0.55), Inches(5.95), Inches(4.5), Inches(0.58))
btn.fill.solid(); btn.fill.fore_color.rgb = BLUE
btn.line.fill.background()
if len(btn.adjustments) > 0: btn.adjustments[0] = 0.3
add_text(slide, "🔍   Analyze My Career", 0.56, 6.04, 4.48, 0.4,
         font_size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# Right: steps preview
right_card = slide.shapes.add_shape(5, Inches(8.7), Inches(1.7),
                                     Inches(4.4), Inches(5.4))
right_card.fill.solid(); right_card.fill.fore_color.rgb = WHITE
right_card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); right_card.line.width = Pt(0.75)
if len(right_card.adjustments) > 0: right_card.adjustments[0] = 0.05

add_text(slide, "What You'll Get", 8.95, 1.85, 4, 0.35, font_size=13, bold=True, color=DARK)

features = [
    ("🎯", "Career Match Score",    "See how well you fit your target role"),
    ("📊", "Skill Gap Report",      "Know exactly what's missing"),
    ("🗺️", "Personalized Roadmap", "Step-by-step learning plan"),
    ("💼", "Job Matches",           "Real opportunities matched to you"),
    ("🤖", "AI Explanation",        "Human-readable insights"),
]
for i, (ic, ttl, dsc) in enumerate(features):
    fy2 = 2.3 + i * 0.9
    add_text(slide, ic,  9.0, fy2, 0.4, 0.5, font_size=18)
    add_text(slide, ttl, 9.5, fy2, 3.3, 0.25, font_size=11, bold=True, color=DARK)
    add_text(slide, dsc, 9.5, fy2 + 0.28, 3.3, 0.28, font_size=9.5, color=SLATE)

slide_number(slide, 4)


# ══════════════════════════════════════════════════════════════════
# SLIDE 5 — AI Analysis Loading Animation
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "AI ANALYSIS IN ACTION", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Watch the AI Analyze Your Profile",
         0.2, 0.98, 9, 0.55, font_size=24, bold=True, color=DARK)

# Center card
center_card = slide.shapes.add_shape(5, Inches(3.5), Inches(1.7),
                                      Inches(6.3), Inches(5.5))
center_card.fill.solid(); center_card.fill.fore_color.rgb = WHITE
center_card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); center_card.line.width = Pt(0.75)
if len(center_card.adjustments) > 0: center_card.adjustments[0] = 0.06

# Robot icon circle
bot_circle = slide.shapes.add_shape(5, Inches(5.9), Inches(1.95),
                                     Inches(1.5), Inches(1.5))
bot_circle.fill.solid(); bot_circle.fill.fore_color.rgb = RGBColor(0xEF, 0xF6, 0xFF)
bot_circle.line.fill.background()
if len(bot_circle.adjustments) > 0: bot_circle.adjustments[0] = 0.5
add_text(slide, "🤖", 5.92, 2.05, 1.46, 1.3, font_size=42, align=PP_ALIGN.CENTER)

add_text(slide, "Analyzing Your Profile",
         3.7, 3.6, 5.9, 0.5, font_size=18, bold=True, color=DARK, align=PP_ALIGN.CENTER)
add_text(slide, "Powered by SkillBridge AI Engine",
         3.7, 4.05, 5.9, 0.35, font_size=11, color=SLATE, align=PP_ALIGN.CENTER)

ai_steps = [
    ("✓", "Reading profile...",                    GREEN, True),
    ("✓", "Extracting skills...",                  GREEN, True),
    ("✓", "Comparing career requirements...",      GREEN, True),
    ("⟳", "Identifying skill gaps...",             BLUE,  False),
    ("○", "Generating recommendations...",         SLATE, False),
]
for i, (ic, txt, col, done) in enumerate(ai_steps):
    sy = 4.55 + i * 0.47
    step_bg = slide.shapes.add_shape(5, Inches(3.7), Inches(sy),
                                      Inches(5.9), Inches(0.38))
    step_bg.fill.solid()
    step_bg.fill.fore_color.rgb = (
        RGBColor(0xEC, 0xFD, 0xF5) if done and ic == "✓" else
        RGBColor(0xEF, 0xF6, 0xFF) if ic == "⟳" else
        RGBColor(0xF8, 0xFA, 0xFC)
    )
    step_bg.line.fill.background()
    if len(step_bg.adjustments) > 0: step_bg.adjustments[0] = 0.3

    add_text(slide, ic,  3.85, sy + 0.04, 0.3, 0.3,
             font_size=13, bold=True, color=col, align=PP_ALIGN.CENTER)
    add_text(slide, txt, 4.2, sy + 0.07, 5.2, 0.25, font_size=11,
             color=GREEN if done else (BLUE if ic == "⟳" else SLATE))

# Overall progress bar
add_text(slide, "Progress", 3.7, 6.85, 2, 0.22, font_size=9, color=SLATE)
add_text(slide, "60%", 9.3, 6.85, 0.4, 0.22,
         font_size=9, bold=True, color=DARK, align=PP_ALIGN.RIGHT)
add_progress_bar(slide, 3.7, 7.1, 6.3, 60, BLUE)

# Left side context
add_text(slide, "Student Profile", 0.3, 1.9, 3, 0.3, font_size=14, bold=True, color=DARK)
profile_lines = [
    ("Name:", "Ananya Sharma"),
    ("Degree:", "B.Tech CSE"),
    ("Skills:", "Python, Excel, Statistics"),
    ("Projects:", "Sales Prediction System"),
    ("Certificates:", "Python Fundamentals"),
    ("Target:", "Data Analyst"),
]
for i, (lbl, val) in enumerate(profile_lines):
    py = 2.3 + i * 0.52
    add_text(slide, lbl, 0.3, py, 1.3, 0.3, font_size=10, bold=True, color=SLATE)
    add_text(slide, val, 1.65, py, 1.7, 0.3, font_size=10, color=DARK)

slide_number(slide, 5)


# ══════════════════════════════════════════════════════════════════
# SLIDE 6 — AI Analysis Results
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "AI ANALYSIS RESULTS", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Ananya's Career Intelligence Report — Data Analyst",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

# Top 3 score cards
metrics = [
    ("🎯", "Career Match", "92%", BLUE,   RGBColor(0xEF, 0xF6, 0xFF)),
    ("✅", "Job Readiness", "78%", GREEN,  RGBColor(0xEC, 0xFD, 0xF5)),
    ("⚡", "Skill Strength", "7 / 10", PURPLE, RGBColor(0xFA, 0xF5, 0xFF)),
]
for i, (icon, lbl, val, col, bg) in enumerate(metrics):
    cx2 = 0.25 + i * 4.38
    mc = slide.shapes.add_shape(5, Inches(cx2), Inches(1.65),
                                 Inches(4.1), Inches(1.6))
    mc.fill.solid(); mc.fill.fore_color.rgb = bg
    mc.line.color.rgb = col; mc.line.width = Pt(1.2)
    if len(mc.adjustments) > 0: mc.adjustments[0] = 0.07

    add_text(slide, icon, cx2 + 0.2, 1.78, 0.55, 0.7, font_size=24)
    add_text(slide, val,  cx2 + 0.8, 1.78, 2.8, 0.7,
             font_size=32, bold=True, color=col)
    add_text(slide, lbl,  cx2 + 0.2, 2.42, 3.7, 0.35,
             font_size=12, bold=True, color=DARK)

# Progress bars
bar_data = [
    ("Career Match",   92, BLUE),
    ("Job Readiness",  78, GREEN),
    ("Skill Strength", 70, PURPLE),
]
for i, (lbl, val, col) in enumerate(bar_data):
    add_progress_bar(slide, 0.25, 3.6 + i * 0.52, 13.0, val, col, lbl, f"{val}%")

# Skill status columns
add_text(slide, "✓  Skills You Have", 0.25, 4.85, 4, 0.32, font_size=13, bold=True, color=GREEN)
for s in ["Python", "Excel", "Statistics"]:
    idx = ["Python", "Excel", "Statistics"].index(s)
    sb = slide.shapes.add_shape(5, Inches(0.25), Inches(5.25 + idx * 0.45),
                                 Inches(3.8), Inches(0.36))
    sb.fill.solid(); sb.fill.fore_color.rgb = RGBColor(0xEC, 0xFD, 0xF5)
    sb.line.fill.background()
    if len(sb.adjustments) > 0: sb.adjustments[0] = 0.3
    add_text(slide, f"✓  {s}", 0.4, 5.28 + idx * 0.45, 3.5, 0.28,
             font_size=11, bold=True, color=GREEN)

add_text(slide, "✕  Skills Needed", 4.4, 4.85, 4, 0.32, font_size=13, bold=True, color=RED)
gaps = [("✕  SQL", RED, "HIGH"), ("✕  Power BI", RED, "HIGH"), ("⚠  Data Visualization", AMBER, "MEDIUM")]
for idx, (lbl, col, pri) in enumerate(gaps):
    sb = slide.shapes.add_shape(5, Inches(4.4), Inches(5.25 + idx * 0.45),
                                 Inches(3.8), Inches(0.36))
    sb.fill.solid(); sb.fill.fore_color.rgb = (
        RGBColor(0xFE, 0xF2, 0xF2) if col == RED else RGBColor(0xFF, 0xFB, 0xEB)
    )
    sb.line.fill.background()
    if len(sb.adjustments) > 0: sb.adjustments[0] = 0.3
    add_text(slide, lbl, 4.55, 5.28 + idx * 0.45, 2.5, 0.28,
             font_size=11, bold=True, color=col)
    pb = slide.shapes.add_shape(5, Inches(7.7), Inches(5.32 + idx * 0.45),
                                 Inches(0.55), Inches(0.22))
    pb.fill.solid(); pb.fill.fore_color.rgb = (
        RGBColor(0xFE, 0xE2, 0xE2) if col == RED else RGBColor(0xFE, 0xF3, 0xC7)
    )
    pb.line.fill.background()
    if len(pb.adjustments) > 0: pb.adjustments[0] = 0.5
    add_text(slide, pri, 7.71, 5.32 + idx * 0.45, 0.53, 0.22,
             font_size=7.5, bold=True, color=col, align=PP_ALIGN.CENTER)

# AI explanation box
ai_box = slide.shapes.add_shape(5, Inches(8.55), Inches(4.75),
                                  Inches(4.6), Inches(2.5))
ai_box.fill.solid(); ai_box.fill.fore_color.rgb = RGBColor(0xEF, 0xF6, 0xFF)
ai_box.line.color.rgb = BLUE; ai_box.line.width = Pt(1.0)
if len(ai_box.adjustments) > 0: ai_box.adjustments[0] = 0.06

add_text(slide, "🤖  AI Insight", 8.75, 4.88, 4, 0.3, font_size=11, bold=True, color=BLUE)
add_text(slide,
         '"Ananya already has a strong foundation in Python, '
         'Excel and Statistics. To become more competitive for '
         'Data Analyst roles, focus on SQL, Power BI and '
         'practical data visualization."',
         8.75, 5.25, 4.2, 1.8, font_size=10.5, color=DARK, italic=True)

slide_number(slide, 6)


# ══════════════════════════════════════════════════════════════════
# SLIDE 7 — Skill Gap Analysis (detailed)
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "SKILL GAP ANALYSIS", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Detailed Gap Breakdown — What to Learn & Why",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

gap_details = [
    ("SQL",                "Beginner",  "Intermediate", "HIGH",   95, RED,   "W3Schools SQL + Mode Analytics",   "3–4 weeks"),
    ("Power BI",           "None",      "Intermediate", "HIGH",   85, RED,   "Microsoft Learn — Power BI",       "3–5 weeks"),
    ("Data Visualization", "Basic",     "Intermediate", "MEDIUM", 78, AMBER, "Storytelling with Data + Tableau", "2–3 weeks"),
]

for i, (skill, cur, req, pri, imp, col, res, effort) in enumerate(gap_details):
    cy = 1.72 + i * 1.88
    card = slide.shapes.add_shape(5, Inches(0.25), Inches(cy),
                                   Inches(13.0), Inches(1.72))
    card.fill.solid(); card.fill.fore_color.rgb = WHITE
    card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); card.line.width = Pt(0.75)
    if len(card.adjustments) > 0: card.adjustments[0] = 0.05

    # Left accent
    acc = slide.shapes.add_shape(1, Inches(0.25), Inches(cy), Inches(0.07), Inches(1.72))
    acc.fill.solid(); acc.fill.fore_color.rgb = col
    acc.line.fill.background()

    # Skill name + priority
    add_text(slide, skill, 0.48, cy + 0.12, 3, 0.38, font_size=16, bold=True, color=DARK)

    pri_bg = slide.shapes.add_shape(5, Inches(0.48), Inches(cy + 0.55),
                                     Inches(0.85), Inches(0.27))
    pri_bg.fill.solid()
    pri_bg.fill.fore_color.rgb = (
        RGBColor(0xFE, 0xE2, 0xE2) if pri == "HIGH" else RGBColor(0xFE, 0xF3, 0xC7)
    )
    pri_bg.line.fill.background()
    if len(pri_bg.adjustments) > 0: pri_bg.adjustments[0] = 0.5
    add_text(slide, pri, 0.49, cy + 0.56, 0.83, 0.24,
             font_size=9, bold=True, color=col, align=PP_ALIGN.CENTER)

    # Importance bar
    add_text(slide, f"Importance: {imp}%", 0.48, cy + 0.93, 3, 0.22, font_size=9, color=SLATE)
    add_progress_bar(slide, 0.48, cy + 1.18, 2.8, imp, col)

    # Level boxes
    for j, (level_lbl, level_val, lc, lbg) in enumerate([
        ("Current Level", cur, RED, RGBColor(0xFE, 0xF2, 0xF2)),
        ("Required Level", req, GREEN, RGBColor(0xEC, 0xFD, 0xF5)),
    ]):
        lx = 3.5 + j * 2.0
        lb = slide.shapes.add_shape(5, Inches(lx), Inches(cy + 0.2),
                                     Inches(1.8), Inches(1.25))
        lb.fill.solid(); lb.fill.fore_color.rgb = lbg
        lb.line.color.rgb = lc; lb.line.width = Pt(0.75)
        if len(lb.adjustments) > 0: lb.adjustments[0] = 0.06
        add_text(slide, level_lbl, lx + 0.1, cy + 0.28, 1.6, 0.28,
                 font_size=9, color=SLATE, align=PP_ALIGN.CENTER)
        add_text(slide, level_val, lx + 0.1, cy + 0.6,  1.6, 0.45,
                 font_size=13, bold=True, color=lc, align=PP_ALIGN.CENTER)

    # Resource
    res_box = slide.shapes.add_shape(5, Inches(7.55), Inches(cy + 0.2),
                                      Inches(3.7), Inches(0.55))
    res_box.fill.solid(); res_box.fill.fore_color.rgb = RGBColor(0xEF, 0xF6, 0xFF)
    res_box.line.color.rgb = RGBColor(0xBF, 0xDB, 0xFE); res_box.line.width = Pt(0.75)
    if len(res_box.adjustments) > 0: res_box.adjustments[0] = 0.3
    add_text(slide, "📚  " + res, 7.65, cy + 0.28, 3.5, 0.4, font_size=10, color=BLUE, bold=True)

    # Effort
    add_text(slide, f"⏱  Effort: {effort}", 7.55, cy + 0.85, 3.7, 0.28,
             font_size=10, color=SLATE)

    # CTA
    cta = slide.shapes.add_shape(5, Inches(11.4), Inches(cy + 0.3),
                                   Inches(1.65), Inches(0.42))
    cta.fill.solid(); cta.fill.fore_color.rgb = col
    cta.line.fill.background()
    if len(cta.adjustments) > 0: cta.adjustments[0] = 0.3
    add_text(slide, "Start Learning →", 11.41, cy + 0.35, 1.63, 0.32,
             font_size=9.5, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

slide_number(slide, 7)


# ══════════════════════════════════════════════════════════════════
# SLIDE 8 — Personalized Roadmap
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = WHITE

add_logo(slide)
add_text(slide, "MY CAREER ROADMAP", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Personalized Learning Path — Data Analyst",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

# Progress overview bar
ov_card = slide.shapes.add_shape(5, Inches(0.25), Inches(1.62), Inches(13.0), Inches(0.72))
ov_card.fill.solid(); ov_card.fill.fore_color.rgb = RGBColor(0xEF, 0xF6, 0xFF)
ov_card.line.color.rgb = RGBColor(0xBF, 0xDB, 0xFE); ov_card.line.width = Pt(0.75)
if len(ov_card.adjustments) > 0: ov_card.adjustments[0] = 0.05
add_text(slide, "Overall Roadmap Progress", 0.45, 1.7, 5, 0.28, font_size=11, bold=True, color=DARK)
add_text(slide, "1 of 6 steps completed   |   Overall: 27%", 0.45, 1.98, 7, 0.22, font_size=9.5, color=SLATE)
add_progress_bar(slide, 6.5, 1.9, 6.5, 27, BLUE)

# Roadmap steps
road_steps = [
    ("01", "SQL Fundamentals",             65,  "in-progress", "W3Schools SQL, Mode Analytics, Khan Academy",   "3 weeks"),
    ("02", "Power BI",                      0,  "locked",      "Microsoft Learn, SQLBI, Guy in a Cube",         "4 weeks"),
    ("03", "Data Visualization",            0,  "locked",      "Storytelling with Data, Tableau Public",        "3 weeks"),
    ("04", "Real-world Project",            0,  "locked",      "Kaggle, GitHub, Towards Data Science",          "2 weeks"),
    ("05", "Google Analytics Certificate", 0,   "locked",      "Coursera — Google, DataCamp",                   "4 weeks"),
    ("06", "Apply for Jobs",               0,   "locked",      "LinkedIn, Internshala, Naukri",                 "Ongoing"),
]

for i, (num, title, prog, status, res, dur) in enumerate(road_steps):
    col_i = i % 3
    row_i = i // 3
    cx3 = 0.25 + col_i * 4.38
    cy3 = 2.55 + row_i * 2.38

    is_active   = status == "in-progress"
    is_complete = status == "complete"
    card_col    = RGBColor(0xEF, 0xF6, 0xFF) if is_active else WHITE
    border_col  = BLUE if is_active else RGBColor(0xE2, 0xE8, 0xF0)
    num_col     = GREEN if is_complete else (BLUE if is_active else SLATE)
    num_bg_col  = RGBColor(0xEC, 0xFD, 0xF5) if is_complete else (RGBColor(0xEF, 0xF6, 0xFF) if is_active else SLATE_LIGHT)

    step_card = slide.shapes.add_shape(5, Inches(cx3), Inches(cy3),
                                        Inches(4.1), Inches(2.2))
    step_card.fill.solid(); step_card.fill.fore_color.rgb = card_col
    step_card.line.color.rgb = border_col
    step_card.line.width = Pt(1.5 if is_active else 0.75)
    if len(step_card.adjustments) > 0: step_card.adjustments[0] = 0.06

    # Number
    nb = slide.shapes.add_shape(5, Inches(cx3 + 0.18), Inches(cy3 + 0.18),
                                  Inches(0.5), Inches(0.5))
    nb.fill.solid(); nb.fill.fore_color.rgb = num_bg_col
    nb.line.fill.background()
    if len(nb.adjustments) > 0: nb.adjustments[0] = 0.5
    add_text(slide, "✓" if is_complete else num,
             cx3 + 0.19, cy3 + 0.2, 0.48, 0.46,
             font_size=11, bold=True, color=num_col, align=PP_ALIGN.CENTER)

    # Status badge
    badge_col = GREEN if is_active else (RGBColor(0xD1, 0xFA, 0xE5) if is_complete else SLATE_LIGHT)
    badge_text_col = GREEN if is_active else (GREEN if is_complete else SLATE)
    badge_txt = "In Progress" if is_active else ("Done!" if is_complete else "Upcoming")
    bb = slide.shapes.add_shape(5, Inches(cx3 + 2.8), Inches(cy3 + 0.2),
                                 Inches(1.1), Inches(0.28))
    bb.fill.solid(); bb.fill.fore_color.rgb = (
        RGBColor(0xEF, 0xF6, 0xFF) if is_active else SLATE_LIGHT
    )
    bb.line.fill.background()
    if len(bb.adjustments) > 0: bb.adjustments[0] = 0.5
    add_text(slide, badge_txt, cx3 + 2.81, cy3 + 0.2, 1.08, 0.28,
             font_size=8.5, bold=True,
             color=BLUE if is_active else SLATE, align=PP_ALIGN.CENTER)

    add_text(slide, title, cx3 + 0.78, cy3 + 0.2, 1.9, 0.4,
             font_size=12, bold=True, color=DARK)
    add_text(slide, f"📚 {res}", cx3 + 0.18, cy3 + 0.7, 3.8, 0.45,
             font_size=9, color=SLATE)
    add_text(slide, f"⏱  {dur}", cx3 + 0.18, cy3 + 1.15, 2, 0.22, font_size=9, color=SLATE)

    # Progress bar
    add_progress_bar(slide, cx3 + 0.18, cy3 + 1.42, 3.7, prog,
                     BLUE if is_active else (GREEN if is_complete else SLATE_LIGHT),
                     "", f"{prog}%")

    # Button
    if is_active:
        btn_b = slide.shapes.add_shape(5, Inches(cx3 + 0.18), Inches(cy3 + 1.75),
                                        Inches(2.0), Inches(0.33))
        btn_b.fill.solid(); btn_b.fill.fore_color.rgb = BLUE
        btn_b.line.fill.background()
        if len(btn_b.adjustments) > 0: btn_b.adjustments[0] = 0.3
        add_text(slide, "▶  Continue Learning", cx3 + 0.19, cy3 + 1.79,
                 1.98, 0.25, font_size=9, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

slide_number(slide, 8)


# ══════════════════════════════════════════════════════════════════
# SLIDE 9 — Opportunity Matching
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "AI OPPORTUNITY MATCH", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Jobs & Internships Matched to Your Profile",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

# Filters bar
filt_card = slide.shapes.add_shape(5, Inches(0.25), Inches(1.65),
                                    Inches(13.0), Inches(0.55))
filt_card.fill.solid(); filt_card.fill.fore_color.rgb = WHITE
filt_card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); filt_card.line.width = Pt(0.75)
if len(filt_card.adjustments) > 0: filt_card.adjustments[0] = 0.04

filters_show = [
    ("Type: All", 0.5), ("Location: All", 2.2), ("Match: 70%+", 4.2), ("Sort: Match %", 6.0),
]
for fl, fx in filters_show:
    fb = slide.shapes.add_shape(5, Inches(fx), Inches(1.72), Inches(1.5), Inches(0.33))
    fb.fill.solid(); fb.fill.fore_color.rgb = BG
    fb.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); fb.line.width = Pt(0.75)
    if len(fb.adjustments) > 0: fb.adjustments[0] = 0.3
    add_text(slide, fl, fx + 0.05, 1.74, 1.4, 0.29, font_size=9.5, color=SLATE)
add_text(slide, "5 opportunities found", 11.3, 1.76, 2, 0.25,
         font_size=9.5, color=SLATE, align=PP_ALIGN.RIGHT)

opportunities = [
    ("📊", "Data Analyst Intern",    "DataNova Analytics",  "Bengaluru", "Internship",  "₹15,000/mo",
     92, ["SQL", "Excel", "Power BI", "Statistics"],
     ["Python ✓", "Excel ✓", "Statistics ✓"], ["SQL ✕", "Power BI ✕"]),
    ("💼", "Junior Business Analyst","TechCorp Solutions",  "Remote",    "Full-time",   "₹5.5 LPA",
     84, ["Excel", "SQL", "Statistics", "Comm."],
     ["Excel ✓", "Statistics ✓"], ["SQL ✕"]),
    ("🤖", "Data Science Intern",    "AI Ventures",         "Hyderabad", "Internship",  "₹20,000/mo",
     79, ["Python", "ML", "Statistics", "SQL"],
     ["Python ✓", "Statistics ✓"], ["ML ✕", "SQL ✕"]),
    ("🚀", "Product Analyst Intern", "StartupX",            "Mumbai",    "Internship",  "₹12,000/mo",
     76, ["Excel", "SQL", "Python", "Comm."],
     ["Python ✓", "Excel ✓"], ["SQL ✕"]),
]

for i, (logo, title, company, loc, typ, pay, match, req, have, miss) in enumerate(opportunities):
    col_i = i % 2
    row_i = i // 2
    cx = 0.25 + col_i * 6.65
    cy = 2.45 + row_i * 2.58

    ocard = slide.shapes.add_shape(5, Inches(cx), Inches(cy),
                                    Inches(6.35), Inches(2.38))
    ocard.fill.solid(); ocard.fill.fore_color.rgb = WHITE
    ocard.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); ocard.line.width = Pt(0.75)
    if len(ocard.adjustments) > 0: ocard.adjustments[0] = 0.06

    # Logo
    add_text(slide, logo, cx + 0.18, cy + 0.2, 0.55, 0.55, font_size=24)

    # Title + company
    add_text(slide, title,   cx + 0.8, cy + 0.2,  4.8, 0.35, font_size=13, bold=True, color=DARK)
    add_text(slide, company, cx + 0.8, cy + 0.55, 4.8, 0.28, font_size=10, color=SLATE)

    # Match badge
    match_col = GREEN if match >= 80 else AMBER
    match_bg  = RGBColor(0xEC, 0xFD, 0xF5) if match >= 80 else RGBColor(0xFF, 0xFB, 0xEB)
    mb = slide.shapes.add_shape(5, Inches(cx + 5.1), Inches(cy + 0.18),
                                  Inches(1.02), Inches(0.34))
    mb.fill.solid(); mb.fill.fore_color.rgb = match_bg
    mb.line.fill.background()
    if len(mb.adjustments) > 0: mb.adjustments[0] = 0.5
    add_text(slide, f"{match}% Match", cx + 5.11, cy + 0.2, 1.0, 0.3,
             font_size=9.5, bold=True, color=match_col, align=PP_ALIGN.CENTER)

    # Tags
    for j, tag in enumerate([(f"📍 {loc}", SLATE_LIGHT, SLATE), (typ, RGBColor(0xEF, 0xF6, 0xFF), BLUE), (pay, RGBColor(0xEC, 0xFD, 0xF5), GREEN)]):
        txt, tbg, tcol = tag
        tw = 1.35
        tb = slide.shapes.add_shape(5, Inches(cx + 0.18 + j * 1.5), Inches(cy + 0.88),
                                     Inches(tw), Inches(0.28))
        tb.fill.solid(); tb.fill.fore_color.rgb = tbg
        tb.line.fill.background()
        if len(tb.adjustments) > 0: tb.adjustments[0] = 0.5
        add_text(slide, txt, cx + 0.19 + j * 1.5, cy + 0.88, tw - 0.02, 0.28,
                 font_size=8.5, color=tcol, align=PP_ALIGN.CENTER)

    # Skills match
    add_text(slide, "Your Match:", cx + 0.18, cy + 1.28, 2, 0.22, font_size=9, bold=True, color=DARK)
    all_skills = [(s, GREEN) for s in have] + [(s, RED) for s in miss]
    for k, (sk, sc) in enumerate(all_skills[:4]):
        add_text(slide, sk, cx + 0.18 + (k % 2) * 2.8, cy + 1.52 + (k // 2) * 0.28,
                 2.7, 0.25, font_size=9, color=sc, bold=True)

    # Button
    btn_card = slide.shapes.add_shape(5, Inches(cx + 0.18), Inches(cy + 2.0),
                                       Inches(2.5), Inches(0.3))
    btn_card.fill.solid(); btn_card.fill.fore_color.rgb = BLUE
    btn_card.line.fill.background()
    if len(btn_card.adjustments) > 0: btn_card.adjustments[0] = 0.3
    add_text(slide, "View Opportunity →", cx + 0.19, cy + 2.02, 2.48, 0.26,
             font_size=9, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

slide_number(slide, 9)


# ══════════════════════════════════════════════════════════════════
# SLIDE 10 — Student Dashboard
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "STUDENT DASHBOARD", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Good morning, Ananya 👋  —  Your Career Intelligence Hub",
         0.2, 0.98, 12, 0.52, font_size=22, bold=True, color=DARK)

# 4 stat cards
stat_cards = [
    ("🎯", "Career Match", "92%",     "for Data Analyst",   BLUE,   RGBColor(0xEF, 0xF6, 0xFF)),
    ("✅", "Job Readiness", "78%",    "overall readiness",   GREEN,  RGBColor(0xEC, 0xFD, 0xF5)),
    ("⚡", "Skills",        "7 / 10", "required skills",     PURPLE, RGBColor(0xFA, 0xF5, 0xFF)),
    ("📊", "Skill Gaps",   "3",       "skills to learn",     AMBER,  RGBColor(0xFF, 0xF7, 0xED)),
]
for i, (icon, lbl, val, sub, col, bg) in enumerate(stat_cards):
    scx = 0.25 + i * 3.28
    sc = slide.shapes.add_shape(5, Inches(scx), Inches(1.68),
                                  Inches(3.1), Inches(1.45))
    sc.fill.solid(); sc.fill.fore_color.rgb = bg
    sc.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); sc.line.width = Pt(0.75)
    if len(sc.adjustments) > 0: sc.adjustments[0] = 0.06

    ic_bg = slide.shapes.add_shape(5, Inches(scx + 0.18), Inches(1.82),
                                    Inches(0.52), Inches(0.52))
    ic_bg.fill.solid()
    ic_bg.fill.fore_color.rgb = bg
    ic_bg.line.fill.background()
    if len(ic_bg.adjustments) > 0: ic_bg.adjustments[0] = 0.3
    add_text(slide, icon, scx + 0.18, 1.85, 0.52, 0.45, font_size=20)

    add_text(slide, val, scx + 0.18, 2.42, 2.8, 0.5,
             font_size=26, bold=True, color=col)
    add_text(slide, lbl, scx + 0.18, 2.9, 2.8, 0.28, font_size=11, bold=True, color=DARK)
    add_text(slide, sub, scx + 0.18, 3.16, 2.8, 0.22, font_size=9, color=SLATE)

# AI Recommendation
ai_rec_card = slide.shapes.add_shape(5, Inches(0.25), Inches(3.32),
                                      Inches(8.5), Inches(1.55))
ai_rec_card.fill.solid(); ai_rec_card.fill.fore_color.rgb = WHITE
ai_rec_card.line.color.rgb = BLUE; ai_rec_card.line.width = Pt(1.5)
if len(ai_rec_card.adjustments) > 0: ai_rec_card.adjustments[0] = 0.06
# Left blue bar
lb = slide.shapes.add_shape(1, Inches(0.25), Inches(3.32), Inches(0.06), Inches(1.55))
lb.fill.solid(); lb.fill.fore_color.rgb = BLUE
lb.line.fill.background()

add_text(slide, "🤖  Your AI Recommendation", 0.45, 3.4, 7, 0.3,
         font_size=12, bold=True, color=BLUE)
add_text(slide,
         '"Complete SQL fundamentals next. After that, build one Power BI dashboard project '
         'to improve your Data Analyst readiness from 78% to ~90%."',
         0.45, 3.75, 8.1, 0.9, font_size=11, color=DARK, italic=True)

# Quick stats panel (right)
qs_card = slide.shapes.add_shape(5, Inches(9.0), Inches(3.32),
                                   Inches(4.2), Inches(1.55))
qs_card.fill.solid(); qs_card.fill.fore_color.rgb = WHITE
qs_card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); qs_card.line.width = Pt(0.75)
if len(qs_card.adjustments) > 0: qs_card.adjustments[0] = 0.06

qs_items = [
    ("🎯", "Goal", "Data Analyst"),
    ("🗺️", "Roadmap", "27% done"),
    ("⚡", "Top Skill", "SQL"),
    ("💼", "Best Match", "92%"),
]
for i, (ic, lbl, val) in enumerate(qs_items):
    qiy = 3.42 + i * 0.36
    add_text(slide, ic,  9.15, qiy, 0.3, 0.3, font_size=12)
    add_text(slide, lbl, 9.5,  qiy, 1.4, 0.28, font_size=9, color=SLATE)
    add_text(slide, val, 10.9, qiy, 2.2, 0.28,
             font_size=10, bold=True, color=DARK, align=PP_ALIGN.RIGHT)

# Progress section
add_text(slide, "Roadmap Progress", 0.25, 5.0, 4, 0.3, font_size=12, bold=True, color=DARK)
add_progress_bar(slide, 0.25, 5.38, 8.7, 27, BLUE, "27% Complete", "")
add_text(slide, "1 of 6 steps done", 0.25, 5.55, 4, 0.25, font_size=9, color=SLATE)

# Top opportunity card
top_opp = slide.shapes.add_shape(5, Inches(9.0), Inches(5.0),
                                   Inches(4.2), Inches(2.18))
top_opp.fill.solid(); top_opp.fill.fore_color.rgb = WHITE
top_opp.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); top_opp.line.width = Pt(0.75)
if len(top_opp.adjustments) > 0: top_opp.adjustments[0] = 0.06

add_text(slide, "🏆  Best Opportunity", 9.15, 5.08, 4, 0.28, font_size=10, bold=True, color=AMBER)
add_text(slide, "Data Analyst Intern",  9.15, 5.4,  4, 0.35, font_size=13, bold=True, color=DARK)
add_text(slide, "DataNova Analytics · Bengaluru", 9.15, 5.78, 4, 0.28, font_size=10, color=SLATE)
mb2 = slide.shapes.add_shape(5, Inches(9.15), Inches(6.1),
                               Inches(1.05), Inches(0.3))
mb2.fill.solid(); mb2.fill.fore_color.rgb = RGBColor(0xEC, 0xFD, 0xF5)
mb2.line.fill.background()
if len(mb2.adjustments) > 0: mb2.adjustments[0] = 0.5
add_text(slide, "92% Match", 9.16, 6.11, 1.03, 0.28,
         font_size=9, bold=True, color=GREEN, align=PP_ALIGN.CENTER)

b3 = slide.shapes.add_shape(5, Inches(9.15), Inches(6.55),
                              Inches(2.2), Inches(0.35))
b3.fill.solid(); b3.fill.fore_color.rgb = BLUE
b3.line.fill.background()
if len(b3.adjustments) > 0: b3.adjustments[0] = 0.3
add_text(slide, "View Opportunity →", 9.16, 6.58, 2.18, 0.29,
         font_size=9.5, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

slide_number(slide, 10)


# ══════════════════════════════════════════════════════════════════
# SLIDE 11 — Career Explorer
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "EXPLORE CAREERS", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "7 Career Paths — Find Your Perfect Fit",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

careers = [
    ("📊", "Data Analyst",          ["Python","SQL","Excel","Power BI"],          92, BLUE),
    ("🤖", "AI/ML Engineer",        ["Python","ML","TensorFlow","Statistics"],     55, PURPLE),
    ("💻", "Software Developer",    ["DSA","Algorithms","Git","Database"],         30, GREEN),
    ("🔐", "Cybersecurity Analyst", ["Networking","Linux","Python","SIEM"],        20, RED),
    ("🎨", "UI/UX Designer",        ["Figma","UX Research","Wireframing"],          0, RGBColor(0xDB,0x27,0x77)),
    ("☁️", "Cloud Engineer",        ["AWS/Azure","Docker","Kubernetes","Linux"],    0, CYAN),
    ("🚀", "Product Manager",       ["Product","SQL","Agile","User Research"],     15, AMBER),
]

for i, (icon, name, skills, match, col) in enumerate(careers):
    ci = i % 4
    ri = i // 4
    cx4 = 0.25 + ci * 3.3
    cy4 = 1.72 + ri * 2.75

    ccard = slide.shapes.add_shape(5, Inches(cx4), Inches(cy4),
                                    Inches(3.1), Inches(2.55))
    ccard.fill.solid(); ccard.fill.fore_color.rgb = WHITE
    ccard.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); ccard.line.width = Pt(0.75)
    if len(ccard.adjustments) > 0: ccard.adjustments[0] = 0.06

    # Top bar
    tb = slide.shapes.add_shape(1, Inches(cx4), Inches(cy4), Inches(3.1), Inches(0.07))
    tb.fill.solid(); tb.fill.fore_color.rgb = col
    tb.line.fill.background()

    add_text(slide, icon, cx4 + 0.15, cy4 + 0.14, 0.52, 0.52, font_size=24)
    add_text(slide, name, cx4 + 0.72, cy4 + 0.2, 2.2, 0.4, font_size=12, bold=True, color=DARK)

    # Match bar
    add_text(slide, f"Your Match: {match}%", cx4 + 0.15, cy4 + 0.72, 2.8, 0.25,
             font_size=9, color=SLATE)
    add_progress_bar(slide, cx4 + 0.15, cy4 + 1.0, 2.8, match, col)

    # Skills
    for k, sk in enumerate(skills[:3]):
        sk_bg = slide.shapes.add_shape(5, Inches(cx4 + 0.15 + (k % 2) * 1.35),
                                        Inches(cy4 + 1.22 + (k // 2) * 0.35),
                                        Inches(1.22), Inches(0.28))
        sk_bg.fill.solid(); sk_bg.fill.fore_color.rgb = SLATE_LIGHT
        sk_bg.line.fill.background()
        if len(sk_bg.adjustments) > 0: sk_bg.adjustments[0] = 0.5
        add_text(slide, sk[:12], cx4 + 0.16 + (k % 2) * 1.35,
                 cy4 + 1.22 + (k // 2) * 0.35, 1.2, 0.28,
                 font_size=8, color=SLATE, align=PP_ALIGN.CENTER)

    # Button
    btn4 = slide.shapes.add_shape(5, Inches(cx4 + 0.15), Inches(cy4 + 2.12),
                                   Inches(2.2), Inches(0.32))
    btn4.fill.solid(); btn4.fill.fore_color.rgb = col
    btn4.line.fill.background()
    if len(btn4.adjustments) > 0: btn4.adjustments[0] = 0.3
    add_text(slide, "🎯 Check My Match", cx4 + 0.16, cy4 + 2.14, 2.18, 0.28,
             font_size=9, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# Last card placeholder if 7
if len(careers) < 8:
    lx = 0.25 + 3 * 3.3
    ly = 1.72 + 1 * 2.75
    lc = slide.shapes.add_shape(5, Inches(lx), Inches(ly), Inches(3.1), Inches(2.55))
    lc.fill.solid(); lc.fill.fore_color.rgb = SLATE_LIGHT
    lc.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); lc.line.width = Pt(0.75)
    if len(lc.adjustments) > 0: lc.adjustments[0] = 0.06
    add_text(slide, "More careers\ncoming soon...", lx + 0.55, ly + 0.9, 2, 0.8,
             font_size=12, color=SLATE, align=PP_ALIGN.CENTER)

slide_number(slide, 11)


# ══════════════════════════════════════════════════════════════════
# SLIDE 12 — BridgeBot AI Assistant
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "BRIDGEBOT AI ASSISTANT", 0.2, 0.72, 7, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Your Personal AI Career Advisor — Available 24/7",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

# Chat window
chat_card = slide.shapes.add_shape(5, Inches(0.3), Inches(1.7),
                                    Inches(7.5), Inches(5.6))
chat_card.fill.solid(); chat_card.fill.fore_color.rgb = WHITE
chat_card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); chat_card.line.width = Pt(0.75)
if len(chat_card.adjustments) > 0: chat_card.adjustments[0] = 0.06

# Chat header
chat_hdr = slide.shapes.add_shape(1, Inches(0.3), Inches(1.7), Inches(7.5), Inches(0.75))
chat_hdr.fill.solid(); chat_hdr.fill.fore_color.rgb = DARK2
chat_hdr.line.fill.background()
add_text(slide, "🤖  BridgeBot", 0.55, 1.78, 5, 0.32, font_size=13, bold=True, color=WHITE)
add_text(slide, "● Online", 0.55, 2.1, 2.5, 0.22, font_size=9.5, color=RGBColor(0x6E, 0xE7, 0xB7))

# Suggested pills
sug_qs = [
    "What skills should I learn next?",
    "Am I ready for Data Analyst jobs?",
]
for i, q in enumerate(sug_qs):
    qb = slide.shapes.add_shape(5, Inches(0.5), Inches(2.6 + i * 0.52),
                                  Inches(5.0), Inches(0.38))
    qb.fill.solid(); qb.fill.fore_color.rgb = RGBColor(0xEF, 0xF6, 0xFF)
    qb.line.color.rgb = RGBColor(0xBF, 0xDB, 0xFE); qb.line.width = Pt(0.75)
    if len(qb.adjustments) > 0: qb.adjustments[0] = 0.5
    add_text(slide, f"💬  {q}", 0.6, 2.63 + i * 0.52, 4.8, 0.3,
             font_size=10, color=BLUE)

# Chat messages
chats = [
    ("user",  "What skills should I learn next?"),
    ("bot",   "Based on your profile, I recommend focusing on SQL first — it's the highest priority gap for Data Analyst. After that, tackle Power BI to build dashboard skills. These two will boost your readiness from 78% to over 88%."),
    ("user",  "Which career suits my profile?"),
    ("bot",   "Your skills (Python, Excel, Statistics) align best with Data Analyst (92% match). You're also a good fit for Business Analyst (80%) and Data Science (70%)."),
]
chat_y = 3.75
for role, msg in chats:
    is_user = role == "user"
    if is_user:
        bubble = slide.shapes.add_shape(5, Inches(2.5), Inches(chat_y),
                                         Inches(5.0), Inches(0.38))
        bubble.fill.solid(); bubble.fill.fore_color.rgb = BLUE
        bubble.line.fill.background()
        if len(bubble.adjustments) > 0: bubble.adjustments[0] = 0.3
        add_text(slide, msg, 2.6, chat_y + 0.05, 4.8, 0.28,
                 font_size=9.5, bold=True, color=WHITE, align=PP_ALIGN.RIGHT)
        chat_y += 0.52
    else:
        lines = [msg[i:i+68] for i in range(0, len(msg), 68)]
        bh = 0.3 + len(lines) * 0.22
        bubble = slide.shapes.add_shape(5, Inches(0.5), Inches(chat_y),
                                         Inches(6.5), Inches(bh))
        bubble.fill.solid(); bubble.fill.fore_color.rgb = SLATE_LIGHT
        bubble.line.fill.background()
        if len(bubble.adjustments) > 0: bubble.adjustments[0] = 0.3
        add_text(slide, msg, 0.6, chat_y + 0.04, 6.3, bh - 0.08,
                 font_size=9.5, color=DARK)
        chat_y += bh + 0.18

# Input bar
inp_bg = slide.shapes.add_shape(5, Inches(0.3), Inches(6.88),
                                  Inches(7.5), Inches(0.42))
inp_bg.fill.solid(); inp_bg.fill.fore_color.rgb = BG
inp_bg.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); inp_bg.line.width = Pt(0.75)
add_text(slide, "Ask anything about your career...", 0.5, 6.92, 6.5, 0.3,
         font_size=10, color=RGBColor(0x94, 0xA3, 0xB8), italic=True)

# Right: Features
add_text(slide, "BridgeBot Can Help With:", 8.1, 1.75, 5, 0.35, font_size=14, bold=True, color=DARK)

features_bot = [
    ("🎯", "Career Matching",       "Compares your profile to any career"),
    ("📊", "Skill Gap Advice",      "Tells you exactly what to learn next"),
    ("🗺️", "Roadmap Guidance",     "Step-by-step learning recommendations"),
    ("💼", "Job Search Tips",       "How to stand out for internships"),
    ("📈", "Progress Tracking",     "Checks your improvement over time"),
    ("🤝", "Interview Prep",        "Common questions for your target role"),
]
for i, (ic, ttl, dsc) in enumerate(features_bot):
    fy = 2.25 + i * 0.85
    fb_card = slide.shapes.add_shape(5, Inches(8.1), Inches(fy),
                                      Inches(5.0), Inches(0.72))
    fb_card.fill.solid(); fb_card.fill.fore_color.rgb = WHITE
    fb_card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); fb_card.line.width = Pt(0.75)
    if len(fb_card.adjustments) > 0: fb_card.adjustments[0] = 0.05
    add_text(slide, ic,  8.25, fy + 0.1,  0.4, 0.52, font_size=20)
    add_text(slide, ttl, 8.72, fy + 0.1,  4.2, 0.28, font_size=11, bold=True, color=DARK)
    add_text(slide, dsc, 8.72, fy + 0.38, 4.2, 0.25, font_size=9.5, color=SLATE)

slide_number(slide, 12)


# ══════════════════════════════════════════════════════════════════
# SLIDE 13 — Tech Stack & Architecture
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "TECHNOLOGY STACK", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Built with Modern, Production-Grade Technologies",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

# Stack cards
stack = [
    ("⚛️",  "React 19",         "UI Framework",        "Component-based SPA architecture", BLUE),
    ("⚡",  "Vite 8",           "Build Tool",          "Lightning-fast HMR dev server",     AMBER),
    ("🎨",  "Tailwind CSS v4",  "Styling",             "Utility-first, custom design tokens",CYAN),
    ("🔄",  "React Context",    "State Management",    "Global state — no Redux needed",     PURPLE),
    ("🤖",  "AI Logic (JS)",    "Skill Matching",      "Match score = matched/total × 100", GREEN),
    ("📱",  "Responsive Design","Mobile-first",        "Desktop + tablet + mobile ready",   RGBColor(0xDB,0x27,0x77)),
]

for i, (icon, tech, cat, desc, col) in enumerate(stack):
    ci = i % 3
    ri = i // 3
    sx = 0.25 + ci * 4.37
    sy = 1.72 + ri * 2.62

    sc = slide.shapes.add_shape(5, Inches(sx), Inches(sy),
                                  Inches(4.12), Inches(2.38))
    sc.fill.solid(); sc.fill.fore_color.rgb = WHITE
    sc.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); sc.line.width = Pt(0.75)
    if len(sc.adjustments) > 0: sc.adjustments[0] = 0.06

    # Icon circle
    ic_c = slide.shapes.add_shape(5, Inches(sx + 0.2), Inches(sy + 0.22),
                                   Inches(0.7), Inches(0.7))
    ic_c.fill.solid()
    # Light version of col
    ic_c.fill.fore_color.rgb = SLATE_LIGHT
    ic_c.line.fill.background()
    if len(ic_c.adjustments) > 0: ic_c.adjustments[0] = 0.5
    add_text(slide, icon, sx + 0.21, sy + 0.25, 0.68, 0.62, font_size=24, align=PP_ALIGN.CENTER)

    # Category pill
    cp = slide.shapes.add_shape(5, Inches(sx + 1.0), Inches(sy + 0.28),
                                  Inches(1.2), Inches(0.26))
    cp.fill.solid(); cp.fill.fore_color.rgb = SLATE_LIGHT
    cp.line.fill.background()
    if len(cp.adjustments) > 0: cp.adjustments[0] = 0.5
    add_text(slide, cat, sx + 1.01, sy + 0.28, 1.18, 0.26,
             font_size=8, color=SLATE, align=PP_ALIGN.CENTER)

    add_text(slide, tech, sx + 0.2, sy + 0.64, 3.7, 0.4, font_size=16, bold=True, color=DARK)
    add_text(slide, desc, sx + 0.2, sy + 1.08, 3.7, 0.5, font_size=10.5, color=SLATE)

    # Bottom accent line
    acc2 = slide.shapes.add_shape(1, Inches(sx), Inches(sy + 2.31), Inches(4.12), Inches(0.07))
    acc2.fill.solid(); acc2.fill.fore_color.rgb = col
    acc2.line.fill.background()

# AI Formula box
formula_card = slide.shapes.add_shape(5, Inches(0.25), Inches(6.98),
                                       Inches(13.0), Inches(0.35))
formula_card.fill.solid(); formula_card.fill.fore_color.rgb = RGBColor(0xEF, 0xF6, 0xFF)
formula_card.line.color.rgb = BLUE; formula_card.line.width = Pt(1.0)
if len(formula_card.adjustments) > 0: formula_card.adjustments[0] = 0.3
add_text(slide,
         "🧠  AI Formula:   Match Score = (Matched Required Skills ÷ Total Required Skills) × 100   "
         "|   Job Readiness = Match × 0.75 + Project Bonus + Certificate Bonus",
         0.4, 7.0, 12.7, 0.28, font_size=10, bold=True, color=BLUE)

slide_number(slide, 13)


# ══════════════════════════════════════════════════════════════════
# SLIDE 14 — Key Features Summary
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = WHITE

add_logo(slide)
add_text(slide, "KEY FEATURES", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "Everything a Student Needs — In One Platform",
         0.2, 0.98, 11, 0.52, font_size=22, bold=True, color=DARK)

features_list = [
    ("🎯", "AI Career Matching",      "Smart skill-to-career matching with real match percentages",          BLUE),
    ("📊", "Skill Gap Detection",     "Detailed gap analysis with priority levels and learning resources",   RED),
    ("🗺️", "Personalized Roadmap",   "Step-by-step learning path with progress tracking",                  PURPLE),
    ("💼", "Opportunity Matching",    "AI-curated internships & jobs filtered by your match score",          GREEN),
    ("🚀", "Career Explorer",         "Compare yourself to 7 career paths with instant match scores",       CYAN),
    ("🤖", "BridgeBot Assistant",     "24/7 AI advisor for career questions and personalized tips",         AMBER),
    ("📱", "Responsive Design",       "Fully works on desktop, tablet, and mobile devices",                 BLUE),
    ("🎭", "Demo Mode",               "One-click demo loads Ananya's complete profile for presentations",    PURPLE),
]

for i, (icon, title, desc, col) in enumerate(features_list):
    ci = i % 2
    ri = i // 2
    fx = 0.25 + ci * 6.65
    fy = 1.72 + ri * 1.38

    fc = slide.shapes.add_shape(5, Inches(fx), Inches(fy),
                                  Inches(6.4), Inches(1.22))
    fc.fill.solid(); fc.fill.fore_color.rgb = WHITE
    fc.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); fc.line.width = Pt(0.75)
    if len(fc.adjustments) > 0: fc.adjustments[0] = 0.05

    # Side bar
    sb = slide.shapes.add_shape(1, Inches(fx), Inches(fy), Inches(0.06), Inches(1.22))
    sb.fill.solid(); sb.fill.fore_color.rgb = col
    sb.line.fill.background()

    add_text(slide, icon, fx + 0.2, fy + 0.27, 0.52, 0.65, font_size=24)
    add_text(slide, title, fx + 0.82, fy + 0.18, 5.3, 0.38, font_size=13, bold=True, color=DARK)
    add_text(slide, desc,  fx + 0.82, fy + 0.6,  5.3, 0.52, font_size=10.5, color=SLATE)

slide_number(slide, 14)


# ══════════════════════════════════════════════════════════════════
# SLIDE 15 — Demo Mode
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
slide.background.fill.solid()
slide.background.fill.fore_color.rgb = BG

add_logo(slide)
add_text(slide, "DEMO MODE", 0.2, 0.72, 6, 0.28, font_size=11, bold=True, color=BLUE)
add_text(slide, "One-Click Demo — Perfect for Live Presentations",
         0.2, 0.98, 10, 0.52, font_size=22, bold=True, color=DARK)

# Big demo button visualization
demo_btn = slide.shapes.add_shape(5, Inches(4.65), Inches(1.8),
                                   Inches(4.0), Inches(0.75))
demo_btn.fill.solid(); demo_btn.fill.fore_color.rgb = CYAN
demo_btn.line.fill.background()
if len(demo_btn.adjustments) > 0: demo_btn.adjustments[0] = 0.4
add_text(slide, "🎯   Try Demo", 4.66, 1.87, 3.98, 0.6,
         font_size=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# Arrow
add_text(slide, "↓  Click loads instantly:", 5.7, 2.7, 2.5, 0.35,
         font_size=13, color=SLATE, align=PP_ALIGN.CENTER)

# Demo profile card
demo_card = slide.shapes.add_shape(5, Inches(3.2), Inches(3.18),
                                    Inches(6.9), Inches(3.9))
demo_card.fill.solid(); demo_card.fill.fore_color.rgb = WHITE
demo_card.line.color.rgb = BLUE; demo_card.line.width = Pt(1.5)
if len(demo_card.adjustments) > 0: demo_card.adjustments[0] = 0.06

# Avatar
av = slide.shapes.add_shape(5, Inches(3.45), Inches(3.35),
                              Inches(0.9), Inches(0.9))
av.fill.solid(); av.fill.fore_color.rgb = BLUE
av.line.fill.background()
if len(av.adjustments) > 0: av.adjustments[0] = 0.5
add_text(slide, "A", 3.46, 3.4, 0.88, 0.8,
         font_size=28, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

add_text(slide, "Ananya Sharma",     4.5, 3.38, 5, 0.38, font_size=16, bold=True, color=DARK)
add_text(slide, "B.Tech CSE · VIT · 3rd Year", 4.5, 3.76, 5, 0.28, font_size=11, color=SLATE)

demo_data = [
    ("⚡  Skills:",        "Python · Excel · Statistics"),
    ("📁  Projects:",      "Sales Prediction System, Customer Segmentation"),
    ("🏆  Certificates:",  "Python Fundamentals (Coursera)"),
    ("🎯  Target Career:", "Data Analyst"),
    ("📈  Experience:",    "Student"),
]
for i, (lbl, val) in enumerate(demo_data):
    dy = 4.18 + i * 0.5
    add_text(slide, lbl, 3.45, dy, 2.3, 0.35, font_size=10.5, bold=True, color=SLATE)
    add_text(slide, val, 5.8,  dy, 4.1, 0.35, font_size=10.5, color=DARK)

# What auto-populates
add_text(slide, "Automatically Populates →", 0.3, 3.18, 2.8, 0.38,
         font_size=12, bold=True, color=DARK)
auto_pops = [
    ("🎛️", "Dashboard with 92% match score"),
    ("📊", "Skill gap: SQL, Power BI, Data Viz"),
    ("🗺️", "6-step learning roadmap"),
    ("💼", "5 matched job opportunities"),
    ("🤖", "BridgeBot pre-loaded with context"),
]
for i, (ic, txt) in enumerate(auto_pops):
    ay = 3.65 + i * 0.62
    ab = slide.shapes.add_shape(5, Inches(0.3), Inches(ay),
                                  Inches(2.75), Inches(0.5))
    ab.fill.solid(); ab.fill.fore_color.rgb = WHITE
    ab.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0); ab.line.width = Pt(0.75)
    if len(ab.adjustments) > 0: ab.adjustments[0] = 0.05
    add_text(slide, ic,  0.42, ay + 0.08, 0.3, 0.34, font_size=14)
    add_text(slide, txt, 0.75, ay + 0.1,  2.2, 0.32, font_size=9.5, color=DARK)

slide_number(slide, 15)


# ══════════════════════════════════════════════════════════════════
# SLIDE 16 — Closing / CTA
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
add_gradient_rect(slide, 0, 0, 13.33, 7.5)

# Decorative circles
for cx_, cy_, sz, op in [(1, 6, 2.5, 0.06), (11.5, 0.5, 3, 0.05), (6.5, 0.2, 1.5, 0.08)]:
    dc = slide.shapes.add_shape(5, Inches(cx_), Inches(cy_), Inches(sz), Inches(sz))
    dc.fill.solid(); dc.fill.fore_color.rgb = WHITE
    dc.line.fill.background()
    if len(dc.adjustments) > 0: dc.adjustments[0] = 0.5

# Logo white
lb2 = slide.shapes.add_shape(5, Inches(0.35), Inches(0.28), Inches(0.48), Inches(0.48))
lb2.fill.solid(); lb2.fill.fore_color.rgb = WHITE
lb2.line.fill.background()
if len(lb2.adjustments) > 0: lb2.adjustments[0] = 0.15
add_text(slide, "S", 0.43, 0.3, 0.32, 0.42, font_size=16, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
add_text(slide, "SkillBridge AI", 0.9, 0.34, 3, 0.35, font_size=14, bold=True, color=WHITE)

# Main quote
add_text(slide,
         '"We don\'t just recommend a job.\nWe show you how to become ready for it."',
         1.0, 1.4, 11.3, 1.6, font_size=30, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# Tagline
add_text(slide, "Discover. Improve. Connect.",
         2.0, 3.1, 9.33, 0.65, font_size=22, color=CYAN, align=PP_ALIGN.CENTER, bold=True, italic=True)

# Stats row
stat_row = [
    ("50,000+", "Students Guided"),
    ("95%",     "AI Accuracy"),
    ("200+",    "Career Paths"),
    ("1,000+",  "Opportunities"),
]
for i, (sv, sl) in enumerate(stat_row):
    bsx = 1.5 + i * 2.65
    add_text(slide, sv, bsx, 3.92, 2.5, 0.55,
             font_size=26, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, sl, bsx, 4.48, 2.5, 0.35,
             font_size=11, color=RGBColor(0xBA, 0xD8, 0xF8), align=PP_ALIGN.CENTER)

# Divider
div = slide.shapes.add_shape(1, Inches(1.5), Inches(4.95), Inches(10.33), Inches(0.02))
div.fill.solid(); div.fill.fore_color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
div.line.fill.background()

# CTA
cta_btn = slide.shapes.add_shape(5, Inches(4.42), Inches(5.2),
                                   Inches(4.5), Inches(0.7))
cta_btn.fill.solid(); cta_btn.fill.fore_color.rgb = CYAN
cta_btn.line.fill.background()
if len(cta_btn.adjustments) > 0: cta_btn.adjustments[0] = 0.4
add_text(slide, "🚀   Start Your Career Analysis",
         4.43, 5.27, 4.48, 0.55, font_size=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

add_text(slide, "skillbridge-ai.com  |  Try Demo → localhost:5174",
         2.5, 6.1, 8.33, 0.35, font_size=11, color=RGBColor(0x93, 0xC5, 0xFD), align=PP_ALIGN.CENTER)

add_text(slide, "© 2026 SkillBridge AI — Your Skills. Your Future.",
         2.5, 6.55, 8.33, 0.3, font_size=10, color=RGBColor(0x60, 0x81, 0xB9), align=PP_ALIGN.CENTER)

slide_number(slide, 16)


# ══════════════════════════════════════════════════════════════════
# Save
# ══════════════════════════════════════════════════════════════════
output_path = "/Users/kthavaprakash/.gemini/antigravity/scratch/skillbridge-ai/SkillBridge_AI_Presentation.pptx"
prs.save(output_path)
print(f"✅  Presentation saved → {output_path}")
print(f"    Total slides: {len(prs.slides)}")
