# weiv-data Node.js APIs

[![Build for Velo by Wix](https://img.shields.io/badge/Built%20for-Velo%20by%20Wix-3638f4)](https://wix.com/velo)

The official [weiv-data APIs](https://www.npmjs.com/package/@exweiv/weiv-data) for Node.js to build web applications using MongoDB inside Wix with Velo. Only limited by MongoDB and your pocket. Not limited by wix-data APIs since you won't use them.

### When and Why to Use?

If you are building a large application using Wix you may want to use something better than wix-data since it's limited differently than Wix's backend limits. And maybe you are looking for better performance. Than you are in the right place.

> This library is not for small projects it's built for large features/projects/apps and you will need advanced JS and general MongoDB knowledge to work with this package.

### Documentation

You can find more info at our **[Official Docs](https://weiv-data.web.app/)**.

## Functions

You can also compare which is available in weivData and wix-data. (We will publish a real docs asap for each function and feature)

- Data Hooks (available)
- Aggregate (available)
- Query (available)
- bulkInsert (available)
- bulkRemove (available)
- bulkSave (available)
- bulkUpdate (available)
- filter (not available)
- get (available)
- insert (available)
- insertReference (available)
- isReferenced (available)
- queryReferenced (available)
- remove (available)
- removeReference (available)
- replaceReferences (available)
- save (available)
- truncate (available)
- update (available)

### About wix-data.v2 Features in weivData

- Indexes (not available yet but will be available soon) ⏰
- Collections (not available yet but will be available soon) ⏰
- Events (not available yet but will be available soon) ⏰

### Features We're Working On

- wix-data.v2 features in weivData (Create, Drop and List Indexes, Create and Manage Collections etc.) ⏰
- Multilanguage Support (read and write data in multilanguage) ⏰

---

### Performance

We can't test it with high traffic right now but what we can say is it's MongoDB and basically you are using MongoDB which is wix-data is also using but generally weivData is a bit faster (**2x faster in general** sometimes more somtimes less depends on the function and call) and you can upgrade your MongoDB Cluster to upgrade the performance (MongoDB has a free version too and we have tested everything on that free version which is shared clusters).

Soon we will add more details and some examples about performance difference. To let you also know **get, isReferenced and query** functions are comes with caching feature (will be improved later on).

**Basic Test Results:**
We have done few tests using the Wix's backend testing tool. We have run get, insert and update function in each 150ms for 100 times and here is the result for weivData and wix-data:

- **327ms avg for weivData**
- **946ms avg for wix-data**

wix-data is much better for cold starts and more consistent (wix-data always completed in 900-1050ms) over weivData. But it satyed slower than weivData after cold start of weivData. You may see up to 3000+ms in weivData for cold starts but this would never happen in wix-data, as you use weivData (after cold start) it will respond much faster. (weivData completed it's first few calls (1-10 calls in general depends on how fast you are making the calls) arround 2000ms then it was more consistent and stayed arround 300ms) You can test it and see yourself.

> Tests are made in backend testing tool in a free Wix Studio website. And weivData library was also using free shared clusters of MongoDB.

## Tested Functions in Wix Env

_If main function tested only there is a possibility of BUG/s but if most of the features tested (Should be Fully Working) then it should be working fine but still there might be BUG/s._

- weivData.aggreagete ✅ (Main Function Tested)
- weivData.query ✅ (Main Function Tested)
- weivData.bulkInsert ✅ (Should be Fully Working)
- weivData.bulkRemove ✅ (Should be Fully Working)
- weivData.bulkSave ✅ (Should be Fully Working)
- weivData.bulkUpdate ✅ (Should be Fully Working)
- weivData.filter ✅ (Should be Fully Working)
- weivData.get ✅ (Should be Fully Working)
- weivData.insert ✅ (Should be Fully Working)
- weivData.insertReference ✅ (Should be Fully Working)
- weivData.isReferenced ✅ (Should be Fully Working)
- weivData.queryReferenced ✅ (Main Function Tested)
- weivData.remove ✅ (Should be Fully Working)
- weivData.removeReference ✅ (Should be Fully Working)
- weivData.replaceReferences ✅ (Should be Fully Working)
- weivData.save ✅ (Should be Fully Working)
- weivData.truncate ✅ (Should be Fully Working)
- weivData.update ✅ (Should be Fully Working)

**Hooks:**

- afterCount ✅
- afterGet ✅
- afterInsert ✅
- afterQuery ✅
- afterRemove ✅
- afterUpdate ✅
- beforeCount ✅
- beforeGet ✅
- beforeInsert ✅
- beforeQuery ✅
- beforeRemove ✅
- beforeUpdate ✅
- onFailure ❌

> After we test if the functions even run at all we will check if they running correctly with expected results. Right now we are only fixing general BUGs that's blocking function to run. After we complete the first test stage we will start testing if the functions returns expected results. All tests are made in Wix env.

## How to Use Hooks?

Using hooks in weiv-data and wix-data has similar way. We are currently not providing a hook for errors. But rest of the hooks are available like in wix-data. To create a hook you need to create a folder in your backend named `WeivData` and then you also need to create a .js file (.js file now .jsw or .web.js) inside of that folder.

-> backend/WeivData/data.js

Then you will create your hooks as functions like in wix-data. Here is an example for afterGet hook:

```js
// In backend/WeivData/data.js file

export async function dbname_collectionname_afterGet(item, context) {
  if (item.number > 5) {
    return true;
  } else {
    return false;
  }
}
```

You need to name your functions correctly to let hooks work. The syntax is like that:
`<database-name>_<collection-name>_<hook-name>`

> Both database name and collection name should be all lowercase.

---

Please report BUGs and leave your feedbacks. info@apps.exweiv.com or you can create an issue in [GitHub repo](https://github.com/ExWeiv/weiv-data/issues) or you can join [Discord](https://discord.gg/pVYJjPKRm6)!
