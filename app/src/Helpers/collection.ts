import { Collection, Db } from 'mongodb/mongodb';

//---------------------------------------------//
//              Internal Types                 //
//---------------------------------------------//

/** @internal */
export type ConnectionHandlerResult<DB extends boolean> =
    DB extends true ? { database: Db, memberId?: string } :
    { collection: Collection, memberId?: string, database?: Db }