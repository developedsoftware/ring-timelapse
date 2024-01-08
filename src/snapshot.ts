import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { RingApi } from 'ring-client-api'
import * as path from 'path'
import * as dotenv from "dotenv";
import * as lodash from "lodash";

const log = console.log;

async function snapshot() {
    
    log('Taking Snapshots');
    
    let isConnected = !!await require('dns').promises.resolve('ring.com').catch(()=>{});
    
    if (!isConnected) {
        log(' - no internet connection');
        return false;
    }

    if (!existsSync(path.resolve(__dirname, "target", ".token"))) {
        log(' - please generate a ring token using ring-timelapse:token');
        return false;
    }

    let token = readFileSync(path.resolve(__dirname, "target", ".token"), "utf8");

    let systemId = (token as string).slice(0,32);
    
    const ringApi = new RingApi({
        refreshToken: token as string,
        systemId: systemId as string,
        controlCenterDisplayName: 'ring-timelapse',
        debug: false
    });
    
    ringApi.onRefreshTokenUpdated.subscribe(
        async ({ newRefreshToken, oldRefreshToken }) => {
            return writeFileSync(path.resolve(__dirname, "target", ".token"), newRefreshToken);
        }
    );

    const cameras = await ringApi.getCameras();

    if (!existsSync(path.resolve(__dirname, "target"))) {
        mkdirSync(path.resolve(__dirname, "target"));
    }
    
    const snapshots = cameras.map(camera => {

        const name = lodash.kebabCase(camera.name);

        log(` - ${camera.name}`);

        return camera.getSnapshot().then(function (result) {
            try {
                if (!existsSync(path.resolve(__dirname, "target", name))) {
                    mkdirSync(path.resolve(__dirname, "target", name));
                }
                return writeFileSync(path.resolve(__dirname, "target", path.join(name, Date.now() + '.png')), result);
            } catch (err) {
                log(` - ${err}`);
            }
        }).catch(err => {
            log(` - ${err}`);
        });
    });
    await Promise.all(snapshots)
    return snapshots;
}

dotenv.config();

snapshot().then(function () { log('Done'); process.exit(); });
