import { splitCollectionId } from './Helpers/name_helpers';
import { merge } from 'lodash';

// console.log(splitCollectionId("CollectionY"))
// console.log(splitCollectionId("databaseX/collectionY"))
// console.log(splitCollectionId("databasex/collectiony"))

const item = {
    _owner: "31",
    name: "1231",
    number: 312312
}

const defaultValues = {
    _owner: "",
    _updatedDate: new Date()
}

console.log(merge(item, defaultValues))