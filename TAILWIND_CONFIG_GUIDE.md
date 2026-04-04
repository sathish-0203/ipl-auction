# Tailwind CSS Configuration Guide

## Overview

The war room uses **Tailwind CSS 3** from CDN with a custom configuration for Material Design 3 colors and typography.

## Configuration Details

### Colors Defined

```javascript
colors: {
  'surface': '#0f1216',                    // Main background
  'surface-container-low': '#15181b',      // Slightly elevated
  'surface-container': '#191c1f',          // Elevated surfaces
  'surface-container-high': '#1f2225',     // More elevated
  'surface-container-highest': '#2b2f33',  // Most elevated
  'outline-variant': '#49454f',            // Dividers, borders
  'primary': '#e1ab00',                    // Gold - CTA, highlights
  'secondary': '#625b71',                  // Purple accent
  'tertiary': '#7d5260',                   // Rose accent
  'error': '#f2b8b5',                      // Red for errors
  'on-error': '#601410',                   // Text on error
}
```

### Typography

```javascript
fontFamily: {
  'headline': ['Space Grotesk', 'sans-serif'],    // Bold titles
  'body': ['Manrope', 'sans-serif'],              // Regular text
}
```

### Keyframes & Animations

```javascript
keyframes: {
  'glow': {
    '0%, 100%': { 
      boxShadow: '0 0 20px rgba(225, 171, 0, 0.3), inset 0 0 20px rgba(225, 171, 0, 0.1)' 
    },
    '50%': { 
      boxShadow: '0 0 30px rgba(225, 171, 0, 0.6), inset 0 0 30px rgba(225, 171, 0, 0.2)' 
    }
  }
}

animation: {
  'glow': 'glow 2s ease-in-out infinite'
}
```

**Used for**: Highest bid card pulsing effect

## Custom Classes

### Button Styles

#### Primary Button (`.btn-primary`)
```css
@apply relative px-6 py-2.5 bg-primary text-[#0f1216] 
       font-headline font-bold text-sm rounded-full 
       overflow-hidden transition-all duration-300;

/* Hover state */
@apply shadow-lg;
box-shadow: 0 0 20px rgba(225, 171, 0, 0.4);
transform: translateY(-2px);

/* Disabled state */
@apply opacity-50 cursor-not-allowed;
```

**Usage**: START, END, PLACE BID, SEND buttons

#### Secondary Button (`.btn-secondary`)
```css
@apply px-4 py-2 bg-surface-container-high 
       border border-outline-variant/30 text-slate-300 
       font-body font-semibold text-xs rounded-lg 
       transition-all;

/* Hover state */
@apply border-primary bg-surface-container-highest;

/* Disabled state */
@apply opacity-40 cursor-not-allowed;
```

**Usage**: Preset bid buttons, secondary actions

## Utility Classes

### Layout

```css
/* Responsive Grid */
grid grid-cols-1 md:grid-cols-3    /* 1 col mobile, 3 cols desktop */
grid grid-cols-1 lg:grid-cols-4    /* 1 col mobile, 4 cols on desktop */

/* Flex Layout */
flex flex-col lg:flex-row           /* Column on mobile, row on desktop */
flex items-center justify-between   /* Centered vertically, spaced horizontally */

/* Responsive Gaps */
gap-4 md:gap-6                      /* Smaller gap on mobile, larger on desktop */
```

### Spacing

```css
/* Padding/Margin Scale */
p-4      /* 16px padding */
px-6     /* 24px horizontal padding */
py-2.5   /* 10px vertical padding */
my-6     /* 24px vertical margin */
gap-3    /* 12px gap between flex items */
```

### Colors

```css
/* Text Colors */
text-white              /* Full white */
text-slate-400          /* Medium gray */
text-slate-500          /* Darker gray */
text-primary            /* Gold (#e1ab00) */
text-emerald-300        /* Emerald for success */

/* Background Colors */
bg-surface-container    /* #191c1f */
bg-primary/20           /* Gold with 20% opacity */
bg-slate-700            /* Dark gray */

/* Border Colors */
border-outline-variant/10    /* Very subtle border */
border-outline-variant/20    /* Subtle border */
border-primary/20            /* Gold border subtle */
border-primary               /* Full gold border */
```

### Effects

```css
/* Opacity */
opacity-50              /* 50% opacity */
opacity-30              /* 30% opacity */

/* Transitions */
transition-all          /* All properties animated */
transition-transform    /* Only transform animated */
duration-300            /* 300ms duration */

/* Shadows */
shadow-lg               /* Large shadow */

/* Rounded Corners */
rounded-full            /* Fully rounded (border-radius: 9999px) */
rounded-xl              /* Extra large radius */
rounded-lg              /* Large radius */
```

## Responsive Breakpoints

```css
/* Mobile-first approach */
Default (< 768px)       /* Mobile phones */
md: (768px)            /* Tablets */
lg: (1024px)           /* Desktops */
xl: (1280px)           /* Large screens */

/* Usage in Tailwind */
text-sm md:text-base lg:text-lg     /* Different font sizes */
hidden md:flex                      /* Hidden on mobile, visible on desktop */
w-full lg:w-1/4                     /* Full width on mobile, 25% on desktop */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

## Custom Styles (in `<style>` tag)

### Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #15181b;
}
::-webkit-scrollbar-thumb {
  background: #49454f;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #625b71;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
```

### Material Symbols Icon Styling

```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

### Accordion Styles

```css
.team-accordion-input {
  display: none;
}

.team-accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.team-accordion-input:checked ~ .team-accordion-content {
  max-height: 300px;
}

.team-accordion-input:checked ~ label .expand-icon {
  transform: rotate(180deg);
}
```

### Glow Effect

```css
.glow-active {
  animation: glow 2s ease-in-out infinite;
}
```

## Color Usage Guidelines

### Primary (#e1ab00 Gold)
- **Used for**: CTA buttons, highlights, primary text, glow effects
- **On backgrounds**: Use over dark surfaces only
- **Opacity variants**: 10%, 20%, 30%, 60% for subtle to strong intensity

### Surface Colors
- **surface**: Page background
- **surface-container**: Standard cards
- **surface-container-high**: Elevated cards, hover states
- **surface-container-highest**: Maximum elevation

### Text Colors
- **#e1e2e7**: Primary text
- **#a8adb5**: Secondary text
- **#49454f**: Muted text, disabled
- **#625b71**: Secondary accents

### Status Colors
- **Emerald/Green**: Success, completed bids
- **Blue**: Information, player types
- **Red**: Errors, insufficient purse
- **Yellow/Orange**: Warnings, your bid

## Common Patterns

### Card Layout
```html
<div class="bg-surface-container-high rounded-xl border border-outline-variant/20 p-6">
  <!-- Content -->
</div>
```

### Button Group
```html
<div class="flex gap-2">
  <button class="btn-primary">ACTION</button>
  <button class="btn-secondary">SECONDARY</button>
</div>
```

### Responsive Container
```html
<div class="max-w-7xl mx-auto px-4 md:px-6 py-4">
  <!-- Content centered with responsive padding -->
</div>
```

### Text Hierarchy
```html
<div class="text-xs font-headline font-bold text-slate-400 uppercase tracking-widest">
  LABEL
</div>
<div class="text-2xl font-headline font-bold text-white">
  HEADING
</div>
<div class="text-sm text-slate-400 font-body">
  Body text
</div>
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

**Note**: Tailwind CSS requires JavaScript enabled for CDN delivery. Purge unused styles if self-hosting.

## Performance Considerations

1. **CDN**: Uses Tailwind CSS CDN (not optimized for production)
   - For production: Use Tailwind CLI or PostCSS plugin
   - Current: ~50KB additional CSS download

2. **Unused Classes**: CDN loads all Tailwind utilities
   - No tree-shaking happens with CDN
   - Self-hosting with build step can reduce to ~10-15KB

3. **CSS Classes**: Well-organized utility classes
   - Minimal custom CSS (only necessary extensions)
   - Consistent naming conventions
   - Easy to maintain and modify

## Customization

To modify Tailwind config:

1. Edit the `tailwind.config = { ... }` object in war-room-new.html
2. Add new colors, fonts, or animations
3. Reload the page to see changes

Example - Add a custom color:
```javascript
colors: {
  ...existing,
  'custom-blue': '#0a66c2',
}
```

Then use: `text-custom-blue`, `bg-custom-blue`, `border-custom-blue`, etc.

## Further Reading

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material Design 3](https://m3.material.io/)
- [Space Grotesk Font](https://fonts.google.com/specimen/Space+Grotesk)
- [Manrope Font](https://fonts.google.com/specimen/Manrope)
- [Material Symbols](https://fonts.google.com/icons)

---

**Version**: 1.0  
**Created**: December 2024
