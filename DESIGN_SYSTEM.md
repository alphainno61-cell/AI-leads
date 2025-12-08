# Design System Quick Reference

## 🎨 Color Variables

### Primary Colors
```css
--color-primary-blue: #2563EB
--color-primary-blue-dark: #1D4ED8
--color-primary-blue-light: #3B82F6
--color-secondary-green: #22C55E
--color-secondary-green-dark: #16A34A
--color-secondary-green-light: #4ADE80
```

### Neutral Colors
```css
--color-white: #FFFFFF
--color-gray-50: #F9FAFB
--color-gray-100: #F3F4F6
--color-gray-200: #E5E7EB
--color-gray-300: #D1D5DB
--color-gray-400: #9CA3AF
--color-gray-500: #6B7280
--color-gray-600: #4B5563
--color-gray-700: #374151
--color-gray-800: #1F2937
--color-gray-900: #111827
```

### Accent Colors
```css
--color-warning: #F59E0B
--color-error: #EF4444
--color-info: #06B6D4
```

## 📏 Typography

### Font Sizes
```css
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px
--font-size-3xl: 30px
--font-size-4xl: 32px
```

### Font Weights
```css
--font-weight-regular: 400
--font-weight-semibold: 600
--font-weight-bold: 700
```

## 📦 Spacing

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

## 🔲 Border Radius

```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px
```

## 🎭 Shadows

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08)
--shadow-hover: 0 8px 16px rgba(37, 99, 235, 0.15)
```

## 🎬 Transitions

```css
--transition-fast: 150ms ease-in-out
--transition-base: 250ms ease-in-out
--transition-slow: 350ms ease-in-out
```

## 🧩 Component Classes

### Buttons
```html
<!-- Primary Button -->
<button class="btn btn-primary">Click Me</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Click Me</button>

<!-- Success Button -->
<button class="btn btn-success">Click Me</button>

<!-- Danger Button -->
<button class="btn btn-danger">Click Me</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>

<!-- Icon Button -->
<button class="btn-icon">🔍</button>
```

### Cards
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Subtitle</p>
  </div>
  <div class="card-body">
    Content goes here
  </div>
  <div class="card-footer">
    Footer content
  </div>
</div>
```

### Badges
```html
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-info">Info</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-neutral">Neutral</span>
```

### Inputs
```html
<div class="input-group">
  <label class="input-label">Label</label>
  <input type="text" class="input" placeholder="Enter text">
</div>

<div class="input-group">
  <label class="input-label">Select</label>
  <select class="select">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</div>

<div class="input-group">
  <label class="input-label">Textarea</label>
  <textarea class="textarea" placeholder="Enter text"></textarea>
</div>
```

### Tables
```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

## 📐 Layout Utilities

### Grid
```html
<div class="grid grid-cols-2 gap-lg">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Available: grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4 -->
```

### Flex
```html
<div class="flex items-center justify-between gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Spacing
```html
<!-- Margin -->
<div class="mt-md mb-lg ml-sm mr-sm">Content</div>

<!-- Padding -->
<div class="p-md">Content</div>
```

## 🎨 Text Utilities

```html
<p class="text-primary">Primary color text</p>
<p class="text-success">Success color text</p>
<p class="text-warning">Warning color text</p>
<p class="text-error">Error color text</p>
<p class="text-muted">Muted text</p>

<p class="text-center">Centered text</p>
<p class="text-right">Right aligned text</p>

<p class="font-semibold">Semi-bold text</p>
<p class="font-bold">Bold text</p>
```

## 🎭 Animation Classes

```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-in">Slides in</div>
<div class="animate-pulse">Pulses</div>
```

## 🎯 Usage Examples

### Dashboard Card
```html
<div class="card stat-card">
  <div class="card-header">
    <h3 class="card-title">Total Leads</h3>
    <span class="badge badge-success">Active</span>
  </div>
  <div class="card-body">
    <div class="stat-main">
      <div class="stat-number">1,247</div>
      <div class="stat-label">Total Leads</div>
    </div>
  </div>
</div>
```

### Form Section
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Lead Filters</h3>
  </div>
  <div class="card-body">
    <div class="grid grid-cols-2 gap-lg">
      <div class="input-group">
        <label class="input-label">Industry</label>
        <select class="select">
          <option>Real Estate</option>
          <option>Mortgage</option>
        </select>
      </div>
      <div class="input-group">
        <label class="input-label">Location</label>
        <input type="text" class="input" placeholder="Enter city">
      </div>
    </div>
    <div class="flex gap-md mt-lg">
      <button class="btn btn-primary">Search</button>
      <button class="btn btn-secondary">Reset</button>
    </div>
  </div>
</div>
```

### Status Indicator
```html
<div class="flex items-center gap-sm">
  <span class="status-dot active"></span>
  <span class="status-text">AI Agent Active</span>
</div>
```

## 📱 Responsive Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */

@media (max-width: 768px) {
  /* Mobile styles */
}

@media (max-width: 1024px) {
  /* Tablet styles */
}
```

## 🎨 Custom Gradients

```css
/* Primary Gradient */
background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);

/* Success Gradient */
background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
```

## 💡 Best Practices

1. **Always use CSS variables** for colors and spacing
2. **Use semantic class names** (e.g., `btn-primary` not `btn-blue`)
3. **Maintain consistent spacing** using the spacing scale
4. **Apply hover states** to interactive elements
5. **Use transitions** for smooth interactions
6. **Keep animations subtle** (150-350ms)
7. **Ensure accessibility** with proper contrast ratios
8. **Test responsiveness** on all screen sizes

## 🔗 Quick Links

- Full Design System: `src/index.css`
- Layout Component: `src/components/Layout/Layout.jsx`
- Example Pages: `src/pages/Dashboard/Dashboard.jsx`

---

**Design System Version**: 1.0.0  
**Last Updated**: December 8, 2025
