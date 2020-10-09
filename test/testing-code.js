export async function p() {
  return (await import('./testing-dep.ts')).p;
}

function * responseTime (next) {
  let start = new Date()
  yield next
  var ms = new Date() - start
  this.set('X-Response-Time', ms + 'ms')
}

export default function init (app) {
  app.use(responseTime)
}
