/*
  Warnings:

  - You are about to drop the column `validatedBy` on the `Evenement` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Evenement] DROP CONSTRAINT [Evenement_validatedBy_fkey];

-- AlterTable
ALTER TABLE [dbo].[Evenement] DROP COLUMN [validatedBy];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
