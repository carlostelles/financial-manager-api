FROM node:12

WORKDIR /usr/src/app

RUN mkdir -p temp/src
COPY src temp/src/
COPY package.json temp/
COPY package-lock.json temp/
COPY tsconfig.json temp/

RUN cd temp && npm install
RUN cd temp && npm run build
RUN cp -r temp/dist .
RUN cp -r temp/node_modules .

RUN rm -rf temp

EXPOSE 3000
