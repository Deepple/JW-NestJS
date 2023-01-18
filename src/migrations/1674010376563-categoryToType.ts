import { MigrationInterface, QueryRunner } from "typeorm"

export class migrations1674010376563 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `mentions` RENAME COLUMN `category` TO `type`',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `mentions` RENAME COLUMN `type` TO `category`',
        );
    }
}
