-- AlterTable
ALTER TABLE `product` ADD COLUMN `rating` DECIMAL(3, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `providerservice` ADD COLUMN `productMappingJson` TEXT NULL;
