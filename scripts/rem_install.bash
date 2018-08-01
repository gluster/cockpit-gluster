#!/bin/bash

if [[ $# -eq 1 ]]
then
	export HOST=$1
else
	echo "no host provided"
	exit 1
fi

npx webpack &&
	make rpm &&
  rsync rpm_build/RPMS/noarch/cockpit-gluster*.rpm \
		${HOST}:/root/cockpit-gluster.rpm &&
  ssh $HOST \
		"rpm -evh cockpit-gluster; \
		rpm -ivh cockpit-gluster.rpm \
		--relocate /usr/share/cockpit=/root/.local/share/cockpit"
	notify-send "done"
