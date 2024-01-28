# CHANGELOG of weivData

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
- BUG fixes for _id .eq filter and weivData.filter

### 1.4.0
- Most features are fixed and should be working. Main operations such as get, remove, insert, update should work just fine. Still testing and fixing BUGs.
- Still working on other features and improvements.

### 1.4.1
- Wix NPM package indexing speed test.

### 1.4.2
- Performance upgrade to getOwnerId function now you can also enable visitorId. Defaults to false. (MemberIDs always saved but visitor ids will be saved if it's set to true)
- Caching implemented to get, isReferenced and query

### 1.4.3
- Tested more function in Wix env.
- insert BUG fixes
- save BUG fixes

### 1.4.4
- General BUG Fixes and readme update

### 1.4.5
- Readme Update

---

*When a new version is released you can see the update notes here.*