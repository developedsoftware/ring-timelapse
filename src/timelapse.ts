import { writeFileSync, copyFileSync, rmSync, existsSync, mkdirSync, readdirSync, lstatSync } from 'fs';
import * as path from 'path'
import FfmpegCommand from 'fluent-ffmpeg';
import * as lodash from "lodash";

async function timelapse() {
    
    const log = console.log;
    
    log('Generating Timelapses');
    
    if (!existsSync(path.resolve(__dirname, "target"))) {
        mkdirSync(path.resolve(__dirname, "target"));
    }
    
    if (!existsSync(path.resolve(__dirname, "archive"))) {
        mkdirSync(path.resolve(__dirname, "archive"));
    }
    
    const folders = readdirSync(path.resolve(__dirname, "target"));
    
    folders.forEach(f => {
        
        if (!existsSync(path.resolve(__dirname, "archive", f))) {
            mkdirSync(path.resolve(__dirname, "archive", f));
        }
        
        if (lstatSync(path.resolve(__dirname, "target", f)).isDirectory()) {
            
            log(lodash.startCase(f));

            let command = FfmpegCommand();

            const files = readdirSync(path.resolve(__dirname, "target", f));
            
            if (files.length === 0) {
                return;
            }
            
            let template = "";
              
            const templateFilePath = path.resolve(__dirname, "target", f + "-" + Date.now() + '.txt');

            command.on('error', (err) => {
                log(err.message);
            });

            command.on('end', () => {
                rmSync(templateFilePath);
                for (const file of files) {
                    copyFileSync(path.resolve(__dirname, "target", f, file), path.resolve(__dirname, "archive", f, file));
                    rmSync(path.resolve(__dirname, "target", f, file));
                }
            });

            for (const file of files.sort((a, b) => {
                return lstatSync(path.resolve(__dirname, "target", f, a)).mtimeMs -
                    lstatSync(path.resolve(__dirname, "target", f, b)).mtimeMs;
            })) {
                const fileSize = lstatSync(path.resolve(__dirname, "target", f, file)).size;
                if (fileSize > 0) {
                    template += `file ${path.resolve(__dirname, "target", f, file)}\n`;
                }
            }
            
            const fileSize = lstatSync(path.resolve(__dirname, "target", f, files[files.length - 1])).size;
            if (fileSize > 0) {
                template += `file ${path.resolve(__dirname, "target", f, files[files.length - 1])}\n`;
            }
            
            if (template.length) {

                writeFileSync(templateFilePath, template);

                command.fpsOutput(60);
                command.addInput(templateFilePath);
                command.inputOptions(["-f", "concat", "-safe", "0"])
                command.videoCodec("libx264")
                command.noAudio()
                command.format("mp4");
                
                let videoFile = path.resolve(__dirname, "target", f + "-" + Date.now() + '.mp4')

                log(` - Preparing ${videoFile}`);

                command.save(videoFile);
            
            } else {
                for (const file of files) {
                    copyFileSync(path.resolve(__dirname, "target", f, file), path.resolve(__dirname, "archive", f, file));
                    rmSync(path.resolve(__dirname, "target", f, file));
                }
            }
        }
    });
    
    log('Rendering Videos');

}

timelapse();