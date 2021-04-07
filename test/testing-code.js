export async function p() {
  return (await import('./testing-dep.ts')).p;
}

function * responseTime (next) {
  let start = Date.now()
  yield next
  var ms = Date.now() - start
  this.set('X-Response-Time', ms + 'ms')
}

export default function init (app) {
  app.use(responseTime)
}
