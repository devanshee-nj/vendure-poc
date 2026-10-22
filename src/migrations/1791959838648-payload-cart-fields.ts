import {MigrationInterface, QueryRunner} from "typeorm";

export class PayloadCartFields1791959838648 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "collection" DROP COLUMN "customFieldsCategoryid"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsCustomisable"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsRating"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsRatingcount"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsDesignnumber"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsOrnamentid"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsBaseproductcode"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsOrnamenttype"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsImages"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsPricefrom"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsAvailablevalues"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsDefaultselection"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsPdpoptions"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsPdpgallery"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsBomdetails"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsProductcode" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsProductname" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsImageurl" text`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsSelectedoptions" text`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsConfigprice" integer`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsConfigprice"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsSelectedoptions"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsImageurl"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsProductname"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsProductcode"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsBomdetails" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsPdpgallery" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsPdpoptions" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsDefaultselection" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsAvailablevalues" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsPricefrom" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsImages" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsOrnamenttype" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsBaseproductcode" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsOrnamentid" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsDesignnumber" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsRatingcount" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsRating" double precision`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsCustomisable" boolean DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "collection" ADD "customFieldsCategoryid" character varying(255)`, undefined);
   }

}
