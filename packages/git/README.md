# @utility/git

A module providing git utility functions.

## Install

```shell
deno add @utility/git
```

## Usage

```typescript
import { GITUtility } from "@utility/git";

await new GITUtility("./git-repo-folder/").hasUncommittedChanges();
// => true
```

## LICENSE

MIT
