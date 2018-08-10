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
mkdir -p %{buildroot}/%{_plugindir}/gluster-management/
install -m 744 dist/* -t %{buildroot}/%{_plugindir}/gluster-management/

%files
%{_plugindir}/gluster-management
