#!/bin/bash
HOST="t27"

if [[ $# -eq 1 ]]
then
	export HOST=$1
fi

sudo echo "acquired sudo" &&
	npx webpack &&
	sudo make rpm &&
  rsync rpm_build/RPMS/noarch/cockpit-gluster-0.1-1.fc28.noarch.rpm ${HOST}:/root/ &&
  ssh $HOST "rpm -evh cockpit-gluster; rpm -ivh cockpit-gluster-0.1-1.fc28.noarch.rpm --relocate /usr/share/cockpit=/root/.local/share/cockpit"
notify-send "done"
