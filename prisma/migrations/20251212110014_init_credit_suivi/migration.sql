/*
  Warnings:

  - You are about to drop the `Action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Beneficiaire` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Action] DROP CONSTRAINT [Action_userId_fkey];

-- DropTable
DROP TABLE [dbo].[Action];

-- DropTable
DROP TABLE [dbo].[Beneficiaire];

-- CreateTable
CREATE TABLE [dbo].[Credit] (
    [id] INT NOT NULL IDENTITY(1,1),
    [montant] FLOAT(53) NOT NULL,
    [montantRembourse] FLOAT(53) NOT NULL CONSTRAINT [Credit_montantRembourse_df] DEFAULT 0,
    [tauxInteret] FLOAT(53) NOT NULL,
    [dateDebut] DATETIME2 NOT NULL,
    [dateFin] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Credit_status_df] DEFAULT 'EN_COURS',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Credit_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Credit_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    [beneficiaireId] INT NOT NULL,
    CONSTRAINT [Credit_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ActionCredit] (
    [id] INT NOT NULL IDENTITY(1,1),
    [creditId] INT NOT NULL,
    [agentId] INT NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [commentaire] NVARCHAR(1000),
    [latitude] FLOAT(53),
    [longitude] FLOAT(53),
    [date] DATETIME2 NOT NULL CONSTRAINT [ActionCredit_date_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ActionCredit_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Credit] ADD CONSTRAINT [Credit_beneficiaireId_fkey] FOREIGN KEY ([beneficiaireId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ActionCredit] ADD CONSTRAINT [ActionCredit_creditId_fkey] FOREIGN KEY ([creditId]) REFERENCES [dbo].[Credit]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ActionCredit] ADD CONSTRAINT [ActionCredit_agentId_fkey] FOREIGN KEY ([agentId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
