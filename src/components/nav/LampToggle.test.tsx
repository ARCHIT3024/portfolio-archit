import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LampToggle } from './LampToggle';

describe('LampToggle', () => {
  it('reports its state with aria-pressed and a matching label', () => {
    const onToggle = vi.fn();
    const { rerender } = render(<LampToggle lightsOff={false} onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Lights off' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    rerender(<LampToggle lightsOff onToggle={onToggle} />);
    const btn = screen.getByRole('button', { name: 'Lights on' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    btn.click();
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
