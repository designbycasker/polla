import styles from './Badge.module.css';

type Variant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
type Size = 'medium' | 'small';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
}

export default function Badge({ children, variant = 'brand', size = 'medium' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {children}
    </span>
  );
}
