APP				:= unstable
XR_VERSION		:= 26.0

unstable.appcache:
	@echo "CACHE MANIFEST"								>  unstable.appcache
	@echo "# `date`"									>> unstable.appcache
	@ls *.js *.css *.png								>> unstable.appcache
	@find ../src ../fonts ../images images -type f		>> unstable.appcache
	@find sfx music -type f								>> unstable.appcache

appcache: unstable.appcache

clean:
	@rm -rf ${CONTENT}			|| true
	@rm ${APP_DIR}/${APP}		|| true
	@rm ${APP_DIR}/${APP}.exe	|| true
	@rm *.zip *.appcache		|| true

distclean: clean
	@rm -rf release-builds	|| true

all:

package: all
	@cd .. && npm install
	@cd .. && npm run package

.PHONY: clean appcache unstable.appcache package

