var isEqual = require('lodash.isequal')

function testurl () {
  var url = require('./url.js')

  var good_str = 'http://download.oracle.com/otn-pub/java/jdk/8u92-b13/jre-8u92-linux-x64.tar.gz'
  var good_obj = {
    type: 'jre',
    build: 'b13',
    file: 'jre-8u92-linux-x64.tar.gz',
    rev: 92,
    version: 8,
    platform: 'linux',
    arch: 'x64',
    ext: 'tar.gz'
  }

  if (!isEqual(good_obj, url(good_str))) {
    console.log('FAIL url.dismantle')
    console.log(JSON.stringify(good_obj, null, 2))
    console.log(JSON.stringify(url(good_str), null, 2))
    process.exit(1)
  }

  if (!(good_str, url(good_obj))) {
    console.log('FAIL url.construct')
    console.log(JSON.stringify(good_str, null, 2))
    console.log(JSON.stringify(url(good_obj), null, 2))
    process.exit(1)
  }

  console.log('OK urls')
}

testurl()
