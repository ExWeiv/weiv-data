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

### Currently we are working on:

> We are still building this library and we will update this README when the library is fully ready to use.

- Documenting APIs
- **Better Error Handling**
- **Performance Improvements**
- Caching Mechanism Implementation
- Adding TS Support
- **Adding `queryReferenced` Function**
- Multilanguage Support
- **Data Hooks Support**

and more...