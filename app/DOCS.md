Contents:

- Difference Between WixData and WeivData (Which One to Choose?)
- General Overview of WeivData and FAQs
- How to Setup for WeivData
- Security in WeivData and MongoDB
- About Data Hooks in WeivData
- Cold Start of WeivData
- Help

---

## WixData and WeivData Differences, Which One to Choose?

WixData is the integrated database system of Wix websites (aka CMS in Wix) which you can create collections with a predefined schema and use a NoSQL database in your Wix website, just like WeivData WixData is also using MongoDB but there are differences between each system.

-> WixData is not only an API library for developers it provides some extra features outside of coding. <br>
-> WixData is also designed for basic users who doesn't know much about database systems. <br>
-> WixData is fully integrated with Wix business solutions and has some advantages.

-> WeivData is an API library built top of MongoDB NodeJS driver. <br>
-> WeivData is not designed for basic users, it's designed for developers. <br>
-> WeivData is not fully integrated with Wix business solutions.

Of course there are more difference between each system and let's take a look at some important differences between each system;

### WeivData (MongoDB)

WeivData is not a standalone product like WixData instead it's an API library that's designed to work just like WixData but faster with more features (more APIs, more customization etc.). The main goal of WeivData is to provide similar system to WixData in terms of coding experience and make it easy for Velo developers to take advantage of external database system without WixData limits and long learning processes.

There isn't any limit that belongs to WeivData but there are limits which will be defined by you when you choose your cluster in MongoDB. WeivData uses MongoDB Atlas in the background so you will need an account in MongoDB and create an [Atlas](https://www.mongodb.com/atlas) cluster which is a product of MongoDB.

### WixData (MongoDB)

WixData is also using MongoDB in the background but everything is managed by Wix and not by MongoDB itself like in Atlas. And there are some limits based on your Wix premium plan, database size, write and read request limits or index counts etc. You can learn more about [WixData limits](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/limits-and-optimization/data-features) at Wix's website.

**Let's compare some important limits in both;**

> M0 Cluster is the free cluster of MongoDB Atlas which is not for production or large traffic websites.

| Feature                             | WeivData (M0 Cluster)       | WixData (Basic Plan)         |
| ----------------------------------- | --------------------------- | ---------------------------- |
| Database Type                       | NoSQL - MongoDB             | NoSQL - MongoDB              |
| Frontend Support                    | Only Backend                | Frontend Supported           |
| Performance/Speed                   | 8.5/10                      | 6.5/10                       |
| Cold Start Time                     | Extra 1000-1500ms           | No Cold Start                |
| Scalability (General)               | Very High                   | Moderate                     |
| Read Limits                         | 100/sec                     | 1500/min                     |
| Write Limits                        | 100/sec                     | 100/min                      |
| Request Timeout                     | 30sec/request               | 5sec/request                 |
| Index Limits                        | 3 Index                     | 1 Index                      |
| Collection Limit                    | 500 Collections             | 15 Collections               |
| Database Limit                      | 100 Databases               | 1 Database (Auto Integrated) |
| Storage Limit                       | 512MB                       | 1500 Items/Documents         |
| Item Size Limit                     | 16MB                        | 512KB                        |
| Automatic Backup                    | No Automatic Backup         | 1 Per Month                  |
| Manual Backup                       | Yes                         | Yes                          |
| Visual Dashboard                    | Yes (Not Integrated to Wix) | Yes                          |
| Dynamic Pages in Wix                | No (Has Workaround)         | Yes                          |
| Datasets (Connecting Data Visually) | Not Available               | Available                    |
| Pricing                             | Free                        | Monthly (12€/m)              |
| Multicloud                          | No                          | Yes                          |
| Multi Region                        | No                          | Yes                          |
| RAM                                 | Shared RAM                  | 400MB                        |
| CPU                                 | Shared vCPU                 | 1vCPU                        |

There are some general details about both system and probably there are more you can think about if you know what you need. But M0 cluster is not recommended and designed for production enviroments so you can also compare features of M10 cluster with another plan of Wix.

_It's also important to mention that WixData is multi region by default so basically you don't need to do anything about it, you will have servers around the world. But in WeivData it all depends on your cluster at MongoDB, if you want to setup the similar system you can use global clusters in MongoDB Atlas._

### When to Choose WeivData?

When you want to build something more complex you may want to choose WeivData over WixData but if you are not planning to build something complex you can go with WixData, it also depends on your future plans with your app. You wouldn't want to pick the wrong database system. And don't forget WeivData is a NoSQL database just like WixData so if you need an SQL database or something else you may want to look for other database systems and maybe integrate it with WixData using external database connections.

## General Overview of WeivData & FAQs

WeivData creates a similar/same syntax of WixData and converts it to a form where mongodb driver can understand. It also handles the authorization so you can set permissions for user, member and admin level. This permission system is working with Wix Members in the background via `wix-members` and/or `wix-users` APIs.

If you are already familiar with MongoDB you can also use **.native** function to use any collection feature of MongoDB NodeJS driver.

### FAQs

#### **How do we define permissions for each level and how it works?**

You define the permissions at MongoDB dashboard where you create database users and set permissions for each user. You can create three different user (Visitor, Member, Admin) and assign required permissions for each database and/or collection for these users. And then you can use these users with WeivData. WeivData will know if the current user is a Visitor, Member or Admin.

#### **How can we create Site Member Author permission in WeivData?**

There isn't any specific user or a permission for this in WeivData but there is a very simple workaround you can apply. If you need a collection where members can only update and delete their own data you can enable a flag in WeivData when passing options which called as `onlyOwner` if you set this to true WeivData will check if searched item's \_owner field mathes with current member id. If so it will apply the action if not it will return undefined.

#### **Is syntax of WeivData same with WixData?**

For some functions yes it's almost the same or directly same but for some other functions it's different a little. For example aggregate function in WixData is not order sensitive, so basically the order of methods won't have any effect on the returned data. But in WeivData it matters and order of your method calls after aggregate function will effect the returned data. Another difference for aggregate function you have a method called `stage` where you can add custom pipeline stages, this allows you to mixin native MongoDB pipeline stages with predefined methods.

#### **What is cold start, and can we optimize it?**

Cold start is the first time you call WeivData in your code, when you call any function of WeivData that makes request/s to database it'll first connect to MongoDB and for this it'll require some extra time usually around 800ms-2s and this will add some extra delay to your first function call. After that first cold connected MongoClient will be cached and this won't happen again until the container killed by Wix.

Every Wix website runs inside of a container and these containers are killed each 5 minutes (rare but sometimes 6min). So every 5 minutes WeivData will need to connect again, and this will require a cold start which will add some delay for first function/s call/s.

To optimize this you can't do much because you don't have any control over how these containers killed, it would be better if Wix would keep the containers alive if there are live visitors but this is not the case. What you can do is use a plugin of WeivData to setup a basic API endpoint in your Wix website and regulary make calls to that POST API endpoint (each 4/5min). This will keep your Wix site warm and make the connection ready for most users.

> In WixData you don't directly interact with database instead you are talking with another server and this makes it possible to create a system where you don't have cold starts.

#### **How can I switch from WixData?**

If you already use WixData and has a lot of data currently it won't be easy to switch to WeivData because for now WeivData doesn't support string based IDs instead we use ObjectIds and because of that you'll need to convert each string id to ObjectId and this won't be eacy for big amounts of data. But soon it'll be possible for you to use string ids and when this happens you can do the following:

1. Create the same collections in a database.
2. Export data from Wix collections as CSV files.
3. Import these CSV files to your MongoDB collections carefully.
4. You are ready to go.

> This should be an easy way to import data to MongoDB when you don't have too many data.

#### **Are there any feature of WixData that doesn't supported by WeivData?**

Yes there are some features we don't support and these are:

- Dynamic Pages (has a workaround)
- Datasets
- Frontend Support
- onFailure Hook

#### **I already know MongoDB can I use native syntax of MongoDB with WeivData?**

Yes this is possible via .native function where you can get a collection cursor and work with this cursor that's returned by MongoDB NodeJS driver.

## How to Setup for WeivData

Follow this step by step guide to setup your Wix website for WeivData:

> We assume that you have already created a MongoDB account and a Atlas cluster so your MongoDB database is ready. If not please fo it first.

1. We assume that you have created your database setup and created your cluster in MongoDB.
2. Go to database access from the MongoDB dashboard.
   1. Go to `Custom Roles` tab and create three different roles: `Admin`, `Member` and `Visitor`.
   2. Add related databases, collections and permissions to each role.
3. When you are done with creating custom roles go back to `Database Users` tab and create three different users.
   1. Create a user for each role we have created before and name them as you want (use secure usernames don't use usernames like admin, member or visitor).
   2. When you create your users create [strong passwords](https://randomkeygen.com/) for your users too.
   3. Create passwords that contains numbers, upper and lowercase letters also symbols and make sure that it's longer than 17 characters.
   4. After you create each user save passwords to somewhere because you will need these later and MongoDB won't show passwords to you again. (Use paper and pencil)
4. When you complete the 3rd step go to `Network Access` page from the MongoDB dashboard.
   1. Remove any IP address in `IP Access List` tab.
   2. Add new IP address and click `Allow Access From Anywhere`. In this way Wix servers will be able to access your database (also any other device!!).
5. When you complete the 4th step. You are now ready to switch to your Wix Studio Dashboard.
   1. Open up the Wix dashboard and go to `Developer Tools -> Secrets Manager`
   2. You will create a single secret for all users you've created in MongoDB. Create a secret named as `WeivDataURIs`.
   3. After you create the secret you will paste the URIs in stringified JSON format like below:

```json
"{
  "visitor": "<visitor-uri>",
  "member": "<member-uri>",
  "admin": "<admin-uri>"
}"
```

6. You are done with Secrets Manager now go to CMS from your Wix Dashboard.
   1. Create a collection and name it as `WeivOwnerID`. This collection will be used to get visitor ids when you enable it for each operation.
   2. You don't need to create any field just create the collection and leave it as it is. weiv-data will remove any data it creates.
7. Now it's time to install the `weiv-data` library. Install `@exweiv/weiv-data` package from NPM.
8. For the last step go to your backend directory.
   1. Create a folder named `WeivData` in your backend section of your site. (backend/WeivData)
   2. Inside of this folder create a JS file named `connection-options.js`, `data.js` and `config.js`. These are required even if you don't set any data hooks, config settings or custom connection options.

```
backend/
├── WeivData/
│   ├── connection-options.js
│   ├── data.js
│   └── config.js
└──
```

9. You should be good to go!

## Security in WeivData and MongoDB

There are not very much to do with security side when you use MongoDB Atlas since it's already managed by MongoDB they will handle the most of the security features. But you should be careful about these steps:

1. Use secure usernames and passwords for your database users.
2. Don't add unrequired roles/permissions to your users, just add minimal permissions (only what is required).
3. Follow secure coding practices and keep your code secure.

And you should be fine in most cases.

> WeivData is already checking things like data types or prototype pollution and throws errors in some cases where you send wrong data. But always follow the secure coding practices.

## About Data Hooks in WeivData

Just like in WixData you can also define data hooks in WeivData too, hooks will make it possible for you to manipulate the data on the fly that's sent to MongoDB or data returned by the function. There are more hooks in WeivData because WeivData has more functions than WixData and you can learn about these in the [documentation of WeivData](https://weiv-data.apps.exweiv.com/).

You will use `data.js` file inside `backend/WeivData` folder. You can define your hooks inside there.

## Help

Ask for help, give feedback or anything else? info@apps.exweiv.com

[API Reference](https://weiv-data.apps.exweiv.com/) <br>
[Install - NPM](https://www.npmjs.com/package/@exweiv/weiv-data) <br>
[Changelog](https://github.com/ExWeiv/weiv-data/blob/main/CHANGELOG.md)

---

[Kolay Gelsin](https://medium.com/the-optimists-daily/kolay-gelsin-a-turkish-expression-we-should-all-know-and-use-83fc1207ae5d) 💜

<img src="https://static.wixstatic.com/media/510eca_399a582544de4cb2b958ce934578097f~mv2.png">
