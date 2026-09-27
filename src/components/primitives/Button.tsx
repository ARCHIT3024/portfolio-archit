import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'outline' | 'cta' | 'ghostDark';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
  ref?: Ref<HTMLButtonElement>;
};
type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant: ButtonVariant;
  ref?: Ref<HTMLAnchorElement>;
};

export function Button({ variant, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${className ?? ''}`}
      {...rest}
    />
  );
}

/** An anchor styled as a button. External links get `rel="noopener noreferrer"` automatically. */
export function LinkButton({
  variant,
  className,
  target,
  rel,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a
      className={`${styles.btn} ${styles[variant]} ${className ?? ''}`}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : rel}
      {...rest}
    >
      {children}
    </a>
  );
}
