-- Fix for existing Supabase projects created before meal sync existed.
-- Run this once in the Supabase SQL Editor if meal records fail with:
-- "violates check constraint space_records_entity_type_check".

alter table public.space_records
drop constraint if exists space_records_entity_type_check;

alter table public.space_records
add constraint space_records_entity_type_check
check (entity_type in ('item', 'category', 'purchase', 'meal', 'settings'));
