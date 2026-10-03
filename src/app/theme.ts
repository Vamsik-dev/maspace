import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Enterprise palette: navy chrome, cobalt brand, cool slate neutrals, brass detail.
// `ink` is the brand scale (kept as the token name used across components).
const ink: MantineColorsTuple = ['#eef3ff', '#dce5fd', '#b6c8f8', '#8ca8f3', '#6a8cee', '#5579eb', '#486fea', '#3a5fd1', '#2f53bb', '#1f45a5'];
const stone: MantineColorsTuple = ['#f8fafc', '#f1f4f9', '#e2e7ef', '#cbd3df', '#94a3b8', '#64748b', '#4b5a70', '#334155', '#1e293b', '#0f1b2d'];
const navy: MantineColorsTuple = ['#e9eef7', '#cfd9ea', '#9fb2d4', '#6c89bd', '#4467a9', '#2d4f93', '#21417d', '#183364', '#10264b', '#0a1a33'];

export const theme = createTheme({
  primaryColor: 'ink',
  primaryShade: 7,
  colors: { ink, stone, navy },
  black: '#0f1b2d',
  // One type family across the product and the site; numbers use tabular figures (.num).
  fontFamily: '"Mona Sans Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  headings: { fontFamily: '"Mona Sans Variable", ui-sans-serif, system-ui, sans-serif', fontWeight: '600' },
  fontSizes: { xs: '12px', sm: '13.5px', md: '14.5px', lg: '16px', xl: '19px' },
  defaultRadius: 'md',
  radius: { xs: '3px', sm: '5px', md: '7px', lg: '10px', xl: '14px' },
  shadows: {
    xs: '0 1px 2px rgba(15,27,45,.05)',
    sm: '0 1px 2px rgba(15,27,45,.05), 0 1px 3px rgba(15,27,45,.06)',
    md: '0 4px 12px rgba(15,27,45,.08), 0 1px 3px rgba(15,27,45,.06)',
    lg: '0 12px 28px rgba(15,27,45,.12)',
    xl: '0 20px 48px rgba(15,27,45,.18)',
  },
  cursorType: 'pointer',
  components: {
    Button: { defaultProps: { size: 'xs', fw: 600, radius: 'md' } },
    Badge: { defaultProps: { radius: 'sm', variant: 'light', size: 'sm' }, styles: { root: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 } } },
    Paper: { defaultProps: { withBorder: true, radius: 'lg' } },
    Card: { defaultProps: { withBorder: true, radius: 'lg' } },
    TextInput: { defaultProps: { size: 'xs', radius: 'md' } },
    Textarea: { defaultProps: { size: 'xs', radius: 'md' } },
    Select: { defaultProps: { size: 'xs', radius: 'md' } },
    MultiSelect: { defaultProps: { size: 'xs', radius: 'md' } },
    SegmentedControl: { defaultProps: { radius: 'md' }, styles: { root: { background: '#e9edf4' } } },
    Tooltip: { defaultProps: { withArrow: true, openDelay: 250, fz: 'xs', color: 'navy.9' } },
    Table: {
      defaultProps: { verticalSpacing: 9, horizontalSpacing: 'md', fz: 'sm' },
      styles: {
        th: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5b6b82', fontWeight: 600, background: '#f8fafc' },
        tr: { borderColor: '#edf0f5' },
      },
    },
    Drawer: { defaultProps: { overlayProps: { backgroundOpacity: 0.25, color: '#0a1a33' } } },
    Modal: { defaultProps: { overlayProps: { backgroundOpacity: 0.35, color: '#0a1a33', blur: 2 }, radius: 'lg' } },
    Menu: { defaultProps: { shadow: 'md', radius: 'md' } },
    Popover: { defaultProps: { radius: 'md' } },
  },
});
