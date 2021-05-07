# Elementalia

An opinionated solution to build a nice static-site of your documentations. Uses Redoc for OpenAPI spec display.

Elementalia is used internally for [Project Antisocial](https://github.com/antisocial-sns), but might work with your organization too!

## How is it opinionated?

It requires the following structure for Elementalia to work.

```
... (other file on your project)
apis/
├─ spec2.json
├─ spec1.yaml
├─ complex_specs/
│  ├─ models/
│  │  ├─ model1.yaml
│  ├─ requests.yaml
│  ├─ openapi.yaml (have to be named this, for nested specification)
...
```

OpenAPI specification that uses `$ref` on another file have to be inside a folder, since Elementalia will treat any valid OpenAPI YAML/JSON file on the root folder as its own entry.
