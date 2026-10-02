import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Restrained, finance-grade palette: warm neutrals + a deep green accent.
const ink: MantineColorsTuple = ['#eef6f3', '#dcebe5', '#b4d6c9', '#89c0ab', '#66ad92', '#4fa182', '#3f8a6e', '#2f735b', '#22604b', '#134a38'];
const stone: MantineColorsTuple = ['#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917'];

export const theme = createTheme({
  primaryColor: 'ink',
  primaryShade: 8,
  colors: { ink, stone },
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  headings: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontWeight: '600' },
  fontSizes: { xs: '11.5px', sm: '13px', md: '14px', lg: '16px', xl: '19px' },
  defaultRadius: 'sm',
  cursorType: 'pointer',
  components: {
    Button: { defaultProps: { size: 'xs', fw: 500 } },
    Badge: { defaultProps: { radius: 'sm', variant: 'light', size: 'sm' }, styles: { root: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 } } },
    Paper: { defaultProps: { withBorder: true, radius: 'md' } },
    Card: { defaultProps: { withBorder: true, radius: 'md' } },
    TextInput: { defaultProps: { size: 'xs' } },
    Textarea: { defaultProps: { size: 'xs' } },
    Select: { defaultProps: { size: 'xs' } },
    MultiSelect: { defaultProps: { size: 'xs' } },
    Tabs: { defaultProps: { variant: 'default' } },
    Tooltip: { defaultProps: { withArrow: true, openDelay: 250, fz: 'xs' } },
    Table: { defaultProps: { verticalSpacing: 6, horizontalSpacing: 'sm', fz: 'sm' } },
    Drawer: { defaultProps: { overlayProps: { backgroundOpacity: 0.15 } } },
    Modal: { defaultProps: { overlayProps: { backgroundOpacity: 0.25 }, radius: 'md' } },
  },
});
