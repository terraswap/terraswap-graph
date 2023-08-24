import { isClassic } from 'lib/terra';
import { ClassicFcd } from 'lib/terra/fcd/classic';
import { MainnetFcd } from 'lib/terra/fcd/mainnet';
import { ClassicLcd } from 'lib/terra/lcd/classic';
import { MainnetLcd } from 'lib/terra/lcd/mainnet';
import { MigrationInterface, QueryRunner } from "typeorm";

export class sender1690445944851 implements MigrationInterface {
    name = 'sender1690445944851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // avoid whole transaction rollback
        if (queryRunner.isTransactionActive) {
            await queryRunner.commitTransaction();
        }

        const chainId = process.env.TERRA_CHAIN_ID;
        if (!chainId) {
            console.error("TERRA_CHAIN_ID is not set")
        }

        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`
            DO $$ 
            BEGIN
              IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'tx_history'
                AND column_name = 'sender'
              ) THEN
                EXECUTE 'ALTER TABLE tx_history ADD COLUMN sender varchar';
              END IF;
            END $$;`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tx_history_sender" ON "tx_history" ("sender") `);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err
        }
        let lastId = 0;
        const limit = 1000;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await queryRunner.startTransaction();
            try {
                const txs: { id: number; tx_hash: string; pair: string }[] = await queryRunner.query(`
                SELECT 
                    TH.id, TH.tx_hash, TH.pair
                FROM tx_history AS TH
                WHERE 
                    TH.sender is NULL 
                    AND TH.id > ${lastId}
                ORDER BY TH.id ASC 
                LIMIT ${limit}
            `);
                if (txs?.length === 0) {
                    break
                }
                lastId = txs[txs.length - 1].id;
                const target = isClassic ? terraApi.classic : terraApi.mainnet;
                const clients = isClassic ? [
                    new ClassicFcd(target.limited.fcd), new ClassicLcd(target.limited.lcd), new ClassicLcd(target.nonLimited.lcd)
                ] : [
                    new MainnetFcd(target.limited.fcd), new MainnetLcd(target.limited.lcd), new MainnetLcd(target.nonLimited.lcd)
                ];
                const resPromises = txs.map(async (tx, txIdx) => {
                    if (txIdx % 10 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 10 * 1000))
                    }
                    for (let idx = 0; idx < clients.length; idx++) {
                        const api = clients[idx]
                        try {
                            const res = await api.getContractMsgSender(tx.tx_hash, tx.pair)
                            if (!res) {
                                continue
                            }
                            return {
                                id: tx.id,
                                sender: res
                            }
                        } catch (err) {
                            console.log(err)
                        }
                    }
                })
                const senderInfo = await Promise.all(resPromises)
                const updatePromises = senderInfo.map(async (info) => {
                    if (info?.sender) {
                        await queryRunner.query(`
                        UPDATE tx_history
                        SET sender = '${info.sender}'
                        WHERE id = ${info.id}
                    `)
                    }
                });
                await Promise.all(updatePromises)
                await queryRunner.commitTransaction();
                console.log(`last commit id: ${lastId}`)
            } catch (err) {
                queryRunner.rollbackTransaction();
                throw err
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_tx_history_sender"`);
        await queryRunner.query(`ALTER TABLE "tx_history" DROP COLUMN "sender"`);
    }

}

const terraApi = {
    classic: {
        limited: {
            fcd: 'https://terra-classic-fcd.publicnode.com',
            lcd: 'https://terra-classic-lcd.publicnode.com'
        },
        nonLimited: {
            lcd: `${process.env.TERRA_LCD || 'http://localhost:1317'}`,
        }
    },
    mainnet: {
        limited: {
            fcd: 'https://phoenix-fcd.terra.dev',
            lcd: 'https://phoenix-lcd.terra.dev',
        },
        nonLimited: {
            lcd: `${process.env.TERRA_LCD || 'http://localhost:1317'}`,
        },
    }
}