CREATE TYPE "WhatsAppSessionStatus" AS ENUM ('STARTING', 'SCAN_QR_CODE', 'WORKING', 'FAILED', 'STOPPED');

CREATE TABLE "whatsapp_sessions" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "session_name" TEXT NOT NULL,
    "status" "WhatsAppSessionStatus" NOT NULL DEFAULT 'STARTING',
    "phone_number" TEXT,
    "engine" TEXT NOT NULL DEFAULT 'WEBJS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whatsapp_sessions_clinic_id_key" ON "whatsapp_sessions"("clinic_id");

CREATE UNIQUE INDEX "whatsapp_sessions_session_name_key" ON "whatsapp_sessions"("session_name");

CREATE INDEX "whatsapp_sessions_status_idx" ON "whatsapp_sessions"("status");
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
