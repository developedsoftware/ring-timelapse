FROM node:current-alpine AS BUILD_IMAGE

WORKDIR /work

COPY . /work/

# install 
RUN npm install 

# build
RUN npm run build

FROM node:current-alpine

# add ffmpeg
RUN apk add  --no-cache ffmpeg

ARG command=snapshot

ENV command=$command

WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /work/dist ./dist
COPY --from=BUILD_IMAGE /work/node_modules ./node_modules
COPY --from=BUILD_IMAGE /work/package.json .

ENTRYPOINT  ["sh"]

CMD ["-c", "npm run --no-update-notifier ${command}"]
