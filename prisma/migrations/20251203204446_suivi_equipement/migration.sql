/*
  Warnings:

  - You are about to drop the column `proprietaireId` on the `Equipement` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Equipement] DROP CONSTRAINT [Equipement_proprietaireId_fkey];

-- AlterTable
ALTER TABLE [dbo].[AffectationEquipement] ADD [archive] BIT NOT NULL CONSTRAINT [AffectationEquipement_archive_df] DEFAULT 0,
[archivedAt] DATETIME2,
[dateFin] DATETIME2,
[pointServiceId] INT;

-- AlterTable
ALTER TABLE [dbo].[Equipement] DROP COLUMN [proprietaireId];

-- CreateTable
CREATE TABLE [dbo].[PointDeService] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [agenceId] INT NOT NULL,
    CONSTRAINT [PointDeService_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PointDeService] ADD CONSTRAINT [PointDeService_agenceId_fkey] FOREIGN KEY ([agenceId]) REFERENCES [dbo].[Agence]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationEquipement] ADD CONSTRAINT [AffectationEquipement_pointServiceId_fkey] FOREIGN KEY ([pointServiceId]) REFERENCES [dbo].[PointDeService]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
