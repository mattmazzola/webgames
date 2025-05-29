# WebGames

## Get tags (properties of games)

<a href="https://huggingface.co/datasets/convergence-ai/webgames/sql-console/0GiqaZI" target="_blank">HF Dataset SQL Query</a>

## Get games which have spatial understanding potential

```sh
node scripts/getGamesByTags.js \
--file /workspaces/webgames/data/webgames-v0-challenges.jsonl \
--or navigation maze planning physics
```

## Playwright

### Run Tests

```sh
pnpm playwright test ladybird
```

#### Visual Sequential for Debugging

```sh
pnpm playwright test map-panner -j 1 --headed
```

### Show Report

```sh
pnpm showreport
```

## Upload Dataset

### Acquire credentials

```sh
az login

azcopy login --login-type azcli
export AZCOPY_AUTO_LOGIN_TYPE=AZCLI
```

### Copy

```sh
azcopy copy \
--recursive \
"datasets/ladybird/ladybird_20250528T164140" \
https://magmardata.blob.core.windows.net/data/ladybird \
--dry-run
```




This is a collection of challenges for general-purpose web-browsing AI agents.

They're designed to be:

- easy for humans to complete
- hard for AI agents to complete
- fast and simple to run
  - just client-side state and a single-page JavaScript app
- easy to evaluate
  - each task provides a unique password on successful completion

_Read the annoucement blog on the Convergence website: [https://convergence.ai/introducing-webgames/](https://convergence.ai/introducing-webgames/)_

## Try it now

🎮 [webgames.convergence.ai](https://webgames.convergence.ai)

## Run locally

```sh
cd webgames
pnpm run dev
```

## Download tasks

Tasks are available as a dataset on [Hugging Face](https://huggingface.co/datasets/convergence-ai/webgames).

Alternatively, you can download them from the webgames website:

1. Go to [webgames.convergence.ai?showDownloads=true](https://webgames.convergence.ai?showDownloads=true)
2. Click the download buttons in the top-right corner (csv or jsonl available)
3. Verify your agent solutions using `solution in messages[-1]` or equivalent, or use the Inspect AI eval scaffolding in the eval folder.
