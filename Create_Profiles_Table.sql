CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  projectId text,
  datasetId text,
  tableName text,
  PRIMARY KEY (id)
);
-- ALTER TABLE public.profiles enable ROW LEVEL SECURITY;
CREATE FUNCTION public.handle_new_user() RETURNS TRIGGER language plpgsql SECURITY DEFINER
SET search_path = '' AS $$ BEGIN
INSERT INTO public.profiles (id, projectId, datasetId, tableName)
VALUES (
    new.id,
    new.raw_user_meta_data->>'projectId',
    new.raw_user_meta_data->>'datasetId',
    new.raw_user_meta_data->>'tableName'
  );
RETURN new;
END;
$$;
-- trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR each ROW EXECUTE PROCEDURE public.handle_new_user();