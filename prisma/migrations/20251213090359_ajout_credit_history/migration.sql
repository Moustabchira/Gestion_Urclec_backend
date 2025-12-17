BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ActionCredit] ADD [archive] BIT NOT NULL CONSTRAINT [ActionCredit_archive_df] DEFAULT 0,
[archivedAt] DATETIME2;

-- CreateTable
CREATE TABLE [dbo].[CreditHistory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [creditId] INT NOT NULL,
    [field] NVARCHAR(1000) NOT NULL,
    [oldValue] NVARCHAR(1000),
    [newValue] NVARCHAR(1000),
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [CreditHistory_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CreditHistory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[CreditHistory] ADD CONSTRAINT [CreditHistory_creditId_fkey] FOREIGN KEY ([creditId]) REFERENCES [dbo].[Credit]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
