/*
  Warnings:

  - You are about to drop the column `pointServiceDestId` on the `MouvementEquipement` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `MouvementEquipement` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[MouvementEquipement] DROP CONSTRAINT [MouvementEquipement_pointServiceDestId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Equipement] DROP CONSTRAINT [Equipement_status_df];
ALTER TABLE [dbo].[Equipement] ADD CONSTRAINT [Equipement_status_df] DEFAULT 'DISPONIBLE' FOR [status];
ALTER TABLE [dbo].[Equipement] ADD [agenceActuelleId] INT,
[etat] NVARCHAR(1000) NOT NULL CONSTRAINT [Equipement_etat_df] DEFAULT 'FONCTIONNEL',
[pointServiceActuelId] INT,
[responsableActuelId] INT;

-- AlterTable
ALTER TABLE [dbo].[MouvementEquipement] DROP COLUMN [pointServiceDestId],
[statut];
ALTER TABLE [dbo].[MouvementEquipement] ADD [etatApres] NVARCHAR(1000),
[etatAvant] NVARCHAR(1000),
[pointServiceDestinationId] INT,
[responsableSourceId] INT;

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [titre] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [canal] NVARCHAR(1000) NOT NULL CONSTRAINT [Notification_canal_df] DEFAULT 'IN_APP',
    [lu] BIT NOT NULL CONSTRAINT [Notification_lu_df] DEFAULT 0,
    [luAt] DATETIME2,
    [userId] INT NOT NULL,
    [equipementId] INT,
    [mouvementId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Equipement] ADD CONSTRAINT [Equipement_agenceActuelleId_fkey] FOREIGN KEY ([agenceActuelleId]) REFERENCES [dbo].[Agence]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Equipement] ADD CONSTRAINT [Equipement_pointServiceActuelId_fkey] FOREIGN KEY ([pointServiceActuelId]) REFERENCES [dbo].[PointDeService]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Equipement] ADD CONSTRAINT [Equipement_responsableActuelId_fkey] FOREIGN KEY ([responsableActuelId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_responsableSourceId_fkey] FOREIGN KEY ([responsableSourceId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_pointServiceDestinationId_fkey] FOREIGN KEY ([pointServiceDestinationId]) REFERENCES [dbo].[PointDeService]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_equipementId_fkey] FOREIGN KEY ([equipementId]) REFERENCES [dbo].[Equipement]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_mouvementId_fkey] FOREIGN KEY ([mouvementId]) REFERENCES [dbo].[MouvementEquipement]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
