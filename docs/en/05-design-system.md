# 05 — Design System

## Philosophy

Synko's UI follows a **modern, high-contrast dark** aesthetic. The goal is clarity, presence and a stronger visual identity without falling into noisy effects. Rules:

- No gradients on interactive elements
- No drop-shadow stacking or heavy visual noise
- Consistent spacing and type scale
- Accessible contrast ratios (WCAG AA)

---

## Color Palette

All colors are defined as CSS custom properties in `styles.scss` and used project-wide.

| Token | Value | Usage |
|---|---|---|
| `--color-bg-base` | `#080B12` | Page background |
| `--color-bg-surface` | `#111827` | Cards, panels |
| `--color-bg-elevated` | `#1E293B` | Elevated surfaces and highlighted sections |
| `--color-border` | `#334155` | Default borders |
| `--color-border-focus` | `#22D3EE` | Input focus ring |
| `--color-primary` | `#22D3EE` | Buttons, links, main accents |
| `--color-primary-hover` | `#06B6D4` | Primary hover state |
| `--color-primary-muted` | `rgba(34,211,238,.16)` | Focus rings, soft accent backgrounds |
| `--color-secondary` | `#8B5CF6` | Secondary accents and AI-related highlights |
| `--color-accent` | `#10B981` | Positive accent, success-related emphasis |
| `--color-text-primary` | `#F8FAFC` | Body copy, headings |
| `--color-text-secondary` | `#94A3B8` | Labels, captions, hints |
| `--color-text-disabled` | `#64748B` | Disabled states, placeholders |
| `--color-error` | `#EF4444` | Errors and destructive states |
| `--color-error-muted` | `rgba(239,68,68,.10)` | Error banners background |
| `--color-success` | `#10B981` | Success indicators |
| `--color-warning` | `#F59E0B` | Warnings |

---

## Typography

Font: **Inter** (Google Fonts). Loaded in `index.html`.

| Token | Value | Usage |
|---|---|---|
| `--font-size-xs` | `0.75rem / 12px` | Footnotes |
| `--font-size-sm` | `0.875rem / 14px` | Labels, inputs, captions |
| `--font-size-base` | `1rem / 16px` | Default body |
| `--font-size-lg` | `1.125rem / 18px` | Brand name, subheadings |
| `--font-size-xl` | `1.25rem / 20px` | Small titles |
| `--font-size-2xl` | `1.5rem / 24px` | Card headings |
| `--font-size-3xl` | `1.875rem / 30px` | Page titles |

**Weights in use:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

---

## Spacing

Based on a `0.25rem` (4px) grid.

| Token | Value |
|---|---|
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-5` | `1.25rem` |
| `--space-6` | `1.5rem` |
| `--space-8` | `2rem` |
| `--space-10` | `2.5rem` |
| `--space-12` | `3rem` |
| `--space-16` | `4rem` |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Chips, badges |
| `--radius-md` | `8px` | Inputs, buttons |
| `--radius-lg` | `12px` | Cards, modals |

---

## Shadows

| Token | Value |
|---|---|
| `--shadow-card` | `0 18px 40px rgba(2,8,23,.42)` |

---

## Transitions

| Token | Value |
|---|---|
| `--transition-fast` | `150ms ease` |
| `--transition-normal` | `200ms ease` |

---

## Components

### Button — Primary

```html
<button class="btn-primary">Label</button>
```

- Background: `--color-primary`
- Hover: `--color-primary-hover`
- Disabled: `opacity: 0.6`
- No outline border, no shadow stacking

### Form Field

```html
<div class="form-field">
  <label class="form-field__label" for="field">Label</label>
  <input class="form-field__input" id="field" type="text" />
</div>
```

- Background: `--color-bg-base`
- Border: `--color-border`
- Focus border: `--color-border-focus` + `box-shadow: 0 0 0 3px --color-primary-muted`

### Error Banner

```html
<div class="login-error" role="alert">Message</div>
```

- Background: `--color-error-muted`
- Border: `--color-error`
- Text: `--color-error`

---

## Naming Conventions

Styles use **BEM** (`block__element--modifier`). Component-scoped SCSS files only contain component-specific rules. All tokens are defined in `styles.scss` and consumed via `var()`.

---

## File Structure

```
src/
  styles.scss           ← Global tokens + reset
  app/
    features/
      auth/
        login/
          login.component.scss   ← Component styles
```

New shared UI components should be created under `src/app/shared/ui/` and scoped with BEM.
