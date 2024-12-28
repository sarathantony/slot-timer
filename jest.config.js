module.exports = {
	roots: ['./'],
	preset: 'ts-jest',
	testEnvironment: 'node',
	coverageDirectory: './coverage',
	coveragePathIgnorePatterns: [
		'tests/',
		'node_modules/',
		'.node/',
		'jest/',
		'webpack.config.js',
		'coverage/'
	],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {'^src/(.*)': '<rootDir>/src/$1'},
	testEnvironment: 'node',
	testPathIgnorePatterns: ['/node_modules/'],
	transform: {'^.+\\.(t|j)s?$': 'ts-jest'},
	transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)']
}