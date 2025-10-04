# Type2Lyfe Design System

**Version:** 2.0  
**Last Updated:** January 4, 2025  
**Platform:** React Web Application

---

## 🎨 Overview

This design system provides a comprehensive set of design tokens, components, and guidelines for the Type2Lyfe web application. It ensures consistency, accessibility, and a modern user experience across all features.

---

## 🌈 Color Palette

### Primary Colors
```css
--background: #F7F9FC      /* Main background color */
--card: #FFFFFF            /* Card/surface background */
--border: #EFF3F8          /* Border and divider color */
--primary: #14B8A6         /* Primary brand color (Teal) */
--primary-dark: #0D9488    /* Darker primary for hover states */
```

### Text Colors
```css
--text-primary: #1E293B    /* Primary text (headings, important content) */
--text-secondary: #64748B  /* Secondary text (descriptions, labels) */
```

### Status Colors
```css
--success: #34D399         /* Success states, positive feedback */
--warning: #FBBF24         /* Warning states, caution */
--danger: #F87171          /* Error states, destructive actions */
--info: #38BDF8            /* Informational messages */
```

### Tailwind CSS Classes
```jsx
// Background
bg-background      // #F7F9FC
bg-card            // #FFFFFF
border-border      // #EFF3F8

// Primary
bg-primary         // #14B8A6
bg-primary-dark    // #0D9488
text-primary       // #14B8A6

// Text
text-text-primary     // #1E293B
text-text-secondary   // #64748B

// Status
bg-success         // #34D399
bg-warning         // #FBBF24
bg-danger          // #F87171
bg-info            // #38BDF8
```

---

## 📝 Typography

### Font Family
- **Primary Font:** Inter (sans-serif)
- **Fallback:** System fonts

### Font Sizes
```css
text-xs     12px    /* Small labels, captions */
text-sm     14px    /* Secondary text, descriptions */
text-base   16px    /* Body text, default */
text-lg     18px    /* Emphasized text */
text-xl     20px    /* Small headings */
text-2xl    24px    /* Large headings */
```

### Font Weights
```css
font-normal    400    /* Regular text */
font-medium    500    /* Emphasized text */
font-semibold  600    /* Headings, buttons */
font-bold      700    /* Strong emphasis */
```

### Usage Examples
```jsx
// Headings
<h1 className="text-2xl font-bold text-text-primary">Main Heading</h1>
<h2 className="text-xl font-semibold text-text-primary">Section Heading</h2>

// Body Text
<p className="text-base text-text-primary">Primary content</p>
<p className="text-sm text-text-secondary">Secondary content</p>

// Labels
<label className="text-sm font-medium text-text-primary">Field Label</label>
<span className="text-xs text-text-secondary">Helper text</span>
```

---

## 📏 Spacing

Use Tailwind's default spacing scale (4px base unit):

```css
p-2    8px     /* Tight spacing */
p-3    12px    /* Compact spacing */
p-4    16px    /* Default spacing */
p-6    24px    /* Comfortable spacing */
p-8    32px    /* Spacious */

gap-2  8px     /* Tight gap */
gap-3  12px    /* Compact gap */
gap-4  16px    /* Default gap */
gap-6  24px    /* Comfortable gap */
```

---

## 🔲 Borders & Radius

### Border Radius
```css
rounded-lg     8px     /* Small components (buttons, inputs) */
rounded-2xl    16px    /* Cards, containers */
rounded-3xl    24px    /* Modals, large surfaces */
```

### Border Width
```css
border         1px     /* Default border */
border-2       2px     /* Emphasized border */
```

### Usage Examples
```jsx
// Card
<div className="bg-card rounded-2xl border border-border">

// Button
<button className="rounded-lg border border-primary">

// Modal
<div className="rounded-3xl bg-card">
```

---

## 🌑 Shadows

### Shadow Tokens
```css
shadow-card    0 4px 12px 0 rgba(0, 0, 0, 0.05)     /* Cards, containers */
shadow-fab     0 8px 20px -4px rgba(20, 184, 166, 0.4)  /* Floating action button */
```

### Usage Examples
```jsx
// Card with shadow
<div className="bg-card rounded-2xl shadow-card">

// Floating Action Button
<button className="bg-primary rounded-full shadow-fab">
```

---

## 🧩 Reusable Components

### Button Component
```jsx
// Primary Button
<button className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="bg-card border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors">
  Secondary Action
</button>

// Danger Button
<button className="bg-danger hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
  Delete
</button>
```

### Card Component
```jsx
<div className="bg-card rounded-2xl shadow-card p-6 border border-border">
  <h3 className="text-lg font-semibold text-text-primary mb-2">Card Title</h3>
  <p className="text-sm text-text-secondary">Card content goes here</p>
</div>
```

### Input Component
```jsx
<div className="space-y-2">
  <label className="text-sm font-medium text-text-primary">Label</label>
  <input 
    type="text"
    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
    placeholder="Enter value..."
  />
</div>
```

### Stat Card Component
```jsx
<div className="bg-card rounded-2xl shadow-card p-4 border border-border">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs text-text-secondary mb-1">Metric Name</p>
      <p className="text-2xl font-bold text-text-primary">120</p>
    </div>
    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
      {/* Icon */}
    </div>
  </div>
</div>
```

### Floating Action Button
```jsx
<button className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-fab flex items-center justify-center transition-all hover:scale-110">
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
</button>
```

---

## 🎯 Component States

### Interactive States
```jsx
// Default
className="bg-primary"

// Hover
className="bg-primary hover:bg-primary-dark"

// Focus
className="focus:ring-2 focus:ring-primary/20 focus:border-primary"

// Active
className="active:scale-95"

// Disabled
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

### Combined Example
```jsx
<button className="
  bg-primary 
  hover:bg-primary-dark 
  active:scale-95 
  disabled:opacity-50 
  disabled:cursor-not-allowed
  text-white 
  font-semibold 
  px-6 py-3 
  rounded-lg 
  transition-all
">
  Interactive Button
</button>
```

---

## ♿ Accessibility

### Color Contrast
- All text colors meet WCAG AA standards (4.5:1 for normal text)
- Primary color (#14B8A6) has sufficient contrast on white backgrounds
- Text colors (#1E293B, #64748B) are optimized for readability

### Focus States
- All interactive elements have visible focus states
- Focus rings use `ring-2 ring-primary/20` for visibility
- Keyboard navigation is fully supported

### Semantic HTML
- Use proper HTML elements (button, input, label, etc.)
- Include ARIA labels where needed
- Maintain logical heading hierarchy

---

## 📱 Responsive Design

### Breakpoints (Tailwind defaults)
```css
sm:   640px    /* Small tablets */
md:   768px    /* Tablets */
lg:   1024px   /* Laptops */
xl:   1280px   /* Desktops */
2xl:  1536px   /* Large desktops */
```

### Mobile-First Approach
```jsx
// Mobile default, tablet and up
<div className="p-4 md:p-6 lg:p-8">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl">
```

---

## 🔄 Transitions & Animations

### Standard Transitions
```css
transition-colors    /* Color changes */
transition-all       /* All properties */
transition-transform /* Scale, rotate, etc. */
```

### Duration
```css
duration-150    /* Fast (150ms) */
duration-300    /* Default (300ms) */
duration-500    /* Slow (500ms) */
```

### Easing
```css
ease-in-out     /* Default easing */
ease-in         /* Acceleration */
ease-out        /* Deceleration */
```

### Usage Examples
```jsx
// Button hover
<button className="bg-primary hover:bg-primary-dark transition-colors duration-300">

// Scale on click
<button className="active:scale-95 transition-transform duration-150">

// Smooth all changes
<div className="transition-all duration-300 ease-in-out">
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [x] Update Tailwind configuration in `frontend/index.html`
- [x] Import Inter font family
- [x] Define color tokens
- [x] Define typography scale
- [x] Define spacing and border radius

### Phase 2: Components
- [ ] Create Button.tsx component
- [ ] Create Card.tsx component
- [ ] Create TextInput.tsx component
- [ ] Create StatCard.tsx component
- [ ] Create FloatingActionButton.tsx component

### Phase 3: Migration
- [ ] Update Dashboard components
- [ ] Update Activity page components
- [ ] Update History page components
- [ ] Update Settings page components
- [ ] Update all modal components
- [ ] Update navigation components

### Phase 4: Testing
- [ ] Visual regression testing
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

---

## 🎨 Design Principles

1. **Consistency:** Use design tokens consistently across all components
2. **Simplicity:** Keep interfaces clean and uncluttered
3. **Accessibility:** Ensure all users can access and use the application
4. **Performance:** Optimize for fast load times and smooth interactions
5. **Responsiveness:** Design works seamlessly across all device sizes

---

## 📚 Resources

- **Tailwind CSS Documentation:** https://tailwindcss.com/docs
- **Inter Font:** https://fonts.google.com/specimen/Inter
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Design System Version:** 2.0  
**Maintained by:** Type2Lyfe Development Team
**Last Review:** January 4, 2025


