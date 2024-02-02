module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "standard-with-typescript",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/quotes": ["warn", "double"],
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi",
        },
        singleline: {
          delimiter: "semi",
        },
      },
    ],
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/space-before-function-paren": "off",
  },
};
