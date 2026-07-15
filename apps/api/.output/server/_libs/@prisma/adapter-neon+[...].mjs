import { t as __commonJSMin } from "../../_runtime.mjs";
import { n as export_types, t as Mn } from "../neondatabase__serverless.mjs";
//#region ../../node_modules/.pnpm/@prisma+debug@7.8.0/node_modules/@prisma/debug/dist/index.mjs
var __defProp = Object.defineProperty;
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var colors_exports = {};
__export(colors_exports, {
	$: () => $,
	bgBlack: () => bgBlack,
	bgBlue: () => bgBlue,
	bgCyan: () => bgCyan,
	bgGreen: () => bgGreen,
	bgMagenta: () => bgMagenta,
	bgRed: () => bgRed,
	bgWhite: () => bgWhite,
	bgYellow: () => bgYellow,
	black: () => black,
	blue: () => blue,
	bold: () => bold,
	cyan: () => cyan,
	dim: () => dim,
	gray: () => gray,
	green: () => green,
	grey: () => grey,
	hidden: () => hidden,
	inverse: () => inverse,
	italic: () => italic,
	magenta: () => magenta,
	red: () => red,
	reset: () => reset,
	strikethrough: () => strikethrough,
	underline: () => underline,
	white: () => white,
	yellow: () => yellow
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
	({FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM} = process.env || {});
	isTTY = process.stdout && process.stdout.isTTY;
}
var $ = { enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY) };
function init(x, y) {
	let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
	let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
	return function(txt) {
		if (!$.enabled || txt == null) return txt;
		return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
	};
}
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
var MAX_ARGS_HISTORY = 100;
var COLORS = [
	"green",
	"yellow",
	"blue",
	"magenta",
	"cyan",
	"red"
];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ??= processEnv.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
var topProps = {
	enable(namespace) {
		if (typeof namespace === "string") globalThis.DEBUG = namespace;
	},
	disable() {
		const prev = globalThis.DEBUG;
		globalThis.DEBUG = "";
		return prev;
	},
	enabled(namespace) {
		const listenedNamespaces = globalThis.DEBUG.split(",").map((s) => {
			return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
		});
		const isListened = listenedNamespaces.some((listenedNamespace) => {
			if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
			return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
		});
		const isExcluded = listenedNamespaces.some((listenedNamespace) => {
			if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
			return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
		});
		return isListened && !isExcluded;
	},
	log: (...args) => {
		const [namespace, format, ...rest] = args;
		(console.warn ?? console.log)(`${namespace} ${format}`, ...rest);
	},
	formatters: {}
};
function debugCreate(namespace) {
	const instanceProps = {
		color: COLORS[lastColor++ % COLORS.length],
		enabled: topProps.enabled(namespace),
		namespace,
		log: topProps.log,
		extend: () => {}
	};
	const debugCall = (...args) => {
		const { enabled, namespace: namespace2, color, log } = instanceProps;
		if (args.length !== 0) argsHistory.push([namespace2, ...args]);
		if (argsHistory.length > MAX_ARGS_HISTORY) argsHistory.shift();
		if (topProps.enabled(namespace2) || enabled) {
			const stringArgs = args.map((arg) => {
				if (typeof arg === "string") return arg;
				return safeStringify(arg);
			});
			const ms = `+${Date.now() - lastTimestamp}ms`;
			lastTimestamp = Date.now();
			if (globalThis.DEBUG_COLORS) log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
			else log(namespace2, ...stringArgs, ms);
		}
	};
	return new Proxy(debugCall, {
		get: (_, prop) => instanceProps[prop],
		set: (_, prop, value) => instanceProps[prop] = value
	});
}
var Debug = new Proxy(debugCreate, {
	get: (_, prop) => topProps[prop],
	set: (_, prop, value) => topProps[prop] = value
});
function safeStringify(value, indent = 2) {
	const cache = /* @__PURE__ */ new Set();
	return JSON.stringify(value, (key, value2) => {
		if (typeof value2 === "object" && value2 !== null) {
			if (cache.has(value2)) return `[Circular *]`;
			cache.add(value2);
		} else if (typeof value2 === "bigint") return value2.toString();
		return value2;
	}, indent);
}
//#endregion
//#region ../../node_modules/.pnpm/@prisma+driver-adapter-utils@7.8.0/node_modules/@prisma/driver-adapter-utils/dist/index.mjs
var DriverAdapterError = class extends Error {
	name = "DriverAdapterError";
	cause;
	constructor(payload) {
		super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
		this.cause = payload;
	}
};
Debug("driver-adapter-utils");
var ColumnTypeEnum = {
	Int32: 0,
	Int64: 1,
	Float: 2,
	Double: 3,
	Numeric: 4,
	Boolean: 5,
	Character: 6,
	Text: 7,
	Date: 8,
	Time: 9,
	DateTime: 10,
	Json: 11,
	Enum: 12,
	Bytes: 13,
	Set: 14,
	Uuid: 15,
	Int32Array: 64,
	Int64Array: 65,
	FloatArray: 66,
	DoubleArray: 67,
	NumericArray: 68,
	BooleanArray: 69,
	CharacterArray: 70,
	TextArray: 71,
	DateArray: 72,
	TimeArray: 73,
	DateTimeArray: 74,
	JsonArray: 75,
	EnumArray: 76,
	BytesArray: 77,
	UuidArray: 78,
	UnknownNumber: 128
};
//#endregion
//#region ../../node_modules/.pnpm/postgres-array@3.0.4/node_modules/postgres-array/index.js
var require_postgres_array = /* @__PURE__ */ __commonJSMin(((exports) => {
	const BACKSLASH = "\\";
	const DQUOT = "\"";
	const LBRACE = "{";
	const RBRACE = "}";
	const LBRACKET = "[";
	const EQUALS = "=";
	const COMMA = ",";
	/** When the raw value is this, it means a literal `null` */
	const NULL_STRING = "NULL";
	/**
	* Parses an array according to
	* https://www.postgresql.org/docs/17/arrays.html#ARRAYS-IO
	*
	* Trusts the data (mostly), so only hook up to trusted Postgres servers.
	*/
	function makeParseArrayWithTransform(transform) {
		const haveTransform = transform != null;
		return function parseArray(str) {
			const rbraceIndex = str.length - 1;
			if (rbraceIndex === 1) return [];
			if (str[rbraceIndex] !== RBRACE) throw new Error("Invalid array text - must end with }");
			let position = 0;
			if (str[position] === LBRACKET) position = str.indexOf(EQUALS) + 1;
			if (str[position++] !== LBRACE) throw new Error("Invalid array text - must start with {");
			const output = [];
			let current = output;
			const stack = [];
			let currentStringStart = position;
			let currentString = "";
			let expectValue = true;
			for (; position < rbraceIndex; ++position) {
				let char = str[position];
				if (char === DQUOT) {
					currentStringStart = ++position;
					let dquot = str.indexOf(DQUOT, currentStringStart);
					let backSlash = str.indexOf(BACKSLASH, currentStringStart);
					while (backSlash !== -1 && backSlash < dquot) {
						position = backSlash;
						const part = str.slice(currentStringStart, position);
						currentString += part;
						currentStringStart = ++position;
						if (dquot === position++) dquot = str.indexOf(DQUOT, position);
						backSlash = str.indexOf(BACKSLASH, position);
					}
					position = dquot;
					const part = str.slice(currentStringStart, position);
					currentString += part;
					current.push(haveTransform ? transform(currentString) : currentString);
					currentString = "";
					expectValue = false;
				} else if (char === LBRACE) {
					const newArray = [];
					current.push(newArray);
					stack.push(current);
					current = newArray;
					currentStringStart = position + 1;
					expectValue = true;
				} else if (char === COMMA) expectValue = true;
				else if (char === RBRACE) {
					expectValue = false;
					const arr = stack.pop();
					if (arr === void 0) throw new Error("Invalid array text - too many '}'");
					current = arr;
				} else if (expectValue) {
					currentStringStart = position;
					while ((char = str[position]) !== COMMA && char !== RBRACE && position < rbraceIndex) ++position;
					const part = str.slice(currentStringStart, position--);
					current.push(part === NULL_STRING ? null : haveTransform ? transform(part) : part);
					expectValue = false;
				} else throw new Error("Was expecting delimeter");
			}
			return output;
		};
	}
	const parseArray = makeParseArrayWithTransform();
	exports.parse = (source, transform) => transform != null ? makeParseArrayWithTransform(transform)(source) : parseArray(source);
}));
//#endregion
//#region ../../node_modules/.pnpm/@prisma+adapter-neon@7.8.0/node_modules/@prisma/adapter-neon/dist/index.mjs
var import_postgres_array = require_postgres_array();
var name = "@prisma/adapter-neon";
var { builtins: ScalarColumnType, getTypeParser } = export_types;
var ArrayColumnType = {
	BIT_ARRAY: 1561,
	BOOL_ARRAY: 1e3,
	BYTEA_ARRAY: 1001,
	BPCHAR_ARRAY: 1014,
	CHAR_ARRAY: 1002,
	CIDR_ARRAY: 651,
	DATE_ARRAY: 1182,
	FLOAT4_ARRAY: 1021,
	FLOAT8_ARRAY: 1022,
	INET_ARRAY: 1041,
	INT2_ARRAY: 1005,
	INT4_ARRAY: 1007,
	INT8_ARRAY: 1016,
	JSONB_ARRAY: 3807,
	JSON_ARRAY: 199,
	MONEY_ARRAY: 791,
	NUMERIC_ARRAY: 1231,
	OID_ARRAY: 1028,
	TEXT_ARRAY: 1009,
	TIMESTAMP_ARRAY: 1115,
	TIMESTAMPTZ_ARRAY: 1185,
	TIME_ARRAY: 1183,
	UUID_ARRAY: 2951,
	VARBIT_ARRAY: 1563,
	VARCHAR_ARRAY: 1015,
	XML_ARRAY: 143
};
var UnsupportedNativeDataType = class _UnsupportedNativeDataType extends Error {
	static typeNames = {
		16: "bool",
		17: "bytea",
		18: "char",
		19: "name",
		20: "int8",
		21: "int2",
		22: "int2vector",
		23: "int4",
		24: "regproc",
		25: "text",
		26: "oid",
		27: "tid",
		28: "xid",
		29: "cid",
		30: "oidvector",
		32: "pg_ddl_command",
		71: "pg_type",
		75: "pg_attribute",
		81: "pg_proc",
		83: "pg_class",
		114: "json",
		142: "xml",
		194: "pg_node_tree",
		269: "table_am_handler",
		325: "index_am_handler",
		600: "point",
		601: "lseg",
		602: "path",
		603: "box",
		604: "polygon",
		628: "line",
		650: "cidr",
		700: "float4",
		701: "float8",
		705: "unknown",
		718: "circle",
		774: "macaddr8",
		790: "money",
		829: "macaddr",
		869: "inet",
		1033: "aclitem",
		1042: "bpchar",
		1043: "varchar",
		1082: "date",
		1083: "time",
		1114: "timestamp",
		1184: "timestamptz",
		1186: "interval",
		1266: "timetz",
		1560: "bit",
		1562: "varbit",
		1700: "numeric",
		1790: "refcursor",
		2202: "regprocedure",
		2203: "regoper",
		2204: "regoperator",
		2205: "regclass",
		2206: "regtype",
		2249: "record",
		2275: "cstring",
		2276: "any",
		2277: "anyarray",
		2278: "void",
		2279: "trigger",
		2280: "language_handler",
		2281: "internal",
		2283: "anyelement",
		2287: "_record",
		2776: "anynonarray",
		2950: "uuid",
		2970: "txid_snapshot",
		3115: "fdw_handler",
		3220: "pg_lsn",
		3310: "tsm_handler",
		3361: "pg_ndistinct",
		3402: "pg_dependencies",
		3500: "anyenum",
		3614: "tsvector",
		3615: "tsquery",
		3642: "gtsvector",
		3734: "regconfig",
		3769: "regdictionary",
		3802: "jsonb",
		3831: "anyrange",
		3838: "event_trigger",
		3904: "int4range",
		3906: "numrange",
		3908: "tsrange",
		3910: "tstzrange",
		3912: "daterange",
		3926: "int8range",
		4072: "jsonpath",
		4089: "regnamespace",
		4096: "regrole",
		4191: "regcollation",
		4451: "int4multirange",
		4532: "nummultirange",
		4533: "tsmultirange",
		4534: "tstzmultirange",
		4535: "datemultirange",
		4536: "int8multirange",
		4537: "anymultirange",
		4538: "anycompatiblemultirange",
		4600: "pg_brin_bloom_summary",
		4601: "pg_brin_minmax_multi_summary",
		5017: "pg_mcv_list",
		5038: "pg_snapshot",
		5069: "xid8",
		5077: "anycompatible",
		5078: "anycompatiblearray",
		5079: "anycompatiblenonarray",
		5080: "anycompatiblerange"
	};
	type;
	constructor(code) {
		super();
		this.type = _UnsupportedNativeDataType.typeNames[code] || "Unknown";
		this.message = `Unsupported column type ${this.type}`;
	}
};
function fieldToColumnType(fieldTypeId) {
	switch (fieldTypeId) {
		case ScalarColumnType.INT2:
		case ScalarColumnType.INT4: return ColumnTypeEnum.Int32;
		case ScalarColumnType.INT8: return ColumnTypeEnum.Int64;
		case ScalarColumnType.FLOAT4: return ColumnTypeEnum.Float;
		case ScalarColumnType.FLOAT8: return ColumnTypeEnum.Double;
		case ScalarColumnType.BOOL: return ColumnTypeEnum.Boolean;
		case ScalarColumnType.DATE: return ColumnTypeEnum.Date;
		case ScalarColumnType.TIME:
		case ScalarColumnType.TIMETZ: return ColumnTypeEnum.Time;
		case ScalarColumnType.TIMESTAMP:
		case ScalarColumnType.TIMESTAMPTZ: return ColumnTypeEnum.DateTime;
		case ScalarColumnType.NUMERIC:
		case ScalarColumnType.MONEY: return ColumnTypeEnum.Numeric;
		case ScalarColumnType.JSON:
		case ScalarColumnType.JSONB: return ColumnTypeEnum.Json;
		case ScalarColumnType.UUID: return ColumnTypeEnum.Uuid;
		case ScalarColumnType.OID: return ColumnTypeEnum.Int64;
		case ScalarColumnType.BPCHAR:
		case ScalarColumnType.TEXT:
		case ScalarColumnType.VARCHAR:
		case ScalarColumnType.BIT:
		case ScalarColumnType.VARBIT:
		case ScalarColumnType.INET:
		case ScalarColumnType.CIDR:
		case ScalarColumnType.XML: return ColumnTypeEnum.Text;
		case ScalarColumnType.BYTEA: return ColumnTypeEnum.Bytes;
		case ArrayColumnType.INT2_ARRAY:
		case ArrayColumnType.INT4_ARRAY: return ColumnTypeEnum.Int32Array;
		case ArrayColumnType.FLOAT4_ARRAY: return ColumnTypeEnum.FloatArray;
		case ArrayColumnType.FLOAT8_ARRAY: return ColumnTypeEnum.DoubleArray;
		case ArrayColumnType.NUMERIC_ARRAY:
		case ArrayColumnType.MONEY_ARRAY: return ColumnTypeEnum.NumericArray;
		case ArrayColumnType.BOOL_ARRAY: return ColumnTypeEnum.BooleanArray;
		case ArrayColumnType.CHAR_ARRAY: return ColumnTypeEnum.CharacterArray;
		case ArrayColumnType.BPCHAR_ARRAY:
		case ArrayColumnType.TEXT_ARRAY:
		case ArrayColumnType.VARCHAR_ARRAY:
		case ArrayColumnType.VARBIT_ARRAY:
		case ArrayColumnType.BIT_ARRAY:
		case ArrayColumnType.INET_ARRAY:
		case ArrayColumnType.CIDR_ARRAY:
		case ArrayColumnType.XML_ARRAY: return ColumnTypeEnum.TextArray;
		case ArrayColumnType.DATE_ARRAY: return ColumnTypeEnum.DateArray;
		case ArrayColumnType.TIME_ARRAY: return ColumnTypeEnum.TimeArray;
		case ArrayColumnType.TIMESTAMP_ARRAY: return ColumnTypeEnum.DateTimeArray;
		case ArrayColumnType.JSON_ARRAY:
		case ArrayColumnType.JSONB_ARRAY: return ColumnTypeEnum.JsonArray;
		case ArrayColumnType.BYTEA_ARRAY: return ColumnTypeEnum.BytesArray;
		case ArrayColumnType.UUID_ARRAY: return ColumnTypeEnum.UuidArray;
		case ArrayColumnType.INT8_ARRAY:
		case ArrayColumnType.OID_ARRAY: return ColumnTypeEnum.Int64Array;
		default:
			if (fieldTypeId >= 1e4) return ColumnTypeEnum.Text;
			throw new UnsupportedNativeDataType(fieldTypeId);
	}
}
function normalize_array(element_normalizer) {
	return (str) => (0, import_postgres_array.parse)(str, element_normalizer);
}
function normalize_numeric(numeric) {
	return numeric;
}
function normalize_date(date) {
	return date;
}
function normalize_timestamp(time) {
	return `${time.replace(" ", "T")}+00:00`;
}
function normalize_timestamptz(time) {
	return time.replace(" ", "T").replace(/[+-]\d{2}(:\d{2})?$/, "+00:00");
}
function normalize_time(time) {
	return time;
}
function normalize_timez(time) {
	return time.replace(/[+-]\d{2}(:\d{2})?$/, "");
}
function normalize_money(money) {
	return money.slice(1);
}
function normalize_xml(xml) {
	return xml;
}
function toJson(json) {
	return json;
}
var parsePgBytes = getTypeParser(ScalarColumnType.BYTEA);
var normalizeByteaArray = getTypeParser(ArrayColumnType.BYTEA_ARRAY);
function convertBytes(serializedBytes) {
	return parsePgBytes(serializedBytes);
}
function normalizeBit(bit) {
	return bit;
}
var customParsers = {
	[ScalarColumnType.NUMERIC]: normalize_numeric,
	[ArrayColumnType.NUMERIC_ARRAY]: normalize_array(normalize_numeric),
	[ScalarColumnType.TIME]: normalize_time,
	[ArrayColumnType.TIME_ARRAY]: normalize_array(normalize_time),
	[ScalarColumnType.TIMETZ]: normalize_timez,
	[ScalarColumnType.DATE]: normalize_date,
	[ArrayColumnType.DATE_ARRAY]: normalize_array(normalize_date),
	[ScalarColumnType.TIMESTAMP]: normalize_timestamp,
	[ArrayColumnType.TIMESTAMP_ARRAY]: normalize_array(normalize_timestamp),
	[ScalarColumnType.TIMESTAMPTZ]: normalize_timestamptz,
	[ArrayColumnType.TIMESTAMPTZ_ARRAY]: normalize_array(normalize_timestamptz),
	[ScalarColumnType.MONEY]: normalize_money,
	[ArrayColumnType.MONEY_ARRAY]: normalize_array(normalize_money),
	[ScalarColumnType.JSON]: toJson,
	[ArrayColumnType.JSON_ARRAY]: normalize_array(toJson),
	[ScalarColumnType.JSONB]: toJson,
	[ArrayColumnType.JSONB_ARRAY]: normalize_array(toJson),
	[ScalarColumnType.BYTEA]: convertBytes,
	[ArrayColumnType.BYTEA_ARRAY]: normalizeByteaArray,
	[ArrayColumnType.BIT_ARRAY]: normalize_array(normalizeBit),
	[ArrayColumnType.VARBIT_ARRAY]: normalize_array(normalizeBit),
	[ArrayColumnType.XML_ARRAY]: normalize_array(normalize_xml)
};
function mapArg(arg, argType) {
	if (arg === null) return null;
	if (Array.isArray(arg) && argType.arity === "list") return arg.map((value) => mapArg(value, argType));
	if (typeof arg === "string" && argType.scalarType === "datetime") arg = new Date(arg);
	if (arg instanceof Date) switch (argType.dbType) {
		case "TIME":
		case "TIMETZ": return formatTime(arg);
		case "DATE": return formatDate(arg);
		default: return formatDateTime(arg);
	}
	if (typeof arg === "string" && argType.scalarType === "bytes") return Buffer.from(arg, "base64");
	if (ArrayBuffer.isView(arg)) return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);
	return arg;
}
function formatDateTime(date) {
	const pad = (n, z = 2) => String(n).padStart(z, "0");
	const ms = date.getUTCMilliseconds();
	return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
function formatDate(date) {
	const pad = (n, z = 2) => String(n).padStart(z, "0");
	return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}
function formatTime(date) {
	const pad = (n, z = 2) => String(n).padStart(z, "0");
	const ms = date.getUTCMilliseconds();
	return pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
function convertDriverError(error) {
	if (isDriverError(error)) return {
		originalCode: error.code,
		originalMessage: error.message,
		...mapDriverError(error)
	};
	throw error;
}
function mapDriverError(error) {
	switch (error.code) {
		case "22001": return {
			kind: "LengthMismatch",
			column: error.column
		};
		case "22003": return {
			kind: "ValueOutOfRange",
			cause: error.message
		};
		case "22P02": return {
			kind: "InvalidInputValue",
			message: error.message
		};
		case "23505": {
			const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
			return {
				kind: "UniqueConstraintViolation",
				constraint: fields !== void 0 ? { fields } : void 0
			};
		}
		case "23502": {
			const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
			return {
				kind: "NullConstraintViolation",
				constraint: fields !== void 0 ? { fields } : void 0
			};
		}
		case "23503": {
			let constraint;
			if (error.column) constraint = { fields: [error.column] };
			else if (error.constraint) constraint = { index: error.constraint };
			return {
				kind: "ForeignKeyConstraintViolation",
				constraint
			};
		}
		case "3D000": return {
			kind: "DatabaseDoesNotExist",
			db: error.message.split(" ").at(1)?.split("\"").at(1)
		};
		case "28000": return {
			kind: "DatabaseAccessDenied",
			db: error.message.split(",").find((s) => s.startsWith(" database"))?.split("\"").at(1)
		};
		case "28P01": return {
			kind: "AuthenticationFailed",
			user: error.message.split(" ").pop()?.split("\"").at(1)
		};
		case "40001": return { kind: "TransactionWriteConflict" };
		case "42P01": return {
			kind: "TableDoesNotExist",
			table: error.message.split(" ").at(1)?.split("\"").at(1)
		};
		case "42703": return {
			kind: "ColumnNotFound",
			column: error.message.split(" ").at(1)?.split("\"").at(1)
		};
		case "42P04": return {
			kind: "DatabaseAlreadyExists",
			db: error.message.split(" ").at(1)?.split("\"").at(1)
		};
		case "53300": return {
			kind: "TooManyConnections",
			cause: error.message
		};
		default: return {
			kind: "postgres",
			code: error.code ?? "N/A",
			severity: error.severity ?? "N/A",
			message: error.message,
			detail: error.detail,
			column: error.column,
			hint: error.hint
		};
	}
}
function isDriverError(error) {
	return typeof error.code === "string" && typeof error.message === "string" && typeof error.severity === "string" && (typeof error.detail === "string" || error.detail === void 0) && (typeof error.column === "string" || error.column === void 0) && (typeof error.hint === "string" || error.hint === void 0);
}
var debug = Debug("prisma:driver-adapter:neon");
var NeonQueryable = class {
	provider = "postgres";
	adapterName = name;
	/**
	* Execute a query given as SQL, interpolating the given parameters.
	*/
	async queryRaw(query) {
		debug(`[js::query_raw] %O`, query);
		const { fields, rows } = await this.performIO(query);
		const columnNames = fields.map((field) => field.name);
		let columnTypes = [];
		try {
			columnTypes = fields.map((field) => fieldToColumnType(field.dataTypeID));
		} catch (e) {
			if (e instanceof UnsupportedNativeDataType) throw new DriverAdapterError({
				kind: "UnsupportedNativeDataType",
				type: e.type
			});
			throw e;
		}
		return {
			columnNames,
			columnTypes,
			rows
		};
	}
	/**
	* Execute a query given as SQL, interpolating the given parameters and
	* returning the number of affected rows.
	* Note: Queryable expects a u64, but napi.rs only supports u32.
	*/
	async executeRaw(query) {
		debug(`[js::execute_raw] %O`, query);
		return (await this.performIO(query)).rowCount ?? 0;
	}
};
var NeonWsQueryable = class extends NeonQueryable {
	constructor(client) {
		super();
		this.client = client;
	}
	async performIO(query) {
		const { sql, args } = query;
		try {
			return await this.client.query({
				text: sql,
				rowMode: "array",
				types: { getTypeParser: (oid, format) => {
					if (format === "text" && customParsers[oid]) return customParsers[oid];
					return export_types.getTypeParser(oid, format);
				} }
			}, args.map((arg, i) => mapArg(arg, query.argTypes[i])));
		} catch (e) {
			this.onError(e);
		}
	}
	onError(e) {
		debug("Error in onError: %O", e);
		throw new DriverAdapterError(convertDriverError(e));
	}
};
var NeonTransaction = class extends NeonWsQueryable {
	constructor(client, options, cleanup) {
		super(client);
		this.options = options;
		this.cleanup = cleanup;
	}
	async commit() {
		debug(`[js::commit]`);
		this.cleanup?.();
		this.client.release();
	}
	async rollback() {
		debug(`[js::rollback]`);
		this.cleanup?.();
		this.client.release();
	}
	async createSavepoint(name2) {
		await this.executeRaw({
			sql: `SAVEPOINT ${name2}`,
			args: [],
			argTypes: []
		});
	}
	async rollbackToSavepoint(name2) {
		await this.executeRaw({
			sql: `ROLLBACK TO SAVEPOINT ${name2}`,
			args: [],
			argTypes: []
		});
	}
	async releaseSavepoint(name2) {
		await this.executeRaw({
			sql: `RELEASE SAVEPOINT ${name2}`,
			args: [],
			argTypes: []
		});
	}
};
var PrismaNeonAdapter = class extends NeonWsQueryable {
	constructor(pool, options) {
		super(pool);
		this.options = options;
	}
	isRunning = true;
	executeScript(_script) {
		throw new Error("Not implemented yet");
	}
	async startTransaction(isolationLevel) {
		const options = { usePhantomQuery: false };
		debug("%s options: %O", "[js::startTransaction]", options);
		const conn = await this.client.connect().catch((error) => this.onError(error));
		const onError = (err) => {
			debug(`Error from pool connection: ${err.message} %O`, err);
			this.options?.onConnectionError?.(err);
		};
		conn.on("error", onError);
		const cleanup = () => {
			conn.removeListener("error", onError);
		};
		try {
			const tx = new NeonTransaction(conn, options, cleanup);
			await tx.executeRaw({
				sql: "BEGIN",
				args: [],
				argTypes: []
			});
			if (isolationLevel) await tx.executeRaw({
				sql: `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
				args: [],
				argTypes: []
			});
			return tx;
		} catch (error) {
			cleanup();
			conn.release(error);
			this.onError(error);
		}
	}
	getConnectionInfo() {
		return {
			schemaName: this.options?.schema,
			supportsRelationJoins: true
		};
	}
	async dispose() {
		if (this.isRunning) {
			await this.client.end();
			this.isRunning = false;
		}
	}
	underlyingDriver() {
		return this.client;
	}
};
var PrismaNeonAdapterFactory = class {
	constructor(config, options) {
		this.config = config;
		this.options = options;
	}
	provider = "postgres";
	adapterName = name;
	async connect() {
		const pool = new Mn(this.config);
		pool.on("error", (err) => {
			debug(`Error from pool client: ${err.message} %O`, err);
			this.options?.onPoolError?.(err);
		});
		return new PrismaNeonAdapter(pool, this.options);
	}
};
//#endregion
export { Debug as a, DriverAdapterError as i, require_postgres_array as n, ColumnTypeEnum as r, PrismaNeonAdapterFactory as t };
