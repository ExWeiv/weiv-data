# CHANGELOG of WeivData

In this file you can find what's changed in each version. (Versions with -dev, -test tags can contain BUG/s and errors don't use them in production)

---

### 4.1.1

- Documentation updated for custom connection options.

### 4.1.0

- Documentation is updated with new informations and better TS support.
- TS internal system is changed and now auto-complete works better.
- Validation system added for almost all functions, with some security checks.
- NPM packages versions updated.
- Error messages changed a bit.
- Aggregation system is replaced with new one, now order of methods matters and there are more updates about aggregate function.
- Some internal updates to WeivDataFilter.
- New function added to get the current version of the package.
- Query system is replaced with new one, now it's better and a bit faster.
- All ids are returned as string from now. Any objectid is converted to string just before return.
- onlyOwner flag added for some functions to enable permission of `Member Author` just like in WixData.
- mongodb version updated to 6.6.2
- BUG fixes and general performance improvements.
- v4 is first skeleton version of WeivData.

### 3.0.4

- BUG Fixes

### 3.0.3

- Default cache time for MongoClient changed to 10 min (it was 5 min)

### 3.0.2

- BUG Fixes

### 3.0.1

- New functions to `create`, `delete`, `rename` and `list` collections from a selected database. Now you can manage collections in databases with these APIs.

### 3.0.0 **(Includes Breaking Changes)**

- `consistentRead` replaced with `readConcern` and now it's using string based data that syncs with mongodb readConcern options.
- Added custom cache rules to control how MongoClient's cached when they are created.
- URI storing strategy changed and now all URIs stored as JSON in a single secret in secrets manager. (Update your secrets before you update to ^3.0.0)
- General TS changes and BUG fixes.

### 2.8.4

- Enabled module import of single-function imports. (TS Change)

### 2.8.3

- Filtering BUG fixed for query and filter classes. (Filters were not working correctly especially for or, not, and)
- BUG Fixes
- TS type changes for filters. (Most filters changed to any since it allows too many data types)

### 2.8.2

- Error Handling BUGs Fixed and Tested (Should be Working Now)
- mongodb version upgraded to 6.3.0
- TS config changes.
- Changelog updated.
- Docs updated.

### 2.8.1

- Error Handling Fixes for All Functions
- Error Message Fixes for All Functions
- Default DB Named Changed as "ExWeiv"
- Docs Updated
- BUG Fixes

### 2.8.0

- BUG Fixes
- New Helper Functions (findOne, getAndRemove, getAndReplace, getAndUpdate)
- New Functions (push, pull, increment, multiply)
- New Cache Options
- Docs Updated (+ Hooks Imported)
- New Hooks for New Functions
- Cache Features Enabled for findOne
- Typing (TS) Changes
- TS Should be Working on VSCode (Auto-complete etc.)
- Library Info Updated

### 2.7.X

- BUG Fixes
- Performance and Memory improvements
- Now you can select between manual connection management or automatic management by MongoDB driver.
- Versions before 2.6.9 are unstable and contains direct errors that blocks library to work correctly.

### 2.6.X

- BUG/Error Fixes
- Performance and Memory improvements
- Now we encrypt URIs and some other sensitive infos when storing them in cache. (Wix sites lives in a container and when container is killed anything in cache is already flushes automatically so it's not very important to encrypt data stored in global variables but we do encrypt them for better secutiry.)
- From 2.6.0 we will log every change like this: 2.6.X (sub versions will be included in parent version)

### 2.5.0

- BUG Fixes
- Performance and Memory improvements
- Now MongoDB manages the connection system with default or overwritten custom connection options. (We may revert this, will test how it performs)
- We have changed some functions logic to use mongodb driver features instead of manual JS implementation.
- MongoDB resource management improvements
- And some basic changes

### 2.4.3

- BUG Fix

### 2.4.2

- BUG Fixes

### 2.4.1

- `update` function docs updated and some BUG fixes to many functions with `upsert` feature enabled.
- new `replace` function is added to replace the all document instead of updating specified fields.
- docs and readme updated.
- internal changes and BUG fixes.

### 2.4.0

- New API/Function (`native`), enables you to use MongoDB native features.

### 2.3.2

- Docs updated.
- readConcern BUG fixed for query and aggregation

### 2.3.1

- Wix auto-complete feature testing. (JSDoc enabled)

### 2.3.0

- BUG fixes + optimizations.
- Docs updated.

### 2.2.6

- Function timings removed.
- Parallel execution is now available in query.
- Speed and performance optimizations.

### 2.2.5

- Function timings added to console.log for optimization.
- New default connection options

### 2.2.4

- BUG fixed for idConverter function. (Imported func name was wrong)
- Docs updated

### 2.2.3

- README updated
- import BUG fixes now you can import without any problem
- BUG fixes
- New function added `flushCache`

### 2.2.0

- Updates to documentation page. (Much better now and much easier to understand)
- Updates to general code and TS features.
- Some file and function names changed internally.
- Include function fixes and TS/docs support in weivData.query function.
- get function BUG fixes.
- X.509 method is now allowed and should be working as expected.
- `idConvreter` function added to library
- Started working to fix few BUG/s and test more functions.

### 2.1.0

- Updates to connection system for performance upgrade and resource saving.

### 2.0.0

- README update.
- BUG fixes and small updates.
- Documentation generated and now it's ready for use. (Will be improved with codes over time it's not best we know)
- Some functions may not work after this update so please test and report.
- Hooks are now also support bulk operations and save function. Works _almost_ same as in wix-data.

### 1.5.41, 1.5.42, 1.5.43

- README update. (docs update)

### 1.5.4

- BUG fixes.
- Order option added to queryReferenced function. (defaults to ascending)

### 1.5.3

- TS Updates
- We have started working for a Discord Server and documentation page built with WeivData.

### 1.5.2

- queryReferenced is ready for test and may contain BUG/s.
- we are testing queryReferenced to see if it's working as expected.

### 1.5.1

- README updated.
- Started to workf for queryReferenced and documentation for library.

### 1.5.0

- All data hooks are available to use and now data hooks are implemented into WeivData.
- onFailure hook is still not available.
- We have started to test data hooks if they are working as expected.

### 1.4.9

- Data Hooks are ready to use with get operation. beforeGet and afterGet hooks are ready.
- Working for other hooks.

### 1.4.80-dev.X

- Data hooks testings.

### 1.4.6

- Performance upgrades and tests.

### 1.4.4

- General BUG Fixes and readme update.

### 1.4.3

- Tested more function in Wix env.
- insert BUG fixes.
- save BUG fixes.

### 1.4.2

- Performance upgrade to getOwnerId function now you can also enable visitorId. Defaults to false. (MemberIDs always saved but visitor ids will be saved if it's set to true)
- Caching implemented to get, isReferenced and query.

### 1.4.1

- Wix NPM package indexing speed test.

### 1.4.0

- Most features are fixed and should be working. Main operations such as get, remove, insert, update should work just fine. Still testing and fixing BUGs.
- Still working on other features and improvements.

### 1.3.10-dev.1-X

- BUG Fixes and development of features for current version.
- Error handling.
- Function testing and fixing.
- bulkInsert returned itemIds fixed (it was an object instead of an array)
- readConcern feature added to bulkInsert and bulkRemove
- BUG fixes for bulkInsert and bulkRemove
- BUG fixes for bulkSave
- BUG fixes for bulkUpdate
- Lodash merge function creates BUG in some cases. (fixed)
- BUG fixes for save
- BUG fixes for removeReference
- BUG fixes for \_id .eq filter and weivData.filter

### 1.3.10

- BUG Fixes for weivData.query

### 1.3.9

- List of tested/working functions in Wix env

### 1.3.1 - 1.3.8

- BUG Fixes
- Error Handling (error messages added to almost every function)
- Performance Tests and Results (README)

### 1.3.0

- BUG Fixes and Performance Upgrades
- README updated with recent info.
- Started to test performance of library.

### 1.2.4 - 1.2.13

- BUG fixes for MongoDB Client Connections and URI handling

### 1.2.3

- README updated with a missing detail on setup.

### 1.2.2

- Changelog created.

### 1.2.1

- First working version with most features completed.
- Any other older version is not working do not use any version before 1.2.1

---

_8 Jan 2024_ first publish of 1.0.0 (draft ver)

---
