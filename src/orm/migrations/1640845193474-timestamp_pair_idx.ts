import { MigrationInterface, QueryRunner } from 'typeorm'

export class timestampPairIdx1640845193474 implements MigrationInterface {
  name = 'timestampPairIdx1640845193474'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "timestamp_pair_idx_day" ON "pair_day_data" ("timestamp", "pair") `
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "timestamp_pair_idx_hour" ON "pair_hour_data" ("timestamp", "pair") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
      return
  }
}
