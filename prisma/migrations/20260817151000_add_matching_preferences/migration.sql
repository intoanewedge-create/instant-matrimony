-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "star" TEXT,
ADD COLUMN     "rasi" TEXT;

-- AlterTable
ALTER TABLE "PartnerPreference" ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "rasi" TEXT,
ADD COLUMN     "star" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE INDEX "Profile_star_idx" ON "Profile"("star");

-- CreateIndex
CREATE INDEX "Profile_rasi_idx" ON "Profile"("rasi");

-- CreateIndex
CREATE INDEX "PartnerPreference_occupation_idx" ON "PartnerPreference"("occupation");

-- CreateIndex
CREATE INDEX "PartnerPreference_state_idx" ON "PartnerPreference"("state");

-- CreateIndex
CREATE INDEX "PartnerPreference_city_idx" ON "PartnerPreference"("city");
