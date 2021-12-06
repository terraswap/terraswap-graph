import { MigrationInterface, QueryRunner } from 'typeorm'

export class pairWeekData1635388570830 implements MigrationInterface {
  name = 'pairWeekData1635388570830'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pair_week_data" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL, "pair" character varying NOT NULL, "token_0" character varying NOT NULL, "token_0_volume" numeric(40) NOT NULL, "token_0_reserve" numeric(40) NOT NULL, "token_1" character varying NOT NULL, "token_1_volume" numeric(40) NOT NULL, "token_1_reserve" numeric(40) NOT NULL, "total_lp_token_share" numeric(40) NOT NULL, "volume_ust" numeric(40) NOT NULL, "liquidity_ust" numeric(40) NOT NULL, "txns" integer NOT NULL, CONSTRAINT "PK_be324b6c0f248796d7405d71aab" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_eb73b4548db97a74b62b912840" ON "pair_week_data" ("timestamp") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ffa6b5d1e8fb5666338ca99b65" ON "pair_week_data" ("pair") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ffa6b5d1e8fb5666338ca99b65"`)
    await queryRunner.query(`DROP INDEX "IDX_eb73b4548db97a74b62b912840"`)
    await queryRunner.query(`DROP TABLE "pair_week_data"`)
  }
}
