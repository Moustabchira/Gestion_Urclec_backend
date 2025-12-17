/*
  Warnings:

  - You are about to drop the column `pointServiceId` on the `AffectationEquipement` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[AffectationEquipement] DROP CONSTRAINT [AffectationEquipement_pointServiceId_fkey];

-- AlterTable
ALTER TABLE [dbo].[AffectationEquipement] DROP COLUMN [pointServiceId];
ALTER TABLE [dbo].[AffectationEquipement] ADD [pointServiceDestId] INT,
[pointServiceOrigineId] INT;

-- AlterTable
ALTER TABLE [dbo].[Equipement] DROP CONSTRAINT [Equipement_quantiteDisponible_df],
[Equipement_quantiteTotale_df];
ALTER TABLE [dbo].[Equipement] ALTER COLUMN [quantiteTotale] INT NULL;
ALTER TABLE [dbo].[Equipement] ALTER COLUMN [quantiteDisponible] INT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationEquipement] ADD CONSTRAINT [AffectationEquipement_pointServiceOrigineId_fkey] FOREIGN KEY ([pointServiceOrigineId]) REFERENCES [dbo].[PointDeService]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationEquipement] ADD CONSTRAINT [AffectationEquipement_pointServiceDestId_fkey] FOREIGN KEY ([pointServiceDestId]) REFERENCES [dbo].[PointDeService]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
