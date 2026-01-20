/*
  Warnings:

  - You are about to drop the column `categorie` on the `Equipement` table. All the data in the column will be lost.
  - You are about to drop the `AffectationEquipement` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[AffectationEquipement] DROP CONSTRAINT [AffectationEquipement_employeId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AffectationEquipement] DROP CONSTRAINT [AffectationEquipement_equipementId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AffectationEquipement] DROP CONSTRAINT [AffectationEquipement_pointServiceDestId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AffectationEquipement] DROP CONSTRAINT [AffectationEquipement_pointServiceOrigineId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Equipement] DROP CONSTRAINT [Equipement_status_df];
ALTER TABLE [dbo].[Equipement] DROP COLUMN [categorie];
ALTER TABLE [dbo].[Equipement] ADD CONSTRAINT [Equipement_status_df] DEFAULT 'FONCTIONNEL' FOR [status];

-- DropTable
DROP TABLE [dbo].[AffectationEquipement];

-- CreateTable
CREATE TABLE [dbo].[MouvementEquipement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [statut] NVARCHAR(1000) NOT NULL,
    [commentaire] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MouvementEquipement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [equipementId] INT NOT NULL,
    [initiateurId] INT NOT NULL,
    [agenceSourceId] INT,
    [agenceDestinationId] INT,
    [pointServiceSourceId] INT,
    [pointServiceDestId] INT,
    [responsableDestinationId] INT,
    [confirmeParId] INT,
    [confirme] BIT NOT NULL CONSTRAINT [MouvementEquipement_confirme_df] DEFAULT 0,
    [dateConfirmation] DATETIME2,
    CONSTRAINT [MouvementEquipement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_equipementId_fkey] FOREIGN KEY ([equipementId]) REFERENCES [dbo].[Equipement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_initiateurId_fkey] FOREIGN KEY ([initiateurId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_agenceSourceId_fkey] FOREIGN KEY ([agenceSourceId]) REFERENCES [dbo].[Agence]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_agenceDestinationId_fkey] FOREIGN KEY ([agenceDestinationId]) REFERENCES [dbo].[Agence]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_pointServiceSourceId_fkey] FOREIGN KEY ([pointServiceSourceId]) REFERENCES [dbo].[PointDeService]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_pointServiceDestId_fkey] FOREIGN KEY ([pointServiceDestId]) REFERENCES [dbo].[PointDeService]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_responsableDestinationId_fkey] FOREIGN KEY ([responsableDestinationId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MouvementEquipement] ADD CONSTRAINT [MouvementEquipement_confirmeParId_fkey] FOREIGN KEY ([confirmeParId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
