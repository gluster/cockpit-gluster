# cockpit-gluster [work in progress]
A GD2 based dashboard for gluster management

## Install Dependencies
```
sudo yum install -y npm
```

## Install JavaScipt Dependencies
```
npm install
```

## Compile Javascript
```
npx --no-install webpack
```

## Build an rpm
```
make rpm
```
## Install to a remote host running GD2 and Cockpit
```
./scripts/rem_install.bash hostname
```
## Browse to the cockpit port:
`http://your-remotehost.domain:9090`

## Screenshots
![Dashboard Image](/screenshots/dashboard.png?raw=true "Dashboard")
![Volume Modal Image](/screenshots/volume_modal.png?raw=true "Volume Modal")


## Install GD2 and cockpit on some remote hosts:

As GD2 is in development, it is recommended to build it from the `master` branch and deploy it with an external etcd.

## Cockpit

https://github.com/cockpit-project/cockpit

GD2 developement guide: https://github.com/gluster/glusterd2/blob/master/doc/development-guide.md

GD2 quickstart guide: https://github.com/gluster/glusterd2/blob/master/doc/quick-start-user-guide.md

With my scripts (on CentOS VMs): https://github.com/rohantmp/gd2-testing
