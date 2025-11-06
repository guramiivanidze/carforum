# CSS Quick Reference

> **Quick lookup for common styling patterns in the new design system**

## 🎨 Most Used Colors

```css
var(--color-primary)          /* #2563eb - Main brand blue */
var(--color-success)          /* #10b981 - Green */
var(--color-error)            /* #ef4444 - Red */
var(--color-warning)          /* #f59e0b - Orange */
var(--color-text-primary)     /* #1f2937 - Main text */
var(--color-text-secondary)   /* #6b7280 - Secondary text */
var(--color-background)       /* #f9fafb - Page background */
var(--color-white)            /* #ffffff - White */
```

## 📏 Most Used Spacing

```css
var(--spacing-xs)    /* 4px */
var(--spacing-sm)    /* 8px */
var(--spacing-md)    /* 16px */
var(--spacing-lg)    /* 24px */
var(--spacing-xl)    /* 32px */
```

## 🔤 Most Used Typography

```css
var(--font-size-sm)      /* 14px */
var(--font-size-base)    /* 16px */
var(--font-size-lg)      /* 20px */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */
```

## 🎭 Most Used Effects

```css
var(--shadow-sm)      /* Small shadow */
var(--shadow-md)      /* Medium shadow */
var(--radius-md)      /* 8px - Standard rounding */
var(--radius-lg)      /* 12px - Large rounding */
var(--transition-normal)  /* Standard transitions */
```

## 🛠️ Most Used Utility Classes

### Layout
```css
.flex               /* Flexbox container */
.flex-col           /* Flex column */
.items-center       /* Align items center */
.justify-between    /* Space between */
.gap-md             /* 16px gap */
```

### Spacing
```css
.p-md               /* 16px padding all sides */
.px-lg              /* 24px padding left/right */
.py-sm              /* 8px padding top/bottom */
.m-md               /* 16px margin all sides */
.my-lg              /* 24px margin top/bottom */
```

### Text
```css
.text-base          /* 16px font size */
.text-lg            /* 20px font size */
.font-semibold      /* 600 weight */
.text-center        /* Center align */
.text-primary       /* Primary text color */
```

### Components
```css
.card               /* Pre-styled card */
.btn                /* Base button */
.btn-primary        /* Primary button */
.badge              /* Badge/tag */
.input              /* Styled input */
```

## 📋 Common Patterns

### Centered Container
```html
<div class="flex items-center justify-center">
  <!-- Content -->
</div>
```

### Card with Padding
```html
<div class="card p-lg">
  <!-- Content -->
</div>
```

### Spaced List
```html
<div class="flex flex-col gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Button Group
```html
<div class="flex gap-sm">
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-secondary">Cancel</button>
</div>
```

### Responsive Grid
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-lg">
  <!-- Items -->
</div>
```

## 🔄 Quick Migration

### Replace This → With This

```css
/* Colors */
#2563eb → var(--color-primary)
#10b981 → var(--color-success)
#ef4444 → var(--color-error)
white → var(--color-white)

/* Spacing */
4px → var(--spacing-xs)
8px → var(--spacing-sm)
16px → var(--spacing-md)
24px → var(--spacing-lg)

/* Typography */
14px → var(--font-size-sm)
16px → var(--font-size-base)
20px → var(--font-size-lg)

/* Effects */
0 2px 4px rgba(0,0,0,0.1) → var(--shadow-sm)
8px → var(--radius-md)
```

## ✅ Quick Checklist

When styling a component:

- [ ] Use `var(--color-*)` for colors
- [ ] Use `var(--spacing-*)` for padding/margin
- [ ] Use `var(--font-size-*)` for font sizes
- [ ] Use utility classes for simple styles
- [ ] Use custom classes for complex components
- [ ] Avoid inline styles
- [ ] Keep specificity low

---

**See `CSS_REFACTORING_GUIDE.md` for detailed documentation**
