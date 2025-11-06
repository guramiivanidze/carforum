# CSS Refactoring Guide

## 🎨 Overview

This document describes the CSS architecture improvements and how to use the new design system.

## ✨ What Was Created

### 1. **CSS Variables (`styles/variables.css`)**

Centralized design tokens for consistent styling across the app.

**Features:**
- ✅ **Color palette** - Primary, secondary, success, warning, error colors with variants
- ✅ **Spacing system** - 8px base scale (xs, sm, md, lg, xl, 2xl, 3xl)
- ✅ **Typography** - Font families, sizes, weights, line heights
- ✅ **Shadows** - Consistent elevation system (xs, sm, md, lg, xl, 2xl)
- ✅ **Border radius** - Standardized rounding (sm, md, lg, xl, full)
- ✅ **Transitions** - Consistent animation timings and easing
- ✅ **Z-index scale** - Organized layering system
- ✅ **Dark mode ready** - Variables prepared for theme switching

**Usage:**
```css
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}
```

---

### 2. **Utility Classes (`styles/utilities.css`)**

Reusable CSS classes for common patterns (Tailwind-inspired).

**Categories:**
- Layout & Display
- Flexbox & Grid
- Spacing (Margin & Padding)
- Typography
- Colors
- Borders
- Shadows & Effects
- Transitions
- Component Patterns

**Usage:**
```html
<!-- Old way -->
<div style="display: flex; gap: 16px; padding: 24px;">
  <button style="background: #2563eb; color: white; padding: 8px 16px;">
    Click me
  </button>
</div>

<!-- New way with utilities -->
<div class="flex gap-md p-lg">
  <button class="btn btn-primary">
    Click me
  </button>
</div>
```

---

### 3. **Updated `index.css`**

Main CSS entry point now imports design system files.

```css
/* Imports design tokens and utilities */
@import './styles/variables.css';
@import './styles/utilities.css';

/* Then defines global base styles */
```

---

## 📖 Design Tokens Reference

### Colors

#### Brand Colors
```css
--color-primary: #2563eb          /* Main brand color */
--color-primary-hover: #1d4ed8    /* Hover state */
--color-primary-light: #3b82f6    /* Light variant */
--color-primary-dark: #1e40af     /* Dark variant */
--color-primary-bg: #eff6ff       /* Background tint */
```

#### Semantic Colors
```css
--color-success: #10b981   /* Green for success */
--color-warning: #f59e0b   /* Orange for warnings */
--color-error: #ef4444     /* Red for errors */
--color-info: #3b82f6      /* Blue for info */
```

#### Text Colors
```css
--color-text-primary: #1f2937      /* Main text */
--color-text-secondary: #6b7280    /* Secondary text */
--color-text-tertiary: #9ca3af     /* Tertiary/muted text */
--color-text-link: #2563eb         /* Link color */
```

#### Gray Scale
```css
--color-gray-50 through --color-gray-900
/* From lightest (50) to darkest (900) */
```

### Spacing Scale

Based on 8px grid system:

```css
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 3rem      /* 48px */
--spacing-3xl: 4rem      /* 64px */
```

### Typography

```css
/* Font Sizes */
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.25rem     /* 20px */
--font-size-xl: 1.5rem      /* 24px */
--font-size-2xl: 2rem       /* 32px */

/* Font Weights */
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Shadows

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.15)
```

### Border Radius

```css
--radius-sm: 0.25rem     /* 4px */
--radius-md: 0.5rem      /* 8px */
--radius-lg: 0.75rem     /* 12px */
--radius-xl: 1rem        /* 16px */
--radius-full: 9999px    /* Circular */
```

---

## 🛠️ Utility Classes Reference

### Layout

```css
.flex              /* display: flex */
.grid              /* display: grid */
.block             /* display: block */
.inline-block      /* display: inline-block */
.hidden            /* display: none */

.relative          /* position: relative */
.absolute          /* position: absolute */
.fixed             /* position: fixed */
.sticky            /* position: sticky */
```

### Flexbox

```css
/* Direction */
.flex-row          /* flex-direction: row */
.flex-col          /* flex-direction: column */

/* Justify */
.justify-start     /* justify-content: flex-start */
.justify-center    /* justify-content: center */
.justify-between   /* justify-content: space-between */

/* Align */
.items-start       /* align-items: flex-start */
.items-center      /* align-items: center */
.items-end         /* align-items: flex-end */

/* Gap */
.gap-xs            /* gap: 4px */
.gap-sm            /* gap: 8px */
.gap-md            /* gap: 16px */
.gap-lg            /* gap: 24px */
```

### Spacing

```css
/* Padding */
.p-md              /* padding: 16px (all sides) */
.px-lg             /* padding-left & right: 24px */
.py-sm             /* padding-top & bottom: 8px */

/* Margin */
.m-md              /* margin: 16px (all sides) */
.mx-auto           /* margin-left & right: auto (centering) */
.my-lg             /* margin-top & bottom: 24px */
.mt-xl             /* margin-top: 32px */
.mb-sm             /* margin-bottom: 8px */
```

### Typography

```css
/* Size */
.text-xs           /* font-size: 12px */
.text-sm           /* font-size: 14px */
.text-base         /* font-size: 16px */
.text-lg           /* font-size: 20px */
.text-xl           /* font-size: 24px */

/* Weight */
.font-normal       /* font-weight: 400 */
.font-medium       /* font-weight: 500 */
.font-semibold     /* font-weight: 600 */
.font-bold         /* font-weight: 700 */

/* Alignment */
.text-left         /* text-align: left */
.text-center       /* text-align: center */
.text-right        /* text-align: right */

/* Other */
.truncate          /* text overflow ellipsis */
.line-clamp-2      /* limit to 2 lines */
```

### Colors

```css
/* Text */
.text-primary      /* Primary text color */
.text-secondary    /* Secondary text color */
.text-success      /* Green text */
.text-error        /* Red text */

/* Background */
.bg-white          /* White background */
.bg-primary        /* Primary brand background */
.bg-success-light  /* Light green background */
.bg-gray-100       /* Light gray background */
```

### Borders & Shadows

```css
/* Borders */
.border            /* 1px border */
.border-t          /* Top border only */
.border-primary    /* Primary color border */

/* Radius */
.rounded-sm        /* 4px radius */
.rounded-md        /* 8px radius */
.rounded-lg        /* 12px radius */
.rounded-full      /* Circular */

/* Shadows */
.shadow-sm         /* Small shadow */
.shadow-md         /* Medium shadow */
.shadow-lg         /* Large shadow */
```

### Components

```css
/* Card */
.card              /* Pre-styled card component */

/* Button */
.btn               /* Base button */
.btn-primary       /* Primary button */
.btn-secondary     /* Secondary button */

/* Badge */
.badge             /* Base badge/tag */
.badge-primary     /* Primary badge */
.badge-success     /* Success badge */

/* Input */
.input             /* Styled input field */

/* Divider */
.divider           /* Horizontal divider line */
.divider-vertical  /* Vertical divider line */
```

---

## 🎯 Migration Guide

### Step 1: Replace Hardcoded Values

**Before:**
```css
.my-component {
  color: #2563eb;
  padding: 16px;
  margin: 24px 0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

**After:**
```css
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-md);
  margin: var(--spacing-lg) 0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

### Step 2: Use Utility Classes Where Possible

**Before:**
```html
<div style="display: flex; justify-content: space-between; padding: 24px;">
  <span style="font-weight: 600; color: #1f2937;">Title</span>
  <button style="background: #2563eb; color: white;">Action</button>
</div>
```

**After:**
```html
<div class="flex justify-between p-lg">
  <span class="font-semibold text-primary">Title</span>
  <button class="btn btn-primary">Action</button>
</div>
```

### Step 3: Extract Common Patterns

If you have repeating styles, consider creating a reusable class:

**Before:**
```css
.card-1 {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.card-2 {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

**After:**
```html
<!-- Just use the built-in .card utility -->
<div class="card">Content</div>
```

---

## 📝 Best Practices

### DO ✅

1. **Use CSS variables for all colors, spacing, and typography**
   ```css
   color: var(--color-primary);
   padding: var(--spacing-md);
   ```

2. **Use utility classes for simple styling**
   ```html
   <div class="flex items-center gap-md p-lg">
   ```

3. **Create custom classes for complex components**
   ```css
   .topic-card {
     /* Complex component-specific styles */
   }
   ```

4. **Keep specificity low**
   ```css
   /* Good */
   .button-primary { }
   
   /* Avoid */
   div.container button.button-primary { }
   ```

5. **Comment complex CSS sections**
   ```css
   /* Topic card hover effect with elevation */
   .topic-card:hover {
     transform: translateY(-2px);
   }
   ```

### DON'T ❌

1. **Don't hardcode colors**
   ```css
   /* Bad */
   color: #2563eb;
   
   /* Good */
   color: var(--color-primary);
   ```

2. **Don't hardcode spacing**
   ```css
   /* Bad */
   margin: 16px;
   
   /* Good */
   margin: var(--spacing-md);
   ```

3. **Don't use inline styles**
   ```html
   <!-- Bad -->
   <div style="padding: 16px;">
   
   <!-- Good -->
   <div class="p-md">
   ```

4. **Don't duplicate styles**
   ```css
   /* Bad - duplication */
   .card-1 { padding: 24px; border-radius: 8px; }
   .card-2 { padding: 24px; border-radius: 8px; }
   
   <!-- Good - use utility -->
   <div class="p-lg rounded-md">
   ```

---

## 🔄 Gradual Migration Strategy

You don't need to refactor everything at once. Follow this approach:

### Phase 1: New Components
- Use the new system for all new components
- Import `variables.css` in component CSS files
- Use utility classes in JSX

### Phase 2: Update on Edit
- When editing existing components, refactor to use new system
- Replace hardcoded values with variables
- Replace inline styles with utility classes

### Phase 3: Systematic Refactor
- Pick one CSS file at a time
- Refactor to use variables and utilities
- Test thoroughly after each file

---

## 🎨 Example Refactors

### Example 1: Button Component

**Before:**
```css
.submit-button {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.submit-button:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}
```

**After:**
```css
.submit-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-normal);
}

.submit-button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-primary);
}
```

Or just use utility classes:
```html
<button class="btn btn-primary">Submit</button>
```

### Example 2: Card Component

**Before:**
```css
.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin: 16px 0;
}

.profile-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

**After:**
```css
.profile-card {
  background: var(--color-background-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  margin: var(--spacing-md) 0;
  transition: var(--transition-normal);
}

.profile-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

Or use utility:
```html
<div class="card my-md">
  <!-- Card content -->
</div>
```

---

## 🚀 Benefits

### Before Refactoring
```css
/* Scattered, inconsistent values */
.component-1 { color: #2563eb; padding: 15px; }
.component-2 { color: #2564eb; padding: 16px; } /* Typo! */
.component-3 { color: rgb(37, 99, 235); padding: 1rem; }
```

### After Refactoring
```css
/* Consistent, maintainable */
.component-1 { color: var(--color-primary); padding: var(--spacing-md); }
.component-2 { color: var(--color-primary); padding: var(--spacing-md); }
.component-3 { color: var(--color-primary); padding: var(--spacing-md); }
```

**Benefits:**
- ✅ **Consistency** - Same values everywhere
- ✅ **Maintainability** - Update once, applies everywhere
- ✅ **Readability** - Semantic names (--color-primary vs #2563eb)
- ✅ **Theme support** - Easy to implement dark mode
- ✅ **Less code** - Utility classes reduce duplication
- ✅ **Faster development** - Pre-made utilities speed up styling

---

## 📚 Resources

### Files Created
- `frontend/src/styles/variables.css` - Design tokens
- `frontend/src/styles/utilities.css` - Utility classes
- `CSS_REFACTORING_GUIDE.md` - This documentation

### Quick Reference
- Color palette: Check `variables.css` `:root` section
- Spacing scale: 8px base (xs=4px, sm=8px, md=16px, lg=24px, xl=32px)
- Utility classes: Check `utilities.css` for full list

### Next Steps
1. Import variables in your component CSS files
2. Start using utility classes in new components
3. Gradually refactor existing components
4. Update App.css to use new system

---

**Last Updated:** November 5, 2024
**Status:** ✅ Ready to Use
