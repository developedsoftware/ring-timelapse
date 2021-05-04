
# Ring Timelapse Generator

Docker containers that take snapshots from your [Ring](https://www.ring.com) cameras and creates timelapse videos from the snapshots.

## Features

- ring-timelapse:snapshot - takes snapshots of all cameras
- ring-timelapse:timelapse - creates a timelapse video of the snapshots in mp4 format
- ring-timelapse:token - generates a ring refresh token

## Installation

In order to run the Docker container you need a ring refresh token.
To generate the token use the following command:

``` bash
docker run -i --rm docker.io/developedsoftware/ring-timelapse:token
```

> **NOTE**: Please keep this token safe and never share it with anybody

## Creating Snapshots

To take a snapshot of every camera run

``` bash
docker run --rm -e token="<insert token here>" -v "/my/folder:/app/dist/target" docker.io/developedsoftware/ring-timelapse:snapshot
```

> Replace `token="<insert token here>"` with the ring token you generated during installation

> Replace `/my/target/folder` with the directory on your host where you want the snapshots saved

Upon completion the container stops and removes itself, allowing you to run it when and however you wish


## Creating A Timelapse Video

To create a timelapse run
 
``` bash
docker run --rm -v "/my/target/folder:/app/dist/target" docker.io/developedsoftware/ring-timelapse:timelapse
```

> Replace `/my/target/folder` with the directory on your host where you want the snapshots saved

> **NOTE** Once the video file is generated the snapshot files will be deleted. To keep these map the archive folder to a directory on your host by using `-v "/my/archive/folder:/app/dist/archive"`

Upon completion the container stops and removes itself, allowing you to run it when and however you wish

## Environment Variables

The following variables are required:

`token` - your generated Ring token

## Crontab

An example crontab file can be found below which captures a snapshot every 5 minutes and creates a timelapse once a month

```
*/5 * * * * docker run --rm -e token="<insert token here>" -v "/my/folder:/app/dist/target" docker.io/developedsoftware/ring-timelapse:snapshot
0 0 1 * *   docker run --rm -v "/my/target/folder:/app/dist/target" -v "/my/archive/folder:/app/dist/archive" docker.io/developedsoftware/ring-timelapse:timelapse
```