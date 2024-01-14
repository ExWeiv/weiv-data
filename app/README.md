# weivData Node.js APIs

[![Build for Velo by Wix](https://img.shields.io/badge/Built%20for-Velo%20by%20Wix-3638f4)](https://wix.com/velo)

The official [weivData APIs](https://www.npmjs.com/package/@exweiv/weiv-data) for Node.js to build web applications using MongoDB inside Wix with Velo. Only limited by MongoDB and your pocket. Not limited by wixData APIs since you won't use them.

### When and Why to Use?

If you are building a large application using Wix you may want to use something better than wixData since it's limited differently than Wix's backend limits. And maybe you are looking for better performance. Than you are in the right place.

> This library is not for small projects it's built for large features/projects/apps and you will need advanced JS and general MongoDB knowledge to work with this package.

### Things to Know

- weivData is not using string based item IDs it's using ObjectId based item IDs. (Important when you switch to this library)
- You won't have the visual dashboard in Wix's dashboard. (There is a way to have this btw, we'll show later on)
- APIs are very similar in most cases same with wixData and most features are same or similar.
- You will need to setup your MongoDB env to get started with this API library.
- You can use "mongodb" or "mongoose" NPM package when you can't find the needed feature in this library.
- This package is built to let you switch from wixData easier and in some cases you may want to switch to "mongodb" NPM package slowly. (You'll need advanced knowledge of that library)
- You won't be able to use some specific types that you had in wixData such as Rich Content, but you can always build these by yourself too. (We are working on this too)

> You can always leave your feedbacks/bug reports in our [GitHub repo](https://github.com/ExWeiv/weiv-data/issues) by creating issues.

Soon we will create a YouTube video to show how you can setup your MongoDB env and start using this library and things to consider/know when using this library or switching from wixData.

---

### Setup MongoDB and Wix

First of all go ahead and create a MongoDB account and a database in your account. You can find many tutorials on YouTube about this. Then come back here, if you already own a MongoDB acount then create a new cluster and do the following steps:

1. Go to Database Access and create 3 different user each user will have different roles/permissions.
   1. Create one for Admin and give it needed permissions for Admin (you can use built-in roles too or create custom roles)
   2. Create one for Member and give it needed permissions that you want to give to site members.
   3. Create one for Visitor and give it needed permissions that you want to give to site visitors.
2. Every time you create a new user you will also create a password save these passwords because we will need them in the nex step.
3. After creating 3 different roles you will need the "connection URI" this will be used to connect your MongoDB clusters.
4. Go to "Database" section in MongoDB dashboard and click "Connect" button select "drivers" you will see an example connection string/uri. Copy this and change the username and password for each user we've created before (Admin, Member, Visitor).
5. After you prepared your connection strings/uris go to your Wix dashboard and open "Secrets Manager"
6. In secret manager create three different secret:
   1. Create a secret named as AdminURI (this is case sensitive) and paste the URI for admin.
   2. Do the same for MemberURI and VisitorURI.
7. Then create another secret for connection options named "WeivDataConnectionOptions" if you don't want to set custom options paste empty object as value. If you want to add custom options when connecting to MongoDB Clusters add your custom object into value. [Connection Options](https://www.mongodb.com/docs/manual/administration/connection-pool-overview/) (Do not paste object as strings Wix will stringify it otherwise you will see errors when connecting).
8. Lastly go to your Wix collections (CMS) and create a collection named as "WeivOwnerID" you don't need to add any data. Just create the collection with the same exact name and leave it as it is. This collection help library to get visitors ID. Since Wix doesn't provide a way to get visitors temporary ID we use a collection to create a data and get the \_owner field value from that data. (Find a ready to paste code to clear that collection per hour or do it manually - check below)
9. And you should be ready to go.

```js
//Paste this code into any .js or .web.js file (.jsw)


import wixData from 'wix-data';

export async function clearWeivDataTempFiles() {
    try {
        await wixData.truncate("WeivOwnerID", { consistentRead: true, suppressAuth: true, suppressHooks: true });
        return null;
    } catch(err) {
        console.error(err);
    }
}

//Use this function with your scheduled jobs to clear collection per hour.
```

**Note:**
Use indexes to faster your queries. We are also working on other APIs that will allow you to create collections with custom options. Also we don't use mongoose in our library for better performance.

## APIs and Examples

Currently we don't have a documentation we are working on one to create so you can see all functions but we have TS included in our library so you should be able to use autocomplete and even see some examples for some of the functions. But here are some examples and the logic of this library.

First of all this library is designed to make switch from wixData easy so most of the functions are same with wixData which means you can use wixData API docs to understand the syntax or APIs. But everything is not same even if they are similar.

Since we add some extra features or we use different style for our library it's different than wixData in some cases.

```js
import weivData from "@exweiv/weiv-data";

export async function testFunction() {
  try {
    const item = await weivData.get("<databaseName>/<collectionName>", itemId, options);
    /* You can access to collections in different databases same as how you access Wix App collections using wixData. */

    const updated = await weivData.update("<databaseName>/<collectionName>", item, options);
    /* Same syntax with wixData when you use update function. */

    return { item, updated };
  } catch (err) {
    console.error(err);
  }
}
```

You can play with library to see how it works. As we said you should see autocompletes and type checking enabled in most cases (%99). And here is all functions listed:

## Functions

You can also compare which is available in weivData and wixData. (We will publish a real docs asap for each function and feature)

- Data Hooks _(not available yet but will be available soon)_
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
- queryReferenced _(not available)_
- remove (available)
- removeReference (available)
- replaceReferences (available)
- save (available)
- truncate (available)
- update (available)

### About wixData.v2 features in weivData

- Indexes (not available yet but will be available soon)
- Collections (not available yet but will be available soon)
- Events (not available yet but will be available soon)

### Features We're Work On

- wixData.v2 features in weivData (Create, Drop and List Indexes, Create and Manage Collections etc.)
- queryReferenced function.
- Data Hooks (afterInsert, beforeInsert, afterUpdate etc.)
- Multilanguage Support (read and write data in multilanguage)

---

### Performance Test Examples

We have tested same **weivData** and **wixData** functions in same site with duplicated (both database has same items) databases and here are the results from some functions. Both functions also tested in a free Wix Studio website.

- **get Function Tests:**
  - weivData for first run (cold start): 700ms
  - wixData for first run (cold start): 120ms
  - weivData after cold start: 17ms
  - wixData after cold start: 112ms
- **update Function Tests:**
  - weivData for first run (cold start): 900ms
  - wixData for first run (cold start): 800ms
  - weivData after cold start: 30ms
  - wixData after cold start: 720ms
---

Please report BUGs and leave your feedbacks. info@apps.exweiv.com or you can create an issue in [GitHub repo](https://github.com/ExWeiv/weiv-data/issues)
