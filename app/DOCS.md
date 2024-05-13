This is the official documentation page for weiv-data APIs powered by **ExWeiv Apps**, we have built an API library for you to use with your Wix sites. This package is designed to work in Wix websites with Velo and JS and mainly focused to developers not basic users but anyone can use it for free! Before we start here are the advantages and disadvantages of weiv-data when compared to wix-data.

| Feature                             | weiv-data (M0 Cluster)      | wix-data (Basic Plan)               |
| ----------------------------------- | --------------------------- | ----------------------------------- |
| Database Type                       | NoSQL - MongoDB             | NoSQL - MongoDB                     |
| Frontend Support                    | Only Backend                | Frontend Supported                  |
| Performance/Speed                   | 8.5/10                      | 6.5/10                              |
| Cold Start Time                     | Extra 1000-1500ms           | No Cold Start                       |
| Scalability (General)               | Very High                   | Moderate                            |
| Consistency                         | 8/10                        | 9/10                                |
| Read Limits                         | 100/sec                     | 1500/min                            |
| Write Limits                        | 100/sec                     | 100/min                             |
| Request Timeout                     | 30sec/request               | 5sec/request                        |
| Index Limits                        | 3 Index in Total            | 1 Index in Total                    |
| Collection Limit                    | 500 Collections             | 15 Collections                      |
| Database Limit                      | 100 Databases               | 1 Database (Auto Generated)         |
| Storage Limit                       | 512MB                       | 1500 Items/Rows                     |
| Item Size Limit                     | 16MB                        | 512KB                               |
| Automatic Backup                    | No Automatic Backup         | 1 Per Month                         |
| Manual Backup                       | Yes                         | Yes                                 |
| Visual Dashboard                    | Yes (Not Integrated to Wix) | Yes (Also Integrated with Wix)      |
| Datasets (Connecting Data Visually) | Not Available               | Available                           |
| Pricing                             | Free, Monthly, Hourly       | Free, Monthly (Starting from 12€/m) |
| Multicloud                          | No                          | Yes                                 |
| RAM                                 | Shared RAM                  | 400MB (1 Micro Container)           |
| CPU                                 | Shared vCPU                 | 1vCPU (1 Micro Container)           |
| Security                            | Very Good                   | Much More Better                    |

> In MongoDB M0 Cluster you WON'T have 100/sec limit for each class of operation you have 100/sec for any class of operation. So read/write/update/delete... sahres the same limit of 100/sec which is 6000/min

**We have compared the limits and other things based on the lowest leves. M0 Cluster for MongoDB (Free) and Basic Plan for Wix Studio (12€/m).**

### Summary

There are still more things we can consider between each library and don't forget that our library is not a platform it's just converting mongodb into similar syntax and adding some features top of it so you can code like in wix-data using weiv-data. What this means is we are actually comparing MongoDB Atlas and wix-data.

And when you have the freedom of upgrading your own MongoDB clusters it's very hard for wix-data to be better because you can upgrade to highest level of dedicated cluster and probably your setup will be better.

But when we compare the lowest levels in each platform you can see that there some cons and pros. Remember there is no one size fits all so consider your app/website and decide which library to use. If you don't need speed and if you are building something simple there is no need to use weiv-data in general. But if you are building something more complex and that needs speed than you can go with weiv-data.

Also keep in mind that we didn't list every single detail about each library/platform we recommend you to take a look at MongoDB M0 Cluster limits and Wix Studio Basic plan limits to let you even understand better the limits and features.

### Using M0 Cluster for Production

When we have test the M0 Cluster it was quite well for begining if your application is not expecting a lot of users you can just start with free version which is M0 then you can upgrade to M2 or M5 or even to a dedicated clusters which is M10 or higher you can also enable multi-cloud and auto-scale features in dedicated clusters.

So _we think_ it's okay to start with M0 and then upgrade if there is a need for an upgrade. Monitor your functions using Wix Monitoring tools and see if you really need a higher version.

> Before upgrading directly remember you can optimize your code and collections using related features such as indexes.

## Setup Your Env

Let's start by setting up our environment for weiv-data and make things ready. Follow the steps and you will be ready to go in 1-3mins:

> If you haven't created a MongoDB account yet go ahead and create one!

1. We assume that you have created your database setup and created your cluster in MongoDB.
2. Go to database access from the MongoDB dashboard.
   1. Go to `Custom Roles` tab and create three different roles: `Admin`, `Member` and `Visitor`.
   2. Add related databases, collections and permissions to each role.
3. When you are done with creating custom roles go back to `Database Users` tab and create three different users.
   1. Create a user for each role we have created before and name them as you want but we suggest naming them as Admin, Member and Visitor.
   2. When you create your users create [strong passwords](https://randomkeygen.com/) for your users too because this will be important for security.
   3. Create passwords that contains numbers, upper and lowercase letters and symbols and make sure that it's longer than 17 characters.
   4. After you create each user save passwords to somewhere because you will need these later.
4. When you complete the 3rd step go to `Network Access` page from the MongoDB dashboard.
   1. Remove any IP address in `IP Access List` tab.
   2. Add new IP address and click `Allow Access From Anywhere`. In this way Wix servers will be able to access your database (also any other server).
   3. Keep in mind that you can setup custom IP addresses if you want.
5. When you complete the 4th step. You are now ready to switch to your Wix Studio Dashboard.
   1. Open up the Wix dashboard and go to `Developer Tools -> Secrets Manager`
   2. You will create a single secret for all users you've created in MongoDB. Create a secret named as `WeivDataURIs`.
   3. After you create the secret you will paste the URIs in JSON format like below:

```json
{
  "visitor": "<visitor-uri>",
  "member": "<member-uri>",
  "admin": "<admin-uri>"
}
```

6. You are done with Secrets Manager now go to CMS from your Wix Dashboard.
   1. Create a collection and name it as `WeivOwnerID`. This collection will be used to get visitor ids when you enable it for each operation.
   2. You don't need to create any field just create the collection and leave it as it is. weiv-data will remove any data it creates.
   3. Also set the collection permissions to Anyone for each operation. So anyone should be able to do all operations for that collection.
7. Now it's time to install the `weiv-data` library.
   1. Go to your Wix Studio Editor and enable coding features (Velo). (Click the code icon = { })
   2. Go to `Packages & Apps`. You will see npm click `+` button. And search for "@exweiv".
   3. You will see the `@exweiv/weiv-data` npm package install that package.
   4. You may also want to install `mongodb` package since you will deal with `ObjectIDs`.
   5. Search for "mongodb" and click the three dots. Select choose version and install the 5.9.2
   6. You can import ObjectId like that: `import { ObjectId } from 'mongodb';`. (More examples below and can only be used in backend).
8. For the last step go to your Wix Studio editor and open up the `Public & Backend` section.
   1. Create a folder named `WeivData` in your backend section of your site.
   2. Inside of this folder create a JS file named `connection-options.js` and `data.js`. These are required even if you don't set any data hooks or custom connection options.
9. You should be good to go!

**Even if you won't setup any custom connection settings or data hooks create `WeivData` folder in your backend and create two .js files `data.js` and `connection-options.js`. This is important and must have to let library work.`**

> We also explain how you use X.509 instead of username and password authentication method.

### Finding Connection URI/String in MongoDB:

**Click to connect button in your cluster.**

<img src="https://static.wixstatic.com/media/510eca_04dddb376fd348079791a884d06f18e4~mv2.png" height="400px" alt="Connect Button in MongoDB Databases Page">

**Then you will see an example of connection uri/string.**

<img src="https://static.wixstatic.com/media/510eca_053a1b7c7ec74c6599f9ff7c6fcde265~mv2.png" height="400px" alt="Connection URI/String">

```js
const username = "Admin";
const password = "StrongPassword.26.34.61";

// Replace username, password and rest of the URL with your own!
const uriExample = `mongodb+srv://${username}:${password}@testingcluster.luecqd2.mongodb.net/`;
```

### IP Address and Security

Currently we don't have any tutorial about how you can setup IP Address within Wix. Instead we allow any IP address and use strong passwords. We are working on different type of authentication methods that's available in MongoDB and also possible with Wix.

### ObjectID Based ItemIDs

In weiv-data unlike wix-data we don't use string based item ids. Instead we use `ObjectId` based item ids. We use ObjectId for better speed and performance. You can learn more about ObjectId via a magical tool called `Google`, `Gemini`, `Chat-GPT` etc. 😊

Currently we are optimizing our code to return ObjectID in every case right now in some cases our library returns string instead of ObjectID. (This will be fixed asap.)

Note: You can use a custom function in our library to convert strings into ObjectId or ObjectIds to string.

```js
import { idConverter } from "@exweiv/weiv-data";

const stringId = "...";
const objectId = "...";

idConverter(stringId); // returns objectid
idConverter(objectId); // returns stringid
```

### Creating Custom Options

Here is a direct example for advanced users to let them understand it directly.

> Example shows a path but you can also use buffer data with `key` field in options. See MongoDB docs for more.

```js
// In your `backend/WeivData/connection-options.js` file.
const defaultOptions = () => {
  return {
    maxPoolSize: 50,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    tls: true,
    authMechanism: "MONGODB-X509",
  };
};

// Defined as a function (can be async)
export const adminClientOptions = () => {
  return {
    ...defaultOptions(),
    tlsCertificateKeyFile: "../../../../../../../../../user-code/backend/WeivData/admin.pem",
  };
};

// Defined as a function (can be async)
export const memberClientOptions = () => {
  return {
    ...defaultOptions(),
    tlsCertificateKeyFile: "../../../../../../../../../user-code/backend/WeivData/member.pem",
  };
};

// Defined as a function (can be async)
export const visitorClientOptions = () => {
  return {
    ...defaultOptions(),
    tlsCertificateKeyFile: "../../../../../../../../../user-code/backend/WeivData/visitor.pem",
  };
};
```

Let's talk about how it works. Basically you can create three different client options for each role and export them named as above example. And export them in that js file.

`adminClientOptions` function will be used for admins. `memberClientOptions` function will be used for members. `visitorClientOptions` function will be used for visitors.

In this way you can assign different certificates or options for each role.

> If you don't create only one or two of these options defaults will be used for the one/s you didn't specify.

[More About Connection Options in MongoDB](https://www.mongodb.com/docs/drivers/node/v5.9/fundamentals/connection/connection-options/)

[More About TLS](https://www.mongodb.com/docs/drivers/node/v5.9/fundamentals/connection/tls/)

[More About Auth Options](https://www.mongodb.com/docs/drivers/node/v5.9/fundamentals/authentication/)

### Using Atlas Managed X.509

You can still use username and password method (SCRAM) which will be fine if you have strong passwords but if you want to use X.509 here is how. Username and password method (SCRAM) is easier and secure. Just create strong passwords!

Let us explain how does weiv-data works when connecting to clusters so you can better understand which options you can use for authentication.

> You can also check our GitHub so you can understand how it works even create pull requests.

- Our connection provider gets the URI from the secret you create in your Wix secrets manager.
- We use secrets manager for URIs but for connection options (`MongoClientOptions`) we use a JS file you create in your Wix backend. As we explain above.

In this way you can manage connection uris/strings as well as connection options.

If you want to create users thats using X.509 method follow the steps:

1. Go to your MongoDB dashboard and create a new user.
2. When creating a user select `certificate` option above.
3. Give a name to your user _(CN)_ and enable download switch.
4. Set an expire date for your certificate.
5. Add permissions and create the user (certificate will be downloaded automatically)
6. Open the downloaded .pem file and copy the content of file.
7. Create a .pem file in your Wix backend and paste the content in that file.
8. In your `connection-options.js` file assign the path of file. **(Read below)**
9. You should be good to go!

When you are pasting the path of .pem file in your backend use the following directory as reference:

```js
const pathToBackend = "../../../../../../../../../user-code/backend/";
```

This is the path to your Wix backend. Yes it's different than what you have in your codes. But this one is the working one. Use this path to access your backend folder. You can also check the example code above.

> You can probably also access to other folders like public, pages etc. Just let you know not needed for our library.

> You can also use Buffer data of your .pem files which is probably what you'll prefer in production. You can store your .pem files in cloud providers and get signed URLs after that you can use that signed URLs to create a Buffer data via axios. And then you can use that Buffer data for X.509 method.

### How to Create Hooks

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

### Manual or Automatic Pool Management

If you want to use automatic pool management do not set min or max pool size in your custom connection options. In this way it will be handled by MongoDB driver and weiv-data library won't connect to cluster manually instead it will return a not connected MongoClient and driver will handle the connection when an operation starts.

If you want to manually configure it you can set min or max (or both) pool size in custom connection options. In this way our library will call the .connect method and it will return a connected client when performing operations.

MongoClients are cached and saved so after cold start it will be cached for 5 min. (Wix Container Time)

<br>

---

Ask for help, give feedback or anything else? info@apps.exweiv.com

- [API Reference](https://weiv-data.apps.exweiv.com/)
- [Install - NPM](https://www.npmjs.com/package/@exweiv/weiv-data)
- [Changelog](https://github.com/ExWeiv/weiv-data/blob/main/CHANGELOG.md)

---

[Kolay Gelsin](https://medium.com/the-optimists-daily/kolay-gelsin-a-turkish-expression-we-should-all-know-and-use-83fc1207ae5d) 💜

<img src="https://static.wixstatic.com/media/510eca_399a582544de4cb2b958ce934578097f~mv2.png">
