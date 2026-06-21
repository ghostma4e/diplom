-- Migration v4: три критерия оценки проектов
ALTER TABLE project_ratings ADD COLUMN IF NOT EXISTS score_design INTEGER CHECK (score_design >= 0 AND score_design <= 100);
ALTER TABLE project_ratings ADD COLUMN IF NOT EXISTS score_technical INTEGER CHECK (score_technical >= 0 AND score_technical <= 100);
ALTER TABLE project_ratings ADD COLUMN IF NOT EXISTS score_tasks INTEGER CHECK (score_tasks >= 0 AND score_tasks <= 100);

UPDATE project_ratings
SET
  score_design = COALESCE(score_design, score),
  score_technical = COALESCE(score_technical, score),
  score_tasks = COALESCE(score_tasks, score)
WHERE score IS NOT NULL;
