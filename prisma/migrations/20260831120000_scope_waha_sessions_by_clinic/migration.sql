UPDATE "whatsapp_sessions"
SET
  "session_name" = "clinic_id",
  "status" = 'STOPPED',
  "phone_number" = NULL
WHERE "session_name" = 'default';

DELETE FROM "whatsapp_conversations" AS legacy
WHERE legacy."session" = 'default'
  AND EXISTS (
    SELECT 1
    FROM "whatsapp_conversations" AS scoped
    WHERE scoped."clinic_id" = legacy."clinic_id"
      AND scoped."session" = legacy."clinic_id"
      AND scoped."chat_id" = legacy."chat_id"
  );

UPDATE "whatsapp_conversations"
SET "session" = "clinic_id"
WHERE "session" = 'default';
