import {MigrationInterface, QueryRunner} from "typeorm";

/** Design variants created before the SKU got a random id: CLRN349 -> CLRN349_X7K2Q9MB. */
export class DesignVariantSkuSuffix1793344615889 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`UPDATE "product_variant" pv SET "sku" = pv."sku" || '_' || upper(substr(md5(random()::text || pv."id"::text), 1, 8)) FROM "product" p WHERE pv."productId" = p."id" AND p."customFieldsDesignref" IS NOT NULL AND pv."sku" = p."customFieldsDesignref"`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`UPDATE "product_variant" pv SET "sku" = p."customFieldsDesignref" FROM "product" p WHERE pv."productId" = p."id" AND p."customFieldsDesignref" IS NOT NULL AND pv."sku" LIKE p."customFieldsDesignref" || '\_%'`, undefined);
   }

}
