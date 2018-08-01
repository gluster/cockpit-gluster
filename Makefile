TMPREPOS = $(CURDIR)/rpm_build
BUILDIR = $(CURDIR)/build_dir
BUILDROOT = $(CURDIR)/build_root
RPMBUILD_ARGS := --define="_topdir $(TMPREPOS)" --buildroot="$(BUILDROOT)"

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
	rm -rf $(BUILDROOT)
	mkdir -p $(BUILDROOT)
	rpmbuild $(RPMBUILD_ARGS) -ts $(TMPREPOS)/SOURCES/$(tarname)
	@echo
	@echo "srpm available at '$(TMPREPOS)'"
	@echo

rpm : srpm
	rpmbuild $(RPMBUILD_ARGS) --rebuild "$(TMPREPOS)"/SRPMS/*.src.rpm
	@echo
	@echo "rpm(s) available at '$(TMPREPOS)'"
	@echo
clean-rpm :
	rm -rf $(TMPREPOS) $(BUILDIR)
