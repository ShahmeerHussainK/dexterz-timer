-- CreateTable
CREATE TABLE IF NOT EXISTS screenshots (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ(6) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT screenshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS idx_screenshots_user_captured ON screenshots(user_id, captured_at);
