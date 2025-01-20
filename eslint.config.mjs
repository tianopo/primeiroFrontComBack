import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends(
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ),
    {
        plugins: {
            "jsx-a11y": jsxA11Y,
            "react": react,
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "jsx-a11y/alt-text": ["error", {
                elements: ["img", "object", "area", "input[type='image']"],
                img: ["Image"],
            }],

            "max-lines": ["error", {
                max: 200,
            }],

            "no-duplicate-imports": "error",
            "no-duplicate-case": "error",
            "no-empty-pattern": "error",
            "no-undef": 0,
            "no-use-before-define": "off",
            "react/react-in-jsx-scope": 0,
            "@typescript-eslint/no-empty-function": 1,
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/prefer-nullish-coalescing": 0,
            "@typescript-eslint/strict-boolean-expressions": 0,
            "@typescript-eslint/restrict-template-expressions": 0,
            "@typescript-eslint/no-useless-constructor": 0,
            "no-unexpected-multiline": 0,
            "@typescript-eslint/consistent-type-definitions": 0,
            "no-console": "warn",
            "react/prop-types": 0,
            "react/no-unescaped-entities": 0,
            "@typescript-eslint/no-confusing-void-expression": 0,
            "no-unused-vars": 1,
            "@typescript-eslint/no-unused-vars": [1, {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                ignoreRestSiblings: true,
            }],
            "no-restricted-syntax": [1, {
                selector: "CallExpression[callee.object.name='console'][callee.property.name!=/^(warn|error)$/]",
                message: "Remova os console.log's",
            }],
        },
    },
    {
        // Override for specific files or directories
        files: ["src/config/**/*.ts", "src/config/**/*.tsx"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
        files: ["src/pages/**/*.tsx", "src/utils/formats.ts", "src/pages/**/*.ts"],
        rules: {
            "max-lines": ["error", {
                max: 700,
            }],
        },
    },
];
