/*
  Warnings:

  - You are about to drop the column `latitude` on the `ActionCredit` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `ActionCredit` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Notification] DROP CONSTRAINT [Notification_actionCreditId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Notification] DROP CONSTRAINT [Notification_equipementId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Notification] DROP CONSTRAINT [Notification_mouvementId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Notification] DROP CONSTRAINT [Notification_userId_fkey];

-- AlterTable
ALTER TABLE [dbo].[ActionCredit] DROP COLUMN [latitude],
[longitude];

-- AlterTable
ALTER TABLE [dbo].[Notification] ADD [demandeId] INT;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_demandeId_fkey] FOREIGN KEY ([demandeId]) REFERENCES [dbo].[Demande]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_equipementId_fkey] FOREIGN KEY ([equipementId]) REFERENCES [dbo].[Equipement]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_mouvementId_fkey] FOREIGN KEY ([mouvementId]) REFERENCES [dbo].[MouvementEquipement]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_actionCreditId_fkey] FOREIGN KEY ([actionCreditId]) REFERENCES [dbo].[ActionCredit]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
