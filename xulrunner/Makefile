APP				:= gravytea
CONTENT			:= ${APP}/content/app/
XR_VERSION		:= 26.0

${APP}/xulrunner:
	@echo ""
	@echo "Select a platform by running one of the following before building:"
	@echo "   make linux"
	@echo "   make linux64"
	@echo "   make mac"
	@echo "   make win"
	@echo ""
	@false

linux: xulrunner-${XR_VERSION}.en-US.linux-i686.tar.bz2
	rm -rf ${APP}/xulrunner || true
	tar jxvf xulrunner-${XR_VERSION}.en-US.linux-i686.tar.bz2
	mv xulrunner ${APP}/

linux64: xulrunner-${XR_VERSION}.en-US.linux-x86_64.tar.bz2
	rm -rf ${APP}/xulrunner || true
	tar jxvf xulrunner-${XR_VERSION}.en-US.linux-x86_64.tar.bz2
	mv xulrunner ${APP}/

mac: xulrunner-${XR_VERSION}.en-US.mac.tar.bz2
	rm -rf ${APP}/xulrunner || true
	tar jxvf xulrunner-${XR_VERSION}.en-US.mac.tar.bz2
	mv xulrunner ${APP}/

win: xulrunner-${XR_VERSION}.en-US.win32.zip
	rm -rf ${APP}/xulrunner || true
	unzip  xulrunner-${XR_VERSION}.en-US.win32.zip
	mv xulrunner ${APP}/

xulrunner-${XR_VERSION}.en-US.linux-i686.tar.bz2:
	curl -O http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/${XR_VERSION}/runtimes/xulrunner-${XR_VERSION}.en-US.linux-i686.tar.bz2

xulrunner-${XR_VERSION}.en-US.linux-x86_64.tar.bz2:
	curl -O http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/${XR_VERSION}/runtimes/xulrunner-${XR_VERSION}.en-US.linux-x86_64.tar.bz2

xulrunner-${XR_VERSION}.en-US.mac.tar.bz2:
	curl -O http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/${XR_VERSION}/runtimes/xulrunner-${XR_VERSION}.en-US.mac.tar.bz2

xulrunner-${XR_VERSION}.en-US.win32.zip:
	curl -O http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/${XR_VERSION}/runtimes/xulrunner-${XR_VERSION}.en-US.win32.zip

clean:
	rm -rf ${CONTENT}			|| true
	rm ${APP}/${APP}			|| true
	rm ${APP}/${APP}.exe		|| true

realclean: clean
	rm -rf ${APP}/xulrunner		|| true


all: ${APP}/xulrunner
	mkdir -p ${CONTENT}
	cp -r ../index.html ../src ${CONTENT}
	if [ -f ${APP}/xulrunner/*stub*.exe ]; then				\
		cp ${APP}/xulrunner/*stub* ${APP}/${APP}.exe	;	\
	else													\
		cp ${APP}/xulrunner/*stub* ${APP}/${APP}		;	\
	fi

# TODO	Implement a 'package' target that builds the correct package for the
#		platform that was just built... .deb/.rpm/.tgz/.msi/.dmg

test: all
	${APP}/${APP}

.PHONY: clean test

