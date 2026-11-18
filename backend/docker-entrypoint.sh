#!/bin/sh
set -e

# Render entrega DATABASE_URL como postgresql://usuario:clave@host:puerto/base.
# Spring necesita una URL JDBC con usuario y clave aparte.
if [ -n "$DATABASE_URL" ]; then
  rest="${DATABASE_URL#*://}"
  credentials="${rest%%@*}"
  export DB_USER="${credentials%%:*}"
  export DB_PASSWORD="${credentials#*:}"
  export DB_URL="jdbc:postgresql://${rest#*@}"
fi

exec java -jar /app/app.jar
