---
name: Aero-Corporate Precision
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#434651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#737783'
  outline-variant: '#c3c6d3'
  surface-tint: '#305bae'
  primary: '#002863'
  on-primary: '#ffffff'
  primary-container: '#003d8f'
  on-primary-container: '#88acff'
  inverse-primary: '#afc6ff'
  secondary: '#0059bb'
  on-secondary: '#ffffff'
  secondary-container: '#0070ea'
  on-secondary-container: '#fefcff'
  tertiary: '#3a2800'
  on-tertiary: '#ffffff'
  tertiary-container: '#563d00'
  on-tertiary-container: '#dba523'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#0d4395'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc7ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#ffdea3'
  tertiary-fixed-dim: '#f7bd3d'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5c4200'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for the high-stakes environment of corporate transportation logistics. Inspired by the efficiency and authority of global airline operations, the system prioritizes clarity, reliability, and premium service delivery.

The aesthetic follows a **Corporate / Modern** style with a focus on high-reliability indicators. It utilizes a structured information hierarchy that conveys precision. By avoiding the "bubbly" trends of consumer gig-economy apps, this design system establishes a professional tone suitable for corporate fleet management and executive transit. The emotional response should be one of total control, safety, and institutional trust.

## Colors
The palette is rooted in a command-and-control philosophy.
- **Deep Blue (Primary):** Used for global navigation, primary actions, and brand identification. It represents stability and depth.
- **Bright Blue (Secondary):** Used for interactive elements, links, and secondary focus areas. It provides a modern digital edge.
- **Gold (Accent):** Reserved for high-value status indicators, premium service tiers, and critical highlights. It must be used sparingly to maintain its "exclusive" impact.
- **Support Grays:** A cool-toned gray scale (#F5F7FA) is used for surface layering to create separation without the need for heavy borders.

## Typography
We use **Inter** for its exceptional legibility in data-heavy environments. The typographic scale is designed to handle complex information like flight/route numbers, timestamps, and driver IDs.

- **Weight Usage:** Medium (500) and Semi-Bold (600) are used for emphasis and data labels. Regular (400) is reserved for long-form content.
- **Data Tables:** For numerical data and coordinates, use the tabular lining features of Inter to ensure vertical alignment.
- **Caps:** Small caps or uppercase labels are used specifically for status tags (e.g., "CONFIRMED", "IN ROUTE") to mimic airport signage and terminal displays.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile.
- **Desktop:** 12-column grid with a maximum width of 1440px. 24px gutters.
- **Mobile:** 4-column grid with 16px margins.
- **Rhythm:** An 8px linear scale (with a 4px half-step for tight components) ensures mathematical consistency.
- **Information Density:** High density is permitted for dispatcher dashboards, while user-facing mobile screens utilize more whitespace to focus on the immediate "next step" of the journey.

## Elevation & Depth
Elevation is primarily conveyed through **Tonal Layers** rather than shadows. 
- **Surfaces:** Backgrounds use `#FFFFFF`, while secondary containers use `#F5F7FA`.
- **Borders:** Subtle `1px` borders in `#E2E8F0` are used to define regions without adding visual noise.
- **Shadows:** When necessary for floating elements (like modals or dropdowns), use "Ambient Shadows"—diffused, low-opacity (8-10%) blurs with a slight blue tint (`#003D8F` at 5% opacity) to maintain color harmony.
- **Interactive States:** Lifted states for cards should use a slightly more pronounced shadow and a 1px primary-color border.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a clean, professional look that feels modern but avoids the "toy-like" roundness of consumer apps.
- **Standard Radius:** 4px for buttons, inputs, and small cards.
- **Large Radius:** 8px for main content containers and dashboard modules.
- **Strictness:** Do not use full-pill buttons. Keep corners crisp enough to maintain a structural, architectural feel.

## Components
- **Buttons:** Primary buttons use `#003D8F` with white text. Secondary buttons use a primary-color outline. Use `label-lg` for button text.
- **Status Chips:** Use a subtle background (10% opacity) of the status color with high-contrast text and a small dot indicator (e.g., Green dot for "In Transit").
- **Inputs:** Square-cornered (4px radius) with `#E2E8F0` borders. Focused state uses a 2px `#007BFF` border.
- **Cards:** White background with a 1px `#F5F7FA` border. No shadow in the default state to maintain a flat, professional "document" feel.
- **Navigation:** A persistent sidebar (desktop) or bottom bar (mobile) using the Primary Deep Blue or a high-contrast White with Primary icons.
- **Data Visualizations:** Use the Gold accent for "Current/Active" data points and Primary Blue for historical data.