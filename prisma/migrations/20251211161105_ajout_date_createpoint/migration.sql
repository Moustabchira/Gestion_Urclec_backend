/*
  Warnings:

  - Added the required column `updatedAt` to the `PointDeService` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[PointDeService] ADD [archive] BIT NOT NULL CONSTRAINT [PointDeService_archive_df] DEFAULT 0,
[archivedAt] DATETIME2,
[createdAt] DATETIME2 NOT NULL CONSTRAINT [PointDeService_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
