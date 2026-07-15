import { r as __require, t as __commonJSMin } from "../../_runtime.mjs";
//#region ../../node_modules/.pnpm/fastify-plugin@6.0.0/node_modules/fastify-plugin/lib/getPluginName.js
var require_getPluginName = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fpStackTracePattern = /at\s(?:.*\.)?plugin\s.*\n\s*(.*)/;
	const fileNamePattern = /(\w*(\.\w*)*)\..*/;
	module.exports = function getPluginName(fn) {
		if (fn.name.length > 0) return fn.name;
		const stackTraceLimit = Error.stackTraceLimit;
		Error.stackTraceLimit = 10;
		try {
			throw new Error("anonymous function");
		} catch (e) {
			Error.stackTraceLimit = stackTraceLimit;
			return extractPluginName(e.stack);
		}
	};
	function extractPluginName(stack) {
		const m = stack.match(fpStackTracePattern);
		return m ? m[1].split(/[/\\]/).slice(-1)[0].match(fileNamePattern)[1] : "anonymous";
	}
	module.exports.extractPluginName = extractPluginName;
}));
//#endregion
//#region ../../node_modules/.pnpm/fastify-plugin@6.0.0/node_modules/fastify-plugin/lib/toCamelCase.js
var require_toCamelCase = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function toCamelCase(name) {
		if (name[0] === "@") name = name.slice(1).replace("/", "-");
		return name.replace(/-(.)/g, function(match, g1) {
			return g1.toUpperCase();
		});
	};
}));
//#endregion
//#region ../../node_modules/.pnpm/fastify-plugin@6.0.0/node_modules/fastify-plugin/index.js
var require_fastify_plugin = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const getPluginName = require_getPluginName();
	const toCamelCase = require_toCamelCase();
	let count = 0;
	function plugin(fn, options = {}) {
		let autoName = false;
		if (fn.default !== void 0) fn = fn.default;
		if (typeof fn !== "function") throw new TypeError(`fastify-plugin expects a function, instead got a '${typeof fn}'`);
		if (typeof options === "string") options = { fastify: options };
		if (typeof options !== "object" || Array.isArray(options) || options === null) throw new TypeError("The options object should be an object");
		if (options.fastify !== void 0 && typeof options.fastify !== "string") throw new TypeError(`fastify-plugin expects a version string, instead got '${typeof options.fastify}'`);
		if (!options.name) {
			autoName = true;
			options.name = getPluginName(fn) + "-auto-" + count++;
		}
		fn[Symbol.for("skip-override")] = options.encapsulate !== true;
		fn[Symbol.for("fastify.display-name")] = options.name;
		fn[Symbol.for("plugin-meta")] = options;
		if (!fn.default) fn.default = fn;
		const camelCase = toCamelCase(options.name);
		if (!autoName && !fn[camelCase]) fn[camelCase] = fn;
		return fn;
	}
	module.exports = plugin;
	module.exports.default = plugin;
	module.exports.fastifyPlugin = plugin;
}));
//#endregion
//#region ../../node_modules/.pnpm/helmet@8.3.0/node_modules/helmet/index.cjs
var require_helmet$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperties(exports, {
		__esModule: { value: true },
		[Symbol.toStringTag]: { value: "Module" }
	});
	const dashify = (str) => str.replace(/[A-Z]/g, (capitalLetter) => "-" + capitalLetter.toLowerCase());
	const errify = (err) => err instanceof Error ? err : new Error(String(err));
	const isString = (value) => typeof value === "string";
	const throwErrorIfExists = (err) => {
		if (err) throw err;
	};
	const dangerouslyDisableDefaultSrc = Symbol("dangerouslyDisableDefaultSrc");
	const SHOULD_BE_QUOTED = /* @__PURE__ */ new Set([
		"none",
		"self",
		"strict-dynamic",
		"report-sample",
		"inline-speculation-rules",
		"unsafe-inline",
		"unsafe-eval",
		"unsafe-hashes",
		"wasm-unsafe-eval"
	]);
	const getDefaultDirectives = () => ({
		"default-src": ["'self'"],
		"base-uri": ["'self'"],
		"font-src": [
			"'self'",
			"https:",
			"data:"
		],
		"form-action": ["'self'"],
		"frame-ancestors": ["'self'"],
		"img-src": ["'self'", "data:"],
		"object-src": ["'none'"],
		"script-src": ["'self'"],
		"script-src-attr": ["'none'"],
		"style-src": [
			"'self'",
			"https:",
			"'unsafe-inline'"
		],
		"upgrade-insecure-requests": []
	});
	const parseDirectiveName = (rawDirectiveName) => {
		if (rawDirectiveName.length === 0 || !/^[a-z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(rawDirectiveName)) throw new Error(`Content-Security-Policy received an invalid directive name ${JSON.stringify(rawDirectiveName)}`);
		return dashify(rawDirectiveName);
	};
	const getDirectiveValueValidationError = (directiveName, directiveValue) => /;|,/.test(directiveValue) ? /* @__PURE__ */ new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`) : null;
	const getDirectiveValueEntryValidationError = (directiveName, directiveValueEntry) => SHOULD_BE_QUOTED.has(directiveValueEntry) || directiveValueEntry.startsWith("nonce-") || directiveValueEntry.startsWith("sha256-") || directiveValueEntry.startsWith("sha384-") || directiveValueEntry.startsWith("sha512-") ? /* @__PURE__ */ new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}. ${JSON.stringify(directiveValueEntry)} should be quoted`) : null;
	const stringifyDirectiveValue = (directiveValue) => {
		if (Array.isArray(directiveValue)) return directiveValue.every(isString) ? directiveValue.join(" ") : null;
		if (directiveValue instanceof Set) return stringifyDirectiveValue(Array.from(directiveValue));
		return null;
	};
	const parseDirectives = ({ useDefaults = true, directives: rawDirectives = {} }) => {
		const result = new Map(useDefaults ? Object.entries(getDefaultDirectives()) : []);
		let hasDisabledDefaultSrc = false;
		const directiveNamesSeen = /* @__PURE__ */ new Set();
		for (const rawDirectiveName in rawDirectives) {
			if (!Object.hasOwn(rawDirectives, rawDirectiveName)) continue;
			const directiveName = parseDirectiveName(rawDirectiveName);
			if (directiveNamesSeen.has(directiveName)) throw new Error(`Content-Security-Policy received a duplicate directive ${JSON.stringify(directiveName)}`);
			directiveNamesSeen.add(directiveName);
			const rawDirectiveValue = rawDirectives[rawDirectiveName];
			let directiveValue;
			if (rawDirectiveValue === null) {
				if (directiveName === "default-src") throw new Error("Content-Security-Policy needs a default-src but it was set to `null`. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.");
				result.delete(directiveName);
				continue;
			} else if (typeof rawDirectiveValue === "string") directiveValue = [rawDirectiveValue];
			else if (rawDirectiveValue === dangerouslyDisableDefaultSrc) if (directiveName === "default-src") {
				hasDisabledDefaultSrc = true;
				result.delete(directiveName);
				continue;
			} else throw new Error(`Content-Security-Policy: tried to disable ${JSON.stringify(directiveName)} as if it were default-src; simply omit the key`);
			else if (rawDirectiveValue) directiveValue = rawDirectiveValue;
			else throw new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`);
			for (const element of directiveValue) {
				if (typeof element !== "string") continue;
				throwErrorIfExists(getDirectiveValueValidationError(directiveName, element) ?? getDirectiveValueEntryValidationError(directiveName, element));
			}
			result.set(directiveName, directiveValue);
		}
		if (!result.size) throw new Error("Content-Security-Policy has no directives. Either set some or disable the header");
		if (!result.has("default-src") && !hasDisabledDefaultSrc) throw new Error("Content-Security-Policy needs a default-src but none was provided. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.");
		let stringResult = "";
		let shouldUseStringResult = true;
		for (const [directiveName, directiveValue] of result) {
			const directiveValueString = stringifyDirectiveValue(directiveValue);
			if (directiveValueString === null) {
				shouldUseStringResult = false;
				break;
			} else {
				if (stringResult) stringResult += ";";
				stringResult += directiveValueString ? `${directiveName} ${directiveValueString}` : directiveName;
			}
		}
		return shouldUseStringResult ? stringResult : result;
	};
	function getHeaderValue(req, res, normalizedDirectives) {
		const result = [];
		for (const [directiveName, rawDirectiveValue] of normalizedDirectives) {
			let directiveValue = "";
			for (const element of rawDirectiveValue) if (typeof element === "function") {
				let newElement;
				try {
					newElement = element(req, res);
				} catch (err) {
					return errify(err);
				}
				const err = getDirectiveValueEntryValidationError(directiveName, newElement);
				if (err) return err;
				directiveValue += " " + newElement;
			} else directiveValue += " " + element;
			if (directiveValue) {
				const err = getDirectiveValueValidationError(directiveName, directiveValue);
				if (err) return err;
				result.push(`${directiveName}${directiveValue}`);
			} else result.push(directiveName);
		}
		return result.join(";");
	}
	const contentSecurityPolicy = function contentSecurityPolicy(options = {}) {
		const headerName = options.reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
		const parsedDirectives = parseDirectives(options);
		if (typeof parsedDirectives === "string") return function contentSecurityPolicyMiddleware(_req, res, next) {
			res.setHeader(headerName, parsedDirectives);
			next();
		};
		return function contentSecurityPolicyMiddleware(req, res, next) {
			const result = getHeaderValue(req, res, parsedDirectives);
			if (result instanceof Error) next(result);
			else {
				res.setHeader(headerName, result);
				next();
			}
		};
	};
	contentSecurityPolicy.getDefaultDirectives = getDefaultDirectives;
	contentSecurityPolicy.dangerouslyDisableDefaultSrc = dangerouslyDisableDefaultSrc;
	const ALLOWED_POLICIES$2 = /* @__PURE__ */ new Set([
		"require-corp",
		"credentialless",
		"unsafe-none"
	]);
	function getHeaderValueFromOptions$6({ policy = "require-corp" }) {
		if (ALLOWED_POLICIES$2.has(policy)) return policy;
		else throw new Error(`Cross-Origin-Embedder-Policy does not support the ${JSON.stringify(policy)} policy`);
	}
	function crossOriginEmbedderPolicy(options = {}) {
		const headerValue = getHeaderValueFromOptions$6(options);
		return function crossOriginEmbedderPolicyMiddleware(_req, res, next) {
			res.setHeader("Cross-Origin-Embedder-Policy", headerValue);
			next();
		};
	}
	const ALLOWED_POLICIES$1 = /* @__PURE__ */ new Set([
		"same-origin",
		"same-origin-allow-popups",
		"noopener-allow-popups",
		"unsafe-none"
	]);
	function getHeaderValueFromOptions$5({ policy = "same-origin" }) {
		if (ALLOWED_POLICIES$1.has(policy)) return policy;
		else throw new Error(`Cross-Origin-Opener-Policy does not support the ${JSON.stringify(policy)} policy`);
	}
	function crossOriginOpenerPolicy(options = {}) {
		const headerValue = getHeaderValueFromOptions$5(options);
		return function crossOriginOpenerPolicyMiddleware(_req, res, next) {
			res.setHeader("Cross-Origin-Opener-Policy", headerValue);
			next();
		};
	}
	const ALLOWED_POLICIES = /* @__PURE__ */ new Set([
		"same-origin",
		"same-site",
		"cross-origin"
	]);
	function getHeaderValueFromOptions$4({ policy = "same-origin" }) {
		if (ALLOWED_POLICIES.has(policy)) return policy;
		else throw new Error(`Cross-Origin-Resource-Policy does not support the ${JSON.stringify(policy)} policy`);
	}
	function crossOriginResourcePolicy(options = {}) {
		const headerValue = getHeaderValueFromOptions$4(options);
		return function crossOriginResourcePolicyMiddleware(_req, res, next) {
			res.setHeader("Cross-Origin-Resource-Policy", headerValue);
			next();
		};
	}
	function originAgentCluster() {
		return function originAgentClusterMiddleware(_req, res, next) {
			res.setHeader("Origin-Agent-Cluster", "?1");
			next();
		};
	}
	const ALLOWED_TOKENS = /* @__PURE__ */ new Set([
		"no-referrer",
		"no-referrer-when-downgrade",
		"same-origin",
		"origin",
		"strict-origin",
		"origin-when-cross-origin",
		"strict-origin-when-cross-origin",
		"unsafe-url",
		""
	]);
	function getHeaderValueFromOptions$3({ policy = ["no-referrer"] }) {
		const tokens = typeof policy === "string" ? [policy] : policy;
		if (tokens.length === 0) throw new Error("Referrer-Policy received no policy tokens");
		const tokensSeen = /* @__PURE__ */ new Set();
		tokens.forEach((token) => {
			if (!ALLOWED_TOKENS.has(token)) throw new Error(`Referrer-Policy received an unexpected policy token ${JSON.stringify(token)}`);
			else if (tokensSeen.has(token)) throw new Error(`Referrer-Policy received a duplicate policy token ${JSON.stringify(token)}`);
			tokensSeen.add(token);
		});
		return tokens.join(",");
	}
	function referrerPolicy(options = {}) {
		const headerValue = getHeaderValueFromOptions$3(options);
		return function referrerPolicyMiddleware(_req, res, next) {
			res.setHeader("Referrer-Policy", headerValue);
			next();
		};
	}
	const DEFAULT_MAX_AGE = 365 * 24 * 60 * 60;
	function parseMaxAge(value = DEFAULT_MAX_AGE) {
		if (value >= 0 && Number.isFinite(value)) return Math.floor(value);
		else throw new Error(`Strict-Transport-Security: ${JSON.stringify(value)} is not a valid value for maxAge. Please choose a positive integer.`);
	}
	function getHeaderValueFromOptions$2(options) {
		if ("maxage" in options) throw new Error("Strict-Transport-Security received an unsupported property, `maxage`. Did you mean to pass `maxAge`?");
		if ("includeSubdomains" in options) throw new Error("Strict-Transport-Security middleware should use `includeSubDomains` instead of `includeSubdomains`. (The correct one has an uppercase \"D\".)");
		const directives = [`max-age=${parseMaxAge(options.maxAge)}`];
		if (options.includeSubDomains === void 0 || options.includeSubDomains) directives.push("includeSubDomains");
		if (options.preload) directives.push("preload");
		return directives.join("; ");
	}
	function strictTransportSecurity(options = {}) {
		const headerValue = getHeaderValueFromOptions$2(options);
		return function strictTransportSecurityMiddleware(_req, res, next) {
			res.setHeader("Strict-Transport-Security", headerValue);
			next();
		};
	}
	function xContentTypeOptions() {
		return function xContentTypeOptionsMiddleware(_req, res, next) {
			res.setHeader("X-Content-Type-Options", "nosniff");
			next();
		};
	}
	function xDnsPrefetchControl(options = {}) {
		const headerValue = options.allow ? "on" : "off";
		return function xDnsPrefetchControlMiddleware(_req, res, next) {
			res.setHeader("X-DNS-Prefetch-Control", headerValue);
			next();
		};
	}
	function xDownloadOptions() {
		return function xDownloadOptionsMiddleware(_req, res, next) {
			res.setHeader("X-Download-Options", "noopen");
			next();
		};
	}
	function getHeaderValueFromOptions$1({ action = "sameorigin" }) {
		const normalizedAction = typeof action === "string" ? action.toUpperCase() : action;
		switch (normalizedAction) {
			case "SAME-ORIGIN": return "SAMEORIGIN";
			case "DENY":
			case "SAMEORIGIN": return normalizedAction;
			default: throw new Error(`X-Frame-Options received an invalid action ${JSON.stringify(action)}`);
		}
	}
	function xFrameOptions(options = {}) {
		const headerValue = getHeaderValueFromOptions$1(options);
		return function xFrameOptionsMiddleware(_req, res, next) {
			res.setHeader("X-Frame-Options", headerValue);
			next();
		};
	}
	const ALLOWED_PERMITTED_POLICIES = /* @__PURE__ */ new Set([
		"none",
		"master-only",
		"by-content-type",
		"all"
	]);
	function getHeaderValueFromOptions({ permittedPolicies = "none" }) {
		if (ALLOWED_PERMITTED_POLICIES.has(permittedPolicies)) return permittedPolicies;
		else throw new Error(`X-Permitted-Cross-Domain-Policies does not support ${JSON.stringify(permittedPolicies)}`);
	}
	function xPermittedCrossDomainPolicies(options = {}) {
		const headerValue = getHeaderValueFromOptions(options);
		return function xPermittedCrossDomainPoliciesMiddleware(_req, res, next) {
			res.setHeader("X-Permitted-Cross-Domain-Policies", headerValue);
			next();
		};
	}
	function xPoweredBy() {
		return function xPoweredByMiddleware(_req, res, next) {
			res.removeHeader("X-Powered-By");
			next();
		};
	}
	function xXssProtection() {
		return function xXssProtectionMiddleware(_req, res, next) {
			res.setHeader("X-XSS-Protection", "0");
			next();
		};
	}
	function getMiddlewareFunctionsFromOptions(options) {
		const result = [];
		switch (options.contentSecurityPolicy) {
			case void 0:
			case true:
				result.push(contentSecurityPolicy());
				break;
			case false: break;
			default:
				result.push(contentSecurityPolicy(options.contentSecurityPolicy));
				break;
		}
		switch (options.crossOriginEmbedderPolicy) {
			case void 0:
			case false: break;
			case true:
				result.push(crossOriginEmbedderPolicy());
				break;
			default:
				result.push(crossOriginEmbedderPolicy(options.crossOriginEmbedderPolicy));
				break;
		}
		switch (options.crossOriginOpenerPolicy) {
			case void 0:
			case true:
				result.push(crossOriginOpenerPolicy());
				break;
			case false: break;
			default:
				result.push(crossOriginOpenerPolicy(options.crossOriginOpenerPolicy));
				break;
		}
		switch (options.crossOriginResourcePolicy) {
			case void 0:
			case true:
				result.push(crossOriginResourcePolicy());
				break;
			case false: break;
			default:
				result.push(crossOriginResourcePolicy(options.crossOriginResourcePolicy));
				break;
		}
		switch (options.originAgentCluster) {
			case void 0:
			case true:
				result.push(originAgentCluster());
				break;
			case false: break;
			default:
				console.warn("Origin-Agent-Cluster does not take options. Remove the property to silence this warning.");
				result.push(originAgentCluster());
				break;
		}
		switch (options.referrerPolicy) {
			case void 0:
			case true:
				result.push(referrerPolicy());
				break;
			case false: break;
			default:
				result.push(referrerPolicy(options.referrerPolicy));
				break;
		}
		if ("strictTransportSecurity" in options && "hsts" in options) throw new Error("Strict-Transport-Security option was specified twice. Remove the `hsts` option to fix this error.");
		const strictTransportSecurityOption = options.strictTransportSecurity ?? options.hsts;
		switch (strictTransportSecurityOption) {
			case void 0:
			case true:
				result.push(strictTransportSecurity());
				break;
			case false: break;
			default:
				result.push(strictTransportSecurity(strictTransportSecurityOption));
				break;
		}
		if ("xContentTypeOptions" in options && "noSniff" in options) throw new Error("X-Content-Type-Options option was specified twice. Remove the `noSniff` option to fix this error.");
		switch (options.xContentTypeOptions ?? options.noSniff) {
			case void 0:
			case true:
				result.push(xContentTypeOptions());
				break;
			case false: break;
			default:
				console.warn("X-Content-Type-Options does not take options. Remove the property to silence this warning.");
				result.push(xContentTypeOptions());
				break;
		}
		if ("xDnsPrefetchControl" in options && "dnsPrefetchControl" in options) throw new Error("X-DNS-Prefetch-Control option was specified twice. Remove the `dnsPrefetchControl` option to fix this error.");
		const xDnsPrefetchControlOption = options.xDnsPrefetchControl ?? options.dnsPrefetchControl;
		switch (xDnsPrefetchControlOption) {
			case void 0:
			case true:
				result.push(xDnsPrefetchControl());
				break;
			case false: break;
			default:
				result.push(xDnsPrefetchControl(xDnsPrefetchControlOption));
				break;
		}
		if ("xDownloadOptions" in options && "ieNoOpen" in options) throw new Error("X-Download-Options option was specified twice. Remove the `ieNoOpen` option to fix this error.");
		switch (options.xDownloadOptions ?? options.ieNoOpen) {
			case void 0:
			case true:
				result.push(xDownloadOptions());
				break;
			case false: break;
			default:
				console.warn("X-Download-Options does not take options. Remove the property to silence this warning.");
				result.push(xDownloadOptions());
				break;
		}
		if ("xFrameOptions" in options && "frameguard" in options) throw new Error("X-Frame-Options option was specified twice. Remove the `frameguard` option to fix this error.");
		const xFrameOptionsOption = options.xFrameOptions ?? options.frameguard;
		switch (xFrameOptionsOption) {
			case void 0:
			case true:
				result.push(xFrameOptions());
				break;
			case false: break;
			default:
				result.push(xFrameOptions(xFrameOptionsOption));
				break;
		}
		if ("xPermittedCrossDomainPolicies" in options && "permittedCrossDomainPolicies" in options) throw new Error("X-Permitted-Cross-Domain-Policies option was specified twice. Remove the `permittedCrossDomainPolicies` option to fix this error.");
		const xPermittedCrossDomainPoliciesOption = options.xPermittedCrossDomainPolicies ?? options.permittedCrossDomainPolicies;
		switch (xPermittedCrossDomainPoliciesOption) {
			case void 0:
			case true:
				result.push(xPermittedCrossDomainPolicies());
				break;
			case false: break;
			default:
				result.push(xPermittedCrossDomainPolicies(xPermittedCrossDomainPoliciesOption));
				break;
		}
		if ("xPoweredBy" in options && "hidePoweredBy" in options) throw new Error("X-Powered-By option was specified twice. Remove the `hidePoweredBy` option to fix this error.");
		switch (options.xPoweredBy ?? options.hidePoweredBy) {
			case void 0:
			case true:
				result.push(xPoweredBy());
				break;
			case false: break;
			default:
				console.warn("X-Powered-By does not take options. Remove the property to silence this warning.");
				result.push(xPoweredBy());
				break;
		}
		if ("xXssProtection" in options && "xssFilter" in options) throw new Error("X-XSS-Protection option was specified twice. Remove the `xssFilter` option to fix this error.");
		switch (options.xXssProtection ?? options.xssFilter) {
			case void 0:
			case true:
				result.push(xXssProtection());
				break;
			case false: break;
			default:
				console.warn("X-XSS-Protection does not take options. Remove the property to silence this warning.");
				result.push(xXssProtection());
				break;
		}
		return result;
	}
	const helmet = Object.assign(function helmet(options = {}) {
		if (options.constructor?.name === "IncomingMessage") throw new Error("It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`.");
		const middlewareFunctions = getMiddlewareFunctionsFromOptions(options);
		return function helmetMiddleware(req, res, next) {
			let middlewareIndex = 0;
			(function internalNext(err) {
				if (err) {
					next(err);
					return;
				}
				const middlewareFunction = middlewareFunctions[middlewareIndex];
				if (middlewareFunction) {
					middlewareIndex++;
					middlewareFunction(req, res, internalNext);
				} else next();
			})();
		};
	}, {
		contentSecurityPolicy,
		crossOriginEmbedderPolicy,
		crossOriginOpenerPolicy,
		crossOriginResourcePolicy,
		originAgentCluster,
		referrerPolicy,
		strictTransportSecurity,
		xContentTypeOptions,
		xDnsPrefetchControl,
		xDownloadOptions,
		xFrameOptions,
		xPermittedCrossDomainPolicies,
		xPoweredBy,
		xXssProtection,
		dnsPrefetchControl: xDnsPrefetchControl,
		xssFilter: xXssProtection,
		permittedCrossDomainPolicies: xPermittedCrossDomainPolicies,
		ieNoOpen: xDownloadOptions,
		noSniff: xContentTypeOptions,
		frameguard: xFrameOptions,
		hidePoweredBy: xPoweredBy,
		hsts: strictTransportSecurity
	});
	exports.contentSecurityPolicy = contentSecurityPolicy;
	exports.crossOriginEmbedderPolicy = crossOriginEmbedderPolicy;
	exports.crossOriginOpenerPolicy = crossOriginOpenerPolicy;
	exports.crossOriginResourcePolicy = crossOriginResourcePolicy;
	exports.default = helmet;
	exports.dnsPrefetchControl = xDnsPrefetchControl;
	exports.frameguard = xFrameOptions;
	exports.hidePoweredBy = xPoweredBy;
	exports.hsts = strictTransportSecurity;
	exports.ieNoOpen = xDownloadOptions;
	exports.noSniff = xContentTypeOptions;
	exports.originAgentCluster = originAgentCluster;
	exports.permittedCrossDomainPolicies = xPermittedCrossDomainPolicies;
	exports.referrerPolicy = referrerPolicy;
	exports.strictTransportSecurity = strictTransportSecurity;
	exports.xContentTypeOptions = xContentTypeOptions;
	exports.xDnsPrefetchControl = xDnsPrefetchControl;
	exports.xDownloadOptions = xDownloadOptions;
	exports.xFrameOptions = xFrameOptions;
	exports.xPermittedCrossDomainPolicies = xPermittedCrossDomainPolicies;
	exports.xPoweredBy = xPoweredBy;
	exports.xXssProtection = xXssProtection;
	exports.xssFilter = xXssProtection;
	module.exports = exports.default;
	module.exports.default = module.exports;
}));
//#endregion
//#region ../../node_modules/.pnpm/@fastify+helmet@13.1.0/node_modules/@fastify/helmet/index.js
var require_helmet = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { randomBytes } = __require("node:crypto");
	const fp = require_fastify_plugin();
	const helmet = require_helmet$1();
	async function fastifyHelmet(fastify, options) {
		const { enableCSPNonces, global, ...globalConfiguration } = options;
		const isGlobal = typeof global === "boolean" ? global : true;
		if (!fastify.hasReplyDecorator("helmet")) fastify.decorateReply("helmet", null);
		if (!fastify.hasReplyDecorator("cspNonce")) fastify.decorateReply("cspNonce", null);
		fastify.addHook("onRoute", (routeOptions) => {
			if (routeOptions.helmet !== void 0) if (typeof routeOptions.helmet === "object") routeOptions.config = Object.assign(routeOptions.config || Object.create(null), { helmet: routeOptions.helmet });
			else if (routeOptions.helmet === false) routeOptions.config = Object.assign(routeOptions.config || Object.create(null), { helmet: { skipRoute: true } });
			else throw new Error("Unknown value for route helmet configuration");
		});
		fastify.addHook("onRequest", async function helmetConfigureReply(request, reply) {
			const { helmet: routeOptions } = request.routeOptions.config;
			if (routeOptions !== void 0) {
				const { enableCSPNonces: enableRouteCSPNonces, skipRoute, ...helmetRouteConfiguration } = routeOptions;
				return replyDecorators(request, reply, Object.assign(Object.create(null), globalConfiguration, helmetRouteConfiguration), enableRouteCSPNonces);
			}
			return replyDecorators(request, reply, globalConfiguration, enableCSPNonces);
		});
		fastify.addHook("onRequest", function helmetApplyHeaders(request, reply, next) {
			const { helmet: routeOptions } = request.routeOptions.config;
			if (routeOptions !== void 0) {
				const { enableCSPNonces: enableRouteCSPNonces, skipRoute, ...helmetRouteConfiguration } = routeOptions;
				if (skipRoute === true) {} else return buildHelmetOnRoutes(request, reply, Object.assign(Object.create(null), globalConfiguration, helmetRouteConfiguration), enableRouteCSPNonces);
				return next();
			}
			if (isGlobal) return buildHelmetOnRoutes(request, reply, globalConfiguration, enableCSPNonces);
			return next();
		});
	}
	async function replyDecorators(request, reply, configuration, enableCSP) {
		if (enableCSP) reply.cspNonce = {
			script: randomBytes(16).toString("hex"),
			style: randomBytes(16).toString("hex")
		};
		reply.helmet = function(opts) {
			const helmetConfiguration = opts ? Object.assign(Object.create(null), configuration, opts) : configuration;
			return helmet(helmetConfiguration)(request.raw, reply.raw, done);
		};
	}
	async function buildHelmetOnRoutes(request, reply, configuration, enableCSP) {
		if (enableCSP === true && configuration.contentSecurityPolicy !== false) {
			const cspDirectives = configuration.contentSecurityPolicy ? configuration.contentSecurityPolicy.directives : helmet.contentSecurityPolicy.getDefaultDirectives();
			const cspReportOnly = configuration.contentSecurityPolicy ? configuration.contentSecurityPolicy.reportOnly : void 0;
			const cspUseDefaults = configuration.contentSecurityPolicy ? configuration.contentSecurityPolicy.useDefaults : void 0;
			const { script: scriptCSPNonce, style: styleCSPNonce } = reply.cspNonce;
			const directives = { ...cspDirectives };
			const scriptKey = Array.isArray(directives["script-src"]) ? "script-src" : "scriptSrc";
			directives[scriptKey] = Array.isArray(directives[scriptKey]) ? [...directives[scriptKey]] : [];
			directives[scriptKey].push(`'nonce-${scriptCSPNonce}'`);
			const styleKey = Array.isArray(directives["style-src"]) ? "style-src" : "styleSrc";
			directives[styleKey] = Array.isArray(directives[styleKey]) ? [...directives[styleKey]] : [];
			directives[styleKey].push(`'nonce-${styleCSPNonce}'`);
			const mergedHelmetConfiguration = Object.assign(Object.create(null), configuration, { contentSecurityPolicy: {
				directives,
				reportOnly: cspReportOnly,
				useDefaults: cspUseDefaults
			} });
			helmet(mergedHelmetConfiguration)(request.raw, reply.raw, done);
		} else helmet(configuration)(request.raw, reply.raw, done);
	}
	function done(error) {
		/* c8 ignore next */
		if (error) throw error;
	}
	module.exports = fp(fastifyHelmet, {
		fastify: "5.x",
		name: "@fastify/helmet"
	});
	module.exports.default = fastifyHelmet;
	module.exports.fastifyHelmet = fastifyHelmet;
	module.exports.contentSecurityPolicy = helmet.contentSecurityPolicy;
}));
//#endregion
export { require_helmet as t };
