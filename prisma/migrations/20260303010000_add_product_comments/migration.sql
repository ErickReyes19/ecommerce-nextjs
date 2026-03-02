-- CreateEnum
CREATE TYPE `CommentStatus` AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE `ProductComment` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `status` `CommentStatus` NOT NULL DEFAULT 'PENDING',
    `reviewedById` VARCHAR(36) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ProductComment_productId_status_idx` ON `ProductComment`(`productId`, `status`);

-- CreateIndex
CREATE INDEX `ProductComment_userId_status_idx` ON `ProductComment`(`userId`, `status`);

-- AddForeignKey
ALTER TABLE `ProductComment` ADD CONSTRAINT `ProductComment_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductComment` ADD CONSTRAINT `ProductComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductComment` ADD CONSTRAINT `ProductComment_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
