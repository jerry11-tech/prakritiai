# Design Brief

## Direction

**PrakritiAI** — Maximalist tech-luxe wellness platform bridging Ayurveda with AI. Dark purple/teal color system with deep charcoal base, vibrant electric accents, and layered glass effects for premium atmosphere.

## Tone

Spiritual meets science: bold, confident, modern. High visual energy tempered by refined typography and intentional spacing—inviting without intimidation.

## Differentiation

Glowing gradient accents on hero text + animated floating orbs + shimmer effects on primary buttons. Dosha percentage bars animate on scroll with smooth easing. Glass-morphism cards with purple/teal borders create depth layering.

## Color Palette

| Token         | OKLCH              | Role                                  |
| ------------- | ------------------ | ------------------------------------- |
| background    | 0.08 0.015 280     | Deep charcoal near-black, primary bg  |
| foreground    | 0.95 0.01 280      | Text, high contrast on dark           |
| card          | 0.12 0.018 280     | Elevated surfaces, slight tint        |
| primary       | 0.68 0.22 280      | Electric purple, CTAs & highlights    |
| accent        | 0.70 0.20 170      | Teal balance, secondary accents       |
| chart-3       | 0.72 0.18 45       | Gold wisdom accent, tertiary          |
| destructive   | 0.55 0.22 25       | Error/warning states                  |
| border        | 0.22 0.025 280     | Subtle purple-tinted dividers         |

## Typography

- Display: **Space Grotesk** — Geometric, futuristic, authoritative headings
- Body: **DM Sans** — Clean, readable, modern interface text
- Scale: Hero `text-6xl font-bold`, h2 `text-4xl font-bold`, labels `text-xs uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Multiple surface layers via subtle background tints + glass effects on cards. Purple/teal borders add color depth without relying on shadows. Layered orbs in hero create atmospheric depth.

## Structural Zones

| Zone    | Background          | Border                          | Notes                              |
| ------- | ------------------- | ------------------------------- | ---------------------------------- |
| Header  | card layer          | bottom border `border-border/30` | Sticky, purple glow on text links  |
| Hero    | gradient overlay    | —                               | Floating orbs, gradient text hero  |
| Section | alt: bg/card layers | —                               | Alternating backgrounds for rhythm |
| Footer  | darkest layer       | top gradient border              | `bg-background` with accent top    |

## Spacing & Rhythm

64px section gaps, 32px card padding, 16px internal component spacing. Loose vertical rhythm creates breathing room on landing page; demo panel uses compact 14px gaps for density.

## Component Patterns

- **Buttons**: Primary `bg-primary` with hover lift + shadow, outline `border border-primary` ghost style, icon badges with teal background
- **Cards**: `rounded-xl` with `border border-primary/30` and `bg-card`, glass effect via subtle blur on hover
- **Badges**: Pill-shaped `rounded-full`, small padding, semantic color coding (purple/teal/gold/coral)

## Motion

- **Entrance**: Scroll-triggered fadeUp (0.7s) + staggered scaleIn (0.6s) on feature cards
- **Hover**: Lifted 2–3px + border color shift to primary/60, smooth 0.2s transition
- **Decorative**: Floating orbs (5–10s loops), shimmer gradient on hero (4s), animated dosha bars (1.4s cubic-bezier)

## Constraints

- No raw hex or named colors; all OKLCH via CSS variables
- Max 12px radius except pill badges (24px full)
- Gradients limited to hero + buttons; avoid gradient overload
- Animation timing consistent: 0.3s micro, 0.6–0.7s entrance, 4s+ ambient

## Signature Detail

Gradient shimmer text on hero headline + animated floating orbs in background create a signature "ambient intelligence" aesthetic—modern AI meets ancient wellness wisdom.
