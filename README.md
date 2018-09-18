# cockpit-gluster
A GD2 based dashboard for gluster management.
It runs on any of the brick servers (where glusterd2 is running).

### Features:
- Status panel for monitoring peers, volumes and bricks
- A Wizard for brick setup and volume deployment.
### Pending Features
- GD2 rest auth support.

## Building from source

### Install Build Dependencies

```
sudo yum install -y npm
npm install
```

### Build the project
```
./node_modules/.bin/webpack
```

## Make an rpm
```
make rpm
```
## Installing

## Setup your brick servers with GD2:

As GD2 is in development, it is recommended to build it from the `master` branch and deploy it with an external etcd.
See [GD2 Resources](#gd2-resources)

## Install cockpit-gluster
```
yum install -y cockpit-gluster-x.x.x-x.noarch.rpm
```
## Browse to the cockpit port:
`http://your-cockpithost.domain:9090`

## Screenshots
![Dashboard Image](/screenshots/dashboard.png?raw=true "Dashboard")
![Volume Modal Image](/screenshots/volume_modal.png?raw=true "Volume Modal")



## Cockpit

https://github.com/cockpit-project/cockpit

# GD2 Resources

GD2 developement guide: https://github.com/gluster/glusterd2/blob/master/doc/development-guide.md

GD2 quickstart guide: https://github.com/gluster/glusterd2/blob/master/doc/quick-start-user-guide.md

With my scripts (on CentOS VMs): https://github.com/rohantmp/gd2-testing

