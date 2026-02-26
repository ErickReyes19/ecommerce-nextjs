-- AlterTable
ALTER TABLE `Product`
    ADD COLUMN `providerId` VARCHAR(191) NULL,
    ADD COLUMN `providerServiceId` VARCHAR(191) NULL,
    ADD COLUMN `externalProductId` VARCHAR(191) NULL,
    ADD COLUMN `syncMetadata` TEXT NULL;

-- CreateTable
CREATE TABLE `Provider` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('API', 'MANUAL') NOT NULL DEFAULT 'API',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Provider_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderService` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `baseUrl` VARCHAR(191) NOT NULL,
    `productEndpoint` VARCHAR(191) NOT NULL,
    `orderEndpoint` VARCHAR(191) NOT NULL,
    `authType` VARCHAR(191) NOT NULL DEFAULT 'NONE',
    `token` VARCHAR(191) NULL,
    `apiKey` VARCHAR(191) NULL,
    `secretKey` VARCHAR(191) NULL,
    `headersJson` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProviderService_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderOrderDispatch` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `providerServiceId` VARCHAR(191) NOT NULL,
    `requestPayload` TEXT NOT NULL,
    `responsePayload` TEXT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProviderOrderDispatch_orderId_idx`(`orderId`),
    INDEX `ProviderOrderDispatch_providerServiceId_idx`(`providerServiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_providerServiceId_fkey` FOREIGN KEY (`providerServiceId`) REFERENCES `ProviderService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderService` ADD CONSTRAINT `ProviderService_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderOrderDispatch` ADD CONSTRAINT `ProviderOrderDispatch_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderOrderDispatch` ADD CONSTRAINT `ProviderOrderDispatch_providerServiceId_fkey` FOREIGN KEY (`providerServiceId`) REFERENCES `ProviderService`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
