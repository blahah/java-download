var os = require('os')
var path = require('path')
var pathExists = require('path-exists')
var mkdir = require('mkdirp')
var nugget = require('nugget')
var homePath = require('home-path')
var mv = require('mv')
var debug = require('debug')('java-download')
var npmrc = require('rc')('npm')
var URL = require('./url.js')
var _ = require('lodash')

var versions = require('./java_versions.json')

module.exports = function download (opts, cb) {
  if (!opts.version) return cb(new Error('must specify version'))

  opts = getLatestMatch(opts)
  if (!opts) return cb(new Error('no matching Java version'))
  var url = URL(opts)
  var filename = urlFilename(opts)

  var homeDir = homePath()
  var cache = opts.cache || path.join(homeDir, './.java')

  opts = URL(url)
  debug('platform/arch', opts.platform, opts.arch)

  var strictSSL = true
  if (opts.strictSSL === false) {
    strictSSL = false
  }

  var proxy
  if (npmrc && npmrc.proxy) proxy = npmrc.proxy
  if (npmrc && npmrc['https-proxy']) proxy = npmrc['https-proxy']

  debug('cache', cache)
  debug('filename', filename)
  debug('url', url)

  var cachedZip = path.join(cache, filename)
  debug('cached ' + opts.ext, cachedZip)

  if (pathExists.sync(cachedZip)) {
    debug(opts.ext + 'exists', cachedZip)
    return cb(null, cachedZip)
  }

  debug('creating cache/tmp dirs')
  // otherwise download it
  mkCacheDir(function (err, actualCache) {
    if (err) return cb(err)
    cachedZip = path.join(actualCache, filename) // in case cache dir changed
    // download to tmpdir
    var tmpdir = path.join(os.tmpdir(), 'java-tmp-download-' + process.pid + '-' + Date.now())
    mkdir(tmpdir, function (err) {
      if (err) return cb(err)
      debug('downloading zip', url, 'to', tmpdir)
      var nuggetOpts = {
        target: filename,
        dir: tmpdir,
        resume: true,
        verbose: true,
        strictSSL: strictSSL,
        proxy: proxy,
        headers: { 'Cookie': 'oraclelicense=accept-securebackup-cookie' }
      }
      nugget(url, nuggetOpts, function (errors) {
        if (errors) {
          var error = errors[0] // nugget returns an array of errors but we only need 1st because we only have 1 url
          if (error.message.indexOf('404') === -1) return cb(error)
          error.message = 'Failed to find Java v' + opts.version + ' for ' + opts.platform + '-' + opts.arch + ' at ' + url
          return cb(error)
        }
        // when dl is done then put in cache
        debug('moving ' + opts.ext + ' to', cachedZip)
        mv(path.join(tmpdir, filename), cachedZip, function (err) {
          if (err) return cb(err)
          cb(null, cachedZip)
        })
      })
    })
  })

  function mkCacheDir (cb) {
    mkdir(cache, function (err) {
      if (err) {
        if (err.code !== 'EACCES') return cb(err)
        // try local folder if homedir is off limits (e.g. some linuxes return '/' as homedir)
        var localCache = path.resolve('./.java')
        debug('local cache', localCache)
        return mkdir(localCache, function (err) {
          if (err) return cb(err)
          cb(null, localCache)
        })
      }
      cb(null, cache)
    })
  }

  function urlFilename (url) {
    return [
      [url.type, url.rev, url.platform, url.arch].join('-'),
      url.ext
    ].join('.')
  }

  function getLatestMatch (opts) {
    return _.find(_.reverse(_.sortBy(versions, ['version', 'rev'])), opts)
  }

}
