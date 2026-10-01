-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'staff');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'staff',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "cin" VARCHAR(30) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "birth_date" DATE NOT NULL,
    "address" VARCHAR(255),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "appointment_date" TIMESTAMPTZ(3) NOT NULL,
    "status" "appointment_status" NOT NULL DEFAULT 'pending',
    "reason" VARCHAR(500) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cin_key" ON "patients"("cin");

-- CreateIndex
CREATE INDEX "patients_full_name_idx" ON "patients"("full_name");

-- CreateIndex
CREATE INDEX "patients_phone_idx" ON "patients"("phone");

-- CreateIndex
CREATE INDEX "appointments_patient_id_appointment_date_status_idx" ON "appointments"("patient_id", "appointment_date", "status");

-- CreateIndex
CREATE INDEX "appointments_appointment_date_status_idx" ON "appointments"("appointment_date", "status");

-- CreateIndex
CREATE INDEX "appointments_created_by_idx" ON "appointments"("created_by");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

