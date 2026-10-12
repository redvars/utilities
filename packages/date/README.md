# @utility/date

[![npm](https://img.shields.io/npm/v/@utility/date.svg)](https://www.npmjs.com/package/@utility/date)
[![License](https://img.shields.io/github/license/redvars/utilities.svg?label=License)](../../LICENSE)

Collection of date utility functions

## Install

```shell
npm install @utility/date
```

## Usage

```typescript
import { isISODate } from "@utility/date";

isISODate("2022-12-27T07:40:25.551Z");
// => true

isISODate("25/12/2022");
// => false
```
