# Solidatus API Query

This is an example piece of JavaScript code to retreive a Solidatus model's data and execute a Solidatus query against it.

The entry point is `index.js`.

## Requirements

- node
- npm
- a valid Solidatus API token to read a model

To authenticate against the API, you will need to request an API token from your user account page in Solidatus. Information on how to get this can be found at `/help/api/authenticating.html` in your Solidatus instance help pages.

## Setup

Install the dependencies from NPM:
`npm i`

## Usage

### Execute a query

`node index query --host https://trial.solidatus.com --token <API_TOKEN> --model <MODEL_ID> --query '<QUERY>'`

- `<MODEL_ID>` - The ID of the model in Solidatus
- `<QUERY>` - The Solidatus query
- `<SOLIDATUS_HOST>` - The URL of the Solidatus instance, e.g. https://trial.solidatus.com
- `<API_TOKEN>` - Solidatus API token with permission to read models

**Example**

`node index query --host https://trial.solidatus.com --token <API_TOKEN> --model <MODEL_ID> --query 'isAttribute() and $name = "Country"'`

Sample can be edited to interrogate the matches entities. By default, the script outputs the paths of the matched entities as JSON.

### Testing

This utility can be used to assert that the result of some queries have not changed.

Tests are specified in a JSON file in the following format:

```json
{
  "get_objects": {
    "query": "isObject()"
  },
  "get_layers": {
    "query": "isLayer()"
  }
}
```

The expected values are automatically stored in this file alongside the corresponding queries by executing the update-tests command. This stores the returned entity IDs inside the JSON file.

`node index update-tests saved-tests/sample.json --host https://trial.solidatus.com --token <API_TOKEN> --model <MODEL_ID>`

Using the run-tests command, we can assert that the returned IDs have not changed.

`node index run-tests saved-tests/sample.json --host https://trial.solidatus.com --token <API_TOKEN> --model <MODEL_ID>`

Output

```
Saved queries in saved-tests/sample.json
    ✓ get_objects
    ✓ get_layers


  2 passing (24ms)
```

## Running a Webserver

This is node app can also be run as a separate webserver that you can query using REST API calls 
The entry point for the webserver is `server.js`

**The current webserver implementation only supports the querying functionality as of 18/10/21**
### Requirements

- node
- npm
- a valid Solidatus API token to read a model

To authenticate against the API, you will need to request an API token from your user account page in Solidatus. Information on how to get this can be found at `/help/api/authenticating.html` in your Solidatus instance help pages.

### Starting the server

The command to start the webserver is:

`node server --host <SOLIDATUS_HOST> --port <PORT>`

- `<SOLIDATUS_HOST>` - The URL of the Solidatus instance, e.g. https://trial.solidatus.com
- `<PORT>` (optional) - The port that the server listens on, e.g. `3000`

If the port option is not set by default the port that the server listens on is `8080`

### Authentication

Similarly with the standard lone app, the webserver requires a valid Solidatus API token to execute a query on a model.

To authenticate a REST API call to the service, the api token needs to be passed into the header of the request.

**Example**

`curl -H "Authorization: Bearer <API_TOKEN>"`
### Executing a query

The queries can be executed by using a `POST` request on the `/api/query` endpoint and providing the `modelId` and `query` fields in the `JSON` body of the `POST` request
The API call returns a JSON object.

**Example**

`curl -X POST -H "Authorization: Bearer <API_TOKEN>" -H "Content-Type: application/json" -d '{"modelId": "<MODEL_ID", "query": "<QUERY>"}' <WEBSERVER_DOMAIN>/api/query`

- `<MODEL_ID>` - The ID of the model in Solidatus
- `<QUERY>` - The Solidatus query
- `<WEBSERVER_DOMAIN>` - Refers to the domain and port that the webserver is hosted on, e.g. if run locally it would be http://localhost:8080

Requests can be made using any tool that allows you to send HTTP requests.

