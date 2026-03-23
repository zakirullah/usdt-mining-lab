#!/bin/bash
bunx prisma db push --skip-generate
exec bunx next start -p ${PORT:-3000}
