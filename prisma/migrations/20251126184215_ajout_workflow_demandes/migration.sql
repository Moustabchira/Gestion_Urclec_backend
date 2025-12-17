BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Demande] ADD [currentApproverId] INT;

-- AddForeignKey
ALTER TABLE [dbo].[Demande] ADD CONSTRAINT [Demande_currentApproverId_fkey] FOREIGN KEY ([currentApproverId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
