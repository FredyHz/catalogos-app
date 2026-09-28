-- CreateEnum
CREATE TYPE "PosterType" AS ENUM ('POSTER', 'ANUNCIO');

-- AlterTable
ALTER TABLE "Poster" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "PosterType" NOT NULL DEFAULT 'POSTER';
