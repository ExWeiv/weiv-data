### Welcome to "@exweiv/weiv-data" APIs

This is the official documentation page for weiv-data APIs powered by **ExWeiv Apps**, we have built an API library for you to use with your Wix sites. This package is designed to work in Wix websites with Velo and JS and mainly focused to developers not basic users but anyone can use it for free! Before we start here are the advantages and disadvantages of weiv-data when compared to wix-data.

| Feature | weiv-data | wix-data |
| --- | --- | --- |
| Cold Start | 4/10 | 7/10 |
| Speed (After Cold Start) | 8/10 | 6/10 |
| Feature Rich | 6/10 | 7/10 |
| Easy to Use | 6/10 | 6/10 |
| Easy to Setup | 7/10 | 10/10 |
| NoSQL? | Yes | Yes |
| Technology | MongoDB | MongoDB |
| ID Type | ObjectID based ids | String based ids |
| Consistency in Speed | 6.5/10 | 9/10 |
| Read Limits | Depends on Your Cluster | Starting from 1500/min  |
| Write Limits | Depends on Your Cluster | Starting from 100/min |
| Collection Limits | Depends on Your Cluster | Starting from 15 Collection |
| Storage Limits | Depends on Your Cluster | Starting from 1500 Items/Rows |

We can compare different things in both library but keep in mind that there are cons and pros for weiv-data. So it doesn't mean everything is better there are some cons when using weiv-data:

### Cons (weiv-data):
- You can't use custom types such as rich content with weiv-data. (Has workaround)
- You won't have Wix based dashboard that's connected to Wix CMS. (Has workaround)
- When you don't have a lot of visitors your calls will take more time to complete. (Because of cold start times)
- 