-- Allow active purchase sessions to sync through the generic records table.
-- Run once in Supabase SQL Editor before deploying the app change.

alter table public.space_records
drop constraint if exists space_records_entity_type_check;

alter table public.space_records
add constraint space_records_entity_type_check
check (
  entity_type in (
    'item',
    'category',
    'purchase',
    'purchase_session',
    'meal',
    'settings'
  )
);
