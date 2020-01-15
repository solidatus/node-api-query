# Soliatus API Query

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

`node index update-tests <test-file.json> --host https://trial.solidatus.com --token <API_TOKEN> --model <MODEL_ID>`

Using the run-tests command, we can assert that the returned IDs have not changed.

`node index run-tests <test-file.json> --host https://trial.solidatus.com --token <API_TOKEN> --model <MODEL_ID>`

Output

```
Saved queries in test-file.json
    ✓ get_objects
    ✓ get_layers


  2 passing (24ms)
```
