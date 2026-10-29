import {MigrationInterface, QueryRunner} from "typeorm";

export class StorefrontCoupons1793269454761 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsPromotioncode" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsUnitdiscount" integer`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsUnitdiscount"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsPromotioncode"`, undefined);
   }

}
