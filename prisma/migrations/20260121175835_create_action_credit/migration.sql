/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Credit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `Credit` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[ActionCredit] DROP CONSTRAINT [ActionCredit_creditId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Credit] DROP CONSTRAINT [Credit_beneficiaireId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Notification] DROP CONSTRAINT [Notification_userId_fkey];

-- AlterTable
ALTER TABLE [dbo].[ActionCredit] ALTER COLUMN [agentId] INT NULL;

-- AlterTable
ALTER TABLE [dbo].[Credit] ADD [agentId] INT,
[reference] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Notification] ADD [actionCreditId] INT;

-- CreateIndex
ALTER TABLE [dbo].[Credit] ADD CONSTRAINT [Credit_reference_key] UNIQUE NONCLUSTERED ([reference]);

-- AddForeignKey
ALTER TABLE [dbo].[Credit] ADD CONSTRAINT [Credit_beneficiaireId_fkey] FOREIGN KEY ([beneficiaireId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Credit] ADD CONSTRAINT [Credit_agentId_fkey] FOREIGN KEY ([agentId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ActionCredit] ADD CONSTRAINT [ActionCredit_creditId_fkey] FOREIGN KEY ([creditId]) REFERENCES [dbo].[Credit]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_actionCreditId_fkey] FOREIGN KEY ([actionCreditId]) REFERENCES [dbo].[ActionCredit]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
