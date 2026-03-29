import { MikroORM } from '@mikro-orm/mysql';
import config from '../../mikro-orm.config';

let orm: MikroORM | null = null;

export async function getOrm(): Promise<MikroORM> {
  if (!orm) {
    orm = await MikroORM.init(config);
  }
  return orm;
}
