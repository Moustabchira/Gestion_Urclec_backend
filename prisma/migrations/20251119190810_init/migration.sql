BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Agence] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom_agence] NVARCHAR(1000) NOT NULL,
    [code_agence] NVARCHAR(1000) NOT NULL,
    [ville] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Agence_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Agence_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Agence_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Agence_code_agence_key] UNIQUE NONCLUSTERED ([code_agence])
);

-- CreateTable
CREATE TABLE [dbo].[Poste] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Poste_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Poste_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Poste_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Poste_nom_key] UNIQUE NONCLUSTERED ([nom])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [prenom] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [code_identifiant] NVARCHAR(1000) NOT NULL,
    [agenceId] INT NOT NULL,
    [posteId] INT NOT NULL,
    [chefId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [User_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [User_code_identifiant_key] UNIQUE NONCLUSTERED ([code_identifiant])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Role_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Role_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_nom_key] UNIQUE NONCLUSTERED ([nom]),
    CONSTRAINT [Role_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[UserRole] (
    [userId] INT NOT NULL,
    [roleId] INT NOT NULL,
    [assignedAt] DATETIME2 NOT NULL CONSTRAINT [UserRole_assignedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [archive] BIT NOT NULL CONSTRAINT [UserRole_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [UserRole_pkey] PRIMARY KEY CLUSTERED ([userId],[roleId])
);

-- CreateTable
CREATE TABLE [dbo].[Permission] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Permission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Permission_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Permission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Permission_nom_key] UNIQUE NONCLUSTERED ([nom]),
    CONSTRAINT [Permission_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[RolePermission] (
    [id] INT NOT NULL IDENTITY(1,1),
    [roleId] INT NOT NULL,
    [permissionId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RolePermission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [archive] BIT NOT NULL CONSTRAINT [RolePermission_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [RolePermission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RolePermission_roleId_permissionId_key] UNIQUE NONCLUSTERED ([roleId],[permissionId])
);

-- CreateTable
CREATE TABLE [dbo].[Demande] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [dateDebut] DATETIME2 NOT NULL,
    [dateFin] DATETIME2 NOT NULL,
    [motif] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Demande_status_df] DEFAULT 'EN_ATTENTE',
    [pdfPath] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Demande_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Demande_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Demande_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Conge] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nbJours] INT NOT NULL,
    [demandeId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Conge_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Conge_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Conge_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Conge_demandeId_key] UNIQUE NONCLUSTERED ([demandeId])
);

-- CreateTable
CREATE TABLE [dbo].[Absence] (
    [id] INT NOT NULL IDENTITY(1,1),
    [justification] NVARCHAR(1000) NOT NULL,
    [demandeId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Absence_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Absence_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Absence_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Absence_demandeId_key] UNIQUE NONCLUSTERED ([demandeId])
);

-- CreateTable
CREATE TABLE [dbo].[DemandePermission] (
    [id] INT NOT NULL IDENTITY(1,1),
    [duree] NVARCHAR(1000) NOT NULL,
    [demandeId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DemandePermission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [DemandePermission_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [DemandePermission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DemandePermission_demandeId_key] UNIQUE NONCLUSTERED ([demandeId])
);

-- CreateTable
CREATE TABLE [dbo].[Decision] (
    [id] INT NOT NULL IDENTITY(1,1),
    [status] NVARCHAR(1000) NOT NULL,
    [niveau] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [demandeId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Decision_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [Decision_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [archive] BIT NOT NULL CONSTRAINT [Decision_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Decision_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Evenement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [titre] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [dateDebut] DATETIME2 NOT NULL,
    [dateFin] DATETIME2 NOT NULL,
    [images] NVARCHAR(max),
    [statut] NVARCHAR(1000) NOT NULL CONSTRAINT [Evenement_statut_df] DEFAULT 'EN_ATTENTE',
    [userId] INT NOT NULL,
    [validatedBy] INT,
    [publishedBy] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Evenement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Evenement_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Evenement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Equipement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [modele] NVARCHAR(1000),
    [categorie] NVARCHAR(1000),
    [quantiteTotale] INT NOT NULL CONSTRAINT [Equipement_quantiteTotale_df] DEFAULT 0,
    [quantiteDisponible] INT NOT NULL CONSTRAINT [Equipement_quantiteDisponible_df] DEFAULT 0,
    [images] NVARCHAR(max),
    [dateAcquisition] DATETIME2 NOT NULL CONSTRAINT [Equipement_dateAcquisition_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Equipement_status_df] DEFAULT 'ACTIF',
    [proprietaireId] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Equipement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Equipement_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Equipement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AffectationEquipement] (
    [id] INT NOT NULL IDENTITY(1,1),
    [equipementId] INT NOT NULL,
    [employeId] INT NOT NULL,
    [quantite] INT NOT NULL CONSTRAINT [AffectationEquipement_quantite_df] DEFAULT 1,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [AffectationEquipement_status_df] DEFAULT 'BON',
    [dateAffectation] DATETIME2 NOT NULL CONSTRAINT [AffectationEquipement_dateAffectation_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [AffectationEquipement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Action] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Action_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Action_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Action_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Beneficiaire] (
    [id] INT NOT NULL IDENTITY(1,1),
    [localisation] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Beneficiaire_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [archive] BIT NOT NULL CONSTRAINT [Beneficiaire_archive_df] DEFAULT 0,
    [archivedAt] DATETIME2,
    CONSTRAINT [Beneficiaire_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_agenceId_fkey] FOREIGN KEY ([agenceId]) REFERENCES [dbo].[Agence]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_posteId_fkey] FOREIGN KEY ([posteId]) REFERENCES [dbo].[Poste]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_chefId_fkey] FOREIGN KEY ([chefId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RolePermission] ADD CONSTRAINT [RolePermission_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RolePermission] ADD CONSTRAINT [RolePermission_permissionId_fkey] FOREIGN KEY ([permissionId]) REFERENCES [dbo].[Permission]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Demande] ADD CONSTRAINT [Demande_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Conge] ADD CONSTRAINT [Conge_demandeId_fkey] FOREIGN KEY ([demandeId]) REFERENCES [dbo].[Demande]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Absence] ADD CONSTRAINT [Absence_demandeId_fkey] FOREIGN KEY ([demandeId]) REFERENCES [dbo].[Demande]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DemandePermission] ADD CONSTRAINT [DemandePermission_demandeId_fkey] FOREIGN KEY ([demandeId]) REFERENCES [dbo].[Demande]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Decision] ADD CONSTRAINT [Decision_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Decision] ADD CONSTRAINT [Decision_demandeId_fkey] FOREIGN KEY ([demandeId]) REFERENCES [dbo].[Demande]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Evenement] ADD CONSTRAINT [Evenement_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Evenement] ADD CONSTRAINT [Evenement_validatedBy_fkey] FOREIGN KEY ([validatedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Evenement] ADD CONSTRAINT [Evenement_publishedBy_fkey] FOREIGN KEY ([publishedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Equipement] ADD CONSTRAINT [Equipement_proprietaireId_fkey] FOREIGN KEY ([proprietaireId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationEquipement] ADD CONSTRAINT [AffectationEquipement_equipementId_fkey] FOREIGN KEY ([equipementId]) REFERENCES [dbo].[Equipement]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AffectationEquipement] ADD CONSTRAINT [AffectationEquipement_employeId_fkey] FOREIGN KEY ([employeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Action] ADD CONSTRAINT [Action_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
