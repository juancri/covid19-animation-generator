all:
	rm -rf dist
	npx eslint src/
	npx tsc
	npx lab --verbose --colors --leaks dist/test


