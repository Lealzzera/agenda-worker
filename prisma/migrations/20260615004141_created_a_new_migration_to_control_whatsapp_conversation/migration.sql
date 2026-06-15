-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_conversations_clinic_id_idx" ON "whatsapp_conversations"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_conversations_clinic_id_session_chat_id_key" ON "whatsapp_conversations"("clinic_id", "session", "chat_id");

-- AddForeignKey
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
