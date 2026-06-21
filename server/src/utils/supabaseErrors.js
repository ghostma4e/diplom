export function mapSupabaseError(error) {
  if (!error) return null;
  const msg = error.message || '';
  if (msg.includes('row-level security')) {
    return (
      'Ошибка RLS в Supabase: укажите service_role key в server/.env или выполните database/fix-rls.sql'
    );
  }
  if (msg.includes('column users.role does not exist')) {
    return 'Добавьте колонку role: выполните database/fix-rls.sql в Supabase SQL Editor';
  }
  return msg;
}
