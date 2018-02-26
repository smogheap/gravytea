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
	@rm manifest.txt || true
	@rm release-builds/unstable.zip || true

distclean: clean
	@rm -rf release-builds	|| true

all:

# Build a list of files that need to be included when packaging as a zip
manifest.txt:
	@cd .. && ls unstable/*.html unstable/*.js					>  unstable/manifest.txt
	@cd .. && ls unstable/*.css unstable/*.png					>> unstable/manifest.txt
	@cd .. && find src fonts images -type f						>> unstable/manifest.txt
	@cd .. && find unstable/images unstable/sfx -type f			>> unstable/manifest.txt
	@cd .. && find unstable/music -type f						>> unstable/manifest.txt

release-builds/unstable.zip: manifest.txt
	@mkdir -p release-builds
	@cd .. && zip -r unstable/release-builds/unstable.zip `cat unstable/manifest.txt`
	@cd redir && zip -ur ../release-builds/unstable.zip index.html

package: all release-builds/unstable.zip
	@cd .. && npm install
	@cd .. && npm run package

zip: release-builds/unstable.zip

.PHONY: clean appcache unstable.appcache package zip

