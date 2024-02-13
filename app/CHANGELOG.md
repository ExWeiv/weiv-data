# CHANGELOG of weiv-data

In this file you can find what's changed in each version.

### 1.2.1

- First working version with most features completed.
- Any other older version is not working do not use any version before 1.2.1

### 1.2.2

- Changelog created.

### 1.2.3

- README updated with a missing detail on setup.

### 1.2.4 - 1.2.13

- BUG fixes for MongoDB Client Connections and URI handling

### 1.3.0

- BUG Fixes and Performance Upgrades
- README updated with recent info.
- Started to test performance of library.

### 1.3.1 - 1.3.8

- BUG Fixes
- Error Handling (error messages added to almost every function)
- Performance Tests and Results (README)

### 1.3.9

- List of tested/working functions in Wix env

### 1.3.10

- BUG Fixes for weivData.query

### 1.3.10-beta.1-X

- BUG Fixes started and everything will be published to beta version from this version until 1.4.X

### 1.3.10-dev.1-X

- BUG Fixes and development of features for current version.
- Error handling.
- Function testing and fixing.
- bulkInsert returned itemIds fixed (it was an object instead of an array)
- consistentRead feature added to bulkInsert and bulkRemove
- BUG fixes for bulkInsert and bulkRemove
- BUG fixes for bulkSave
- BUG fixes for bulkUpdate
- Lodash merge function creates BUG in some cases. (fixed)
- BUG fixes for save
- BUG fixes for removeReference
- BUG fixes for \_id .eq filter and weivData.filter

### 1.4.0

- Most features are fixed and should be working. Main operations such as get, remove, insert, update should work just fine. Still testing and fixing BUGs.
- Still working on other features and improvements.

### 1.4.1

- Wix NPM package indexing speed test.

### 1.4.2

- Performance upgrade to getOwnerId function now you can also enable visitorId. Defaults to false. (MemberIDs always saved but visitor ids will be saved if it's set to true)
- Caching implemented to get, isReferenced and query.

### 1.4.3

- Tested more function in Wix env.
- insert BUG fixes.
- save BUG fixes.

### 1.4.4

- General BUG Fixes and readme update.

### 1.4.5

- Readme Update.

### 1.4.6

- Performance upgrades and tests.

### 1.4.7-8

- README updated.

### 1.4.80-dev.X

- Data hooks testings.

### 1.4.9

- Data Hooks are ready to use with get operation. beforeGet and afterGet hooks are ready.
- Working for other hooks.

### 1.5.0

- All data hooks are available to use and now data hooks are implemented into weiv-data.
- onFailure hook is still not available.
- We have started to test data hooks if they are working as expected.

### 1.5.1

- README updated.
- Started to workf for queryReferenced and documentation for library.

### 1.5.2

- queryReferenced is ready for test and may contain BUG/s.
- we are testing queryReferenced to see if it's working as expected.

### 1.5.3

- TS Updates
- We have started working for a Discord Server and documentation page built with weiv-data.

### 1.5.4

- BUG fixes.
- Order option added to queryReferenced function. (defaults to ascending)

### 1.5.41, 1.5.42, 1.5.43

- README update. (docs update)

### 2.0.0

- README update.
- BUG fixes and small updates.
- Documentation generated and now it's ready for use. (Will be improved with codes over time it's not best we know)
- Some functions may not work after this update so please test and report. ([Discord](https://discord.gg/pVYJjPKRm6) or Email)
- Hooks are now also support bulk operations and save function. Works *almost* same as in wix-data.

### 2.1.0

- Updates to connection system for performance upgrade and resource saving.

### 2.2.0

- Updates to documentation page. (Much better now and much easier to understand)
- Updates to general code and TS features.
- Some file and function names changed internally.
- Include function fixes and TS/docs support in weivData.query function.
- get function BUG fixes.
- X.509 method is now allowed and should be working as expected.
- `idConvreter` function added to library
- Started working to fix few BUG/s and test more functions.
- Discord server created and READMEs updated with new informations.

### 2.2.3

- README updated
- import BUG fixes now you can import without any problem
- BUG fixes
- New function added `flushCache`

### 2.2.4

- BUG fixed for idConverter function. (Imported func name was wrong)
- Docs updated

### 2.2.5

- Function timings added to console.log for optimization.
- New default connection options

### 2.2.6

- Function timings removed.
- Parallel execution is now available in query.
- Speed and performance optimizations.

### 2.3.0

- BUG fixes + optimizations.
- Docs updated.

---

_When a new version is released you can see the update notes here. Or in our [Discord Server](https://discord.gg/pVYJjPKRm6)_

---
