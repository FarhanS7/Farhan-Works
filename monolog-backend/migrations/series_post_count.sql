-- 1. Add post_count to series table
ALTER TABLE series ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- 2. Populate existing counts
UPDATE series
SET post_count = (
  SELECT count(*)
  FROM posts
  WHERE posts.series_id = series.id AND posts.is_published = TRUE
);

-- 3. Create generic series count update function
CREATE OR REPLACE FUNCTION update_series_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.series_id IS NOT NULL AND NEW.is_published = TRUE THEN
      UPDATE series SET post_count = post_count + 1 WHERE id = NEW.series_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If series changed or publish status changed
    IF OLD.series_id IS DISTINCT FROM NEW.series_id OR OLD.is_published IS DISTINCT FROM NEW.is_published THEN
      -- Decrease count on old series if it was published
      IF OLD.series_id IS NOT NULL AND OLD.is_published = TRUE THEN
        UPDATE series SET post_count = post_count - 1 WHERE id = OLD.series_id;
      END IF;
      -- Increase count on new series if it is published
      IF NEW.series_id IS NOT NULL AND NEW.is_published = TRUE THEN
        UPDATE series SET post_count = post_count + 1 WHERE id = NEW.series_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.series_id IS NOT NULL AND OLD.is_published = TRUE THEN
      UPDATE series SET post_count = post_count - 1 WHERE id = OLD.series_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on posts
DROP TRIGGER IF EXISTS trigger_update_series_count ON posts;
CREATE TRIGGER trigger_update_series_count
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_series_post_count();
