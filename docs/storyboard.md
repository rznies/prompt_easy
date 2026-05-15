# Prompt Easy Launch Video - Storyboard

**Concept:** "Vague In. Perfect Out."
**Vibe:** Premium, minimal, Apple-keynote energy. Dark background, glass UI, real product footage. No stock animations. No gradients, no explainer voice, just clean type and product.
**Format:** 32 seconds total length. Primary: 1080x1920 (LinkedIn). Secondary Export: 1920x1080.
**Framerate:** 30fps

---

## 0-3s (Frames 0-90) — The Hook
*Visuals:* Black screen.
*Action:* 
- Typewriter text appears: "Your prompts suck."
- Short beat. Text deletes rapidly.
- Typewriter text appears: "Let's fix that."
- Subtle click sound (audio cue). Logo fades in: **Prompt Easy**.

## 3-8s (Frames 90-240) — The Problem
*Visuals:* Split screen layout.
*Action:*
- **Left side:** Messy ChatGPT input being typed: "write me something about marketing idk make it good"
- **Right side:** Same user staring at generic, bad output.
- **Overlay:** Clean text fades in: "Vague prompts = vague answers"

## 8-18s (Frames 240-540) — The Magic (The "v1" Reality)
*Visuals:* Full-screen mock of chatgpt.com, dark mode (#0A0A0B with 1% film grain). 
*Implementation:* 
- Standalone Chrome Frame Component with a static high-res screenshot background.
- "Pan and Scan" camera movement to reframe the wide UI for the 9:16 vertical video.

- **8.0-9.5s (Shot 1):** Establish messy prompt (`write me something about marketing idk make it good`) in ChatGPT textarea. Camera is panned down. Chrome toolbar visible at top, Prompt Easy icon grey (inactive).
- **9.5-10.5s (Shot 2):** Cursor moves from textarea to toolbar icon (smooth bezier). Camera pans up to follow cursor. Icon scales up on hover, scales down on click.
- **10.5-11.5s (Shot 3):** Glass popup spawns from icon position (scale 0.8 → 1 with spring, opacity 0 → 1). Clean UI with `backdrop-filter: blur(24px)`.
- **11.5-12.5s (Shot 4):** Messy prompt appears in popup input field instantly (auto-paste). Text fades in.
- **12.5-13.2s (Shot 5):** Cursor clicks "Improve" button. Button clicks (scale 1.02 → 0.98), text changes to "Improving..." with subtle pulsing dots.
- **13.2-16.5s (Shot 6 - The Morph):** 
  - Messy text opacity 1 → 0, slides up.
  - Blank pause ("thinking").
  - Structured prompt types in at 25ms/char. Exact text:
    `Role: Senior growth marketer`
    `Task: Write 3 LinkedIn hooks`
    `Format: One sentence each`
    `Constraints: <15 words, no buzzwords`
- **16.5-17.2s (Shot 7):** "Copy" button appears, scales in, and is clicked. Button flashes purple `#7C3AED`, tooltip "Copied!" fades in.
- **17.2-18.0s (Shot 8):** Popup scales down and fades out. Hard cut to ChatGPT textarea with the structured prompt pasted. Camera has returned to original framing. We do not show ChatGPT generating a response. Overlay text fades in: "1 click."

## 18-25s (Frames 540-750) — Features Flash
*Visuals:* Three clean cards sliding in. No clutter, fast-paced (0.8s per card).
*Cards:*
1. **Improve mode** (Icon + text)
2. **Works on ChatGPT, Claude, Gemini** (Logos)
3. **BYOK — unlimited, private** (Icon + text, reflecting the unlimited core offering)

## 25-32s (Frames 750-960) — CTA
*Visuals:* Full screen product shot on dark gradient.
*Action:*
- Text fades in: "Prompt Easy — Free. Unlimited with your Gemini key."
- Button animates: "Try it now →"
- Your LinkedIn URL + Chrome Web Store badge fade in.
- Final frame holds for 2 seconds.

---
*End of Video*