-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('CHECK_IN', 'HANDOVER');

-- CreateTable
CREATE TABLE "ParcelImage" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "type" "ImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParcelImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ParcelImage" ADD CONSTRAINT "ParcelImage_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
