# Soliatus API Query
This is an example piece of JavaScript code to retreive a Solidatus model's data and execute a Solidatus query against it.

The entry point is `index.js`.

## Requirements
* node
* npm
* a valid Solidatus API token to read a model

To authenticate against the API, you will need to request an API token from your user account page in Solidatus. Information on how to get this can be found at `/help/api/authenticating.html` in your Solidatus instance help pages.

## Setup

Install the dependencies from NPM:
`npm i`

## Usage

`node index.js query --model <MODEL_ID> --query '<QUERY>' --host <SOLIDATUS_HOST> --token <API_TOKEN>`

* `<MODEL_ID>` - The ID of the model in Solidatus
* `<QUERY>` - The Solidatus query
* `<SOLIDATUS_HOST>` - The URL of the Solidatus instance, e.g. https://trial.solidatus.com
* `<API_TOKEN>` - Solidatus API token with permission to read models

## Example

`node index.js query --model <MODEL_ID> --query 'isAttribute() and $name = "Country"' --host https://trial.solidatus.com --token <API_TOKEN>`

Sample can be edited to interrogate the matches entities. By default, the script outputs the paths of the matched entities as JSON.
