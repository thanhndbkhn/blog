-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('vn', 'en');

-- CreateTable
CREATE TABLE "post_translations" (
    "post_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "post_translations_pkey" PRIMARY KEY ("post_id","locale")
);

-- CreateTable
CREATE TABLE "i18n_entries" (
    "key" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "i18n_entries_pkey" PRIMARY KEY ("key","locale")
);

-- AddForeignKey
ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
