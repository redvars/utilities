# @utility/string

[![npm](https://img.shields.io/npm/v/@utility/string.svg)](https://www.npmjs.com/package/@utility/string)
[![License](https://img.shields.io/github/license/redvars/utilities.svg?label=License)](../../LICENSE)

Collection of string utility functions

## Install

```shell
npm install @utility/string
```

## Usage

**underscoreToTitleCase** - Converts provided underscore format string to camel case
```typescript
import { underscoreToTitleCase } from "@utility/string";

underscoreToTitleCase("hello_world");
// => Hello World
```


**toBoolean** - Converts a string value to a boolean.
```typescript
import { toBoolean } from "@utility/string";

const trueValue = toBoolean("true"); // true
```
