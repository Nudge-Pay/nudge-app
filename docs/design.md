# Vela interface style

Vela uses a restrained navy, white, and cobalt palette with the same semantic colors across the welcome page, shared controls, and navigation. Light and dark palettes live in `src/constants/theme.ts`.

## Shared styles

- Body copy uses the platform sans font; web uses a system font stack with Inter when available.
- Headings use tighter spacing and a stronger weight. Body text uses regular weight for readability.
- Primary buttons use cobalt with white text. Text accents use a separate color so dark mode keeps readable contrast.
- Inputs and buttons have 12 px corner radii; cards use 20 px. Controls have a minimum height of 52 px.
- Surfaces and borders use theme tokens instead of screen-specific colors.

## Welcome page

The page uses the existing Vela mark and the headline “A simpler way to pay.” Copy explains contactless requests, passkey access, and wallet control in English. The setup action continues to the existing passkey registration route.

The introduction and setup card stack on smaller screens and appear side by side at widths of 1000 px and above. The header wraps on narrow screens. Content remains scrollable and supports the system color scheme.

Network context follows the configured Stellar network: testnet displays the preview badge and test-funds note.
