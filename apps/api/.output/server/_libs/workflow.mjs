import "./@workflow/core+[...].mjs";
//#region ../../node_modules/.pnpm/workflow@4.6.0_@nestjs+common@11.1.28_reflect-metadata@0.2.2_rxjs@7.8.2__@nestjs+core@1_b595a2b26d1a902ce4766ea1d8df7f10/node_modules/workflow/dist/stdlib.js
/**
* This is the "standard library" of steps that we make available to all workflow users.
* The can be imported like so: `import { fetch } from 'workflow'`. and used in workflow.
* The need to be exported directly in this package and cannot live in `core` to prevent
* circular dependencies post-compilation.
*/ /**
* A hoisted `fetch()` function that is executed as a "step" function,
* for use within workflow functions.
*
* @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
*/ async function fetch(...args) {
	return globalThis.fetch(...args);
}
fetch.stepId = "step//workflow@4.6.0//fetch";
//#endregion
export {};
