import styles from './Avatar.module.css';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'large' | 'medium' | 'small' | 'xsmall';
}

function getInitial(name?: string | null) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

export default function Avatar({ src, name, size = 'medium' }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name ?? ''} className={`${styles.avatar} ${styles[size]}`} />;
  }
  return (
    <div className={`${styles.avatar} ${styles.fallback} ${styles[size]}`}>
      {getInitial(name)}
    </div>
  );
}
