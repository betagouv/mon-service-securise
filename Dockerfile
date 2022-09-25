FROM scalingo/scalingo-20:latest

ENV NPM_CONFIG_PRODUCTION=false
ENV NPM_NO_BUILD=true

RUN useradd -ms /bin/bash mss
WORKDIR /home/mss
COPY .buildpacks package.json package-lock.json ./
COPY scripts/buildpack.sh scripts/

RUN mkdir -p /tmp/cache /tmp/env && \
    scripts/buildpack.sh /home/mss /tmp/cache /tmp/env && \
    rm .profile.d/WEB_CONCURRENCY.sh

COPY --chown=mss:mss . .
RUN chown -R mss:mss .profile.d .npm

USER mss
EXPOSE 3000
ENTRYPOINT ["/home/mss/scripts/entrypoint.sh"]
CMD ["npx", "nodemon", "server.js"]
