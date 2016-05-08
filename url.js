var URL = require('url')
var os = require('os')

module.exports =  function (url) {
  if ((typeof url) === 'string') return dismantle(url)
  else return construct(url)
}

// e.g.
//  http://download.oracle.com/otn-pub/java/jdk/8u92-b13/jre-8u92-linux-x64.tar.gz
function dismantle (url) {
  var parsed = URL.parse(url)

  var def = {}

  var parts = parsed.pathname.replace(/^\//i, '').split('/')
  def.build = parts[3].split('-')[1]
  def.file = parts[4]

  var fileparts = def.file.split('-')
  def.type = fileparts[0]
  var versionparts = fileparts[1].split('u')
  def.version = Number(versionparts[0])
  def.rev = Number(versionparts[1])
  def.platform = fileparts[2]
  def.arch = fileparts[3].split('.')[0]
  def.ext = fileparts[3].split('.').slice(1).join('.')

  return def
}


function construct (url) {
  var platform = url.platform || platform()
  var arch = url.arch  || arch()

  var host = url.host || 'http://download.oracle.com'
  var basepath = url.basepath || 'otn-pub/java/jdk'

  var type = url.type  || 'jvm'
  var rev = '' + url.version + 'u' + url.rev
  var rev_build = [rev, url.build].join('-')
  var file_lastpart = [arch, url.ext].join('.')

  var file = [url.type, rev, platform, file_lastpart].join('-')

  return [host, basepath, rev_build, file].join('/')
}

function platform () {
  return {
    darwin: 'macosx',
    freebsd: 'freebsd',
    linux: 'linux',
    sunos: 'solaris',
    win32: 'windows'
  }[os.platform()]
}

function arch () {
  return {
    x64: 'x64',
    arm: 'arm64-vfp-hflp',
    ia32: 'i586'
  }[os.arch()]
}
