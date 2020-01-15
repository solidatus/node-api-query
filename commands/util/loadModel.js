const fetch = require('node-fetch')

async function loadModel(args) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + args.token
  }

  let agent
  if (args.proxy) {
    agent = new HttpsProxyAgent(args.proxy)
  }

  return await fetch(`${args.host}/api/v1/models/${args.model}/load`, {
    method: 'GET',
    agent,
    headers
  }).then(function(response) {
    if (!response.ok) {
      throw Error(response.statusText)
    }
    return response.json()
  })
}

module.exports = loadModel
