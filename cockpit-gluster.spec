%global _plugindir %{_datarootdir}/cockpit

Name: cockpit-gluster
Version: %{_version}
Release: 1
Summary: A Cockpit plugin to deploy and manage Gluster

License:        ASL 2.0
URL:            https://example.com/%{name}
Source0:        https://example.com/%{name}/release/%{name}-%{version}.tar.gz

BuildArch:      noarch

Requires: cockpit

Prefix: %{_plugindir}
%description
A Cockpit plugin to deploy and manage Gluster


%prep
%setup -q

%install
mkdir -p %{buildroot}/%{_plugindir}/gluster-management/ansible/
install -m 644 dist/* -t %{buildroot}/%{_plugindir}/gluster-management/

mkdir -p %{buildroot}/etc/ansible/

install -m 644 "ansible/hc_wizard.yml" -t %{buildroot}/etc/ansible/
install -m 644 "ansible/hc_wizard_inventory_example.yml" -t %{buildroot}/etc/ansible/


%files
%{_plugindir}/gluster-management
/etc/ansible/hc_wizard.yml
/etc/ansible/hc_wizard_inventory_example.yml
