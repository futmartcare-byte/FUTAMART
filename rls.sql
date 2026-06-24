alter table push_tokens enable row level security;
create policy "Users can insert own token" on push_tokens for insert with check (auth.uid() = user_id);
create policy "Users can update own token" on push_tokens for update using (auth.uid() = user_id);
create policy "Service can read tokens" on push_tokens for select using (true);
