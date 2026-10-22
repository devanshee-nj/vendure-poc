import {MigrationInterface, QueryRunner} from "typeorm";

export class CatalogDesignFields1791788910560 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsCarat"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsSize"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsMetal"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsStone"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection" ADD "customFieldsCategoryid" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsDesignref" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsDesignnumber" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsOrnamentid" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsBaseproductcode" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsOrnamenttype" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsCustomisable" boolean DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsRating" double precision`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsRatingcount" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsImages" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsPricefrom" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsAvailablevalues" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsDefaultselection" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsPdpoptions" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsPdpgallery" text`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsBomdetails" text`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsConfigsku" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsConfigsku"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsBomdetails"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsPdpgallery"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsPdpoptions"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsDefaultselection"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsAvailablevalues"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsPricefrom"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsImages"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsRatingcount"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsRating"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsCustomisable"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsOrnamenttype"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsBaseproductcode"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsOrnamentid"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsDesignnumber"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsDesignref"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection" DROP COLUMN "customFieldsCategoryid"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsStone" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsMetal" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsSize" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsCarat" double precision`, undefined);
   }

}
