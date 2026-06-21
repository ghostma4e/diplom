import { isImageAvatar } from '../constants/langIcons.js';

export default function AvatarDisplay({ user, size = 'md' }) {
  const url = user?.avatar_url;
  const cls = size === 'lg' ? 'profile-avatar-lg' : '';

  if (url && isImageAvatar(url)) {
    return <img src={url} alt="" className={`profile-avatar-img ${cls}`} />;
  }

  const initial = (user?.username || '?').charAt(0).toUpperCase();
  return <span className={`profile-avatar-initial ${cls}`}>{initial}</span>;
}
