import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOrderlineConfigFields1791463792807 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsMetal" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsStone" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsCarat" double precision`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" ADD "customFieldsSize" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsSize"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsCarat"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsStone"`, undefined);
        await queryRunner.query(`ALTER TABLE "order_line" DROP COLUMN "customFieldsMetal"`, undefined);
   }

}
