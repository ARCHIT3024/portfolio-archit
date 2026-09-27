import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Desk } from './Desk';

describe('Desk', () => {
  it('examines one card at a time from the keyboard and keeps content in the DOM', async () => {
    const user = userEvent.setup();
    render(<Desk />);
    const typewriter = screen.getByRole('button', { name: /The Typewriter/ });
    const mug = screen.getByRole('button', { name: /The Coffee Mug/ });
    expect(typewriter).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Black. Refilled often. Not negotiable.')).toBeInTheDocument();

    typewriter.focus();
    await user.keyboard('{Enter}');
    expect(typewriter).toHaveAttribute('aria-expanded', 'true');

    mug.focus();
    await user.keyboard(' ');
    expect(mug).toHaveAttribute('aria-expanded', 'true');
    expect(typewriter).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard(' ');
    expect(mug).toHaveAttribute('aria-expanded', 'false');
  });
});
