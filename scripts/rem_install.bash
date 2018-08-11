#!/bin/bash
set -eu
help="Compiles, Packages, Pushes to Server via root ssh. Installs.\nUsage: rem_install.bash <hostname> [<install-for-user>]"
if [[ ${1} = "help" || ${1} = "--help"|| ${1} = "-h" ]]
then
				echo -e ${help}
				return 0
fi


if [[ $# -eq 1 ]]
then
	export HOST=$1
elif [[ $# -eq 2 ]]
then
	export HOST=$1
	export USER=$2
else
	echo -e $help
	exit 1
fi

if [[ $USER = "root" ]]
then
	export USERHOME="/root/"
else
	export USERHOME="/home/${USER}/"
fi

npx webpack &&
	make rpm &&
  rsync rpm_build/RPMS/noarch/cockpit-gluster*.rpm \
		${HOST}:${USERHOME}/cockpit-gluster.rpm &&
  ssh $HOST \
		"rpm -evh cockpit-gluster; \
		rpm -ivh ${USERHOME}/cockpit-gluster.rpm \
		--relocate /usr/share/cockpit=${USERHOME}/.local/share/cockpit"
notify-send "done"
