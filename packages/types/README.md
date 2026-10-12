# @utility/types

[![npm](https://img.shields.io/npm/v/@utility/types.svg)](https://www.npmjs.com/package/@utility/types)
[![License](https://img.shields.io/github/license/redvars/utilities.svg?label=License)](../../LICENSE)

Collection of commonly used types

## Install

```shell
npm install @utility/types
```

## Usage

```typescript
import { JSONObject } from "@utility/types/json";

let a: JSONObject = { "b": 1 };
// Looks fine in IDE

let b: JSONObject = "testing";
// Shows error in IDE
```
