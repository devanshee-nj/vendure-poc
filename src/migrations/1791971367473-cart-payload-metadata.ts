import {MigrationInterface, QueryRunner} from "typeorm";

export class CartPayloadMetadata1791971367473 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsProductcode"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsSlug" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsLanguage" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsProductdetails" text`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsPricing" text`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsMetadata" text`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsMetadata"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsPricing"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsProductdetails"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsLanguage"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsSlug"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsProductcode" character varying(255)`, undefined);
   }

}
