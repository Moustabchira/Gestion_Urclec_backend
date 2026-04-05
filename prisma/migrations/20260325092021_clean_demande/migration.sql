/*
  Warnings:

  - You are about to drop the `Absence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemandePermission` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Absence] DROP CONSTRAINT [Absence_demandeId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Conge] DROP CONSTRAINT [Conge_demandeId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Demande] DROP CONSTRAINT [Demande_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[DemandePermission] DROP CONSTRAINT [DemandePermission_demandeId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Decision] DROP CONSTRAINT [Decision_updatedAt_df];

-- DropTable
DROP TABLE [dbo].[Absence];

-- DropTable
DROP TABLE [dbo].[Conge];

-- DropTable
DROP TABLE [dbo].[DemandePermission];

-- AddForeignKey
ALTER TABLE [dbo].[Demande] ADD CONSTRAINT [Demande_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
