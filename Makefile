TMPREPOS = rpm_build
BUILDIR = build_dir
RPMBUILD_ARGS := --define="_topdir  $(CURDIR)/$(TMPREPOS)"

PACKAGE = cockpit-gluster
VERSION = 0.1
RELEASE = 0

distdir = $(PACKAGE)-$(VERSION)
tarname = $(distdir).tar.gz



tarify :
	rm -rf $(TMPREPOS)
	mkdir -p $(TMPREPOS)/{SPECS,RPMS,SRPMS,SOURCES}
	rm -rf $(BUILDIR)
	mkdir -p $(BUILDIR)/$(distdir)
	rsync -r dist $(BUILDIR)/$(distdir)/
	rsync -r LICENSE $(BUILDIR)/$(distdir)/
	rsync -r cockpit-gluster.spec $(BUILDIR)/$(distdir)/

	tar -C $(BUILDIR) -cvzf $(TMPREPOS)/SOURCES/$(tarname) $(distdir)



srpm :	tarify
	rpmbuild $(RPMBUILD_ARGS) -ts $(TMPREPOS)/SOURCES/$(tarname)
	@echo
	@echo "srpm available at '$(TMPREPOS)'"
	@echo

rpm : srpm
	rpmbuild --define="_topdir /home/tpjsm/workspace/rhhi/cockpit-gluster/rpm_build/" --rebuild "$(TMPREPOS)"/SRPMS/*.src.rpm
	@echo
	@echo "rpm(s) available at '$(TMPREPOS)'"
	@echo
test :
	echo $(BUILDIR)/$(distdir)
