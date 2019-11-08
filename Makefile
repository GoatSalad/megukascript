export node_bins=$(PWD)/node_modules/.bin
export uglifyjs=$(node_bins)/uglifyjs
export gulp=$(node_bins)/gulp

all: vendor
	$(gulp)
	echo 'require("main").init()' >> meguca.user.js

deps:
	npm install --progress false --depth 0

vendor: deps
	$(uglifyjs) node_modules/almond/almond.js -o almond.js

clean:
	rm -rf meguca.user.js almond.js node_modules
