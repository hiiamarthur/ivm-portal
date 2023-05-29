# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version: 1.0.0


### Commits

#### fix: frontend errors
**[#cf31d32]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/cf31d321ddb8d02f414f5d6335ec8d904caed63d)

- Date: 29 May 2023

- Author: vicki

- Detail: fix: frontend errors

fix error when saving empty promo campaign list in machine detail page
show voucher type filter option "valueoff" and "percentoff" only in
campign voucher list


#### update generate changelog template
**[#2eb5bcd]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/2eb5bcde5b247d86d84b91369e2c5b70317460a4)

- Date: 29 May 2023

- Author: vicki

- Detail: update generate changelog template

add changelog-template.hbs
add generate changelog script and config in package.json


#### fix and merge missing update
**[#d2d6845]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/d2d6845b86b411f55dfdfb58b0232b952d55d61b)

- Date: 29 May 2023

- Author: vicki

- Detail: fix and merge missing update

fix merge error from previous commits
merge missing update from previous commits


#### Promotion API & Import voucher list fix
**[#0150da0]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/0150da06413af2f5e3d196e95e459a2d6c7ab896)

- Date: 23 May 2023

- Author: vicki

- Detail: Promotion API & Import voucher list fix

**[PromotionAPI]**
authenticate access from vending machine
update txn and voucher used balance
edit campaign list for promotion (SuperAdmin only)
update voucher type list in add/edit voucher form

**[Campaign Voucher related]**
export voucher code usage report
show voucher code usage in salesreport detail list

**[Import voucher fix]**
fix error uploading "voucherlist.csv"

**[Misc]**
add no of record shown per page on userlist
remove duplicated files in gitignore


#### add change log
**[#a28d091]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/a28d0917faedbc66825df43713a50aedf3add477)

- Date: 27 April 2023

- Author: vicki.lam

- Detail: add change log


#### checking loginid should be case sensitive
**[#d1d6d3d]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/d1d6d3d265e57961a6aae8c9335166a665377dd4)

- Date: 8 March 2023

- Author: vicki.lam

- Detail: checking loginid should be case sensitive


#### export event log and edit machine product/sku
**[#b3fdbfc]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/b3fdbfc87331757a26019d7d77f50987c7584a81)

- Date: 7 March 2023

- Author: vicki.lam

- Detail: export event log and edit machine product/sku


#### update gitignore
**[#c362858]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/c362858760dfad72f3b339758f9e5067c6b5fb94)

- Date: 7 March 2023

- Author: vicki.lam

- Detail: update gitignore


#### campaign voucher list data from past 365 days
**[#fe81271]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/fe81271681dfab719573c51b77737173dd5a4c96)

- Date: 26 January 2023

- Author: vicki.lam

- Detail: campaign voucher list data from past 365 days


#### fix datatable no of records shown per page
**[#5e60dc6]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/5e60dc6e00651118bc66d8fd0e1c50a713106a32)

- Date: 19 January 2023

- Author: vicki.lam

- Detail: fix datatable no of records shown per page


#### change .env.dev db password
**[#0d0a47e]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/0d0a47e39dd1df4a06ce2793db57864f36c0d026)

- Date: 11 January 2023

- Author: VickiLam

- Detail: change .env.dev db password


#### developement notes and update
**[#29d3cac]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/29d3cac05990575da1dbaaa4ea218182694bacf8)

- Date: 28 December 2022

- Author: vicki.lam

- Detail: developement notes and update


#### new database connection
**[#cc4cbf0]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/cc4cbf075d863b6c14568542e7a98d70084e4f80)

- Date: 15 December 2022

- Author: vicki.lam

- Detail: new database connection


#### update userprofile
**[#b4d732b]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/b4d732bb36cdf828d509debae9711ae339f486fe)

- Date: 12 December 2022

- Author: vicki.lam

- Detail: update userprofile


#### generate vouchercode and password
**[#e3568bd]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/e3568bdd2efb772e6a6566db4474ee109a68b6c8)

- Date: 30 November 2022

- Author: vicki.lam

- Detail: generate vouchercode and password


#### voucher related update
**[#458c178]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/458c1780129d04830096915f274b3b51bda1f251)

- Date: 30 November 2022

- Author: vicki.lam

- Detail: voucher related update


#### voucher mgt update
**[#ca1a831]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/ca1a831b429be49b583be59f5e1a181bda60d139)

- Date: 28 November 2022

- Author: vicki.lam

- Detail: voucher mgt update


#### exception logging
**[#5083b8c]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/5083b8c6732c494e80ccb4144f19185635368ab4)

- Date: 11 November 2022

- Author: vicki.lam

- Detail: exception logging


#### user mgt, uploadcsv & writing error log to file
**[#a7958d3]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/a7958d34c22fedc3128a904b464db6b79e0c00c3)

- Date: 10 November 2022

- Author: vicki.lam

- Detail: user mgt, uploadcsv & writing error log to file


#### campaign voucher
**[#7b6db08]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/7b6db08de2f74c740ee0482fa0191113c20e46bb)

- Date: 1 November 2022

- Author: vicki.lam

- Detail: campaign voucher


#### update voucher status & add datepicker libraries
**[#a62ed96]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/a62ed96336a6fd4c474aea5877705027ea37484f)

- Date: 14 October 2022

- Author: vicki.lam

- Detail: update voucher status & add datepicker libraries


#### machine voucher & machine items edit functions
**[#02a97ca]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/02a97cac30307bc0c68cc18f0426d55aa413b436)

- Date: 7 October 2022

- Author: vicki.lam

- Detail: machine voucher & machine items edit functions


#### hide schema name
**[#ef3e3d5]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/ef3e3d57e355be7b599a56539c96a01915507928)

- Date: 16 September 2022

- Author: vicki.lam

- Detail: hide schema name


#### delete user & mask login page server name
**[#e9952d2]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/e9952d2f31c578a944bd98232e67082ac3bcd568)

- Date: 13 September 2022

- Author: vicki.lam

- Detail: delete user & mask login page server name


#### responsive side menu
**[#1586263]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/1586263c94e1f0917fa9093ddbe1a8a36af23c7d)

- Date: 8 September 2022

- Author: vicki.lam

- Detail: responsive side menu


#### channel update and inventory bug fix
**[#de8ae59]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/de8ae59ed54cf0fce62a779e9b936689a7c8c950)

- Date: 7 September 2022

- Author: vicki.lam

- Detail: channel update and inventory bug fix


#### switch schema & machine channel detail
**[#3d7919c]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/3d7919c513cefe072f37d3e808d4e29699862768)

- Date: 5 September 2022

- Author: vicki.lam

- Detail: switch schema & machine channel detail


#### switching schema
**[#b44293c]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/b44293cdb6a094bddf612b9a0dd8422e8bd77a49)

- Date: 31 August 2022

- Author: vicki.lam

- Detail: switching schema


#### user management
**[#425008f]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/425008f290ee8d5f2956351caf1e41be9ad5f861)

- Date: 26 August 2022

- Author: vicki.lam

- Detail: user management


#### login guard
**[#c0886b9]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/c0886b951cd2e74854013b2b524ad5146c7ddd8c)

- Date: 19 August 2022

- Author: vicki.lam

- Detail: login guard


#### generate excel and machine version#1
**[#97fe7f0]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/97fe7f0768d5d4b97beb3b7f98bf6d00d00b65e6)

- Date: 28 July 2022

- Author: vicki.lam

- Detail: generate excel and machine version#1


#### generate excel
**[#b2ba7ff]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/b2ba7ffbceccc41a6f5083bd00cff2e8ba7ac461)

- Date: 19 July 2022

- Author: vicki.lam

- Detail: generate excel


#### excel generation
**[#7d4b776]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/7d4b776596a0c438fa636af624034c3fa456422a)

- Date: 18 July 2022

- Author: vicki.lam

- Detail: excel generation


#### inventory & machine
**[#cbe0283]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/cbe02830722e7902018fad8a3c4f78b773a91131)

- Date: 12 July 2022

- Author: vicki.lam

- Detail: inventory & machine


#### first commit
**[#6c34da9]** (http://192.168.1.9:3000/IT/ivm-webportal/commit/6c34da93cc8aa84da8a68d97a9a81b53b0d9a9ee)

- Date: 12 July 2022

- Author: vicki.lam

- Detail: first commit


