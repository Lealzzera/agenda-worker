/*
  Warnings:

  - A unique constraint covering the columns `[clinic_id,date,start_time,end_time]` on the table `clinic_special_dates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "clinic_special_dates_clinic_id_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "clinic_special_dates_clinic_id_date_start_time_end_time_key" ON "clinic_special_dates"("clinic_id", "date", "start_time", "end_time");
