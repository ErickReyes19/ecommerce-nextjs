-- AlterTable
ALTER TABLE `Product`
  ADD COLUMN `rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `ProviderService`
  ADD COLUMN `productMappingJson` TEXT NULL;
