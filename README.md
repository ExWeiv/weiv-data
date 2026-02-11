<a href="https://studio.exweiv.com">
    <img align="right" alt="ExWeiv Studio Logo" title="ExWeiv Studio" height="60" src="https://raw.githubusercontent.com/ExWeiv/public/main/exweiv-studio/images/icon.png">
</a>

# WeivData Node.js APIs

![Static Badge](https://img.shields.io/badge/Built_for-Wix-0C6EFC)
![NPM Downloads](https://img.shields.io/npm/dw/%40exweiv%2Fweiv-data)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/ExWeiv/weiv-data/publish.yml?label=CD)

The official [WeivData APIs](https://www.npmjs.com/package/@exweiv/weiv-data) for Node.js to build web applications using MongoDB with Wix. Designed for easy switch from `wix-data` APIs by providing same or similar syntax for most functions, example switch;


**Using Wix SDK APIs:**
```js
import { items } from "@wix/data";

items.get("collectionId", "itemId");
// https://dev.wix.com/docs/sdk/backend-modules/data/items/get
```

**Using Velo APIs:**
```js
import wixData from "wix-data";

wixData.get("collectionId", "itemId");
// https://dev.wix.com/docs/velo/apis/wix-data/get
```

**Using WeivData APIs:**
```js
import weivData from "@exweiv/weiv-data";

weivData.get("collectionId", "itemId");
// https://weiv-data.apps.exweiv.com/functions/get.html
```

Most of the time you will do very little changes or just a keyword change, this is how we built this library to provide easier and faster codebase change for larger projects.

### When and Why to Use?

You can use this library whenever you want it's all up to you. But we recommend to use this library when you are building something large/complex and when you expect a lot of traffic. Or you want faster results from your database operations. There are more scenarios when you can use this library if you want to learn more take a look to our docs.

> You can also use native mongodb collection cursor with this library. Learn more about `.native` function in docs.

You can find more info at our **[API Reference](https://weiv-data.apps.exweiv.com/)**.

[Read changelog here](https://github.com/ExWeiv/weiv-data/blob/main/CHANGELOG.md)

---

[Kolay Gelsin](https://medium.com/the-optimists-daily/kolay-gelsin-a-turkish-expression-we-should-all-know-and-use-83fc1207ae5d) 💜
