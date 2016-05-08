# java-download

downloads a Java JVM release package from Oracle

just [electron-download](https://github.com/electron-userland/electron-download) by modified to get java.

This is mostly a mashup of [electron-download](https://github.com/electron-userland/electron-download) and [Java-JRE-JDK-Downloader](https://github.com/inetquestion/Java-JRE-JDK-Downloader)

### usage

```plain
$ npm install --global java-download
$ java-download --version=8 --type=jre
$ javadl --version=8 --type=jre --platform=linux
```

```js
var download = require('java-download')

download({
  version: 8,
  arch: 'x64',
  platform: 'windows',
  cache: './zips' // defaults to <user home directory>/.java
}, function (err, path) {
  // path will be the path of the file that it downloaded.
  // if the file was already cached it will skip
  // downloading and call the cb with the cached file path
  // if it wasn't cached it will download the file and save
  // it in the cache path
})
```
