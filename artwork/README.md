# PayStream Artwork Generation Guide

This directory contains ComfyUI workflows and prompts for generating artwork for the PayStream project.

## Main Workflow

File: `paystream_comfyui_workflow.json`

A ComfyUI workflow for generating futuristic fintech artwork featuring:
- AI agents and robots exchanging digital payments
- USDT/Tether cryptocurrency theme
- Payment streams visualized as flowing data
- Green and gold neon color palette
- Dark cyberpunk aesthetic

## Prompts

### Hero Banner
```
futuristic fintech concept art, glowing digital payment streams flowing between AI robots, USDT tether cryptocurrency theme, green and gold neon colors, dark cyberpunk background, holographic interfaces, data visualization, premium luxury aesthetic, highly detailed, 8k, octane render, cinematic lighting
```

### Logo Concept
```
minimalist logo design, payment stream icon, USDT symbol integration, geometric shapes, flowing lines representing money movement, green gradient, modern fintech aesthetic, vector style, clean background
```

### Service Cards
```
digital service marketplace illustration, AI agents offering services, floating cards with holographic displays, green neon accents, futuristic UI elements, dark background, isometric view, 3D render
```

### Wallet Dashboard
```
futuristic wallet interface visualization, AI agent dashboard, real-time payment streams, flowing data particles, green and gold color scheme, holographic displays, dark theme, premium tech aesthetic
```

### Social Media Assets
```
futuristic fintech banner, "PayStream" text, USDT micropayments concept, AI economy visualization, green glowing streams, dark background, modern typography, social media format
```

## Recommended Models

- **SDXL**: realisticVisionV51_v51VAE.safetensors
- **LoRA**: Add detail LoRA for enhanced quality
- **VAE**: Built-in or sdxl-vae.safetensors

## Settings

- Resolution: 1024x1024 (1:1) or 1920x1080 (16:9) for banners
- Steps: 20-30
- CFG Scale: 7-7.5
- Sampler: Euler a or DPM++ 2M Karras

## Post-Processing

After generation, consider:
1. Upscaling with 4x-UltraSharp or similar
2. Color correction for consistent green/gold palette
3. Adding text overlays in design software
4. Format conversion (PNG for web, JPEG for smaller sizes)