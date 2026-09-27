import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhotoFrame } from './PhotoFrame';
import { TextLink } from './TextLink';

describe('PhotoFrame', () => {
  it('renders the design placeholder until the image exists', () => {
    render(<PhotoFrame slot={{ label: 'Portrait, 4:5', ratio: [4, 5] }} variant="portrait" />);
    expect(screen.getByText('IMAGE PLACEHOLDER')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders AVIF/WebP sources with only the widths that exist', () => {
    const { container } = render(
      <PhotoFrame
        slot={{
          label: 'x',
          ratio: [16, 10],
          src: 'shot',
          widths: [480, 960, 1200],
          alt: 'A dashboard',
        }}
        variant="evidence"
      />,
    );
    const img = screen.getByRole('img', { name: 'A dashboard' });
    expect(img).toHaveAttribute('src', '/images/shot-960.webp');
    expect(img).toHaveAttribute('loading', 'lazy');
    const avif = container.querySelector('source[type="image/avif"]');
    expect(avif?.getAttribute('srcset')).toBe(
      '/images/shot-480.avif 480w, /images/shot-960.avif 960w, /images/shot-1200.avif 1200w',
    );
  });
});

describe('TextLink', () => {
  it('opens external links safely', () => {
    render(<TextLink href="https://github.com/x">GitHub</TextLink>);
    const a = screen.getByRole('link', { name: 'GitHub' });
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a missing link as unlinked TODO text, not a dead #', () => {
    render(<TextLink href={null}>LinkedIn</TextLink>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('LinkedIn')).toHaveAttribute('data-todo', 'link');
  });
});
