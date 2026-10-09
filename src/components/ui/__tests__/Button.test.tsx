import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

jest.mock('@/global.css', () => ({}), { virtual: true });
jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    primary: '#245BCE',
    primaryPressed: '#1C49AA',
    error: '#B42336',
    backgroundElement: '#EDF1F6',
    text: '#17243B',
    background: '#F7F8FA',
    onPrimary: '#FFFFFF',
  }),
}));

import { Button } from '../Button';

describe('Button accessibility', () => {
  it('omitting accessibilityRole and accessibilityState preserves defaults', async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<Button label="Submit" />);
    });
    const json = tree.toJSON() as any;

    expect(json.props.accessibilityRole).toBe('button');
    expect(json.props.accessibilityState).toEqual({
      disabled: false,
      busy: false,
    });
  });

  it('renders caller-supplied accessibilityRole', async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<Button label="Read more" accessibilityRole="link" />);
    });
    const json = tree.toJSON() as any;

    expect(json.props.accessibilityRole).toBe('link');
  });

  it('merges caller accessibilityState with computed disabled and busy flags', async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<Button label="Select Option" accessibilityState={{ selected: true }} />);
    });
    const json = tree.toJSON() as any;

    expect(json.props.accessibilityState).toEqual({
      disabled: false,
      busy: false,
      selected: true,
    });
  });

  it('reflects loading and disabled in accessibilityState', async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<Button label="Processing" loading disabled />);
    });
    const json = tree.toJSON() as any;

    expect(json.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });
});
