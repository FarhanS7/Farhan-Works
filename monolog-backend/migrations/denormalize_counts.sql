-- MonoLog Database Denormalization Migration

-- 1. Add view_count and comment_count to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- 2. Create function to increment/decrement view_count on views insert
CREATE OR REPLACE FUNCTION update_post_view_count() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET view_count = view_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Create function to increment/decrement comment_count on comments approve/delete
CREATE OR REPLACE FUNCTION update_post_comment_count() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Only count if it's already approved (rare, but possible)
        IF (NEW.is_approved = TRUE) THEN
            UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If approved state changes
        IF (OLD.is_approved = FALSE AND NEW.is_approved = TRUE) THEN
            UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        ELSIF (OLD.is_approved = TRUE AND NEW.is_approved = FALSE) THEN
            UPDATE posts SET comment_count = comment_count - 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- If an approved comment is deleted
        IF (OLD.is_approved = TRUE) THEN
            UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create triggers
DROP TRIGGER IF EXISTS trg_update_view_count ON views;
CREATE TRIGGER trg_update_view_count
AFTER INSERT OR DELETE ON views
FOR EACH ROW EXECUTE FUNCTION update_post_view_count();

DROP TRIGGER IF EXISTS trg_update_comment_count ON comments;
CREATE TRIGGER trg_update_comment_count
AFTER INSERT OR UPDATE OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- 5. Initialize counts for existing data
UPDATE posts p
SET 
    view_count = (SELECT COUNT(*) FROM views v WHERE v.post_id = p.id),
    comment_count = (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_approved = TRUE);

-- 6. Add indexes on the new columns for sorting/filtering performance
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_comment_count ON posts(comment_count DESC);
