/** Логотипы языков программирования (SVG в public/icons/lang) */
export const LANG_ICONS = [
  { id: 'java', label: 'Java', src: '/icons/lang/java.svg' },
  { id: 'javascript', label: 'JavaScript', src: '/icons/lang/javascript.svg' },
  { id: 'python', label: 'Python', src: '/icons/lang/python.svg' },
  { id: 'csharp', label: 'C#', src: '/icons/lang/csharp.svg' },
  { id: 'cpp', label: 'C++', src: '/icons/lang/cpp.svg' },
  { id: 'php', label: 'PHP', src: '/icons/lang/php.svg' },
  { id: 'go', label: 'Go', src: '/icons/lang/go.svg' },
  { id: 'rust', label: 'Rust', src: '/icons/lang/rust.svg' },
  { id: 'typescript', label: 'TypeScript', src: '/icons/lang/typescript.svg' },
  { id: 'kotlin', label: 'Kotlin', src: '/icons/lang/kotlin.svg' },
  { id: 'ruby', label: 'Ruby', src: '/icons/lang/ruby.svg' },
  { id: '1c', label: '1C', src: '/icons/lang/1c.svg' },
];

export function isImageAvatar(url) {
  if (!url) return false;
  return (
    /^https?:\/\//i.test(url) ||
    url.startsWith('data:image/') ||
    url.startsWith('/icons/')
  );
}
