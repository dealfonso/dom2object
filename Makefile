current_dir = $(notdir $(shell pwd))
LIBRARY_NAME := $(if $(LIBRARY_NAME),$(LIBRARY_NAME),$(current_dir))
DIST_FOLDER := $(if $(DIST_FOLDER),$(DIST_FOLDER),dist)
FILENAME = $(DIST_FOLDER)/$(LIBRARY_NAME)

DEPENDS =
DEPENDS_FOLDER = ./depends
DEP_FILES = $(foreach fd, $(DEPENDS), $(DEPENDS_FOLDER)/$(fd)/dist/$(fd).module.js)

PRE = 
POST = 
FILES = src/*.js

build: rawfile depends
	mkdir -p $(DIST_FOLDER)
	cat $(DEP_FILES) $(FILENAME).raw.js | uglifyjs -e exports:window | js-beautify -t -s 1 -m 1 -j -n | cat notice - > $(FILENAME).full.js
	cat $(DEP_FILES) $(FILENAME).raw.js | uglifyjs -e exports:window -b | js-beautify -t -s 1 -m 1 -j -n | cat notice - > $(FILENAME).js
	cat $(DEP_FILES) $(FILENAME).raw.js | uglifyjs -e exports:window --toplevel --module -m | cat notice.min - > $(FILENAME).min.js
	cat $(DEP_FILES) $(FILENAME).raw.js | uglifyjs -e exports:window --compress passes=3,dead_code=true,toplevel=true --toplevel --module -m -- | cat notice.min - > $(FILENAME).compress.js

module: rawfile depends
	mkdir -p $(DIST_FOLDER)
	( cat notice; echo 'if (typeof imports === "undefined") { var imports = {}; }' ; cat $(DEP_FILES) $(FILENAME).raw.js | uglifyjs -e exports:imports | js-beautify -t -s 1 -m 1 -j -n ) > $(FILENAME).module.js

rawfile: $(FILES) $(PRE) $(POST)
	mkdir -p $(DIST_FOLDER)
	cat $(PRE) $(FILES) $(POST) > $(FILENAME).raw.js

depends: $(DEPENDS)
	echo $(DEPENDS) $(DEP_FILES)

clean:
	rm -f $(FILENAME).raw.js $(FILENAME).full.js $(FILENAME).min.js $(FILENAME).js $(FILENAME).compress.js $(FILENAME).module.js
	if [ -d $(DIST_FOLDER) ] && [ -z "$(ls -A $(DIST_FOLDER))" ]; then rm -r $(DIST_FOLDER); fi

cleanall: clean
	for fd in $(DEPENDS); do $(MAKE) -C $(DEPENDS_FOLDER)/$$fd clean; done

$(DEPENDS): FORCE
	$(MAKE) -C $(DEPENDS_FOLDER)/$@ module

FORCE:
