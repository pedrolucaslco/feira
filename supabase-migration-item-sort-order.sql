-- Migration for projects created before item ordering used a dedicated field.
-- It keeps createdAt immutable and initializes data.sortOrder for synced items.
--
-- Run this once in the Supabase SQL editor after deploying the app change.

update public.space_records
set
  data = jsonb_set(
    coalesce(data, '{}'::jsonb),
    '{sortOrder}',
    to_jsonb(
      case
        when data ? 'sortOrder' and (data->>'sortOrder') ~ '^-?[0-9]+(\.[0-9]+)?$'
          then (data->>'sortOrder')::double precision
        when data ? 'createdAt' and (data->>'createdAt') ~ '^-?[0-9]+(\.[0-9]+)?$'
          then (data->>'createdAt')::double precision
        else extract(epoch from coalesce(updated_at, now())) * 1000
      end
    ),
    true
  )
where entity_type = 'item'
  and deleted_at is null
  and not (coalesce(data, '{}'::jsonb) ? 'sortOrder');
