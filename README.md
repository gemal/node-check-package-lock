# check-package-lock
Checks the package-lock.json file for http:// links

## What does it do?
check-package-lock can check if the package-lock.json file contain insecure http:// links

## Usage
To check the package-lock.json file in the current folder:
```
npm install -g check-package-lock
check-package-lock
```

To check the package-lock.json file in another folder:
```
npm install -g check-package-lock
check-package-lock --folder 'nodefolder'
```

## Exit codes
```
0 = No errors
1 = Errors were founds in the package-lock.json files
2 = package-lock.json was not found
3 = Folder specified does not exists
4 = Folder specified is not a folder
```

## CI - Continuous Integration
check-package-lock can be used in CI environments to check your package-lock.json file before merging a pull request

## Badges

[![CircleCI](https://circleci.com/gh/gemal/node-check-package-lock.svg?style=svg)](https://circleci.com/gh/gemal/node-check-package-lock)

[![codecov](https://codecov.io/gh/gemal/node-check-package-lock/branch/master/graph/badge.svg)](https://codecov.io/gh/gemal/node-check-package-lock)

[![StyleCI](https://github.styleci.io/repos/183420925/shield)](https://github.styleci.io/repos/183420925)

[![Known Vulnerabilities](https://snyk.io/test/github/gemal/node-check-package-lock/badge.svg)](https://snyk.io/test/github/gemal/node-check-package-lock)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/gemal/node-check-package-lock.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/gemal/node-check-package-lock/alerts/)

[![CodeFactor](https://www.codefactor.io/repository/github/gemal/node-check-package-lock/badge)](https://www.codefactor.io/repository/github/gemal/node-check-package-lock)

[![DeepScan grade](https://deepscan.io/api/teams/14204/projects/17307/branches/392368/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=14204&pid=17307&bid=392368)
