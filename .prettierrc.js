/** @type {import("prettier").Config} */
export default {
	printWidth: 1000,
	trailingComma: "all",
	useTabs: true,
	tabWidth: 4,
	semi: true,
	singleQuote: false,
	quoteProps: "consistent",
	endOfLine: "lf",
	bracketSpacing: false,

	overrides: [
		{
			files: "*.md",
			options: {
				tabWidth: 2,
			},
		},
		{
			files: "README.md",
			options: {},
		},
	],
};
