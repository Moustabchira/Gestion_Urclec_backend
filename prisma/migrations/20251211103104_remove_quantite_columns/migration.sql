/*
  Warnings:

  - You are about to drop the column `quantiteDisponible` on the `Equipement` table. All the data in the column will be lost.
  - You are about to drop the column `quantiteTotale` on the `Equipement` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Equipement] DROP COLUMN [quantiteDisponible],
[quantiteTotale];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
